/**
 * FanPulse AI — External Cricket Data Sync Edge Function
 *
 * Secure server-side proxy and synchronization service for external cricket telemetry.
 * Communicates with authorized external REST providers (CricketData.org / CricAPI)
 * via provider abstraction layer with automatic fallback to grounded sample data.
 *
 * Prevents client exposure of API keys, enforces timeouts, handles rate-limits,
 * and supports administrative database sync.
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth, tryVerifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { getCricketDataProvider } from '../_shared/cricketProvider/index.ts';
import { handleError, ValidationError, ForbiddenError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const method = req.method.toUpperCase();
  const url = new URL(req.url);

  try {
    const body = method !== 'GET' ? await req.json().catch(() => ({})) : {};
    const action =
      body.action ||
      url.searchParams.get('action') ||
      (method === 'POST' ? 'get-live-matches' : 'provider-status');

    const provider = getCricketDataProvider();

    // =========================================================================
    // ACTION 1: PROVIDER STATUS & HEALTH METRICS
    // =========================================================================
    if (action === 'provider-status') {
      const metadata = provider.getMetadata();
      return jsonResponse({
        status: 'healthy',
        provider: metadata,
        environment: Deno.env.get('ENVIRONMENT') || 'development',
      });
    }

    // =========================================================================
    // ACTION 2: GET LIVE / RECENT MATCHES FROM PROVIDER
    // =========================================================================
    if (action === 'get-live-matches') {
      const status = body.status || url.searchParams.get('status') || 'ALL';
      const format = body.format || url.searchParams.get('format') || 'ALL';
      const limit = Number(body.limit || url.searchParams.get('limit') || 20);

      const matches = await provider.getMatches({ status, format, limit });
      const metadata = provider.getMetadata();

      return jsonResponse({
        matches,
        total: matches.length,
        metadata,
      });
    }

    // =========================================================================
    // ACTION 3: GET MATCH SCORECARD FROM PROVIDER
    // =========================================================================
    if (action === 'get-match-scorecard') {
      const matchId = body.matchId || url.searchParams.get('matchId') || url.searchParams.get('id');
      if (!matchId) {
        throw new ValidationError('matchId parameter is required.');
      }

      const scorecard = await provider.getMatchScorecard(matchId);
      const metadata = provider.getMetadata();

      if (!scorecard) {
        return errorResponse(`Scorecard for match "${matchId}" not found.`, 404, 'NotFound');
      }

      return jsonResponse({
        scorecard,
        metadata,
      });
    }

    // =========================================================================
    // ACTION 4: SYNC LIVE MATCH TO SUPABASE POSTGRESQL (ADMIN ONLY)
    // =========================================================================
    if (action === 'sync-to-database') {
      const authUser = await verifyAuth(req, { requiredRole: 'ADMIN' });
      const matchId = body.matchId || url.searchParams.get('matchId');

      if (!matchId) {
        throw new ValidationError('matchId is required for database synchronization.');
      }

      const matchDetail = await provider.getMatchDetail(matchId);
      if (!matchDetail) {
        return errorResponse(`Match "${matchId}" not found in provider feed.`, 404, 'NotFound');
      }

      const supabase = createCallerClient(req);

      // Upsert fixture into matches table
      const { data: syncedMatch, error: matchErr } = await supabase
        .from('matches')
        .upsert(
          {
            id: matchDetail.id,
            title: matchDetail.title,
            format: matchDetail.format,
            status: matchDetail.status,
            venue: matchDetail.venue,
            match_date: matchDetail.matchDate,
            result_summary: matchDetail.resultSummary,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single();

      if (matchErr) {
        logger.error('SyncCricketData', 'Database match upsert error', matchErr);
        throw new Error(`Failed to sync match to database: ${matchErr.message}`);
      }

      logger.info('SyncCricketData', `Match ${matchDetail.id} successfully synced to database by admin ${authUser.id}`);

      return jsonResponse({
        message: 'Match successfully synchronized to database.',
        syncedMatch,
        metadata: provider.getMetadata(),
      });
    }

    return errorResponse(
      `Unrecognized action "${action}". Valid actions: provider-status, get-live-matches, get-match-scorecard, sync-to-database.`,
      400,
      'BadRequest'
    );
  } catch (err: unknown) {
    return handleError(err, 'SyncCricketData');
  }
});
