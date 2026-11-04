/**
 * FanPulse AI — Fantasy Scoring Engine Edge Function
 *
 * Server-side deterministic cricket fantasy scoring calculation service.
 * Enforces server-side evaluation, prevents duplicate score application,
 * supports versioned configurable rulesets, and securely writes authoritative
 * player and team points to Supabase.
 *
 * Implements API Design (§6.1, §6.2, §6.3, §6.4) and Requirements (§4.2 BR-SCORE-*).
 */

import { handleCors } from '../_shared/shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/shared/response.ts';
import { verifyAuth } from '../_shared/auth/verifier.ts';
import { createCallerClient, createAdminClient } from '../_shared/supabaseClient.ts';
import {
  DEFAULT_SCORING_RULES,
  calculatePlayerScore,
  calculateTeamScore,
  type ScoringRulesConfig,
  type PlayerPerformanceInput,
} from '../_shared/scoring/index.ts';
import { handleError, ValidationError, ForbiddenError, NotFoundError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const method = req.method.toUpperCase();
  const url = new URL(req.url);

  try {
    const body = (method !== 'GET') ? await req.json().catch(() => ({})) : {};
    const action = body.action || url.searchParams.get('action') || (
      method === 'POST' ? 'calculate' : 'get-rules'
    );

    // =========================================================================
    // ACTION 1: TRIGGER FANTASY POINTS RECALCULATION (API §6.1)
    // Server-side authoritative evaluation. Admin or Service-Role only.
    // =========================================================================
    if (action === 'calculate') {
      const authUser = await verifyAuth(req);
      if (authUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only administrators can trigger match scoring recalculation (FR-SCORE-05).');
      }

      const matchId = body.matchId || url.searchParams.get('matchId');
      if (!matchId) {
        throw new ValidationError('matchId is required to calculate fantasy scores.');
      }

      const requestedVersion = body.rulesetVersion || url.searchParams.get('version') || 'v1.0';
      const adminClient = createAdminClient();
      const startTime = Date.now();

      // 1. Fetch match metadata
      const { data: match, error: matchErr } = await adminClient
        .from('matches')
        .select('id, title, status, match_format')
        .eq('id', matchId)
        .maybeSingle();

      if (matchErr || !match) {
        throw new NotFoundError(`Match ${matchId} not found.`);
      }

      const format = (match.match_format || 'T20').toUpperCase();

      // 2. Fetch active scoring rules for format & version
      let rulesConfig: ScoringRulesConfig = { ...DEFAULT_SCORING_RULES, version: requestedVersion };
      const { data: dbRules } = await adminClient
        .from('scoring_rules')
        .select('event_key, points_value')
        .in('format', ['ALL', format])
        .eq('is_active', true)
        .eq('version', requestedVersion);

      if (dbRules && dbRules.length > 0) {
        const rulesMap: Record<string, number> = {};
        for (const r of dbRules) {
          rulesMap[r.event_key] = Number(r.points_value);
        }
        rulesConfig = {
          version: requestedVersion,
          RUN: rulesMap['RUN_SCORED'] ?? DEFAULT_SCORING_RULES.RUN,
          BOUNDARY_FOUR: rulesMap['BOUNDARY_FOUR'] ?? DEFAULT_SCORING_RULES.BOUNDARY_FOUR,
          BOUNDARY_SIX: rulesMap['BOUNDARY_SIX'] ?? DEFAULT_SCORING_RULES.BOUNDARY_SIX,
          HALF_CENTURY_BONUS: rulesMap['HALF_CENTURY_BONUS'] ?? DEFAULT_SCORING_RULES.HALF_CENTURY_BONUS,
          CENTURY_BONUS: rulesMap['CENTURY_BONUS'] ?? DEFAULT_SCORING_RULES.CENTURY_BONUS,
          DUCK_PENALTY: rulesMap['DUCK_PENALTY'] ?? DEFAULT_SCORING_RULES.DUCK_PENALTY,
          WICKET: rulesMap['WICKET_TAKEN'] ?? DEFAULT_SCORING_RULES.WICKET,
          MAIDEN_OVER: rulesMap['MAIDEN_OVER'] ?? DEFAULT_SCORING_RULES.MAIDEN_OVER,
          THREE_WICKET_BONUS: rulesMap['THREE_WICKET_HAUL'] ?? DEFAULT_SCORING_RULES.THREE_WICKET_BONUS,
          FIVE_WICKET_BONUS: rulesMap['FIVE_WICKET_HAUL'] ?? DEFAULT_SCORING_RULES.FIVE_WICKET_BONUS,
          ECONOMY_RATE_BONUS: rulesMap['ECONOMY_RATE_BONUS'] ?? DEFAULT_SCORING_RULES.ECONOMY_RATE_BONUS,
          ECONOMY_RATE_PENALTY: rulesMap['ECONOMY_RATE_PENALTY'] ?? DEFAULT_SCORING_RULES.ECONOMY_RATE_PENALTY,
          CATCH: rulesMap['CATCH_TAKEN'] ?? DEFAULT_SCORING_RULES.CATCH,
          RUN_OUT_DIRECT: rulesMap['RUN_OUT_DIRECT'] ?? DEFAULT_SCORING_RULES.RUN_OUT_DIRECT,
          RUN_OUT_INDIRECT: rulesMap['RUN_OUT_INDIRECT'] ?? DEFAULT_SCORING_RULES.RUN_OUT_INDIRECT,
          STUMPING: rulesMap['STUMPING'] ?? DEFAULT_SCORING_RULES.STUMPING,
          CAPTAIN_MULTIPLIER: rulesMap['CAPTAIN_MULTIPLIER'] ?? DEFAULT_SCORING_RULES.CAPTAIN_MULTIPLIER,
          VICE_CAPTAIN_MULTIPLIER: rulesMap['VICE_CAPTAIN_MULTIPLIER'] ?? DEFAULT_SCORING_RULES.VICE_CAPTAIN_MULTIPLIER,
        };
      }

      // 3. Fetch player match performances for this match fixture
      const { data: statsRows } = await adminClient
        .from('player_match_statistics')
        .select('*')
        .eq('match_id', matchId);

      const performancesMap: Record<string, Partial<PlayerPerformanceInput>> = {};
      if (statsRows) {
        for (const row of statsRows) {
          performancesMap[row.player_id] = {
            playerId: row.player_id,
            runsScored: row.runs_scored,
            ballsFaced: row.balls_faced,
            fours: row.fours,
            sixes: row.sixes,
            isOut: row.is_out,
            dismissalType: row.dismissal_type,
            oversBowled: row.overs_bowled,
            maidens: row.maidens,
            runsConceded: row.runs_conceded,
            wicketsTaken: row.wickets_taken,
            economyRate: row.economy_rate,
            catches: row.catches,
            stumpings: row.stumpings,
            runOuts: row.run_outs,
          };
        }
      }

      // 4. Fetch all user fantasy teams for this match with player rosters
      const { data: teams, error: teamsErr } = await adminClient
        .from('fantasy_teams')
        .select(`
          id, team_name, match_id, captain_player_id, vice_captain_player_id,
          players:fantasy_team_players(player_id, player_name, player_role, team_code, is_captain, is_vice_captain)
        `)
        .eq('match_id', matchId);

      if (teamsErr) {
        throw new Error(`Failed to query fantasy teams: ${teamsErr.message}`);
      }

      let totalTeamsEvaluated = 0;
      let totalPlayersScored = 0;

      // 5. Calculate and persist scores atomically per team
      for (const team of (teams || [])) {
        const teamScore = calculateTeamScore(
          {
            id: team.id,
            teamName: team.team_name,
            matchId: team.match_id,
            captainPlayerId: team.captain_player_id,
            viceCaptainPlayerId: team.vice_captain_player_id,
            players: (team.players || []).map((p: any) => ({
              playerId: p.player_id,
              playerName: p.player_name,
              role: p.player_role,
            })),
          },
          performancesMap,
          rulesConfig,
          { format }
        );

        // Execute atomic database persistence RPC
        const { error: rpcErr } = await adminClient.rpc('save_team_fantasy_points_atomic', {
          p_fantasy_team_id: team.id,
          p_match_id: matchId,
          p_total_points: teamScore.totalPoints,
          p_player_points: teamScore.playerPoints,
          p_ruleset_version: rulesConfig.version,
        });

        if (rpcErr) {
          logger.warn('RPC save_team_fantasy_points_atomic failed, falling back to direct UPSERT', { error: rpcErr.message });
          // Fallback direct UPSERT
          for (const pp of teamScore.playerPoints) {
            await adminClient
              .from('fantasy_player_points')
              .upsert(
                {
                  fantasy_team_id: team.id,
                  player_id: pp.playerId,
                  match_id: matchId,
                  base_points: pp.basePoints,
                  multiplier: pp.multiplier,
                  final_points: pp.finalPoints,
                  breakdown_json: pp.breakdown,
                  ruleset_version: rulesConfig.version,
                  calculated_at: new Date().toISOString(),
                },
                { onConflict: 'fantasy_team_id,player_id' }
              );
          }

          await adminClient
            .from('fantasy_teams')
            .update({ total_points: teamScore.totalPoints, updated_at: new Date().toISOString() })
            .eq('id', team.id);
        }

        totalTeamsEvaluated += 1;
        totalPlayersScored += teamScore.playerPoints.length;
      }

      const durationMs = Date.now() - startTime;

      // 6. Record audit log
      await adminClient.from('scoring_audit_logs').insert({
        match_id: matchId,
        triggered_by: authUser.id,
        teams_evaluated: totalTeamsEvaluated,
        players_scored: totalPlayersScored,
        ruleset_version: rulesConfig.version,
        status: 'SUCCESS',
        execution_duration_ms: durationMs,
      }).catch(() => {});

      logger.info('Fantasy scoring calculation completed successfully', {
        matchId,
        teamsEvaluated: totalTeamsEvaluated,
        playersScored: totalPlayersScored,
        durationMs,
      });

      return jsonResponse({
        matchId,
        teamsEvaluated: totalTeamsEvaluated,
        playersScored: totalPlayersScored,
        status: 'SUCCESS',
        calculatedAt: new Date().toISOString(),
        rulesetVersion: rulesConfig.version,
      }, 200);
    }

    // =========================================================================
    // ACTION 2: GET PLAYER FANTASY POINTS IN A MATCH (API §6.2)
    // Public endpoint for itemized player points breakdown.
    // =========================================================================
    if (action === 'get-player-points') {
      const matchId = url.searchParams.get('matchId') || body.matchId;
      const playerId = url.searchParams.get('playerId') || body.playerId;

      if (!matchId || !playerId) {
        throw new ValidationError('matchId and playerId are required.');
      }

      const callerClient = createCallerClient(req);

      // Fetch player name and role
      const { data: player } = await callerClient
        .from('players')
        .select('id, name, primary_role')
        .eq('id', playerId)
        .maybeSingle();

      // Fetch match stats
      const { data: stats } = await callerClient
        .from('player_match_statistics')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .maybeSingle();

      const calculated = calculatePlayerScore(
        stats || { playerId },
        DEFAULT_SCORING_RULES,
        {
          playerName: player?.name || 'Player',
          role: player?.primary_role || 'BATTER',
        }
      );

      return jsonResponse({
        matchId,
        playerId,
        playerName: calculated.playerName,
        basePoints: calculated.basePoints,
        breakdown: calculated.breakdown.map((b) => ({
          category: b.category,
          rule: b.rule,
          points: b.points,
        })),
        rulesetVersion: calculated.rulesetVersion,
      }, 200);
    }

    // =========================================================================
    // ACTION 3: GET FANTASY TEAM POINTS & BREAKDOWN (API §6.3)
    // Authenticated user can view points for their team.
    // =========================================================================
    if (action === 'get-team-points') {
      const authUser = await verifyAuth(req);
      const teamId = url.searchParams.get('teamId') || body.teamId;

      if (!teamId) {
        throw new ValidationError('teamId is required.');
      }

      const callerClient = createCallerClient(req);

      // Verify ownership or admin
      const { data: team, error: teamErr } = await callerClient
        .from('fantasy_teams')
        .select(`
          id, team_name, match_id, user_id, captain_player_id, vice_captain_player_id, total_points,
          players:fantasy_team_players(player_id, player_name, player_role, is_captain, is_vice_captain)
        `)
        .eq('id', teamId)
        .maybeSingle();

      if (teamErr || !team) {
        throw new NotFoundError(`Fantasy team ${teamId} not found.`);
      }

      if (team.user_id !== authUser.id && authUser.role !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to view another user’s fantasy team points.');
      }

      // Fetch persisted player points
      const { data: playerPoints } = await callerClient
        .from('fantasy_player_points')
        .select('*')
        .eq('fantasy_team_id', teamId);

      if (playerPoints && playerPoints.length > 0) {
        return jsonResponse({
          fantasyTeamId: team.id,
          teamName: team.team_name,
          matchId: team.match_id,
          totalPoints: Number(team.total_points || 0),
          playerPoints: playerPoints.map((pp) => ({
            playerId: pp.player_id,
            basePoints: Number(pp.base_points),
            multiplier: Number(pp.multiplier),
            finalPoints: Number(pp.final_points),
            isCaptain: Number(pp.multiplier) === 2.0,
            isViceCaptain: Number(pp.multiplier) === 1.5,
            breakdown: pp.breakdown_json,
          })),
        }, 200);
      }

      // If not yet persisted, compute on the fly using match stats
      const { data: statsRows } = await callerClient
        .from('player_match_statistics')
        .select('*')
        .eq('match_id', team.match_id);

      const perfMap: Record<string, any> = {};
      if (statsRows) {
        for (const s of statsRows) perfMap[s.player_id] = s;
      }

      const onTheFly = calculateTeamScore(
        {
          id: team.id,
          teamName: team.team_name,
          matchId: team.match_id,
          captainPlayerId: team.captain_player_id,
          viceCaptainPlayerId: team.vice_captain_player_id,
          players: team.players || [],
        },
        perfMap,
        DEFAULT_SCORING_RULES
      );

      return jsonResponse({
        fantasyTeamId: team.id,
        teamName: team.team_name,
        matchId: team.match_id,
        totalPoints: onTheFly.totalPoints,
        playerPoints: onTheFly.playerPoints,
        calculatedAt: onTheFly.calculatedAt,
      }, 200);
    }

    // =========================================================================
    // ACTION 4: GET ACTIVE SCORING RULES (API §6.4)
    // Public endpoint for active configuration-driven rules.
    // =========================================================================
    if (action === 'get-rules') {
      const format = (url.searchParams.get('format') || 'ALL').toUpperCase();
      const version = url.searchParams.get('version') || 'v1.0';

      const callerClient = createCallerClient(req);

      const { data: dbRules } = await callerClient
        .from('scoring_rules')
        .select('*')
        .in('format', ['ALL', format])
        .eq('is_active', true)
        .eq('version', version)
        .order('rule_category', { ascending: true });

      if (dbRules && dbRules.length > 0) {
        return jsonResponse(dbRules.map((r) => ({
          id: r.id,
          format: r.format,
          category: r.rule_category,
          eventKey: r.event_key,
          eventName: r.event_name,
          pointsValue: Number(r.points_value),
          conditionThreshold: r.condition_threshold ? Number(r.condition_threshold) : null,
          description: r.description,
          version: r.version,
        })), 200);
      }

      // Default static response
      return jsonResponse([
        { format: 'ALL', category: 'BATTING', eventKey: 'RUN_SCORED', eventName: 'Run Scored', pointsValue: DEFAULT_SCORING_RULES.RUN, description: 'Each run scored with bat' },
        { format: 'ALL', category: 'BATTING', eventKey: 'BOUNDARY_FOUR', eventName: 'Boundary Four', pointsValue: DEFAULT_SCORING_RULES.BOUNDARY_FOUR, description: 'Boundary four bonus' },
        { format: 'ALL', category: 'BATTING', eventKey: 'BOUNDARY_SIX', eventName: 'Boundary Six', pointsValue: DEFAULT_SCORING_RULES.BOUNDARY_SIX, description: 'Boundary six bonus' },
        { format: 'ALL', category: 'BONUS', eventKey: 'HALF_CENTURY_BONUS', eventName: 'Half-Century Bonus', pointsValue: DEFAULT_SCORING_RULES.HALF_CENTURY_BONUS, conditionThreshold: 50.0, description: '50-99 runs' },
        { format: 'ALL', category: 'BONUS', eventKey: 'CENTURY_BONUS', eventName: 'Century Bonus', pointsValue: DEFAULT_SCORING_RULES.CENTURY_BONUS, conditionThreshold: 100.0, description: '100+ runs' },
        { format: 'ALL', category: 'PENALTY', eventKey: 'DUCK_PENALTY', eventName: 'Duck Dismissal Penalty', pointsValue: DEFAULT_SCORING_RULES.DUCK_PENALTY, conditionThreshold: 0.0, description: '0 runs dismissed' },
        { format: 'ALL', category: 'BOWLING', eventKey: 'WICKET_TAKEN', eventName: 'Wicket Taken', pointsValue: DEFAULT_SCORING_RULES.WICKET, description: 'Bowler wicket' },
        { format: 'ALL', category: 'BOWLING', eventKey: 'MAIDEN_OVER', eventName: 'Maiden Over', pointsValue: DEFAULT_SCORING_RULES.MAIDEN_OVER, description: 'Maiden over bowled' },
        { format: 'ALL', category: 'BONUS', eventKey: 'THREE_WICKET_HAUL', eventName: '3-Wicket Haul Bonus', pointsValue: DEFAULT_SCORING_RULES.THREE_WICKET_BONUS, conditionThreshold: 3.0, description: '3-4 wickets' },
        { format: 'ALL', category: 'BONUS', eventKey: 'FIVE_WICKET_HAUL', eventName: '5-Wicket Haul Bonus', pointsValue: DEFAULT_SCORING_RULES.FIVE_WICKET_BONUS, conditionThreshold: 5.0, description: '5+ wickets' },
        { format: 'ALL', category: 'BONUS', eventKey: 'ECONOMY_RATE_BONUS', eventName: 'Economy Rate Bonus', pointsValue: DEFAULT_SCORING_RULES.ECONOMY_RATE_BONUS, conditionThreshold: 4.0, description: 'Econ <= 4.0 (min 2 ov)' },
        { format: 'ALL', category: 'PENALTY', eventKey: 'ECONOMY_RATE_PENALTY', eventName: 'Economy Rate Penalty', pointsValue: DEFAULT_SCORING_RULES.ECONOMY_RATE_PENALTY, conditionThreshold: 10.0, description: 'Econ >= 10.0 (min 2 ov)' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'CATCH_TAKEN', eventName: 'Catch Taken', pointsValue: DEFAULT_SCORING_RULES.CATCH, description: 'Catch taken' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'RUN_OUT_DIRECT', eventName: 'Direct Run-Out', pointsValue: DEFAULT_SCORING_RULES.RUN_OUT_DIRECT, description: 'Direct hit run out' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'RUN_OUT_INDIRECT', eventName: 'Indirect Run-Out', pointsValue: DEFAULT_SCORING_RULES.RUN_OUT_INDIRECT, description: 'Indirect run out' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'STUMPING', eventName: 'Stumping', pointsValue: DEFAULT_SCORING_RULES.STUMPING, description: 'Wicketkeeper stumping' },
        { format: 'ALL', category: 'MULTIPLIER', eventKey: 'CAPTAIN_MULTIPLIER', eventName: 'Captain Multiplier', pointsValue: DEFAULT_SCORING_RULES.CAPTAIN_MULTIPLIER, description: '2.0x points' },
        { format: 'ALL', category: 'MULTIPLIER', eventKey: 'VICE_CAPTAIN_MULTIPLIER', eventName: 'Vice-Captain Multiplier', pointsValue: DEFAULT_SCORING_RULES.VICE_CAPTAIN_MULTIPLIER, description: '1.5x points' },
      ], 200);
    }

    throw new ValidationError(`Unsupported action: ${action}`);
  } catch (err: unknown) {
    return handleError(err, 'CalculateFantasyScoring');
  }
});
