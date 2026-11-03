import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, isSupabaseConfigured } from '../services/authService';
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

  const [isLoading, setIsLoading] = useState(false);
  const isMockMode = !isSupabaseConfigured();

  // Synchronize Supabase cloud auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const authUser = {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.app_metadata?.role || 'ROLE_USER',
            isMockUser: false,
            authMode: 'SUPABASE_CLOUD',
          };
          setUser(authUser);
          setToken(session.access_token);
          localStorage.setItem('fanpulse_user', JSON.stringify(authUser));
          localStorage.setItem('fanpulse_token', session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          localStorage.removeItem('fanpulse_user');
          localStorage.removeItem('fanpulse_token');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(credentials);
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('fanpulse_user', JSON.stringify(result.user));
      localStorage.setItem('fanpulse_token', result.token);
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
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('fanpulse_user', JSON.stringify(result.user));
        localStorage.setItem('fanpulse_token', result.token);
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
      setUser(null);
      setToken(null);
      localStorage.removeItem('fanpulse_user');
      localStorage.removeItem('fanpulse_token');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const updatedFields = await authService.updateProfile(profileData);
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem('fanpulse_user', JSON.stringify(updatedUser));
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDemoAuth = () => {
    if (user) {
      signOut();
    } else {
      const mockUser = {
        id: 'mock_demo_fan',
        email: 'cricketfan@fanpulse.ai',
        displayName: 'Demo Cricket Fan',
        role: 'ROLE_USER',
        favoriteTeam: 'India National Team',
        bio: 'Fantasy manager & cricket analyst',
        isMockUser: true,
        authMode: 'DEVELOPMENT_MOCK',
      };
      const mockToken = `mock_token_${Date.now()}`;
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('fanpulse_user', JSON.stringify(mockUser));
      localStorage.setItem('fanpulse_token', mockToken);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    isMockMode,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateProfile,
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
