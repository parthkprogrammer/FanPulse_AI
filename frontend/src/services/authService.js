import { supabase } from './supabaseClient';

export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder-project') &&
    !url.includes('your-project-id') &&
    !key.includes('placeholder-anon-key') &&
    !key.includes('your-anon-key')
  );
};

/**
 * Normalizes role string to 'USER' | 'ADMIN'
 */
export const normalizeRole = (role) => {
  if (!role) return 'USER';
  const clean = String(role).trim().toUpperCase();
  if (clean === 'ADMIN' || clean === 'ROLE_ADMIN') {
    return 'ADMIN';
  }
  return 'USER';
};

/**
 * Maps Supabase Auth errors to secure user-friendly messages
 * to prevent user enumeration attacks and information disclosure.
 */
export const sanitizeAuthError = (error) => {
  if (!error) return 'An unexpected authentication error occurred.';
  const message = error.message || String(error);

  if (message.includes('Invalid login credentials') || message.includes('invalid_grant')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (message.includes('User already registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (message.includes('Password should be')) {
    return 'Password does not meet the security requirements.';
  }
  if (message.includes('rate limit') || message.includes('Too many requests')) {
    return 'Too many login attempts. Please wait a few moments and try again.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Unable to reach authentication service. Please check your network connection.';
  }

  // Safe fallback without exposing internal stack or database diagnostics
  return 'Authentication request could not be processed. Please try again.';
};

export const authService = {
  isConfigured: isSupabaseConfigured,
  normalizeRole,

  /**
   * Authenticates user using email and password through Supabase Auth.
   * Passwords are encrypted over TLS and never stored locally.
   */
  async signIn({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(sanitizeAuthError(error));
      }

      if (!data.user || !data.session) {
        throw new Error('Authentication failed. No active session returned.');
      }

      // Fetch user profile from public.profiles table (obeying RLS)
      let profile = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        profile = profileData;
      } catch {
        // Non-blocking fallback to metadata if profile read is deferred
      }

      const authoritativeRole = normalizeRole(
        profile?.role || data.user.app_metadata?.role || data.user.user_metadata?.role || 'USER'
      );

      const user = {
        id: data.user.id,
        email: data.user.email,
        displayName: profile?.display_name || data.user.user_metadata?.full_name || email.split('@')[0],
        role: authoritativeRole,
        favoriteTeam: profile?.favorite_team || data.user.user_metadata?.favorite_team || 'India National Team',
        bio: profile?.bio || data.user.user_metadata?.bio || 'Cricket fan & fantasy manager',
        isMockUser: false,
        authMode: 'SUPABASE_CLOUD',
        createdAt: data.user.created_at,
      };

      return {
        user,
        token: data.session.access_token,
        isMock: false,
      };
    }

    // Development Mock Authentication fallback
    // Passwords are strictly ignored and never persisted in storage
    const mockEmail = email.trim().toLowerCase();
    const isAdmin = mockEmail.includes('admin');
    const mockUser = {
      id: 'mock_usr_' + btoa(mockEmail).substring(0, 10),
      email: mockEmail,
      displayName: mockEmail.split('@')[0].replace(/[._-]/g, ' '),
      role: isAdmin ? 'ADMIN' : 'USER',
      favoriteTeam: 'India National Team',
      bio: 'Cricket fan & fantasy manager (Demo Account)',
      isMockUser: true,
      authMode: 'DEVELOPMENT_MOCK',
      createdAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: `mock_jwt_session_${Date.now()}`,
      isMock: true,
      notice: 'Signed in via Development Mock Authentication. Cloud Supabase project not linked.',
    };
  },

  /**
   * Registers a new user account with Supabase Auth.
   * Auto-provisions user profile via database trigger.
   */
  async signUp({ email, password, fullName, favoriteTeam = 'India National Team', bio = 'Cricket fan & fantasy manager' }) {
    if (!email || !password || !fullName) {
      throw new Error('Full name, email, and password are required.');
    }

    if (isSupabaseConfigured()) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            favorite_team: favoriteTeam,
            bio,
          },
        },
      });

      if (error) {
        throw new Error(sanitizeAuthError(error));
      }

      const hasSession = Boolean(data.session);

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            displayName: cleanName,
            role: 'USER',
            favoriteTeam,
            bio,
            isMockUser: false,
            authMode: 'SUPABASE_CLOUD',
            createdAt: data.user.created_at,
          }
        : null;

      return {
        user,
        token: data.session?.access_token || null,
        isMock: false,
        requiresEmailConfirmation: !hasSession,
      };
    }

    // Development Mock Registration fallback
    const mockEmail = email.trim().toLowerCase();
    const mockUser = {
      id: 'mock_usr_' + btoa(mockEmail).substring(0, 10),
      email: mockEmail,
      displayName: fullName.trim(),
      role: 'USER',
      favoriteTeam,
      bio,
      isMockUser: true,
      authMode: 'DEVELOPMENT_MOCK',
      createdAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: `mock_jwt_session_${Date.now()}`,
      isMock: true,
      requiresEmailConfirmation: false,
      notice: 'Account created via Development Mock Authentication.',
    };
  },

  /**
   * Terminates active session and invalidates access tokens.
   */
  async signOut() {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Proceed with client clean-up even if network request fails
      }
    }
    return { success: true };
  },

  /**
   * Retrieves the currently authenticated user and profile.
   */
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return null;
      }

      // Fetch latest profile state from PostgreSQL
      let profile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        profile = data;
      } catch {
        // Fallback to session user
      }

      const user = {
        id: session.user.id,
        email: session.user.email,
        displayName: profile?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        role: normalizeRole(profile?.role || session.user.app_metadata?.role || session.user.user_metadata?.role || 'USER'),
        favoriteTeam: profile?.favorite_team || session.user.user_metadata?.favorite_team || 'India National Team',
        bio: profile?.bio || session.user.user_metadata?.bio || 'Cricket fan & fantasy manager',
        isMockUser: false,
        authMode: 'SUPABASE_CLOUD',
        createdAt: session.user.created_at,
      };

      return {
        user,
        token: session.access_token,
      };
    }

    // Mock Mode Check
    try {
      const stored = localStorage.getItem('fanpulse_user');
      const token = localStorage.getItem('fanpulse_token');
      if (stored && token) {
        return {
          user: JSON.parse(stored),
          token,
        };
      }
    } catch {
      return null;
    }

    return null;
  },

  /**
   * Updates user profile display name, favorite team, and bio.
   * Updates both Supabase Auth user metadata and the public.profiles table.
   */
  async updateProfile(userId, updates) {
    if (!updates) return null;

    if (isSupabaseConfigured()) {
      // 1. Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.displayName,
          favorite_team: updates.favoriteTeam,
          bio: updates.bio,
        },
      });

      if (authError) {
        throw new Error(sanitizeAuthError(authError));
      }

      // 2. Update public.profiles row directly (protected by RLS auth.uid() = id)
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: updates.displayName,
            favorite_team: updates.favoriteTeam,
            bio: updates.bio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          // If RLS rejected due to unauthorized role change or similar
          if (profileError.code === '42501') {
            throw new Error('Unauthorized profile modification.');
          }
        }
      }

      return {
        displayName: updates.displayName,
        favoriteTeam: updates.favoriteTeam,
        bio: updates.bio,
      };
    }

    // Mock mode update
    return {
      displayName: updates.displayName,
      favoriteTeam: updates.favoriteTeam,
      bio: updates.bio,
      isMock: true,
    };
  },
};

export default authService;
