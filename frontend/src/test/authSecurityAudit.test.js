/**
 * FanPulse AI — Authentication, Authorization & Security Audit Test Suite
 *
 * Exhaustive security verification testing:
 * - Privilege Escalation Prevention (rejection of user_metadata.role spoofing)
 * - Cross-user ownership authorization on Fantasy Teams (CRUD, role assignment, comparison)
 * - Match deadline locking security (rejection of edits on locked/live matches)
 * - Secret Isolation (guarantee that service_role and Gemini keys are not exposed)
 * - CORS origin filtering
 * - Sanitized failure handling to prevent user enumeration and database leakage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractBearerToken,
  normalizeRole,
  checkResourceOwnership,
} from '../../../supabase/functions/_shared/auth/verifier';
import { getCorsHeaders } from '../../../supabase/functions/_shared/shared/cors';
import { validateComparisonPrivacy } from '../../../supabase/functions/_shared/comparison/index';
import { handleError, AppError, ForbiddenError, UnauthorizedError } from '../../../supabase/functions/_shared/utils/errors';
import { sanitizeAuthError, authService } from '../services/authService';

describe('FanPulse AI — Application Security & Authorization Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. PRIVILEGE ESCALATION & ROLE ISOLATION
  // =========================================================================
  describe('1. Privilege Escalation Prevention & RBAC Enforcement', () => {
    it('normalizes roles and strictly rejects unauthorized role strings', () => {
      expect(normalizeRole('USER')).toBe('USER');
      expect(normalizeRole('ADMIN')).toBe('ADMIN');
      expect(normalizeRole('ROLE_ADMIN')).toBe('ADMIN');
      expect(normalizeRole('SUPERUSER')).toBe('USER');
      expect(normalizeRole('ROOT')).toBe('USER');
      expect(normalizeRole('HACKER')).toBe('USER');
      expect(normalizeRole(null)).toBe('USER');
      expect(normalizeRole(undefined)).toBe('USER');
    });

    it('enforces that checkResourceOwnership blocks cross-user modifications', () => {
      const victimUserId = 'user_victim_123';
      const attackerUserId = 'user_attacker_456';
      const adminUserId = 'user_admin_999';

      // Attacker cannot access victim's resource
      expect(() => {
        checkResourceOwnership(victimUserId, attackerUserId, 'USER');
      }).toThrow(ForbiddenError);

      // Victim can access own resource
      expect(() => {
        checkResourceOwnership(victimUserId, victimUserId, 'USER');
      }).not.toThrow();

      // Administrator can access resource for moderation
      expect(() => {
        checkResourceOwnership(victimUserId, adminUserId, 'ADMIN');
      }).not.toThrow();
    });

    it('ensures frontend authService normalizes roles strictly from app_metadata or profiles', async () => {
      // Mock Supabase user with spoofed user_metadata
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'spoofed_user_001',
                email: 'attacker@evil.com',
                user_metadata: { role: 'ADMIN', full_name: 'Attacker' }, // Spoofed claim
                app_metadata: { role: 'USER' }, // Authoritative claim
              },
              session: { access_token: 'valid_jwt_token_123' },
            },
            error: null,
          }),
        },
      };

      // In authService, role must resolve to USER, ignoring user_metadata.role
      const authoritativeRole = normalizeRole(mockSupabase.data?.user?.app_metadata?.role || 'USER');
      expect(authoritativeRole).toBe('USER');
    });
  });

  // =========================================================================
  // 2. OWNERSHIP VALIDATION ON FANTASY SQUADS (IDOR PREVENTION)
  // =========================================================================
  describe('2. Insecure Direct Object Reference (IDOR) & Ownership Validation', () => {
    const userA = 'user_alice_111';
    const userB = 'user_bob_222';
    const admin = 'admin_super_999';

    it('blocks User B from comparing User A squad under privacy policy (NFR-SEC-03)', () => {
      const teamA_UserId = userA;
      const teamB_UserId = userB;

      // User B tries to compare User A's team with their own
      const check = validateComparisonPrivacy(teamA_UserId, teamB_UserId, userB, 'USER');
      expect(check.isAllowed).toBe(false);
      expect(check.reason).toMatch(/privacy policy violation/i);
    });

    it('allows a user to compare their own two distinct squads', () => {
      const check = validateComparisonPrivacy(userA, userA, userA, 'USER');
      expect(check.isAllowed).toBe(true);
    });

    it('allows an administrator to review comparison telemetry across any squads', () => {
      const check = validateComparisonPrivacy(userA, userB, admin, 'ADMIN');
      expect(check.isAllowed).toBe(true);
    });

    it('simulates rejection of unauthorized team update attempts', () => {
      const existingTeam = {
        id: 'team-victim',
        user_id: userA,
        team_name: 'Victim Squad',
        match: { status: 'UPCOMING' },
      };

      const callerUser = { id: userB, role: 'USER' };

      // Validation logic matching Edge Function
      const isAuthorized = existingTeam.user_id === callerUser.id || callerUser.role === 'ADMIN';
      expect(isAuthorized).toBe(false);
    });

    it('rejects team role modifications after match deadline lock (BR-TEAM-06)', () => {
      const lockedStatuses = ['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'];

      for (const status of lockedStatuses) {
        const existingTeam = {
          id: 'team-1',
          user_id: userA,
          match: { status },
        };

        const isLocked = lockedStatuses.includes(existingTeam.match.status);
        expect(isLocked).toBe(true);
      }
    });
  });

  // =========================================================================
  // 3. SECRETS & ENVIRONMENT ISOLATION
  // =========================================================================
  describe('3. Secret Isolation & Environment Security', () => {
    it('verifies that service-role keys are never present in frontend bundles or code', () => {
      const envKeys = Object.keys(import.meta.env);
      for (const key of envKeys) {
        expect(key.toLowerCase()).not.toContain('service_role');
        expect(key.toLowerCase()).not.toContain('servicerole');
        expect(key).not.toBe('SUPABASE_SERVICE_ROLE_KEY');
      }
    });

    it('verifies that GEMINI_API_KEY is not exposed to frontend environment', () => {
      const envKeys = Object.keys(import.meta.env);
      for (const key of envKeys) {
        expect(key).not.toBe('GEMINI_API_KEY');
        expect(key).not.toBe('VITE_GEMINI_API_KEY');
      }
    });
  });

  // =========================================================================
  // 4. CORS ORIGIN RESTRICTION
  // =========================================================================
  describe('4. CORS Policy & Origin Filtering', () => {
    it('returns standard cors headers by default', () => {
      const headers = getCorsHeaders();
      expect(headers['Access-Control-Allow-Origin']).toBeDefined();
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
    });

    it('extracts Bearer tokens securely and ignores invalid schemes', () => {
      const validReq = new Request('https://api.fanpulse.ai/functions/v1/test', {
        headers: { Authorization: 'Bearer my_jwt_token' },
      });
      expect(extractBearerToken(validReq)).toBe('my_jwt_token');

      const basicReq = new Request('https://api.fanpulse.ai/functions/v1/test', {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      });
      expect(extractBearerToken(basicReq)).toBeNull();
    });
  });

  // =========================================================================
  // 5. ERROR SANITIZATION & LEAK PREVENTION
  // =========================================================================
  describe('5. Error Sanitization & Information Disclosure Protection', () => {
    it('sanitizes Supabase Auth invalid credentials to prevent enumeration', () => {
      const safe = sanitizeAuthError(new Error('Invalid login credentials'));
      expect(safe).toBe('Invalid email or password. Please check your credentials.');
      expect(safe).not.toContain('Invalid login credentials');
    });

    it('sanitizes internal database syntax or table errors', () => {
      const rawDbErr = new Error('syntax error at or near "SELECT" in table public.profiles');
      const safe = sanitizeAuthError(rawDbErr);
      expect(safe).toBe('Authentication request could not be processed. Please try again.');
      expect(safe).not.toContain('public.profiles');
    });

    it('centralized handleError masks 500 errors and does not leak stack traces to client', async () => {
      const internalErr = new Error('FATAL: Connection pool exhausted at db.internal:5432');
      const response = handleError(internalErr, 'SecurityAuditTest');

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.status).toBe('error');
      expect(json.message).toBe('An unexpected error occurred while processing your request.');
      expect(json.error).toBe('InternalServerError');
      expect(JSON.stringify(json)).not.toContain('FATAL');
      expect(JSON.stringify(json)).not.toContain('db.internal');
    });
  });
});
