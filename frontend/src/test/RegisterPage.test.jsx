import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import RegisterPage from '../pages/RegisterPage';

const renderRegisterPage = (customAuthValue = null) => {
  if (customAuthValue) {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={customAuthValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RegisterPage Component — Form Validation, API States & Accessibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering', () => {
    it('renders all form input fields, labels, placeholders, and submit button', () => {
      renderRegisterPage();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/development mock mode/i)).toBeInTheDocument();
    });

    it('renders password complexity helper text for user guidance', () => {
      renderRegisterPage();

      expect(
        screen.getByText(/must be 8\+ chars with uppercase, lowercase, and a number\./i)
      ).toBeInTheDocument();
    });
  });

  describe('2. Form Validation', () => {
    it('displays validation errors on empty submission', async () => {
      renderRegisterPage();

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('validates full name format rejecting numeric or special characters', async () => {
      renderRegisterPage();

      const nameInput = screen.getByLabelText(/full name/i);
      fireEvent.change(nameInput, { target: { value: 'User12345!' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/full name contains invalid characters/i)).toBeInTheDocument();
      });
    });

    it('validates email format rejecting malformed address', async () => {
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'not-a-valid-email' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('enforces password complexity: rejects password missing uppercase letter', async () => {
      renderRegisterPage();

      const pwdInput = screen.getByLabelText(/^password/i);
      fireEvent.change(pwdInput, { target: { value: 'alllowercase1' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/password must include at least one uppercase letter/i)
        ).toBeInTheDocument();
      });
    });

    it('enforces password complexity: rejects password missing numeric digit', async () => {
      renderRegisterPage();

      const pwdInput = screen.getByLabelText(/^password/i);
      fireEvent.change(pwdInput, { target: { value: 'PasswordNoDigit' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/password must include at least one numeric digit/i)
        ).toBeInTheDocument();
      });
    });

    it('enforces password confirmation match: rejects mismatching confirmation', async () => {
      renderRegisterPage();

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Virat Kohli' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'virat@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secret123!' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentSecret456!' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. User Interaction & API States', () => {
    it('submits valid registration form and displays success notice', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: { id: 'usr-new-1', email: 'virat@fanpulse.ai' },
        requiresEmailConfirmation: false,
      });

      renderRegisterPage({
        signUp: mockSignUp,
        isMockMode: true,
        user: null,
        token: null,
      });

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Virat Kohli' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'virat@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass123' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'virat@fanpulse.ai',
          password: 'StrongPass123',
          fullName: 'Virat Kohli',
        });
      });

      expect(await screen.findByText(/account created successfully!/i)).toBeInTheDocument();
    });

    it('handles email confirmation required response on sign up', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: { id: 'usr-new-2', email: 'fan@fanpulse.ai' },
        requiresEmailConfirmation: true,
      });

      renderRegisterPage({
        signUp: mockSignUp,
        isMockMode: false,
        user: null,
        token: null,
      });

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Rohit Sharma' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'rohit@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'CaptainHitman45' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'CaptainHitman45' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/registration successful! please check your email for confirmation link\./i)
        ).toBeInTheDocument();
      });
    });

    it('renders error alert when registration API service fails', async () => {
      const mockSignUp = vi.fn().mockRejectedValue(
        new Error('User already registered with this email address.')
      );

      renderRegisterPage({
        signUp: mockSignUp,
        isMockMode: false,
        user: null,
        token: null,
      });

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Existing User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'duplicate@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/user already registered with this email address\./i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('4. Accessibility Basics', () => {
    it('provides accessible inputs linked to labels via htmlFor and id attributes', () => {
      renderRegisterPage();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      expect(nameInput).toHaveAttribute('id', 'input-full-name');
      expect(emailInput).toHaveAttribute('id', 'input-email-address');
      expect(passwordInput).toHaveAttribute('id', 'input-password');
      expect(confirmInput).toHaveAttribute('id', 'input-confirm-password');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmInput).toHaveAttribute('type', 'password');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('marks fields as aria-invalid when validation fails', async () => {
      renderRegisterPage();

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
