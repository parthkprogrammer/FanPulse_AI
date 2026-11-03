import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, normalizeRole, sanitizeAuthError } from '../services/authService';
import {
  extractBearerToken,
  normalizeRole as backendNormalizeRole,
  checkResourceOwnership,
} from '../../../supabase/functions/_shared/auth/verifier';
import { ForbiddenError } from '../../../supabase/functions/_shared/utils/errors';
import { registerSchema, loginSchema, profileUpdateSchema } from '../utils/validationSchemas';

describe('FanPulse AI — Security & Authentication Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Password Policy & Request Validation Security', () => {
    it('enforces strong password policy (min 8 chars, uppercase, lowercase, number)', () => {
      // Weak passwords
      expect(registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'short',
        confirmPassword: 'short',
      }).success).toBe(false);

      expect(registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'alllowercase1',
        confirmPassword: 'alllowercase1',
      }).success).toBe(false);

      expect(registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'ALLUPPERCASE1',
        confirmPassword: 'ALLUPPERCASE1',
      }).success).toBe(false);

      expect(registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'NoNumbersHere!',
        confirmPassword: 'NoNumbersHere!',
      }).success).toBe(false);

      // Strong valid password
      const valid = registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'CricketPass2026',
        confirmPassword: 'CricketPass2026',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects registration when password and confirmPassword do not match', () => {
      const result = registerSchema.safeParse({
        fullName: 'Virat Fan',
        email: 'virat@example.com',
        password: 'CricketPass2026',
        confirmPassword: 'DifferentPass2026',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmErr = result.error.issues.find((e) => e.path.includes('confirmPassword'));
        expect(confirmErr?.message).toMatch(/passwords do not match/i);
      }
    });

    it('validates email format strictly on login and register', () => {
      expect(loginSchema.safeParse({ email: 'notanemail', password: 'ValidPass1' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'fan@fanpulse.ai', password: 'ValidPass1' }).success).toBe(true);
    });

    it('validates profile updates and sanitizes display name length', () => {
      // Disallow 1-character names
      expect(profileUpdateSchema.safeParse({ displayName: 'A' }).success).toBe(false);
      // Valid name
      expect(profileUpdateSchema.safeParse({
        displayName: 'Sachin Tendulkar',
        favoriteTeam: 'Mumbai Indians',
        bio: 'Cricket legend fan',
      }).success).toBe(true);
    });
  });

  describe('2. Sanitized Error Handling (Anti-User Enumeration)', () => {
    it('obfuscates invalid login credentials to prevent user enumeration', () => {
      const rawSupabaseError = { message: 'Invalid login credentials' };
      const safeError = sanitizeAuthError(rawSupabaseError);
      expect(safeError).toBe('Invalid email or password. Please check your credentials.');
      // Must not reveal whether email exists
      expect(safeError).not.toContain('User not found');
      expect(safeError).not.toContain('Password incorrect');
    });

    it('maps email already registered without leaking database internals', () => {
      const rawConflictError = { message: 'User already registered' };
      const safeError = sanitizeAuthError(rawConflictError);
      expect(safeError).toBe('An account with this email already exists. Please sign in instead.');
    });

    it('sanitizes unexpected internal errors safely', () => {
      const rawDbError = { message: 'pg_exec: relation "auth.users" failed with code 500' };
      const safeError = sanitizeAuthError(rawDbError);
      expect(safeError).toBe('Authentication request could not be processed. Please try again.');
      expect(safeError).not.toContain('pg_exec');
    });
  });

  describe('3. Role Normalization & RBAC Hierarchy', () => {
    it('normalizes roles correctly across frontend and backend modules', () => {
      expect(normalizeRole('USER')).toBe('USER');
      expect(normalizeRole('ROLE_USER')).toBe('USER');
      expect(normalizeRole('ADMIN')).toBe('ADMIN');
      expect(normalizeRole('ROLE_ADMIN')).toBe('ADMIN');
      expect(normalizeRole(null)).toBe('USER');
      expect(normalizeRole(undefined)).toBe('USER');

      expect(backendNormalizeRole('ROLE_ADMIN')).toBe('ADMIN');
      expect(backendNormalizeRole('ADMIN')).toBe('ADMIN');
      expect(backendNormalizeRole('USER')).toBe('USER');
    });

    it('enforces resource ownership security (NFR-SEC-03, NFR-SEC-04)', () => {
      const ownerId = 'usr_owner_123';
      const attackerId = 'usr_attacker_456';
      const adminId = 'usr_admin_999';

      // 1. Owner can access their own resource
      expect(() => checkResourceOwnership(ownerId, ownerId, 'USER')).not.toThrow();

      // 2. Administrator can access any user resource
      expect(() => checkResourceOwnership(ownerId, adminId, 'ADMIN')).not.toThrow();
      expect(() => checkResourceOwnership(ownerId, adminId, 'ROLE_ADMIN')).not.toThrow();

      // 3. Unauthorized third-party user is denied
      expect(() => checkResourceOwnership(ownerId, attackerId, 'USER')).toThrow(ForbiddenError);
    });
  });

  describe('4. Token Security & Extraction', () => {
    it('extracts Bearer token correctly from HTTP Authorization headers', () => {
      const req = new Request('https://api.fanpulse.ai/functions/v1/test', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken',
        },
      });

      const token = extractBearerToken(req);
      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken');
    });

    it('rejects malformed or non-Bearer authorization headers', () => {
      const reqBasic = new Request('https://api.fanpulse.ai/functions/v1/test', {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      });
      expect(extractBearerToken(reqBasic)).toBeNull();

      const reqEmpty = new Request('https://api.fanpulse.ai/functions/v1/test');
      expect(extractBearerToken(reqEmpty)).toBeNull();
    });
  });

  describe('5. Client Session Management & Local Storage Security', () => {
    it('authenticates user and never stores plaintext passwords in frontend storage', async () => {
      const testEmail = 'cricketlover@fanpulse.ai';
      const testPassword = 'SecretPassword123';

      const result = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();

      // Verify password was NOT saved in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        expect(value).not.toContain(testPassword);
      }
    });

    it('clears session on signOut', async () => {
      await authService.signIn({ email: 'fan@fanpulse.ai', password: 'Password123' });
      await authService.signOut();

      // Confirm clean state
      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('identifies and marks mock user sessions transparently', async () => {
      const result = await authService.signIn({
        email: 'demo@fanpulse.ai',
        password: 'Password123',
      });

      // In mock mode (no cloud config), notice is explicitly attached
      if (result.isMock) {
        expect(result.user.isMockUser).toBe(true);
        expect(result.user.authMode).toBe('DEVELOPMENT_MOCK');
        expect(result.notice).toMatch(/development mock authentication/i);
      }
    });
  });

  describe('6. Environment & Secret Isolation Security', () => {
    it('verifies that the service-role key is NOT exposed to frontend environment', () => {
      // In Vite, import.meta.env exposes VITE_* variables
      const envKeys = Object.keys(import.meta.env);
      const serviceRoleExposed = envKeys.some((k) =>
        k.toLowerCase().includes('service_role') || k.toLowerCase().includes('servicerole')
      );
      expect(serviceRoleExposed).toBe(false);
    });

    it('verifies that Gemini secret keys are NOT exposed to frontend environment', () => {
      const envKeys = Object.keys(import.meta.env);
      const geminiApiKeyExposed = envKeys.some(
        (k) => k === 'GEMINI_API_KEY' || k === 'VITE_GEMINI_API_KEY'
      );
      expect(geminiApiKeyExposed).toBe(false);
    });
  });
});

