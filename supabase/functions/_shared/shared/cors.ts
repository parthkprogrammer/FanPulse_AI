/**
 * FanPulse AI — Shared CORS Policy Module
 *
 * Provides standard CORS headers and preflight handling for Supabase Edge Functions.
 * Supports origin validation via ALLOWED_ORIGIN environment variable.
 */

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, accept, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Resolves CORS headers dynamically with origin restriction when configured.
 */
export function getCorsHeaders(req?: Request): Record<string, string> {
  try {
    const allowedOriginEnv = typeof Deno !== 'undefined' ? Deno.env.get('ALLOWED_ORIGIN') : undefined;
    const requestOrigin = req?.headers.get('Origin') || req?.headers.get('origin');

    if (allowedOriginEnv) {
      const origins = allowedOriginEnv.split(',').map((o) => o.trim());
      if (requestOrigin && origins.includes(requestOrigin)) {
        return {
          ...corsHeaders,
          'Access-Control-Allow-Origin': requestOrigin,
          'Vary': 'Origin',
        };
      }
      return {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origins[0],
        'Vary': 'Origin',
      };
    }
  } catch {
    // Fallback to standard headers
  }

  return corsHeaders;
}

/**
 * Handles CORS OPTIONS preflight request.
 * Returns Response if OPTIONS, or null to continue pipeline.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}
