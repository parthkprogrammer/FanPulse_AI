import { apiClient } from './apiClient';
import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './authService';

/**
 * Standard roster of 22 players for India vs Australia T20 fixture
 * Strictly matches DATABASE_DESIGN.md role enums: BATTER, BOWLER, ALL_ROUNDER, WICKET_KEEPER
 */
export const SAMPLE_ROSTERS = {
  'm-ind-aus-t20': [
    // India Squad (11 Players)
    { id: 'p-rohit-s', name: 'Rohit Sharma', role: 'BATTER', teamCode: 'IND', teamName: 'India', credits: 9.5, recentForm: '45, 12, 89' },
    { id: 'p-shubman-g', name: 'Shubman Gill', role: 'BATTER', teamCode: 'IND', teamName: 'India', credits: 8.5, recentForm: '28, 64, 15' },
    { id: 'p-virat-k', name: 'Virat Kohli', role: 'BATTER', teamCode: 'IND', teamName: 'India', credits: 10.0, recentForm: '82, 51, 74' },
    { id: 'p-surya-y', name: 'Suryakumar Yadav', role: 'BATTER', teamCode: 'IND', teamName: 'India', credits: 9.0, recentForm: '68, 32, 28' },
    { id: 'p-rishabh-p', name: 'Rishabh Pant', role: 'WICKET_KEEPER', teamCode: 'IND', teamName: 'India', credits: 8.5, recentForm: '34, 48, 12' },
    { id: 'p-hardik-p', name: 'Hardik Pandya', role: 'ALL_ROUNDER', teamCode: 'IND', teamName: 'India', credits: 9.5, recentForm: '42+2w, 18+1w' },
    { id: 'p-ravindra-j', name: 'Ravindra Jadeja', role: 'ALL_ROUNDER', teamCode: 'IND', teamName: 'India', credits: 8.5, recentForm: '22+1w, 15+2w' },
    { id: 'p-jasprit-b', name: 'Jasprit Bumrah', role: 'BOWLER', teamCode: 'IND', teamName: 'India', credits: 9.5, recentForm: '3/16, 2/24, 3/24' },
    { id: 'p-arshdeep-s', name: 'Arshdeep Singh', role: 'BOWLER', teamCode: 'IND', teamName: 'India', credits: 8.5, recentForm: '2/28, 1/32, 2/38' },
    { id: 'p-kuldeep-y', name: 'Kuldeep Yadav', role: 'BOWLER', teamCode: 'IND', teamName: 'India', credits: 8.5, recentForm: '2/18, 3/26, 1/36' },
    { id: 'p-mohd-s', name: 'Mohammed Siraj', role: 'BOWLER', teamCode: 'IND', teamName: 'India', credits: 8.0, recentForm: '1/35, 2/29, 1/42' },

    // Australia Squad (11 Players)
    { id: 'p-travis-h', name: 'Travis Head', role: 'BATTER', teamCode: 'AUS', teamName: 'Australia', credits: 9.5, recentForm: '76, 31, 65' },
    { id: 'p-david-w', name: 'David Warner', role: 'BATTER', teamCode: 'AUS', teamName: 'Australia', credits: 9.0, recentForm: '18, 54, 39' },
    { id: 'p-tim-d', name: 'Tim David', role: 'BATTER', teamCode: 'AUS', teamName: 'Australia', credits: 8.0, recentForm: '25, 41, 15' },
    { id: 'p-matthew-w', name: 'Matthew Wade', role: 'WICKET_KEEPER', teamCode: 'AUS', teamName: 'Australia', credits: 8.0, recentForm: '22, 19, 4*' },
    { id: 'p-mitch-m', name: 'Mitchell Marsh', role: 'ALL_ROUNDER', teamCode: 'AUS', teamName: 'Australia', credits: 9.0, recentForm: '36+1w, 52' },
    { id: 'p-glenn-m', name: 'Glenn Maxwell', role: 'ALL_ROUNDER', teamCode: 'AUS', teamName: 'Australia', credits: 9.5, recentForm: '54+1w, 28' },
    { id: 'p-marcus-s', name: 'Marcus Stoinis', role: 'ALL_ROUNDER', teamCode: 'AUS', teamName: 'Australia', credits: 8.5, recentForm: '24+1w, 18' },
    { id: 'p-pat-c', name: 'Pat Cummins', role: 'BOWLER', teamCode: 'AUS', teamName: 'Australia', credits: 9.0, recentForm: '2/30, 1/28, 0/44' },
    { id: 'p-mitch-s', name: 'Mitchell Starc', role: 'BOWLER', teamCode: 'AUS', teamName: 'Australia', credits: 9.0, recentForm: '3/32, 1/38, 2/29' },
    { id: 'p-josh-h', name: 'Josh Hazlewood', role: 'BOWLER', teamCode: 'AUS', teamName: 'Australia', credits: 8.5, recentForm: '2/22, 2/32, 1/26' },
    { id: 'p-adam-z', name: 'Adam Zampa', role: 'BOWLER', teamCode: 'AUS', teamName: 'Australia', credits: 8.5, recentForm: '2/24, 3/30, 1/34' },
  ],
};

