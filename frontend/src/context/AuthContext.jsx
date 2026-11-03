import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = (userData, authToken = 'mock-demo-jwt-token') => {
    setUser(userData);
    setToken(authToken);
    try {
      localStorage.setItem('fanpulse_user', JSON.stringify(userData));
      localStorage.setItem('fanpulse_token', authToken);
    } catch (e) {
      console.error('Failed to save auth to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('fanpulse_user');
      localStorage.removeItem('fanpulse_token');
    } catch (e) {
      console.error('Failed to clear auth from localStorage', e);
    }
  };

  // Demo toggle helper to easily test protected route access in preview mode
  const toggleDemoAuth = () => {
    if (user) {
      logout();
    } else {
      login({
        id: 'usr_demo_01',
        email: 'cricketfan@fanpulse.ai',
        displayName: 'Demo User',
        role: 'ROLE_USER',
      });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
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
