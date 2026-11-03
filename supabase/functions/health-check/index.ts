/**
 * FanPulse AI — Health Check Edge Function
 *
 * Verifies that the Supabase Edge Functions runtime is healthy,
 * accepting requests, and reporting system timestamp and environment.
 */

import { handleCors } from '../_shared/cors.ts';
import { jsonResponse } from '../_shared/response.ts';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  // Health check response payload
  const healthData = {
    status: 'UP',
    service: 'fanpulse-ai-edge-functions',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: Deno.env.get('ENVIRONMENT') || 'development',
    runtime: {
      platform: 'Deno Edge Runtime',
      denoVersion: Deno.version.deno,
    },
  };

  return jsonResponse(healthData, 200);
});