const STORAGE_KEY = 'fanpulse_user_fantasy_teams';

export const fantasyService = {
  /**
   * Retrieves roster of players available for drafting in a given match fixture
   */
  async getMatchRoster(matchId) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (SAMPLE_ROSTERS[matchId]) {
      return {
        matchId,
        players: SAMPLE_ROSTERS[matchId],
        isDemoData: true,
        dataLabel: 'DEMO DATA',
      };
    }

    // Default to India vs Australia roster if match not explicitly defined
    return {
      matchId: matchId || 'm-ind-aus-t20',
      players: SAMPLE_ROSTERS['m-ind-aus-t20'],
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };
  },

  /**
   * Client-side validation of Fantasy Team Composition against BR-TEAM-01 through BR-TEAM-06
   */
  validateTeamComposition({ teamName, players = [], captainPlayerId, viceCaptainPlayerId }) {
    const errors = [];

    // Rule: Team Name between 3 and 100 characters (FR-FANTASY-06)
    if (!teamName || teamName.trim().length < 3) {
      errors.push('Team name must be at least 3 characters.');
    } else if (teamName.trim().length > 100) {
      errors.push('Team name must not exceed 100 characters.');
    }

    // Rule: Exactly 11 players (BR-TEAM-01, FR-FANTASY-02)
    if (!players || players.length !== 11) {
      errors.push(`A fantasy squad must contain exactly 11 players. Currently selected: ${players?.length || 0}.`);
    }

    // Rule: No duplicate players (BR-TEAM-06)
    const playerIds = players.map((p) => p.id);
    const uniqueIds = new Set(playerIds);
    if (uniqueIds.size !== playerIds.length) {
      errors.push('Duplicate players detected. Each player may only be drafted once.');
    }

    // Rule: Captain and Vice-Captain distinct and chosen from drafted 11 (BR-TEAM-04, FR-FANTASY-05)
    if (!captainPlayerId) {
      errors.push('Please select a Captain (2× points multiplier).');
    }
    if (!viceCaptainPlayerId) {
      errors.push('Please select a Vice-Captain (1.5× points multiplier).');
    }
    if (captainPlayerId && viceCaptainPlayerId && captainPlayerId === viceCaptainPlayerId) {
      errors.push('Captain and Vice-Captain cannot be the same player.');
    }
    if (captainPlayerId && !uniqueIds.has(captainPlayerId)) {
      errors.push('Designated Captain must be in the selected 11 players.');
    }
    if (viceCaptainPlayerId && !uniqueIds.has(viceCaptainPlayerId)) {
      errors.push('Designated Vice-Captain must be in the selected 11 players.');
    }

    // Composition minimums (BR-TEAM-03, FR-FANTASY-04)
    if (players.length === 11) {
      const wkCount = players.filter((p) => p.role === 'WICKET_KEEPER').length;
      const batCount = players.filter((p) => p.role === 'BATTER').length;
      const arCount = players.filter((p) => p.role === 'ALL_ROUNDER').length;
      const bowlCount = players.filter((p) => p.role === 'BOWLER').length;

      if (wkCount < 1) errors.push('Lineup must include at least 1 Wicket-Keeper (WK).');
      if (batCount < 1) errors.push('Lineup must include at least 1 Batter (BAT).');
      if (arCount < 1) errors.push('Lineup must include at least 1 All-Rounder (AR).');
      if (bowlCount < 1) errors.push('Lineup must include at least 1 Bowler (BOWL).');

      // Rule: Both competing teams represented (BR-TEAM-02, FR-FANTASY-03)
      const teamCodes = new Set(players.map((p) => p.teamCode));
      if (teamCodes.size < 2) {
        errors.push('Lineup must include players from both competing teams.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Saves the drafted fantasy team via Edge Function, Supabase, or mock local store
   */
  async saveFantasyTeam(teamData, { simulateError = false } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (simulateError) {
      throw new Error('API Error: Network timeout communicating with fantasy validation engine.');
    }

    // Run client validation first
    const { isValid, errors } = this.validateTeamComposition(teamData);
    if (!isValid) {
      const err = new Error(errors[0]);
      err.validationErrors = errors;
      throw err;
    }

    // If Supabase is configured, attempt Edge Function or Supabase table persistence
    if (isSupabaseConfigured()) {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const token = authData?.session?.access_token;

        if (token) {
          // Call validate-fantasy-team Edge Function
          const response = await apiClient.post('/validate-fantasy-team', {
            matchId: teamData.matchId,
            teamName: teamData.teamName,
            captainPlayerId: teamData.captainPlayerId,
            viceCaptainPlayerId: teamData.viceCaptainPlayerId,
            players: teamData.players.map((p) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              teamCode: p.teamCode,
            })),
          });

          if (response.data?.status === 'success') {
            return {
              ...response.data.data,
              isDemoData: false,
            };
          }
        }
      } catch (err) {
        // If server returned 400 validation error, bubble up
        if (err.response?.data?.details) {
          const serverErrors = err.response.data.details;
          const errorMsg = Array.isArray(serverErrors) ? serverErrors.join(' ') : err.response.data.message;
          const e = new Error(errorMsg);
          e.validationErrors = Array.isArray(serverErrors) ? serverErrors : [errorMsg];
          throw e;
        }
        // Fall back gracefully to mock storage if edge function is not deployed locally
      }
    }

    // Mock storage persistence
    const newTeam = {
      id: `ft-${Date.now()}`,
      matchId: teamData.matchId,
      teamName: teamData.teamName.trim(),
      captainPlayerId: teamData.captainPlayerId,
      viceCaptainPlayerId: teamData.viceCaptainPlayerId,
      players: teamData.players,
      totalPoints: 0.0,
      createdAt: new Date().toISOString(),
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.unshift(newTeam);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Storage access fallback
    }

    return newTeam;
  },

  /**
   * Retrieves drafted teams for user
   */
  async getUserFantasyTeams() {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('fantasy_teams')
          .select(`
            id, team_name, match_id, captain_player_id, vice_captain_player_id, total_points, created_at,
            players:fantasy_team_players(player_id, player_name, player_role, team_code, is_captain, is_vice_captain)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            teams: data,
            isDemoData: false,
          };
        }
      } catch {
        // Fallback to local storage
      }
    }

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return {
        teams: stored,
        isDemoData: true,
        dataLabel: 'DEMO DATA',
      };
    } catch {
      return { teams: [], isDemoData: true };
    }
  },
};

export default fantasyService;
