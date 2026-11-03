/**
 * FanPulse AI — Authentication & Authorization Verification Module
 *
 * Verifies JWT tokens, extracts caller credentials, and enforces
 * role-based access control (RBAC) in Supabase Edge Functions.
 */

import { UnauthorizedError, ForbiddenError } from '../utils/errors.ts';
import { createCallerClient } from '../supabaseClient.ts';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: string;
  metadata?: Record<string, unknown>;
  token: string;
}

/**
 * Extracts Bearer token from the Request Authorization header
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
 * Verifies the caller's JWT token via Supabase Auth.
 * Throws UnauthorizedError if token is absent, expired, or invalid.
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
      throw new UnauthorizedError(error?.message || 'Invalid or expired authentication token.');
    }

    const role = (user.app_metadata?.role as string) || 'ROLE_USER';

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role,
      metadata: user.user_metadata,
      token,
    };

    // If an elevated role is required, verify membership
    if (requiredRole && role !== requiredRole && role !== 'ROLE_ADMIN') {
      throw new ForbiddenError(
        `Insufficient privileges. Required role: "${requiredRole}", current role: "${role}".`
      );
    }

    return authUser;
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      throw err;
    }
    throw new UnauthorizedError('Failed to verify caller authentication token.');
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

