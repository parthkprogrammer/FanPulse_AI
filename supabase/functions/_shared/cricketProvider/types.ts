/**
 * FanPulse AI — External Cricket Data Provider Abstraction Types
 *
 * Vendor-agnostic domain interfaces, normalization models, and provider contracts.
 * Conforms strictly to DATABASE_DESIGN.md (§3.2, §3.3) and API_DESIGN.md (§3).
 */

export type MatchStatus =
  | 'UPCOMING'
  | 'SCHEDULED'
  | 'LIVE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED';

export type MatchFormat = 'T20' | 'ODI' | 'TEST';

export interface NormalizedTeamScore {
  name: string;
  code: string;
  runs?: number;
  wickets?: number;
  overs?: number;
  runRate?: number;
  scoreDisplay?: string;
  isBatting?: boolean;
}

export interface NormalizedMatch {
  id: string;
  externalId?: string;
  title: string;
  format: MatchFormat;
  status: MatchStatus;
  venue: string;
  matchDate: string;
  team1: NormalizedTeamScore;
  team2: NormalizedTeamScore;
  resultSummary?: string | null;
  currentInnings?: number;
  isLive: boolean;
  dataSource: string;
  isDemoData: boolean;
}

export interface NormalizedBatterStats {
  playerId?: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalText?: string;
}

export interface NormalizedBowlerStats {
  playerId?: string;
  playerName: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
}

export interface NormalizedInningsScorecard {
  inningsNumber: number;
  battingTeamName: string;
  battingTeamCode: string;
  bowlingTeamName: string;
  bowlingTeamCode: string;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  extras: number;
  batting: NormalizedBatterStats[];
  bowling: NormalizedBowlerStats[];
}

export interface NormalizedScorecard {
  matchId: string;
  title: string;
  format: MatchFormat;
  status: MatchStatus;
  innings: NormalizedInningsScorecard[];
  dataSource: string;
  isDemoData: boolean;
  lastUpdated: string;
}

export interface ProviderMetadata {
  providerName: string;
  isLive: boolean;
  rateLimitHitsLimit?: number;
  rateLimitHitsUsed?: number;
  rateLimitHitsRemaining?: number;
  lastSyncTimestamp?: string;
  notice?: string;
}

/**
 * Standard Provider Contract (Dependency Inversion Principle)
 * Encapsulates external API communication behind a uniform interface.
 */
export interface CricketDataProvider {
  readonly name: string;
  readonly isLive: boolean;

  getMatches(options?: {
    status?: string;
    format?: string;
    limit?: number;
    offset?: number;
  }): Promise<NormalizedMatch[]>;

  getMatchDetail(matchId: string): Promise<NormalizedMatch | null>;

  getMatchScorecard(matchId: string): Promise<NormalizedScorecard | null>;

  getMetadata(): ProviderMetadata;
}
