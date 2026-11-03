import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

const renderLoginPage = (customAuthValue = null) => {
  if (customAuthValue) {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={customAuthValue}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Component — Form Validation, API States & Accessibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering', () => {
    it('renders login form elements, inputs, and development mock mode badge', () => {
      renderLoginPage();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/development mock mode/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    });
  });

  describe('2. Form Validation', () => {
    it('validates empty inputs on submit and displays error messages', async () => {
      renderLoginPage();

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format: rejects malformed email address', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates password minimum length: rejects password with less than 6 characters', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const pwdInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'fan@fanpulse.ai' } });
      fireEvent.change(pwdInput, { target: { value: '12345' } });

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. User Interaction & API States', () => {
    it('submits valid credentials and triggers signIn authentication', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        user: { id: 'usr-1', email: 'fan@fanpulse.ai' },
        isMock: true,
      });

      renderLoginPage({
        signIn: mockSignIn,
        isMockMode: true,
        user: null,
        token: null,
      });

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'fan@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'fan@fanpulse.ai',
          password: 'Password123',
        });
      });

      expect(
        await screen.findByText(/signed in with development mock authentication\./i)
      ).toBeInTheDocument();
    });

    it('renders server error alert when authentication fails', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(
        new Error('Invalid login credentials provided.')
      );

      renderLoginPage({
        signIn: mockSignIn,
        isMockMode: false,
        user: null,
        token: null,
      });

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass123' } });

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid login credentials provided\./i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('4. Accessibility Basics', () => {
    it('provides accessible inputs with proper IDs, labels, and types', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('id', 'input-email-address');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');

      expect(passwordInput).toHaveAttribute('id', 'input-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('updates aria-invalid to true when validation fails', async () => {
      renderLoginPage();

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
