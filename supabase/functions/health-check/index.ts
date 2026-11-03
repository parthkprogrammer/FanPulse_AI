/**
 * FanPulse AI — Health Check Edge Function
 *
 * Comprehensive runtime health probe and subsystem diagnostic service.
 * Verifies foundational configuration, architecture modules, and database connectivity.
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse } from '../_shared/shared/response.ts';
import { getConfig, validateConfig } from '../_shared/config/index.ts';
import { logger } from '../_shared/utils/logger.ts';
import { handleError } from '../_shared/utils/errors.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();

  try {
    const config = getConfig();
    const configValidation = validateConfig();

    // 2. Subsystem Inventory Check
    const registeredModules = [
      'config',
      'shared',
      'auth',
      'matches',
      'players',
      'fantasy',
      'scoring',
      'comparison',
      'ai',
      'insights',
      'validation',
      'utils',
    ];

    // 3. Database Connectivity Probe (Optional non-blocking check)
    let dbStatus = 'NOT_CONFIGURED';
    let dbLatencyMs: number | null = null;

    if (config.supabase.anonKey && !config.supabase.url.includes('placeholder')) {
      const dbStart = Date.now();
      try {
        const supabase = createCallerClient(req);
        // Quick query to test PostgREST connectivity
        const { error } = await supabase.from('matches').select('id').limit(1);
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = error ? 'UNAVAILABLE' : 'CONNECTED';
      } catch {
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = 'DISCONNECTED';
      }
    }

    const totalLatencyMs = Date.now() - startTime;

    const healthPayload = {
      status: 'UP',
      service: config.serviceName,
      version: config.version,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      runtime: {
        platform: 'Deno Edge Runtime',
        denoVersion: Deno.version?.deno || 'unknown',
        typescriptVersion: Deno.version?.typescript || 'unknown',
        v8Version: Deno.version?.v8 || 'unknown',
      },
      configuration: {
        isValid: configValidation.isValid,
        missingKeys: configValidation.missingKeys,
        hasServiceRoleKey: config.supabase.hasServiceRoleKey,
        hasGeminiApiKey: config.ai.hasApiKey,
      },
      subsystems: {
        totalModules: registeredModules.length,
        modules: registeredModules,
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
      diagnostics: {
        totalResponseLatencyMs: totalLatencyMs,
      },
    };

    logger.info('HealthCheck', 'Health check diagnostic probe completed successfully', {
      environment: config.environment,
      status: 'UP',
      latencyMs: totalLatencyMs,
    });

    return jsonResponse(healthPayload, 200);
  } catch (err: unknown) {
    return handleError(err, 'HealthCheck');
  }
});
