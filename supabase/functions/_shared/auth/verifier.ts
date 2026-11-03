/**
 * FanPulse AI — Authentication & Authorization Verification Module
 *
 * Verifies JWT tokens, extracts caller credentials, and enforces
 * role-based access control (RBAC) in Supabase Edge Functions.
 */

import { UnauthorizedError, ForbiddenError } from '../utils/errors.ts';
import { createCallerClient } from '../supabaseClient.ts';

export type UserRole = 'USER' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: UserRole;
  rawRole: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
  token: string;
}

/**
 * Normalizes role representations across app_metadata, DB profiles, and legacy constants.
 * Standardizes to 'USER' | 'ADMIN'.
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'USER';
  const clean = String(role).trim().toUpperCase();
  if (clean === 'ADMIN' || clean === 'ROLE_ADMIN') {
    return 'ADMIN';
  }
  return 'USER';
}

/**
 * Extracts Bearer token from the Request Authorization header.
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }

  return null;
}

/**
 * Enforces resource ownership security (NFR-SEC-03, NFR-SEC-04).
 * Rejects requests if caller is not resource owner and does not hold ADMIN role.
 */
export function checkResourceOwnership(
  resourceUserId: string,
  callerUserId: string,
  callerRole?: string | null
): void {
  const isOwner = resourceUserId === callerUserId;
  const isAdmin = normalizeRole(callerRole) === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Access denied: you do not have permission to access or modify this resource.');
  }
}

/**
 * Verifies caller JWT token via Supabase Auth identity.
 * Validates token signature, expiration, and user existence.
 * Enforces role-based access control when requiredRole is provided.
 */
export async function verifyAuth(
  req: Request,
  { requiredRole }: { requiredRole?: string } = {}
): Promise<AuthenticatedUser> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedError('Authentication required. Missing Bearer authorization token.');
  }

  try {
    const supabase = createCallerClient(req);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired authentication session.');
    }

    const rawRole = (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'USER';
    const normalizedRole = normalizeRole(rawRole);

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: normalizedRole,
      rawRole,
      displayName: user.user_metadata?.full_name || user.email?.split('@')[0],
      metadata: user.user_metadata,
      token,
    };

    // If an elevated role (e.g., ADMIN) is required, enforce RBAC
    if (requiredRole) {
      const requiredNormalized = normalizeRole(requiredRole);
      if (requiredNormalized === 'ADMIN' && authUser.role !== 'ADMIN') {
        throw new ForbiddenError(
          `Insufficient privileges. Required role: "${requiredRole}", caller role: "${authUser.role}".`
        );
      }
    }

    return authUser;
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      throw err;
    }
    // Prevent leaking internal error details
    throw new UnauthorizedError('Authentication failed. Invalid or expired session credentials.');
  }
}

/**
 * Optional authentication verification: returns user if valid token present, null if guest.
 */
export async function tryVerifyAuth(req: Request): Promise<AuthenticatedUser | null> {
  try {
    const token = extractBearerToken(req);
    if (!token) return null;
    return await verifyAuth(req);
  } catch {
    return null;
  }
}
