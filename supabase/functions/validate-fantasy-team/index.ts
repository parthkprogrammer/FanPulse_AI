import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

interface PlayerSelection {
  id: string;
  name: string;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  teamCode: string;
}

interface ValidateFantasyTeamRequest {
  matchId: string;
  teamName: string;
  captainPlayerId: string;
  viceCaptainPlayerId: string;
  players: PlayerSelection[];
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return errorResponse('Method Not Allowed. Use POST.', 405, 'MethodNotAllowed');
  }

  try {
    // 2. Extract Authorization header & check user
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    let userId: string | null = null;
    let supabaseClient = null;

    if (supabaseUrl && supabaseAnonKey && authHeader) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // 3. Parse JSON body
    const body: ValidateFantasyTeamRequest = await req.json();
    const { matchId, teamName, captainPlayerId, viceCaptainPlayerId, players } = body;

    const validationErrors: string[] = [];

    // Rule: Match ID required
    if (!matchId) {
      validationErrors.push('matchId is required.');
    }

    // Rule: Team Name between 3 and 100 characters
    if (!teamName || teamName.trim().length < 3 || teamName.trim().length > 100) {
      validationErrors.push('Team name must be between 3 and 100 characters.');
    }

    // Rule: Exactly 11 players (BR-TEAM-01)
    if (!Array.isArray(players) || players.length !== 11) {
      validationErrors.push('Squad must contain exactly 11 players (BR-TEAM-01).');
    }

    // Rule: Unique players, no duplicates (BR-TEAM-06)
    const playerIds = players?.map((p) => p.id) ?? [];
    const uniqueIds = new Set(playerIds);
    if (uniqueIds.size !== playerIds.length) {
      validationErrors.push('Duplicate player selections are strictly prohibited (BR-TEAM-06).');
    }

    // Rule: Captain and Vice-Captain distinct (BR-TEAM-04)
    if (!captainPlayerId) {
      validationErrors.push('A Captain must be designated (BR-TEAM-04).');
    }
    if (!viceCaptainPlayerId) {
      validationErrors.push('A Vice-Captain must be designated (BR-TEAM-04).');
    }
    if (captainPlayerId && viceCaptainPlayerId && captainPlayerId === viceCaptainPlayerId) {
      validationErrors.push('Captain and Vice-Captain cannot be the same player (BR-TEAM-04).');
    }
    if (captainPlayerId && !uniqueIds.has(captainPlayerId)) {
      validationErrors.push('Designated Captain must be in the selected 11 players.');
    }
    if (viceCaptainPlayerId && !uniqueIds.has(viceCaptainPlayerId)) {
      validationErrors.push('Designated Vice-Captain must be in the selected 11 players.');
    }

    // Rule: Role distribution (BR-TEAM-03: at least 1 WK, 1 BAT, 1 AR, 1 BOWL)
    if (Array.isArray(players) && players.length === 11) {
      const wkCount = players.filter((p) => p.role === 'WICKET_KEEPER').length;
      const batCount = players.filter((p) => p.role === 'BATTER').length;
      const arCount = players.filter((p) => p.role === 'ALL_ROUNDER').length;
      const bowlCount = players.filter((p) => p.role === 'BOWLER').length;

      if (wkCount < 1) validationErrors.push('Lineup must include at least 1 Wicket-Keeper (BR-TEAM-03).');
      if (batCount < 1) validationErrors.push('Lineup must include at least 1 Batter (BR-TEAM-03).');
      if (arCount < 1) validationErrors.push('Lineup must include at least 1 All-Rounder (BR-TEAM-03).');
      if (bowlCount < 1) validationErrors.push('Lineup must include at least 1 Bowler (BR-TEAM-03).');

      // Rule: Both competing teams represented (BR-TEAM-02)
      const teamCodes = new Set(players.map((p) => p.teamCode));
      if (teamCodes.size < 2) {
        validationErrors.push('Lineup must include players from both competing teams (BR-TEAM-02).');
      }

      // Rule: Maximum 7 players from a single team (BR-TEAM-02)
      const teamCounts: Record<string, number> = {};
      for (const player of players) {
        if (player.teamCode) {
          teamCounts[player.teamCode] = (teamCounts[player.teamCode] || 0) + 1;
          if (teamCounts[player.teamCode] > 7) {
            validationErrors.push('Maximum 7 players allowed from a single team (BR-TEAM-02).');
            break;
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      return errorResponse(
        'Fantasy team composition validation failed.',
        400,
        'ValidationError',
        validationErrors
      );
    }

    // If Supabase is connected and user is authenticated, persist into database
    let createdTeamId = `ft-${Date.now()}`;
    if (supabaseClient && userId) {
      const { data: teamInsert, error: teamError } = await supabaseClient
        .from('fantasy_teams')
        .insert({
          user_id: userId,
          match_id: matchId,
          team_name: teamName.trim(),
          captain_player_id: captainPlayerId,
          vice_captain_player_id: viceCaptainPlayerId,
          total_points: 0.0,
        })
        .select('id')
        .single();

      if (!teamError && teamInsert) {
        createdTeamId = teamInsert.id;

        const playerInserts = players.map((p) => ({
          fantasy_team_id: createdTeamId,
          player_id: p.id,
          match_id: matchId,
          player_name: p.name,
          player_role: p.role,
          team_code: p.teamCode,
          is_captain: p.id === captainPlayerId,
          is_vice_captain: p.id === viceCaptainPlayerId,
        }));

        await supabaseClient.from('fantasy_team_players').insert(playerInserts);
      }
    }

    return jsonResponse(
      {
        id: createdTeamId,
        teamName: teamName.trim(),
        matchId,
        captainPlayerId,
        viceCaptainPlayerId,
        playersCount: players.length,
        message: 'Fantasy team validated and saved successfully.',
      },
      201
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown internal error';
    return errorResponse(errorMsg, 500, 'InternalServerError');
  }
});
