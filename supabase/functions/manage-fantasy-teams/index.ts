/**
 * FanPulse AI — Manage Fantasy Teams Edge Function
 *
 * Authoritative backend service for Fantasy Team CRUD operations,
 * server-side composition validation (BR-TEAM-01 through BR-TEAM-06),
 * and role-based ownership protection (NFR-SEC-03).
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { validateSquadComposition, type FantasySquadPlayer } from '../_shared/fantasy/index.ts';
import { handleError, ValidationError, ForbiddenError, NotFoundError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const method = req.method.toUpperCase();

  try {
    // 2. Authenticate Caller Identity (Supabase GoTrue JWT)
    const authUser = await verifyAuth(req);

    const url = new URL(req.url);
    const body = (method !== 'GET') ? await req.json().catch(() => ({})) : {};
    const action = body.action || url.searchParams.get('action') || (
      method === 'POST' ? 'create' :
      method === 'PUT' ? 'update' :
      method === 'DELETE' ? 'delete' :
      method === 'PATCH' ? 'assign-roles' : 'list'
    );

    const supabase = createCallerClient(req);

    // =========================================================================
    // ACTION: CREATE FANTASY TEAM
    // =========================================================================
    if (action === 'create') {
      const {
        matchId,
        teamName,
        captainPlayerId,
        viceCaptainPlayerId,
        players = [],
      } = body;

      if (!matchId) {
        throw new ValidationError('matchId is required.');
      }

      // Authoritative Squad Validation (BR-TEAM-01 through BR-TEAM-06)
      const squadValidation = validateSquadComposition({
        teamName,
        captainPlayerId,
        viceCaptainPlayerId,
        players: players as FantasySquadPlayer[],
      });

      if (!squadValidation.isValid) {
        throw new ValidationError('Fantasy team composition rules violated.', squadValidation.errors);
      }

      // Check Match Deadline (BR-TEAM-06)
      const { data: match, error: matchErr } = await supabase
        .from('matches')
        .select('status')
        .eq('id', matchId)
        .maybeSingle();

      if (match && ['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].includes(match.status)) {
        throw new ForbiddenError(
          `Cannot create fantasy team: Match is already "${match.status}". Lineups are locked.`
        );
      }

      // Try Atomic RPC function first; fallback to client sequence if RPC is not loaded
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('save_fantasy_team_atomic', {
          p_match_id: matchId,
          p_team_name: teamName.trim(),
          p_captain_id: captainPlayerId,
          p_vice_captain_id: viceCaptainPlayerId,
          p_players: players,
        });

        if (!rpcError && rpcResult) {
          logger.info('ManageFantasyTeams', `Fantasy team created via RPC: ${rpcResult.id}`, {
            userId: authUser.id,
            teamId: rpcResult.id,
          });
          return jsonResponse({ team: rpcResult, message: 'Fantasy team saved successfully.' }, 201);
        }
      } catch {
        // Fall back to standard PostgREST inserts
      }

      // Standard PostgREST insertion respecting RLS
      const { data: teamInsert, error: teamErr } = await supabase
        .from('fantasy_teams')
        .insert({
          user_id: authUser.id,
          match_id: matchId,
          team_name: teamName.trim(),
          captain_player_id: captainPlayerId,
          vice_captain_player_id: viceCaptainPlayerId,
          total_points: 0.0,
        })
        .select('*')
        .single();

      if (teamErr || !teamInsert) {
        throw new Error(teamErr?.message || 'Failed to persist fantasy team header.');
      }

      const playerRows = players.map((p: FantasySquadPlayer) => ({
        fantasy_team_id: teamInsert.id,
        player_id: p.id,
        match_id: matchId,
        player_name: p.name,
        player_role: p.role,
        team_code: p.teamCode,
        is_captain: p.id === captainPlayerId,
        is_vice_captain: p.id === viceCaptainPlayerId,
      }));

      const { error: playersErr } = await supabase
        .from('fantasy_team_players')
        .insert(playerRows);

      if (playersErr) {
        // Rollback team if player inserts fail
        await supabase.from('fantasy_teams').delete().eq('id', teamInsert.id);
        throw new Error(`Failed to persist squad players: ${playersErr.message}`);
      }

      logger.info('ManageFantasyTeams', `Fantasy team created: ${teamInsert.id}`, {
        userId: authUser.id,
        teamId: teamInsert.id,
      });

      return jsonResponse(
        {
          team: {
            ...teamInsert,
            players,
          },
          message: 'Fantasy team saved successfully.',
        },
        201
      );
    }

    // =========================================================================
    // ACTION: UPDATE FANTASY TEAM
    // =========================================================================
    if (action === 'update') {
      const teamId = body.teamId || body.id;
      if (!teamId) {
        throw new ValidationError('teamId is required to update a fantasy team.');
      }

      // Verify ownership (NFR-SEC-03)
      const { data: existingTeam, error: fetchErr } = await supabase
        .from('fantasy_teams')
        .select('*, match:matches(status)')
        .eq('id', teamId)
        .single();

      if (fetchErr || !existingTeam) {
        throw new NotFoundError(`Fantasy team "${teamId}" not found.`);
      }

      if (existingTeam.user_id !== authUser.id && authUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only modify fantasy teams belonging to your account.');
      }

      if (existingTeam.match && ['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].includes(existingTeam.match.status)) {
        throw new ForbiddenError(
          `Cannot modify fantasy team: Match is already "${existingTeam.match.status}". Lineups are locked.`
        );
      }

      const {
        teamName = existingTeam.team_name,
        captainPlayerId = existingTeam.captain_player_id,
        viceCaptainPlayerId = existingTeam.vice_captain_player_id,
        players,
      } = body;

      if (players) {
        const squadValidation = validateSquadComposition({
          teamName,
          captainPlayerId,
          viceCaptainPlayerId,
          players: players as FantasySquadPlayer[],
        });

        if (!squadValidation.isValid) {
          throw new ValidationError('Updated squad composition is invalid.', squadValidation.errors);
        }
      }

      // Update header
      const { data: updatedTeam, error: updateErr } = await supabase
        .from('fantasy_teams')
        .update({
          team_name: teamName.trim(),
          captain_player_id: captainPlayerId,
          vice_captain_player_id: viceCaptainPlayerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId)
        .select('*')
        .single();

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      // If new players array provided, replace players
      if (players && Array.isArray(players) && players.length === 11) {
        await supabase.from('fantasy_team_players').delete().eq('fantasy_team_id', teamId);
        const playerRows = players.map((p: FantasySquadPlayer) => ({
          fantasy_team_id: teamId,
          player_id: p.id,
          match_id: existingTeam.match_id,
          player_name: p.name,
          player_role: p.role,
          team_code: p.teamCode,
          is_captain: p.id === captainPlayerId,
          is_vice_captain: p.id === viceCaptainPlayerId,
        }));
        await supabase.from('fantasy_team_players').insert(playerRows);
      }

      logger.info('ManageFantasyTeams', `Fantasy team updated: ${teamId}`, {
        userId: authUser.id,
        teamId,
      });

      return jsonResponse({
        team: updatedTeam,
        message: 'Fantasy team updated successfully.',
      });
    }

    // =========================================================================
    // ACTION: DELETE FANTASY TEAM
    // =========================================================================
    if (action === 'delete') {
      const teamId = body.teamId || body.id || url.searchParams.get('teamId');
      if (!teamId) {
        throw new ValidationError('teamId is required to delete a fantasy team.');
      }

      const { data: existingTeam, error: fetchErr } = await supabase
        .from('fantasy_teams')
        .select('*, match:matches(status)')
        .eq('id', teamId)
        .single();

      if (fetchErr || !existingTeam) {
        throw new NotFoundError(`Fantasy team "${teamId}" not found.`);
      }

      if (existingTeam.user_id !== authUser.id && authUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only delete fantasy teams belonging to your account.');
      }

      if (existingTeam.match && ['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].includes(existingTeam.match.status)) {
        throw new ForbiddenError(
          `Cannot delete fantasy team: Match is already "${existingTeam.match.status}". Lineups are locked.`
        );
      }

      const { error: deleteErr } = await supabase
        .from('fantasy_teams')
        .delete()
        .eq('id', teamId);

      if (deleteErr) {
        throw new Error(deleteErr.message);
      }

      logger.info('ManageFantasyTeams', `Fantasy team deleted: ${teamId}`, {
        userId: authUser.id,
        teamId,
      });

      return jsonResponse({
        success: true,
        message: 'Fantasy team deleted successfully.',
      });
    }

    // =========================================================================
    // ACTION: RETRIEVE USER'S FANTASY TEAMS
    // =========================================================================
    if (action === 'list') {
      const matchFilter = url.searchParams.get('matchId') || body.matchId;

      let query = supabase
        .from('fantasy_teams')
        .select(`
          id, team_name, match_id, captain_player_id, vice_captain_player_id, total_points, is_locked, created_at,
          players:fantasy_team_players(player_id, player_name, player_role, team_code, is_captain, is_vice_captain),
          match:matches(id, title, format, status, venue)
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (matchFilter) {
        query = query.eq('match_id', matchFilter);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }

      return jsonResponse({
        teams: data || [],
        total: data?.length || 0,
      });
    }

    // =========================================================================
    // ACTION: ASSIGN / UPDATE ROLES (CAPTAIN & VICE-CAPTAIN)
    // =========================================================================
    if (action === 'assign-roles') {
      const teamId = body.teamId || body.id;
      const { captainPlayerId, viceCaptainPlayerId } = body;

      if (!teamId || !captainPlayerId || !viceCaptainPlayerId) {
        throw new ValidationError('teamId, captainPlayerId, and viceCaptainPlayerId are required.');
      }

      if (captainPlayerId === viceCaptainPlayerId) {
        throw new ValidationError('Captain and Vice-Captain cannot be the same player (BR-TEAM-04).');
      }

      const { data: team, error: teamErr } = await supabase
        .from('fantasy_teams')
        .select('*, players:fantasy_team_players(player_id)')
        .eq('id', teamId)
        .single();

      if (teamErr || !team) {
        throw new NotFoundError(`Fantasy team "${teamId}" not found.`);
      }

      if (team.user_id !== authUser.id && authUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only modify fantasy teams belonging to your account.');
      }

      const playerIds = (team.players || []).map((p: { player_id: string }) => p.player_id);
      if (!playerIds.includes(captainPlayerId) || !playerIds.includes(viceCaptainPlayerId)) {
        throw new ValidationError('Both Captain and Vice-Captain must belong to the drafted 11 players.');
      }

      // Update header
      await supabase
        .from('fantasy_teams')
        .update({
          captain_player_id: captainPlayerId,
          vice_captain_player_id: viceCaptainPlayerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      // Update player flags
      await supabase
        .from('fantasy_team_players')
        .update({ is_captain: false, is_vice_captain: false })
        .eq('fantasy_team_id', teamId);

      await supabase
        .from('fantasy_team_players')
        .update({ is_captain: true })
        .eq('fantasy_team_id', teamId)
        .eq('player_id', captainPlayerId);

      await supabase
        .from('fantasy_team_players')
        .update({ is_vice_captain: true })
        .eq('fantasy_team_id', teamId)
        .eq('player_id', viceCaptainPlayerId);

      logger.info('ManageFantasyTeams', `Roles assigned for team: ${teamId}`, {
        captainPlayerId,
        viceCaptainPlayerId,
      });

      return jsonResponse({
        teamId,
        captainPlayerId,
        viceCaptainPlayerId,
        message: 'Captain and Vice-Captain assigned successfully.',
      });
    }

    return errorResponse(`Unrecognized action "${action}". Valid actions: create, update, delete, list, assign-roles.`, 400, 'BadRequest');
  } catch (err: unknown) {
    return handleError(err, 'ManageFantasyTeams');
  }
});

