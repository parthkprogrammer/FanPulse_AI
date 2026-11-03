/**
 * FanPulse AI — Manage Players Edge Function
 *
 * Protected administrative operations for cricket athletes:
 * master profile creation, metadata updates, and match performance logging.
 * Restricted strictly to users holding the ADMIN role (NFR-SEC-04).
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { validatePlayerInput, type PlayerRole } from '../_shared/players/index.ts';
import { handleError, ValidationError, NotFoundError, ConflictError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const method = req.method.toUpperCase();
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return errorResponse('Method Not Allowed. Use POST, PUT, or PATCH.', 405, 'MethodNotAllowed');
  }

  try {
    // 2. Enforce Administrator Role (NFR-SEC-04)
    const adminUser = await verifyAuth(req, { requiredRole: 'ADMIN' });

    const body = await req.json().catch(() => ({}));
    const action = body.action || (method === 'POST' ? 'create' : 'update');

    const supabase = createCallerClient(req);

    // =========================================================================
    // ACTION: CREATE PLAYER PROFILE
    // =========================================================================
    if (action === 'create') {
      const {
        id,
        name,
        shortName,
        country,
        primaryRole,
        battingStyle,
        bowlingStyle,
        imageUrl,
      } = body;

      const validation = validatePlayerInput({
        name,
        shortName,
        country,
        primaryRole,
      });

      if (!validation.isValid) {
        throw new ValidationError('Player creation validation failed.', validation.errors);
      }

      const playerId = id || `p-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const { data, error } = await supabase
        .from('players')
        .insert({
          id: playerId,
          name: name.trim(),
          short_name: shortName.trim(),
          country: country.trim(),
          primary_role: primaryRole,
          batting_style: battingStyle || null,
          bowling_style: bowlingStyle || null,
          image_url: imageUrl || null,
        })
        .select('*')
        .single();

      if (error) {
        logger.error('ManagePlayers', 'Failed to create player profile', { error, playerId });
        if (error.code === '23505') {
          throw new ConflictError(`Player with ID "${playerId}" already exists.`);
        }
        throw new Error(error.message);
      }

      logger.info('ManagePlayers', `Player profile created successfully: ${playerId}`, {
        adminId: adminUser.id,
        playerId,
      });

      return jsonResponse(
        {
          player: data,
          message: 'Player profile created successfully.',
        },
        201
      );
    }

    // =========================================================================
    // ACTION: UPDATE PLAYER PROFILE
    // =========================================================================
    if (action === 'update') {
      const playerId = body.playerId || body.id;
      if (!playerId) {
        throw new ValidationError('playerId is required to update a player profile.');
      }

      const updates: Record<string, unknown> = {};
      if (body.name) updates.name = body.name.trim();
      if (body.shortName) updates.short_name = body.shortName.trim();
      if (body.country) updates.country = body.country.trim();
      if (body.primaryRole) updates.primary_role = body.primaryRole as PlayerRole;
      if (body.battingStyle) updates.batting_style = body.battingStyle;
      if (body.bowlingStyle) updates.bowling_style = body.bowlingStyle;
      if (body.imageUrl) updates.image_url = body.imageUrl;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId)
        .select('*')
        .single();

      if (error || !data) {
        throw new NotFoundError(`Player record "${playerId}" not found or update failed.`);
      }

      logger.info('ManagePlayers', `Player profile updated: ${playerId}`, {
        adminId: adminUser.id,
        playerId,
      });

      return jsonResponse({
        player: data,
        message: 'Player profile updated successfully.',
      });
    }

    // =========================================================================
    // ACTION: RECORD MATCH PERFORMANCE STATISTICS
    // =========================================================================
    if (action === 'record-stats') {
      const {
        matchId,
        playerId,
        teamId,
        inningsNumber = 1,
        runsScored = 0,
        ballsFaced = 0,
        fours = 0,
        sixes = 0,
        isOut = false,
        dismissalType,
        oversBowled = 0.0,
        maidens = 0,
        runsConceded = 0,
        wicketsTaken = 0,
        catches = 0,
        stumpings = 0,
        runOuts = 0,
      } = body;

      if (!matchId || !playerId || !teamId) {
        throw new ValidationError('matchId, playerId, and teamId are required to record statistics.');
      }

      const strikeRate = ballsFaced > 0 ? Number(((runsScored / ballsFaced) * 100).toFixed(2)) : null;
      const economyRate = oversBowled > 0 ? Number((runsConceded / oversBowled).toFixed(2)) : null;

      const { data, error } = await supabase
        .from('player_match_statistics')
        .upsert({
          match_id: matchId,
          player_id: playerId,
          team_id: teamId,
          innings_number: inningsNumber,
          runs_scored: runsScored,
          balls_faced: ballsFaced,
          fours,
          sixes,
          strike_rate: strikeRate,
          is_out: isOut,
          dismissal_type: dismissalType || null,
          overs_bowled: oversBowled,
          maidens,
          runs_conceded: runsConceded,
          wickets_taken: wicketsTaken,
          economy_rate: economyRate,
          catches,
          stumpings,
          run_outs: runOuts,
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      logger.info('ManagePlayers', `Match performance recorded: ${playerId} in match ${matchId}`, {
        adminId: adminUser.id,
        matchId,
        playerId,
      });

      return jsonResponse({
        stats: data,
        message: 'Player match statistics recorded successfully.',
      });
    }

    return errorResponse(`Unrecognized action "${action}". Valid actions: create, update, record-stats.`, 400, 'BadRequest');
  } catch (err: unknown) {
    return handleError(err, 'ManagePlayers');
  }
});

