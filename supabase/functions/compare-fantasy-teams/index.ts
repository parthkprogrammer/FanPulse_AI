import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

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

    if (!team1Id || !team2Id) {
      return errorResponse('Both team1Id and team2Id parameters are required for comparison (FR-COMPARE-01).', 400, 'BadRequest');
    }

    if (team1Id === team2Id) {
      return errorResponse('Cannot compare a fantasy team with itself. Select two distinct squads.', 400, 'BadRequest');
    }

    // 2. Authentication & Privacy Check
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

    // If Supabase is connected, query both teams
    if (supabaseClient) {
      const { data: team1, error: err1 } = await supabaseClient
        .from('fantasy_teams')
        .select('*, players:fantasy_team_players(*)')
        .eq('id', team1Id)
        .single();

      const { data: team2, error: err2 } = await supabaseClient
        .from('fantasy_teams')
        .select('*, players:fantasy_team_players(*)')
        .eq('id', team2Id)
        .single();

      if (err1 || err2 || !team1 || !team2) {
        return errorResponse('One or both fantasy teams were not found in the database.', 404, 'NotFound');
      }

      // Privacy Policy Check (FR-COMPARE-01, NFR-SEC-03): User must own both teams
      if (userId && (team1.user_id !== userId || team2.user_id !== userId)) {
        return errorResponse(
          'Privacy Policy Violation: You can only compare fantasy teams that belong to your account.',
          403,
          'Forbidden'
        );
      }

      // Match Identity Check (FR-COMPARE-04): Must belong to the exact same match
      if (team1.match_id !== team2.match_id) {
        return errorResponse(
          'Match Fixture Mismatch: Compared fantasy teams must belong to the exact same match fixture.',
          400,
          'BadRequest'
        );
      }

      // Construct comparison response
      const pointsDiff = Math.abs(Number(team1.total_points || 0) - Number(team2.total_points || 0));
      const leadingTeamId =
        Number(team1.total_points || 0) >= Number(team2.total_points || 0) ? team1.id : team2.id;

      return jsonResponse({
        matchId: team1.match_id,
        team1: {
          id: team1.id,
          name: team1.team_name,
          totalPoints: Number(team1.total_points || 0),
          captainId: team1.captain_player_id,
          viceCaptainId: team1.vice_captain_player_id,
        },
        team2: {
          id: team2.id,
          name: team2.team_name,
          totalPoints: Number(team2.total_points || 0),
          captainId: team2.captain_player_id,
          viceCaptainId: team2.vice_captain_player_id,
        },
        pointsDifference: pointsDiff,
        leadingTeamId,
      });
    }

    // Default mock response conforming to API_DESIGN.md §7.1
    return jsonResponse({
      matchId: 'm-ind-aus-t20',
      matchSummary: 'India vs Australia — 3rd T20I',
      team1: {
        id: team1Id,
        name: 'Men in Blue Titans',
        totalPoints: 412.5,
        captain: 'Virat Kohli',
        viceCaptain: 'Jasprit Bumrah',
        captainPoints: 196.0,
        viceCaptainPoints: 127.5,
      },
      team2: {
        id: team2Id,
        name: 'Royal Strikers XI',
        totalPoints: 384.0,
        captain: 'Rohit Sharma',
        viceCaptain: 'Travis Head',
        captainPoints: 124.0,
        viceCaptainPoints: 112.5,
      },
      pointsDifference: 28.5,
      leadingTeamId: team1Id,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown internal error';
    return errorResponse(errorMsg, 500, 'InternalServerError');
  }
});
