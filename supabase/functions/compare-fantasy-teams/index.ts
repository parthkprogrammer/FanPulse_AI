/**
 * FanPulse AI — Compare Fantasy Teams Edge Function
 *
 * Authoritative backend service for comparing two fantasy teams for a match.
 * Enforces:
 * - User authentication & privacy policy (FR-COMPARE-01, NFR-SEC-03)
 * - Match fixture equality check (FR-COMPARE-04)
 * - Authoritative server-side points derivation (never trusts frontend points)
 * - Side-by-side player contributions, common vs differential picks, and positional breakdown
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient, createAdminClient } from '../_shared/supabaseClient.ts';
import {
  validateDistinctTeams,
  validateComparisonPrivacy,
  validateSameMatchFixture,
  computeTeamComparison,
} from '../_shared/comparison/index.ts';
import {
  DEFAULT_SCORING_RULES,
  calculateTeamScore,
  type PlayerPerformanceInput,
} from '../_shared/scoring/index.ts';
import { handleError, ValidationError, ForbiddenError, NotFoundError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    let team1Id = url.searchParams.get('team1Id');
    let team2Id = url.searchParams.get('team2Id');

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      team1Id = team1Id || body.team1Id;
      team2Id = team2Id || body.team2Id;
    }

    // 2. Validate input parameters and distinct squads (FR-COMPARE-01)
    const distinctCheck = validateDistinctTeams(team1Id || '', team2Id || '');
    if (!distinctCheck.isValid) {
      throw new ValidationError(distinctCheck.error || 'Invalid team parameters.');
    }

    // 3. Authenticate Caller Identity (Supabase GoTrue JWT)
    const authUser = await verifyAuth(req);

    // 4. Retrieve both fantasy teams with squad lineups
    const callerClient = createCallerClient(req);

    const { data: team1, error: err1 } = await callerClient
      .from('fantasy_teams')
      .select(`
        id, user_id, match_id, team_name, captain_player_id, vice_captain_player_id, total_points,
        players:fantasy_team_players(player_id, player_name, player_role, team_code, is_captain, is_vice_captain)
      `)
      .eq('id', team1Id)
      .maybeSingle();

    const { data: team2, error: err2 } = await callerClient
      .from('fantasy_teams')
      .select(`
        id, user_id, match_id, team_name, captain_player_id, vice_captain_player_id, total_points,
        players:fantasy_team_players(player_id, player_name, player_role, team_code, is_captain, is_vice_captain)
      `)
      .eq('id', team2Id)
      .maybeSingle();

    if (err1 || err2 || !team1 || !team2) {
      throw new NotFoundError('One or both fantasy teams were not found in the database.');
    }

    // 5. Authorization & Privacy Policy Check (NFR-SEC-03)
    const privacyCheck = validateComparisonPrivacy(
      team1.user_id,
      team2.user_id,
      authUser.id,
      authUser.role
    );

    if (!privacyCheck.isAllowed) {
      throw new ForbiddenError(privacyCheck.reason || 'You are not authorized to compare these fantasy teams.');
    }

    // 6. Match Fixture Compatibility Check (FR-COMPARE-04)
    if (!validateSameMatchFixture(team1.match_id, team2.match_id)) {
      throw new ValidationError(
        'Match Fixture Mismatch: Compared fantasy teams must belong to the exact same match fixture (FR-COMPARE-04).'
      );
    }

    // 7. Query match information for context summary
    let matchSummary = 'Cricket Match Fixture';
    const { data: match } = await callerClient
      .from('matches')
      .select('title, match_format')
      .eq('id', team1.match_id)
      .maybeSingle();

    if (match) {
      matchSummary = match.title ? `${match.title} (${match.match_format || 'T20'})` : matchSummary;
    }

    // 8. Query Authoritative Points (Never trust client points)
    // First, check persistent fantasy_player_points
    const { data: fpp1 } = await callerClient
      .from('fantasy_player_points')
      .select('player_id, final_points')
      .eq('fantasy_team_id', team1.id);

    const { data: fpp2 } = await callerClient
      .from('fantasy_player_points')
      .select('player_id, final_points')
      .eq('fantasy_team_id', team2.id);

    const pointsMap1: Record<string, number> = {};
    const pointsMap2: Record<string, number> = {};

    if (fpp1 && fpp1.length > 0) {
      for (const row of fpp1) pointsMap1[row.player_id] = Number(row.final_points);
    }

    if (fpp2 && fpp2.length > 0) {
      for (const row of fpp2) pointsMap2[row.player_id] = Number(row.final_points);
    }

    // If points have not yet been stored in fantasy_player_points (e.g. on-the-fly evaluation)
    if (Object.keys(pointsMap1).length === 0 || Object.keys(pointsMap2).length === 0) {
      const { data: statsRows } = await callerClient
        .from('player_match_statistics')
        .select('*')
        .eq('match_id', team1.match_id);

      if (statsRows && statsRows.length > 0) {
        const perfMap: Record<string, Partial<PlayerPerformanceInput>> = {};
        for (const s of statsRows) {
          perfMap[s.player_id] = {
            playerId: s.player_id,
            runsScored: s.runs_scored,
            ballsFaced: s.balls_faced,
            fours: s.fours,
            sixes: s.sixes,
            isOut: s.is_out,
            dismissalType: s.dismissal_type,
            oversBowled: s.overs_bowled,
            maidens: s.maidens,
            runsConceded: s.runs_conceded,
            wicketsTaken: s.wickets_taken,
            economyRate: s.economy_rate,
            catches: s.catches,
            stumpings: s.stumpings,
            runOuts: s.run_outs,
          };
        }

        if (Object.keys(pointsMap1).length === 0) {
          const t1Calc = calculateTeamScore(
            {
              id: team1.id,
              teamName: team1.team_name,
              matchId: team1.match_id,
              captainPlayerId: team1.captain_player_id,
              viceCaptainPlayerId: team1.vice_captain_player_id,
              players: team1.players || [],
            },
            perfMap,
            DEFAULT_SCORING_RULES
          );
          for (const pp of t1Calc.playerPoints) {
            pointsMap1[pp.playerId] = pp.finalPoints;
          }
        }

        if (Object.keys(pointsMap2).length === 0) {
          const t2Calc = calculateTeamScore(
            {
              id: team2.id,
              teamName: team2.team_name,
              matchId: team2.match_id,
              captainPlayerId: team2.captain_player_id,
              viceCaptainPlayerId: team2.vice_captain_player_id,
              players: team2.players || [],
            },
            perfMap,
            DEFAULT_SCORING_RULES
          );
          for (const pp of t2Calc.playerPoints) {
            pointsMap2[pp.playerId] = pp.finalPoints;
          }
        }
      }
    }

    // 9. Assemble Authoritative Comparison Result (stripping all private user information)
    const comparisonResult = computeTeamComparison(
      team1,
      team2,
      pointsMap1,
      pointsMap2,
      matchSummary
    );

    return jsonResponse({
      status: 'success',
      data: comparisonResult,
    }, 200);
  } catch (err: unknown) {
    return handleError(err, 'CompareFantasyTeams');
  }
});
