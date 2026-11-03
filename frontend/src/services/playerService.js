import { isSupabaseConfigured } from './authService';
import { supabase } from './supabaseClient';
import apiClient from './apiClient';

/**
 * Controlled Sample Player Catalog
 * Conforms strictly to DATABASE_DESIGN.md §3.5 and API_DESIGN.md §4.2
 */
export const CONTROLLED_SAMPLE_PLAYERS = [
  {
    id: 'p-virat-k',
    name: 'Virat Kohli',
    shortName: 'V Kohli',
    country: 'India',
    primaryRole: 'BATTER',
    teamCode: 'IND',
    teamName: 'India',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_MEDIUM',
    imageUrl: 'https://cdn.fanpulse.ai/players/kohli.png',
    credits: 10.0,
    recentForm: '82, 51, 74',
    battingStats: {
      matches: 117,
      innings: 109,
      runs: 4188,
      highestScore: 122,
      battingAverage: 48.69,
      strikeRate: 137.04,
      centuries: 1,
      halfCenturies: 38,
    },
    bowlingStats: {
      matches: 117,
      innings: 13,
      oversBowled: 25.4,
      wickets: 4,
      bowlingAverage: 51.0,
      economyRate: 7.94,
      bestFigures: '1/13',
    },
  },
  {
    id: 'p-rohit-s',
    name: 'Rohit Sharma',
    shortName: 'R Sharma',
    country: 'India',
    primaryRole: 'BATTER',
    teamCode: 'IND',
    teamName: 'India',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_OFFBREAK',
    imageUrl: 'https://cdn.fanpulse.ai/players/rohit.png',
    credits: 9.5,
    recentForm: '45, 12, 89',
    battingStats: {
      matches: 159,
      innings: 151,
      runs: 4231,
      highestScore: 121,
      battingAverage: 32.05,
      strikeRate: 140.89,
      centuries: 5,
      halfCenturies: 32,
    },
    bowlingStats: {
      matches: 159,
      innings: 12,
      oversBowled: 11.2,
      wickets: 1,
      bowlingAverage: 68.0,
      economyRate: 8.12,
      bestFigures: '1/22',
    },
  },
  {
    id: 'p-jasprit-b',
    name: 'Jasprit Bumrah',
    shortName: 'J Bumrah',
    country: 'India',
    primaryRole: 'BOWLER',
    teamCode: 'IND',
    teamName: 'India',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_FAST',
    imageUrl: 'https://cdn.fanpulse.ai/players/bumrah.png',
    credits: 9.5,
    recentForm: '3/16, 2/24, 3/24',
    battingStats: {
      matches: 70,
      innings: 7,
      runs: 18,
      highestScore: 7,
      battingAverage: 6.0,
      strikeRate: 64.28,
      centuries: 0,
      halfCenturies: 0,
    },
    bowlingStats: {
      matches: 70,
      innings: 69,
      oversBowled: 250.0,
      wickets: 89,
      bowlingAverage: 17.74,
      economyRate: 6.27,
      bestFigures: '3/11',
    },
  },
  {
    id: 'p-hardik-p',
    name: 'Hardik Pandya',
    shortName: 'H Pandya',
    country: 'India',
    primaryRole: 'ALL_ROUNDER',
    teamCode: 'IND',
    teamName: 'India',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_FAST_MEDIUM',
    imageUrl: 'https://cdn.fanpulse.ai/players/hardik.png',
    credits: 9.5,
    recentForm: '42+2w, 18+1w',
    battingStats: {
      matches: 100,
      innings: 78,
      runs: 1492,
      highestScore: 71,
      battingAverage: 26.64,
      strikeRate: 139.83,
      centuries: 0,
      halfCenturies: 4,
    },
    bowlingStats: {
      matches: 100,
      innings: 89,
      oversBowled: 218.4,
      wickets: 84,
      bowlingAverage: 25.42,
      economyRate: 8.18,
      bestFigures: '4/16',
    },
  },
  {
    id: 'p-rishabh-p',
    name: 'Rishabh Pant',
    shortName: 'R Pant',
    country: 'India',
    primaryRole: 'WICKET_KEEPER',
    teamCode: 'IND',
    teamName: 'India',
    battingStyle: 'LEFT_HAND_BAT',
    bowlingStyle: null,
    imageUrl: 'https://cdn.fanpulse.ai/players/pant.png',
    credits: 8.5,
    recentForm: '34, 48, 12',
    battingStats: {
      matches: 76,
      innings: 66,
      runs: 1209,
      highestScore: 65,
      battingAverage: 23.25,
      strikeRate: 127.26,
      centuries: 0,
      halfCenturies: 3,
    },
    bowlingStats: {
      matches: 76,
      innings: 0,
      oversBowled: 0,
      wickets: 0,
      bowlingAverage: null,
      economyRate: null,
      bestFigures: null,
    },
  },
  {
    id: 'p-travis-h',
    name: 'Travis Head',
    shortName: 'TM Head',
    country: 'Australia',
    primaryRole: 'BATTER',
    teamCode: 'AUS',
    teamName: 'Australia',
    battingStyle: 'LEFT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_OFFBREAK',
    imageUrl: 'https://cdn.fanpulse.ai/players/head.png',
    credits: 9.5,
    recentForm: '76, 31, 65',
    battingStats: {
      matches: 38,
      innings: 37,
      runs: 1094,
      highestScore: 91,
      battingAverage: 34.18,
      strikeRate: 159.24,
      centuries: 0,
      halfCenturies: 5,
    },
    bowlingStats: {
      matches: 38,
      innings: 8,
      oversBowled: 8.0,
      wickets: 1,
      bowlingAverage: 62.0,
      economyRate: 8.5,
      bestFigures: '1/12',
    },
  },
  {
    id: 'p-glenn-m',
    name: 'Glenn Maxwell',
    shortName: 'GJ Maxwell',
    country: 'Australia',
    primaryRole: 'ALL_ROUNDER',
    teamCode: 'AUS',
    teamName: 'Australia',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_OFFBREAK',
    imageUrl: 'https://cdn.fanpulse.ai/players/maxwell.png',
    credits: 9.5,
    recentForm: '54+1w, 28',
    battingStats: {
      matches: 106,
      innings: 98,
      runs: 2468,
      highestScore: 145,
      battingAverage: 29.73,
      strikeRate: 153.29,
      centuries: 5,
      halfCenturies: 11,
    },
    bowlingStats: {
      matches: 106,
      innings: 75,
      oversBowled: 152.0,
      wickets: 43,
      bowlingAverage: 27.5,
      economyRate: 7.82,
      bestFigures: '3/10',
    },
  },
  {
    id: 'p-pat-c',
    name: 'Pat Cummins',
    shortName: 'PJ Cummins',
    country: 'Australia',
    primaryRole: 'BOWLER',
    teamCode: 'AUS',
    teamName: 'Australia',
    battingStyle: 'RIGHT_HAND_BAT',
    bowlingStyle: 'RIGHT_ARM_FAST',
    imageUrl: 'https://cdn.fanpulse.ai/players/cummins.png',
    credits: 9.0,
    recentForm: '2/30, 1/28, 0/44',
    battingStats: {
      matches: 57,
      innings: 30,
      runs: 192,
      highestScore: 28,
      battingAverage: 12.0,
      strikeRate: 128.0,
      centuries: 0,
      halfCenturies: 0,
    },
    bowlingStats: {
      matches: 57,
      innings: 57,
      oversBowled: 204.0,
      wickets: 66,
      bowlingAverage: 23.4,
      economyRate: 7.42,
      bestFigures: '3/15',
    },
  },
  {
    id: 'p-matthew-w',
    name: 'Matthew Wade',
    shortName: 'MS Wade',
    country: 'Australia',
    primaryRole: 'WICKET_KEEPER',
    teamCode: 'AUS',
    teamName: 'Australia',
    battingStyle: 'LEFT_HAND_BAT',
    bowlingStyle: null,
    imageUrl: 'https://cdn.fanpulse.ai/players/wade.png',
    credits: 8.0,
    recentForm: '22, 19, 4*',
    battingStats: {
      matches: 88,
      innings: 62,
      runs: 1202,
      highestScore: 80,
      battingAverage: 26.13,
      strikeRate: 134.15,
      centuries: 0,
      halfCenturies: 3,
    },
    bowlingStats: {
      matches: 88,
      innings: 0,
      oversBowled: 0,
      wickets: 0,
      bowlingAverage: null,
      economyRate: null,
      bestFigures: null,
    },
  },
];

