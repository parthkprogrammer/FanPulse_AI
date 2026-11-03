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

export const authService = {
  isConfigured: isSupabaseConfigured,

  async signIn({ email, password }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.full_name || email.split('@')[0],
          role: data.user.app_metadata?.role || 'ROLE_USER',
          isMockUser: false,
          authMode: 'SUPABASE_CLOUD',
        },
        token: data.session.access_token,
        isMock: false,
      };
    }

    // Development Mock Authentication fallback
    // Passwords are strictly ignored and never persisted
    const mockUser = {
      id: 'mock_usr_' + btoa(email).substring(0, 10),
      email,
      displayName: email.split('@')[0].replace(/[._-]/g, ' '),
      role: email.includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER',
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

  async signUp({ email, password, fullName }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          displayName: fullName,
          role: 'ROLE_USER',
          isMockUser: false,
          authMode: 'SUPABASE_CLOUD',
        } : null,
        token: data.session?.access_token || null,
        isMock: false,
        requiresEmailConfirmation: !data.session,
      };
    }

    // Development Mock Registration fallback
    // Passwords are never saved
    const mockUser = {
      id: 'mock_usr_' + btoa(email).substring(0, 10),
      email,
      displayName: fullName,
      role: 'ROLE_USER',
      favoriteTeam: 'Not selected',
      bio: 'New FanPulse AI Member (Demo Account)',
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

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    return { success: true };
  },

  async updateProfile(updates) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.displayName,
          favorite_team: updates.favoriteTeam,
          bio: updates.bio,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        displayName: updates.displayName,
        favoriteTeam: updates.favoriteTeam,
        bio: updates.bio,
      };
    }

    // Mock update: return updated object
    return {
      displayName: updates.displayName,
      favoriteTeam: updates.favoriteTeam,
      bio: updates.bio,
      isMock: true,
    };
  },
};

export default authService;
