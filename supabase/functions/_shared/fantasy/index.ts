/**
 * FanPulse AI — Fantasy Domain Module
 *
 * Core constants, squad composition rules, and validation interfaces
 * conforming to BR-TEAM-01 through BR-TEAM-06.
 */

import { PlayerRole } from '../players/index.ts';

export const FANTASY_RULES = {
  SQUAD_SIZE: 11, // BR-TEAM-01
  MIN_TEAMS_REPRESENTED: 2, // BR-TEAM-02
  MAX_PLAYERS_PER_TEAM: 7,
  MIN_BATTERS: 1, // BR-TEAM-03
  MIN_BOWLERS: 1, // BR-TEAM-03
  MIN_ALL_ROUNDERS: 1, // BR-TEAM-03
  MIN_WICKET_KEEPERS: 1, // BR-TEAM-03
  CAPTAIN_MULTIPLIER: 2.0, // BR-TEAM-04
  VICE_CAPTAIN_MULTIPLIER: 1.5, // BR-TEAM-04
  MIN_TEAM_NAME_LENGTH: 3,
  MAX_TEAM_NAME_LENGTH: 100,
} as const;

export interface FantasySquadPlayer {
  id: string;
  name: string;
  role: PlayerRole;
  teamCode: string;
}

export interface FantasyTeamEntity {
  id: string;
  userId: string;
  matchId: string;
  teamName: string;
  captainPlayerId: string;
  viceCaptainPlayerId: string;
  totalPoints: number;
  players?: FantasySquadPlayer[];
  createdAt: string;
}

export interface SquadValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a fantasy squad against BR-TEAM-01 through BR-TEAM-06
 */
export function validateSquadComposition(squad: {
  teamName: string;
  captainPlayerId: string;
  viceCaptainPlayerId: string;
  players: FantasySquadPlayer[];
}): SquadValidationResult {
  const errors: string[] = [];

  if (!squad.teamName || squad.teamName.trim().length < FANTASY_RULES.MIN_TEAM_NAME_LENGTH) {
    errors.push(`Team name must be at least ${FANTASY_RULES.MIN_TEAM_NAME_LENGTH} characters.`);
  }

  if (squad.teamName && squad.teamName.trim().length > FANTASY_RULES.MAX_TEAM_NAME_LENGTH) {
    errors.push(`Team name must not exceed ${FANTASY_RULES.MAX_TEAM_NAME_LENGTH} characters.`);
  }

  if (!Array.isArray(squad.players) || squad.players.length !== FANTASY_RULES.SQUAD_SIZE) {
    errors.push(`A fantasy squad must contain exactly ${FANTASY_RULES.SQUAD_SIZE} players.`);
  }

  const playerIds = squad.players?.map((p) => p.id) || [];
  const uniqueIds = new Set(playerIds);
  if (uniqueIds.size !== playerIds.length) {
    errors.push('Duplicate player selections are not allowed (BR-TEAM-06).');
  }

  if (!squad.captainPlayerId) {
    errors.push('A Captain must be designated (BR-TEAM-04).');
  }

  if (!squad.viceCaptainPlayerId) {
    errors.push('A Vice-Captain must be designated (BR-TEAM-04).');
  }

  if (squad.captainPlayerId && squad.viceCaptainPlayerId && squad.captainPlayerId === squad.viceCaptainPlayerId) {
    errors.push('Captain and Vice-Captain cannot be the same player (BR-TEAM-04).');
  }

  if (squad.captainPlayerId && !uniqueIds.has(squad.captainPlayerId)) {
    errors.push('Designated Captain must be in the selected 11 players.');
  }

  if (squad.viceCaptainPlayerId && !uniqueIds.has(squad.viceCaptainPlayerId)) {
    errors.push('Designated Vice-Captain must be in the selected 11 players.');
  }

  if (squad.players && squad.players.length === FANTASY_RULES.SQUAD_SIZE) {
    const wk = squad.players.filter((p) => p.role === 'WICKET_KEEPER').length;
    const bat = squad.players.filter((p) => p.role === 'BATTER').length;
    const ar = squad.players.filter((p) => p.role === 'ALL_ROUNDER').length;
    const bowl = squad.players.filter((p) => p.role === 'BOWLER').length;

    if (wk < FANTASY_RULES.MIN_WICKET_KEEPERS) errors.push('Lineup must include at least 1 Wicket-Keeper.');
    if (bat < FANTASY_RULES.MIN_BATTERS) errors.push('Lineup must include at least 1 Batter.');
    if (ar < FANTASY_RULES.MIN_ALL_ROUNDERS) errors.push('Lineup must include at least 1 All-Rounder.');
    if (bowl < FANTASY_RULES.MIN_BOWLERS) errors.push('Lineup must include at least 1 Bowler.');

    const teams = new Set(squad.players.map((p) => p.teamCode));
    if (teams.size < FANTASY_RULES.MIN_TEAMS_REPRESENTED) {
      errors.push('Lineup must include players from both competing teams (BR-TEAM-02).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

