import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const renderWithAuth = ({
  initialRoute = '/protected',
  user = null,
  token = null,
  isLoading = false,
  requiredRole = undefined,
} = {}) => {
  const authValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    isMockMode: true,
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
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
            <Route path="/protected" element={<div>Protected Member Area</div>} />
            <Route path="/admin" element={<div>Admin Confidential Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute Component Security Tests', () => {
  it('shows loading spinner when authentication session is initializing', () => {
    renderWithAuth({ isLoading: true });
    expect(screen.getByText(/authenticating session/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected member area/i)).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to login', () => {
    renderWithAuth({ user: null, token: null });
    expect(screen.getByText(/login page screen/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected member area/i)).not.toBeInTheDocument();
  });

  it('allows authenticated regular USER to access standard protected routes', () => {
    renderWithAuth({
      user: { id: 'usr_1', email: 'fan@fanpulse.ai', role: 'USER' },
      token: 'valid_jwt_123',
    });
    expect(screen.getByText(/protected member area/i)).toBeInTheDocument();
  });

  it('blocks regular USER from accessing ADMIN routes with Access Restricted UI', () => {
    renderWithAuth({
      initialRoute: '/admin',
      user: { id: 'usr_1', email: 'fan@fanpulse.ai', role: 'USER' },
      token: 'valid_jwt_123',
      requiredRole: 'ADMIN',
    });

    expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
    expect(screen.getByText(/requires elevated credentials/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin confidential dashboard/i)).not.toBeInTheDocument();
  });

  it('allows ADMIN user to access ADMIN protected routes', () => {
    renderWithAuth({
      initialRoute: '/admin',
      user: { id: 'admin_1', email: 'admin@fanpulse.ai', role: 'ADMIN' },
      token: 'admin_jwt_999',
      requiredRole: 'ADMIN',
    });

    expect(screen.getByText(/admin confidential dashboard/i)).toBeInTheDocument();
    expect(screen.queryByText(/access restricted/i)).not.toBeInTheDocument();
  });
});

