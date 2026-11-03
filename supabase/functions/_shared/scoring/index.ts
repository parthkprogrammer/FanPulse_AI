/**
 * FanPulse AI — Scoring Domain Module
 *
 * Deterministic cricket fantasy scoring constants and rules
 * conforming to DATABASE_DESIGN.md and REQUIREMENTS.md (BR-SCORE-*).
 */

export const SCORING_RULES = {
  // Batting
  RUN: 1.0,
  BOUNDARY_FOUR: 1.0,
  BOUNDARY_SIX: 2.0,
  HALF_CENTURY_BONUS: 8.0,
  CENTURY_BONUS: 16.0,
  DUCK_PENALTY: -2.0,

  // Bowling
  WICKET: 25.0,
  MAIDEN_OVER: 8.0,
  THREE_WICKET_BONUS: 4.0,
  FIVE_WICKET_BONUS: 16.0,

  // Fielding
  CATCH: 8.0,
  STUMPING: 12.0,
  RUN_OUT_DIRECT: 12.0,
  RUN_OUT_INDIRECT: 6.0,

  // Multipliers
  CAPTAIN_MULTIPLIER: 2.0,
  VICE_CAPTAIN_MULTIPLIER: 1.5,
} as const;

export interface PlayerScoreBreakdown {
  playerId: string;
  playerName: string;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export function applyMultiplier(basePoints: number, isCaptain: boolean, isViceCaptain: boolean): number {
  if (isCaptain) return Number((basePoints * SCORING_RULES.CAPTAIN_MULTIPLIER).toFixed(2));
  if (isViceCaptain) return Number((basePoints * SCORING_RULES.VICE_CAPTAIN_MULTIPLIER).toFixed(2));
  return Number(basePoints.toFixed(2));
}

