import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, profileUpdateSchema } from '../utils/validationSchemas';

describe('Authentication Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const valid = { email: 'fan@fanpulse.ai', password: 'password123' };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/valid email/i);
    });

    it('rejects short passwords', () => {
      const invalid = { email: 'fan@fanpulse.ai', password: '123' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/at least 6 characters/i);
    });
  });

  describe('registerSchema', () => {
    it('validates a complete, compliant registration input', () => {
      const valid = {
        fullName: 'Rohit Sharma',
        email: 'rohit@fanpulse.ai',
        password: 'Password123',
        confirmPassword: 'Password123',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects passwords without a numeric digit', () => {
      const invalid = {
        fullName: 'Virat Kohli',
        email: 'virat@fanpulse.ai',
        password: 'PasswordOnly',
        confirmPassword: 'PasswordOnly',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/numeric digit/i);
    });

    it('rejects passwords that do not match confirmPassword', () => {
      const invalid = {
        fullName: 'Virat Kohli',
        email: 'virat@fanpulse.ai',
        password: 'Password123',
        confirmPassword: 'Password456',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/do not match/i);
    });
  });

  describe('profileUpdateSchema', () => {
    it('validates valid profile data', () => {
      const valid = {
        displayName: 'Master Blaster',
        favoriteTeam: 'India',
        bio: 'Cricket analyst and fantasy strategist',
      };
      const result = profileUpdateSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects empty or single character display names', () => {
      const invalid = { displayName: 'A' };
      const result = profileUpdateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
