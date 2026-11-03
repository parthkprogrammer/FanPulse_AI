/**
 * FanPulse AI — AI Domain Types & Interfaces
 * Conforms to AI_MODULE_DESIGN.md and API_DESIGN.md.
 */

export type AiTopic =
  | 'MATCH_EXPLANATION'
  | 'KEY_MOMENTS'
  | 'PLAYER_PERFORMANCE'
  | 'FANTASY_PERFORMANCE'
  | 'GENERAL_CRICKET';

export interface AiAssistantRequest {
  matchId: string;
  question: string;
  topic?: AiTopic;
  playerId?: string;
  fantasyTeamId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface BatterContextItem {
  name: string;
  runs: number;
  balls: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  status?: string;
}

export interface BowlerContextItem {
  name: string;
  overs: string;
  maidens?: number;
  runs: number;
  wickets: number;
  economy?: number;
}

export interface InningsContextItem {
  inningsNumber: number;
  team: string;
  total: string;
  overs: string;
  runRate?: number;
  topBatters?: BatterContextItem[];
  keyBowlers?: BowlerContextItem[];
}

export interface TopPerformerContextItem {
  name: string;
  team: string;
  role: string;
  stats: string;
  fantasyPoints?: number;
}

export interface GroundedMatchContext {
  metadata: {
    id: string;
    title: string;
    format: string;
    status: string;
    venue: string;
    toss?: string | null;
    result?: string | null;
    team1?: { id: string; name: string; code: string };
    team2?: { id: string; name: string; code: string };
  };
  scores: Record<string, unknown>;
  innings?: InningsContextItem[];
  topPerformers?: TopPerformerContextItem[];
  turningPoints?: string[];
  fantasySnapshot?: {
    topScoringPlayers?: Array<{ name: string; basePoints: number; role?: string }>;
    teamBreakdown?: Record<string, unknown>;
  };
  dataFreshness?: string;
  uncertaintyNotes?: string[];
}

export interface AiAssistantResponse {
  explanation: string;
  matchId: string;
  topic: AiTopic;
  provider: string;
  isGrounded: boolean;
  isSimulated?: boolean;
  dataContext: {
    matchId: string;
    status: string;
    venue?: string;
    scores?: Record<string, unknown>;
  };
  tokenCount?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  timestamp: string;
  notice?: string;
}

export interface GeminiApiConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
}
