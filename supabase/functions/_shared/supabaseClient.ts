/**
 * Server-side Supabase client factory for Edge Functions.
 *
 * Utilizes standard runtime environment variables provided by Supabase Edge Runtime:
 * - SUPABASE_URL: Project API URL
 * - SUPABASE_ANON_KEY: Client anonymous key
 * - SUPABASE_SERVICE_ROLE_KEY: Privileged service role key (bypasses RLS)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client that acts in the context of the calling user.
 * Forwards the caller's JWT token so Row Level Security (RLS) is respected.
 */
export function createCallerClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const authHeader = req.headers.get('Authorization') ?? '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Creates an admin Supabase client with service-role privileges.
 * WARNING: Bypasses Row Level Security (RLS). Use only for verified system tasks
 * like deterministic fantasy score calculation and verified stat ingestion.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
