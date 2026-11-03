/**
 * FanPulse AI — Players Domain Module
 *
 * Core constants, interfaces, and role constraints for cricket players.
 * Conforms to DATABASE_DESIGN.md and API_DESIGN.md.
 */

export const PLAYER_ROLES = ['BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'] as const;
export type PlayerRole = (typeof PLAYER_ROLES)[number];

export interface PlayerEntity {
  id: string;
  name: string;
  role: PlayerRole;
  teamCode: string;
  teamName?: string;
  credits?: number;
  recentForm?: string;
}

export interface PlayerMatchPerformance {
  playerId: string;
  playerName: string;
  role: PlayerRole;
  runsScored?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  wicketsTaken?: number;
  oversBowled?: number;
  runsConceded?: number;
  economyRate?: number;
  catches?: number;
  stumpings?: number;
  runOuts?: number;
  fantasyPointsTotal: number;
}

