/**
 * FanPulse AI — Matches Domain Module
 *
 * Core constants, interfaces, and validation rules for cricket fixtures.
 * Conforms to DATABASE_DESIGN.md and API_DESIGN.md.
 */

export const MATCH_STATUSES = ['SCHEDULED', 'UPCOMING', 'LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_FORMATS = ['T20', 'ODI', 'TEST'] as const;
export type MatchFormat = (typeof MATCH_FORMATS)[number];

export interface TeamScore {
  id?: number | string;
  name: string;
  code: string;
  score: string | number;
  wickets?: number;
  overs?: number;
  runRate?: number;
}

export interface MatchEntity {
  id: string;
  title: string;
  format: MatchFormat;
  status: MatchStatus;
  venue: string;
  matchDate: string;
  team1: TeamScore;
  team2: TeamScore;
  currentInnings?: number;
  resultSummary?: string | null;
  isLive?: boolean;
}

export function isMatchLive(status: MatchStatus): boolean {
  return status === 'LIVE' || status === 'IN_PROGRESS';
}

export function isMatchCompleted(status: MatchStatus): boolean {
  return status === 'COMPLETED';
}

