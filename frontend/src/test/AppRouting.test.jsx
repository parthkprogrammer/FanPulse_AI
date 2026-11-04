import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import App from '../App';

// Mock Recharts ResponsiveContainer since JSDOM lacks real dimensions
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: '800px', height: '300px' }}>{children}</div>
    ),
  };
});

const renderAppWithRoute = ({
  initialRoute = '/',
  user = null,
  token = null,
  isLoading = false,
} = {}) => {
  const authValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    isMockMode: true,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    hasRole: (role) => {
      if (!user) return false;
      const uRole = user.role === 'ROLE_ADMIN' ? 'ADMIN' : user.role;
      const rRole = role === 'ROLE_ADMIN' ? 'ADMIN' : role;
      if (uRole === 'ADMIN') return true;
      return uRole === rRole;
    },
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    logout: vi.fn(),
    toggleDemoAuth: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('App Routing & Protected Pages QA Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Public Routes & Root Redirection', () => {
    it('redirects root path "/" to "/dashboard" and renders Dashboard', async () => {
      renderAppWithRoute({ initialRoute: '/' });

      // Verifies redirected to dashboard and featured match resolves
      expect(await screen.findByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      expect(screen.getByText('184/4')).toBeInTheDocument();
    });

    it('navigates directly to "/matches" and renders Match Center', async () => {
      renderAppWithRoute({ initialRoute: '/matches' });

      expect(await screen.findByText(/Cricket Match Center/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time cricket telemetry/i)).toBeInTheDocument();
    });

    it('navigates to "/login" and renders Login Page', () => {
      renderAppWithRoute({ initialRoute: '/login' });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('navigates to "/register" and renders Registration Page', () => {
      renderAppWithRoute({ initialRoute: '/register' });

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe('2. Protected Routes — Unauthenticated Redirection', () => {
    it('redirects unauthenticated user accessing "/fantasy/teams" to "/login"', () => {
      renderAppWithRoute({
        initialRoute: '/fantasy/teams',
        user: null,
        token: null,
      });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText(/My Fantasy Teams/i)).not.toBeInTheDocument();
    });

    it('redirects unauthenticated user accessing "/fantasy/create" to "/login"', () => {
      renderAppWithRoute({
        initialRoute: '/fantasy/create',
        user: null,
        token: null,
      });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByText(/Fantasy Team Builder/i)).not.toBeInTheDocument();
    });

    it('redirects unauthenticated user accessing "/assistant" to "/login"', () => {
      renderAppWithRoute({
        initialRoute: '/assistant',
        user: null,
        token: null,
      });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByText(/Cricket Intelligence Assistant/i)).not.toBeInTheDocument();
    });

    it('redirects unauthenticated user accessing "/profile" to "/login"', () => {
      renderAppWithRoute({
        initialRoute: '/profile',
        user: null,
        token: null,
      });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByText(/User Profile/i)).not.toBeInTheDocument();
    });
  });

  describe('3. Protected Routes — Authenticated Access & RBAC', () => {
    it('allows authenticated regular USER to access protected fantasy builder', async () => {
      renderAppWithRoute({
        initialRoute: '/fantasy/create',
        user: { id: 'usr-1', email: 'fan@fanpulse.ai', role: 'USER' },
        token: 'token-123',
      });

      expect(await screen.findByText(/Fantasy Team Builder/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    });

    it('allows authenticated regular USER to access AI assistant', async () => {
      renderAppWithRoute({
        initialRoute: '/assistant',
        user: { id: 'usr-1', email: 'fan@fanpulse.ai', role: 'USER' },
        token: 'token-123',
      });

      expect(await screen.findByText(/Cricket Intelligence Assistant/i)).toBeInTheDocument();
    });

    it('blocks regular USER from accessing "/admin" with Access Restricted UI', () => {
      renderAppWithRoute({
        initialRoute: '/admin',
        user: { id: 'usr-1', email: 'fan@fanpulse.ai', role: 'USER' },
        token: 'token-123',
      });

      expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/requires elevated credentials/i)).toBeInTheDocument();
      expect(screen.queryByText(/Admin System Console/i)).not.toBeInTheDocument();
    });

    it('allows ADMIN role to access "/admin" dashboard', async () => {
      renderAppWithRoute({
        initialRoute: '/admin',
        user: { id: 'admin-1', email: 'admin@fanpulse.ai', role: 'ADMIN' },
        token: 'admin-token-999',
      });

      expect(await screen.findByText(/Platform Administration/i)).toBeInTheDocument();
      expect(screen.queryByText(/access restricted/i)).not.toBeInTheDocument();
    });
  });

  describe('4. 404 Catch-All Route', () => {
    it('renders NotFoundPage when navigating to an undefined path', () => {
      renderAppWithRoute({ initialRoute: '/nonexistent-cricket-pitch-url' });

      expect(screen.getByText(/404 — Page Not Found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/the match pitch or fantasy resource you are looking for does not exist/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument();
    });
  });
});
