/**
 * FanPulse AI — Manage Matches Edge Function
 *
 * Protected administrative operations for cricket match fixtures:
 * creation, updates, and lifecycle status management.
 * Restricted strictly to users holding the ADMIN role (NFR-SEC-04).
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { validateMatchInput, isValidStatusTransition, type MatchStatus } from '../_shared/matches/index.ts';
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
    // ACTION: CREATE MATCH FIXTURE
    // =========================================================================
    if (action === 'create') {
      const {
        id,
        title,
        team1Id,
        team2Id,
        format,
        venue,
        matchDate,
        status = 'UPCOMING',
        tossWinnerTeamId,
        tossDecision,
      } = body;

      const validation = validateMatchInput({
        title,
        team1Id,
        team2Id,
        format,
        venue,
        matchDate,
        status,
      });

      if (!validation.isValid) {
        throw new ValidationError('Match creation validation failed.', validation.errors);
      }

      const matchId = id || `m-${Date.now()}`;

      // Insert fixture into database (protected by RLS admin check)
      const { data, error } = await supabase
        .from('matches')
        .insert({
          id: matchId,
          title: title.trim(),
          team1_id: team1Id,
          team2_id: team2Id,
          format,
          status,
          venue: venue.trim(),
          match_date: matchDate,
          toss_winner_team_id: tossWinnerTeamId || null,
          toss_decision: tossDecision || null,
        })
        .select('*')
        .single();

      if (error) {
        logger.error('ManageMatches', 'Failed to create match fixture', { error, matchId });
        if (error.code === '23505') {
          throw new ConflictError(`Match fixture with ID "${matchId}" already exists.`);
        }
        throw new Error(error.message);
      }

      logger.info('ManageMatches', `Match fixture created successfully: ${matchId}`, {
        adminId: adminUser.id,
        matchId,
      });

      return jsonResponse(
        {
          match: data,
          message: 'Match fixture successfully created.',
        },
        201
      );
    }

    // =========================================================================
    // ACTION: UPDATE MATCH DETAILS
    // =========================================================================
    if (action === 'update') {
      const matchId = body.matchId || body.id;
      if (!matchId) {
        throw new ValidationError('matchId is required to update a fixture.');
      }

      const updates: Record<string, unknown> = {};
      if (body.title) updates.title = body.title.trim();
      if (body.venue) updates.venue = body.venue.trim();
      if (body.matchDate) updates.match_date = body.matchDate;
      if (body.tossWinnerTeamId) updates.toss_winner_team_id = body.tossWinnerTeamId;
      if (body.tossDecision) updates.toss_decision = body.tossDecision;
      if (body.winningTeamId) updates.winning_team_id = body.winningTeamId;
      if (body.resultType) updates.result_type = body.resultType;
      if (body.resultSummary) updates.result_summary = body.resultSummary;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', matchId)
        .select('*')
        .single();

      if (error || !data) {
        throw new NotFoundError(`Match fixture "${matchId}" not found or update failed.`);
      }

      logger.info('ManageMatches', `Match fixture updated: ${matchId}`, {
        adminId: adminUser.id,
        matchId,
      });

      return jsonResponse({
        match: data,
        message: 'Match fixture successfully updated.',
      });
    }

    // =========================================================================
    // ACTION: UPDATE LIFECYCLE STATUS
    // =========================================================================
    if (action === 'update-status') {
      const matchId = body.matchId || body.id;
      const newStatus = body.status as MatchStatus;

      if (!matchId || !newStatus) {
        throw new ValidationError('Both matchId and target status are required.');
      }

      // Fetch current status to validate transition
      const { data: currentMatch, error: fetchErr } = await supabase
        .from('matches')
        .select('status')
        .eq('id', matchId)
        .single();

      if (fetchErr || !currentMatch) {
        throw new NotFoundError(`Match fixture "${matchId}" not found.`);
      }

      if (!isValidStatusTransition(currentMatch.status, newStatus)) {
        throw new ValidationError(
          `Illegal status transition from "${currentMatch.status}" to "${newStatus}".`
        );
      }

      const statusUpdates: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (body.resultSummary) statusUpdates.result_summary = body.resultSummary;
      if (body.winningTeamId) statusUpdates.winning_team_id = body.winningTeamId;

      const { data: updated, error: updateErr } = await supabase
        .from('matches')
        .update(statusUpdates)
        .eq('id', matchId)
        .select('*')
        .single();

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      logger.info('ManageMatches', `Match status updated: ${matchId} -> ${newStatus}`, {
        adminId: adminUser.id,
        matchId,
        newStatus,
      });

      return jsonResponse({
        match: updated,
        message: `Match status updated to ${newStatus}.`,
      });
    }

    return errorResponse(`Unrecognized action "${action}". Valid actions: create, update, update-status.`, 400, 'BadRequest');
  } catch (err: unknown) {
    return handleError(err, 'ManageMatches');
  }
});

