import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, isSupabaseConfigured, normalizeRole } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fanpulse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('fanpulse_token') || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const isMockMode = !isSupabaseConfigured();

  // Helper to persist session cache
  const setPersistedSession = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    if (userData && accessToken) {
      localStorage.setItem('fanpulse_user', JSON.stringify(userData));
      localStorage.setItem('fanpulse_token', accessToken);
    } else {
      localStorage.removeItem('fanpulse_user');
      localStorage.removeItem('fanpulse_token');
    }
  };

  // Synchronize Supabase Cloud Auth session on mount and state changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured()) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const current = await authService.getCurrentUser();
        if (mounted) {
          if (current) {
            setPersistedSession(current.user, current.token);
          } else {
            setPersistedSession(null, null);
          }
        }
      } catch (err) {
        if (mounted) setPersistedSession(null, null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          try {
            // Retrieve fresh profile from PostgreSQL
            let profile = null;
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              profile = data;
            } catch {
              // Non-blocking fallback
            }

            const authUser = {
              id: session.user.id,
              email: session.user.email,
              displayName: profile?.display_name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              role: normalizeRole(profile?.role || session.user.app_metadata?.role || session.user.user_metadata?.role || 'USER'),
              favoriteTeam: profile?.favorite_team || session.user.user_metadata?.favorite_team || 'India National Team',
              bio: profile?.bio || session.user.user_metadata?.bio || 'Cricket fan & fantasy manager',
              isMockUser: false,
              authMode: 'SUPABASE_CLOUD',
              createdAt: session.user.created_at,
            };

            setPersistedSession(authUser, session.access_token);
          } catch {
            // Keep existing state if fetch fails
          }
        } else if (event === 'SIGNED_OUT') {
          setPersistedSession(null, null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(credentials);
      setPersistedSession(result.user, result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(credentials);
      if (result.user && result.token) {
        setPersistedSession(result.user, result.token);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setPersistedSession(null, null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const updatedFields = await authService.updateProfile(user?.id, profileData);
      const updatedUser = { ...user, ...updatedFields };
      setPersistedSession(updatedUser, token);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    if (current) {
      setPersistedSession(current.user, current.token);
      return current.user;
    }
    return null;
  }, []);

  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    const userRole = normalizeRole(user.role);
    const targetRole = normalizeRole(requiredRole);
    if (userRole === 'ADMIN') return true; // Admins satisfy all role checks
    return userRole === targetRole;
  }, [user]);

  const toggleDemoAuth = () => {
    if (user) {
      signOut();
    } else {
      const mockUser = {
        id: 'mock_demo_fan',
        email: 'cricketfan@fanpulse.ai',
        displayName: 'Demo Cricket Fan',
        role: 'USER',
        favoriteTeam: 'India National Team',
        bio: 'Fantasy manager & cricket analyst',
        isMockUser: true,
        authMode: 'DEVELOPMENT_MOCK',
      };
      const mockToken = `mock_token_${Date.now()}`;
      setPersistedSession(mockUser, mockToken);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: normalizeRole(user?.role) === 'ADMIN',
    isLoading,
    isMockMode,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateProfile,
    refreshCurrentUser,
    hasRole,
    toggleDemoAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
