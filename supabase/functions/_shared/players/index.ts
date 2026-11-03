/**
 * FanPulse AI — Players Domain Module
 *
 * Core constants, interfaces, and validation rules for cricket players.
 * Conforms to DATABASE_DESIGN.md and API_DESIGN.md.
 */

export const PLAYER_ROLES = ['BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'] as const;
export type PlayerRole = (typeof PLAYER_ROLES)[number];

export interface PlayerEntity {
  id: string;
  name: string;
  shortName?: string;
  role: PlayerRole;
  country: string;
  teamCode?: string;
  teamName?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  imageUrl?: string;
  credits?: number;
  recentForm?: string;
}

export interface BattingCareerStats {
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  battingAverage: number | null;
  strikeRate: number | null;
  centuries: number;
  halfCenturies: number;
}

export interface BowlingCareerStats {
  matches: number;
  innings: number;
  oversBowled: number;
  wickets: number;
  bowlingAverage: number | null;
  economyRate: number | null;
  bestFigures: string | null;
}

export interface PlayerDetail extends PlayerEntity {
  battingStats: BattingCareerStats;
  bowlingStats: BowlingCareerStats;
}

export interface PlayerMatchPerformance {
  playerId: string;
  playerName: string;
  matchId?: string;
  team?: string;
  role: PlayerRole;
  batting: {
    runsScored: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    strikeRate: number | null;
    isOut: boolean;
    dismissalType: string | null;
  };
  bowling: {
    oversBowled: number;
    maidens: number;
    runsConceded: number;
    wicketsTaken: number;
    economyRate: number | null;
  };
  fielding: {
    catches: number;
    stumpings: number;
    runOuts: number;
  };
  fantasyPointsTotal?: number;
}

export interface CreatePlayerInput {
  id?: string;
  name: string;
  shortName: string;
  country: string;
  primaryRole: PlayerRole;
  battingStyle?: string;
  bowlingStyle?: string;
  imageUrl?: string;
}

export interface UpdatePlayerInput {
  name?: string;
  shortName?: string;
  country?: string;
  primaryRole?: PlayerRole;
  battingStyle?: string;
  bowlingStyle?: string;
  imageUrl?: string;
}

/**
 * Validates player creation input against domain rules
 */
export function validatePlayerInput(input: Partial<CreatePlayerInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < 2) {
    errors.push('Player full name must be at least 2 characters.');
  }

  if (!input.shortName || input.shortName.trim().length < 2) {
    errors.push('Player short name / abbreviation is required.');
  }

  if (!input.country || input.country.trim().length < 2) {
    errors.push('Player country is required.');
  }

  if (!input.primaryRole || !PLAYER_ROLES.includes(input.primaryRole as PlayerRole)) {
    errors.push(`primaryRole must be one of: ${PLAYER_ROLES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