export const playerService = {
  /**
   * Retrieves player list with optional role, country, and search filters with pagination
   */
  async getPlayers({ role = 'ALL', country = 'ALL', search = '', page = 1, pageSize = 20 } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('players')
          .select('*, career:player_career_statistics(*)', { count: 'exact' });

        if (role !== 'ALL') {
          query = query.eq('primary_role', role);
        }
        if (country !== 'ALL') {
          query = query.eq('country', country);
        }
        if (search && search.trim() !== '') {
          query = query.ilike('name', `%${search.trim()}%`);
        }

        const startIndex = (page - 1) * pageSize;
        query = query.range(startIndex, startIndex + pageSize - 1).order('name', { ascending: true });

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return {
            players: data.map((p) => ({
              id: p.id,
              name: p.name,
              shortName: p.short_name,
              country: p.country,
              primaryRole: p.primary_role,
              role: p.primary_role,
              battingStyle: p.batting_style,
              bowlingStyle: p.bowling_style,
              imageUrl: p.image_url,
              battingStats: p.career || null,
              bowlingStats: p.career || null,
            })),
            total: count || data.length,
            page,
            pageSize,
            totalPages: Math.ceil((count || data.length) / pageSize),
            isDemoData: false,
            dataLabel: 'POSTGREST DATA',
          };
        }
      } catch {
        // Fallback to controlled sample
      }
    }

    // Filter controlled sample catalog
    let filtered = [...CONTROLLED_SAMPLE_PLAYERS];

    if (role !== 'ALL') {
      filtered = filtered.filter(
        (p) => p.primaryRole.toUpperCase() === role.toUpperCase()
      );
    }

    if (country !== 'ALL') {
      filtered = filtered.filter(
        (p) => p.country.toUpperCase() === country.toUpperCase()
      );
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortName.toLowerCase().includes(term) ||
          p.country.toLowerCase().includes(term)
      );
    }

    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      players: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };
  },

  /**
   * Retrieves player profile by ID along with career statistics.
   * Handles missing players gracefully by returning null.
   */
  async getPlayerById(playerId) {
    if (!playerId) return null;
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*, career:player_career_statistics(*)')
          .eq('id', playerId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            shortName: data.short_name,
            country: data.country,
            primaryRole: data.primary_role,
            role: data.primary_role,
            battingStyle: data.batting_style,
            bowlingStyle: data.bowling_style,
            imageUrl: data.image_url,
            battingStats: data.career
              ? {
                  matches: data.career.matches_played,
                  innings: data.career.innings_batted,
                  runs: data.career.runs_scored,
                  highestScore: data.career.highest_score,
                  battingAverage: Number(data.career.batting_average),
                  strikeRate: Number(data.career.batting_strike_rate),
                  centuries: data.career.centuries,
                  halfCenturies: data.career.half_centuries,
                }
              : null,
            bowlingStats: data.career
              ? {
                  matches: data.career.matches_played,
                  innings: data.career.innings_batted,
                  oversBowled: Number(data.career.overs_bowled),
                  wickets: data.career.wickets_taken,
                  bowlingAverage: Number(data.career.bowling_average),
                  economyRate: Number(data.career.bowling_economy_rate),
                  bestFigures: data.career.best_bowling_figures,
                }
              : null,
            isDemoData: false,
          };
        }
      } catch {
        // Fallback
      }
    }

    const player = CONTROLLED_SAMPLE_PLAYERS.find((p) => p.id === playerId);
    if (!player) {
      return null;
    }

    return {
      ...player,
      role: player.primaryRole,
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };
  },

  /**
   * Retrieves individual player match performance statistics for a specific fixture
   */
  async getPlayerMatchPerformance(playerId, matchId) {
    if (!playerId || !matchId) return null;
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('player_match_statistics')
          .select('*, player:players(*), team:teams(*)')
          .eq('player_id', playerId)
          .eq('match_id', matchId)
          .maybeSingle();

        if (!error && data) {
          return {
            playerId: data.player_id,
            playerName: data.player?.name,
            matchId: data.match_id,
            team: data.team?.name,
            batting: {
              runsScored: data.runs_scored,
              ballsFaced: data.balls_faced,
              fours: data.fours,
              sixes: data.sixes,
              strikeRate: data.strike_rate ? Number(data.strike_rate) : null,
              isOut: data.is_out,
              dismissalType: data.dismissal_type,
            },
            bowling: {
              oversBowled: Number(data.overs_bowled),
              maidens: data.maidens,
              runsConceded: data.runs_conceded,
              wicketsTaken: data.wickets_taken,
              economyRate: data.economy_rate ? Number(data.economy_rate) : null,
            },
            fielding: {
              catches: data.catches,
              stumpings: data.stumpings,
              runOuts: data.run_outs,
            },
            isDemoData: false,
          };
        }
      } catch {
        // Fallback
      }
    }

    // Default sample match performance for Virat Kohli in 3rd T20I
    if (playerId === 'p-virat-k') {
      return {
        playerId: 'p-virat-k',
        playerName: 'Virat Kohli',
        matchId: matchId || 'm-ind-aus-t20',
        team: 'India',
        batting: {
          runsScored: 74,
          ballsFaced: 48,
          fours: 6,
          sixes: 2,
          strikeRate: 154.2,
          isOut: false,
          dismissalType: 'NOT_OUT',
        },
        bowling: {
          oversBowled: 0.0,
          maidens: 0,
          runsConceded: 0,
          wicketsTaken: 0,
          economyRate: null,
        },
        fielding: {
          catches: 1,
          stumpings: 0,
          runOuts: 0,
        },
        isDemoData: true,
        dataLabel: 'DEMO DATA',
      };
    }

    return null;
  },

  /**
   * Creates a new player master record (Protected: Requires ADMIN role)
   */
  async createPlayer(playerData) {
    if (!playerData?.name || !playerData?.shortName || !playerData?.country || !playerData?.primaryRole) {
      throw new Error('Missing required player fields (name, shortName, country, primaryRole).');
    }

    try {
      const response = await apiClient.post('/manage-players', {
        action: 'create',
        ...playerData,
      });

      if (response.data?.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      if (!isSupabaseConfigured()) {
        const newPlayer = {
          id: playerData.id || `p-${playerData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          ...playerData,
          role: playerData.primaryRole,
          credits: 8.5,
          battingStats: { matches: 0, innings: 0, runs: 0, highestScore: 0, battingAverage: null, strikeRate: null, centuries: 0, halfCenturies: 0 },
          bowlingStats: { matches: 0, innings: 0, oversBowled: 0, wickets: 0, bowlingAverage: null, economyRate: null, bestFigures: null },
          isDemoData: true,
          dataLabel: 'DEMO DATA',
        };
        CONTROLLED_SAMPLE_PLAYERS.unshift(newPlayer);
        return {
          player: newPlayer,
          message: 'Player profile created in development mock mode.',
        };
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to create player profile.');
    }
  },

  /**
   * Updates an existing player record (Protected: Requires ADMIN role)
   */
  async updatePlayer(playerId, updates) {
    if (!playerId) {
      throw new Error('playerId is required to update a player.');
    }

    try {
      const response = await apiClient.post('/manage-players', {
        action: 'update',
        playerId,
        ...updates,
      });

      if (response.data?.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      if (!isSupabaseConfigured()) {
        const player = CONTROLLED_SAMPLE_PLAYERS.find((p) => p.id === playerId);
        if (player) {
          Object.assign(player, updates);
          return { player, message: 'Player profile updated in development mock mode.' };
        }
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to update player profile.');
    }
  },
};

export default playerService;

