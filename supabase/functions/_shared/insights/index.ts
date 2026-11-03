/**
 * FanPulse AI — Insights Domain Module
 *
 * Core interfaces and calculation contracts for match turning points
 * and pivotal momentum shifts conforming to FR-INSIGHT-01 through FR-INSIGHT-03.
 */

export interface TurningPointEvent {
  overNumber: number | string;
  ballNumber?: number;
  eventDescription: string;
  impactScore?: number;
  wicketPlayerId?: string;
  runsScored?: number;
}

export interface MatchMomentumShift {
  phase: string;
  battingTeamCode: string;
  runRateSwing: number;
  description: string;
}

export interface PlayerPerformanceInsight {
  playerId: string;
  playerName: string;
  quantitativeImpact: string;
  contextualImpact: string;
  fantasyContributionRating: 'HIGH' | 'MEDIUM' | 'LOW';
}

