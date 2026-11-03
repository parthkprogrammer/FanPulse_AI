/**
 * FanPulse AI — Matches Domain Module
 *
 * Core constants, interfaces, and validation rules for cricket fixtures.
 * Conforms to DATABASE_DESIGN.md and API_DESIGN.md.
 */

export const MATCH_STATUSES = [
  'SCHEDULED',
  'UPCOMING',
  'LIVE',
  'IN_PROGRESS',
  'COMPLETED',
  'ABANDONED',
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_FORMATS = ['T20', 'ODI', 'TEST'] as const;
export type MatchFormat = (typeof MATCH_FORMATS)[number];

export interface TeamScore {
  id?: number | string;
  name: string;
  code: string;
  score?: string | number;
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

export interface CreateMatchInput {
  id?: string;
  title: string;
  team1Id: string;
  team2Id: string;
  format: MatchFormat;
  status?: MatchStatus;
  venue: string;
  matchDate: string;
  tossWinnerTeamId?: string;
  tossDecision?: 'BAT' | 'BOWL';
}

export interface UpdateMatchInput {
  title?: string;
  venue?: string;
  matchDate?: string;
  status?: MatchStatus;
  tossWinnerTeamId?: string;
  tossDecision?: 'BAT' | 'BOWL';
  winningTeamId?: string;
  resultType?: 'NORMAL' | 'TIE' | 'NO_RESULT' | 'SUPER_OVER';
  resultSummary?: string;
}

export function isMatchLive(status: MatchStatus): boolean {
  return status === 'LIVE' || status === 'IN_PROGRESS';
}

export function isMatchCompleted(status: MatchStatus): boolean {
  return status === 'COMPLETED';
}

/**
 * Validates match creation inputs
 */
export function validateMatchInput(input: Partial<CreateMatchInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < 3) {
    errors.push('Match title must be at least 3 characters.');
  }

  if (!input.team1Id || !input.team2Id) {
    errors.push('Both team1Id and team2Id are required.');
  } else if (input.team1Id === input.team2Id) {
    errors.push('Competing teams must be distinct.');
  }

  if (!input.format || !MATCH_FORMATS.includes(input.format as MatchFormat)) {
    errors.push(`Format must be one of: ${MATCH_FORMATS.join(', ')}.`);
  }

  if (!input.venue || input.venue.trim().length < 2) {
    errors.push('Match venue is required.');
  }

  if (!input.matchDate || isNaN(Date.parse(input.matchDate))) {
    errors.push('A valid ISO-8601 matchDate is required.');
  }

  if (input.status && !MATCH_STATUSES.includes(input.status as MatchStatus)) {
    errors.push(`Status must be one of: ${MATCH_STATUSES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates legal lifecycle state transitions
 */
export function isValidStatusTransition(
  currentStatus: MatchStatus,
  targetStatus: MatchStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const validTransitions: Record<MatchStatus, MatchStatus[]> = {
    SCHEDULED: ['UPCOMING', 'LIVE', 'IN_PROGRESS', 'ABANDONED'],
    UPCOMING: ['LIVE', 'IN_PROGRESS', 'ABANDONED'],
    LIVE: ['COMPLETED', 'ABANDONED'],
    IN_PROGRESS: ['COMPLETED', 'ABANDONED'],
    COMPLETED: [], // Completed matches are terminal
    ABANDONED: [], // Abandoned matches are terminal
  };

  const allowed = validTransitions[currentStatus] || [];
  return allowed.includes(targetStatus);
}
