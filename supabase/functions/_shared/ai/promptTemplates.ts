/**
 * FanPulse AI — Prompt Template Manager & Input Defense
 * Conforms to AI_MODULE_DESIGN.md §8 and §9.
 *
 * Implements 5 dedicated, grounded prompt templates:
 * 1. Match Situation Explanation
 * 2. Player Performance Explanation
 * 3. Fantasy Team Performance Explanation
 * 4. Match Summary
 * 5. Turning-Point Explanation
 */

import { AiTopic, GroundedMatchContext } from './types.ts';

export const DISALLOWED_INJECTION_PHRASES = [
  'ignore all previous instructions',
  'ignore previous instructions',
  'system override',
  'reveal your prompt',
  'reveal system prompt',
  'what is your system prompt',
  'act as dan',
  'jailbreak',
  'disregard safety',
  'developer mode',
  'output full system prompt',
  'bypass guardrails',
  'unfiltered mode',
];

export const BASE_SYSTEM_INSTRUCTION = `You are FanPulse AI, an expert, objective, and engaging cricket analyst.
Your task is to explain cricket matches and fantasy performances to fans using ONLY the verified JSON data provided in the [MATCH_DATA] section below.

CRITICAL OPERATIONAL RULES:
1. STRICT DATA GROUNDING: Use ONLY the statistics, scores, overs, wickets, boundaries, strike rates, economy rates, and names provided in [MATCH_DATA]. Do not invent runs, wickets, bowling figures, wagon wheels, or unrecorded events (BR-AI-01).
2. DISTINGUISH FACTS FROM INTERPRETATIONS: State verified numbers and events as definitive facts (e.g., "Kohli scored 74* off 48 balls"). Frame tactical evaluations or game momentum as analytical observations (e.g., "This restrained approach during the middle overs allowed India to preserve wickets"). Never present an opinion or guess as an authoritative data metric.
3. HANDLE MISSING DATA EXPLICITLY: If the user asks about an unrecorded metric, ball-tracking trajectory, pitch moisture, or player not in the match dataset, explicitly explain that this information is not recorded in the match telemetry rather than guessing or fabricating.
4. NO GUARANTEED PREDICTIONS: Do not forecast match winners, predict future scores, or speculate on future tournament outcomes. Never guarantee athletic or competitive results (BR-AI-02).
5. NO BETTING OR FINANCIAL ADVICE: Never mention odds, betting lines, gambling recommendations, or monetary stakes. Impartial sports analysis only.
6. FANTASY ROLE CLARITY: Fantasy points provided in the data are authoritative, calculated by backend scoring rules. Explain how player actions earned those points; do not recalculate, re-score, or dispute point values.
7. TONE & STYLE: Direct, lively, and analytical. Use clear cricket terminology (e.g., strike rate, economy rate, death overs, powerplay). Format responses in clean Markdown paragraphs with bold text for player names, teams, and scores. Keep responses concise (typically 2-3 paragraphs or structured bullet points).`;

/**
 * Validates user input question against length and prompt injection patterns.
 */
export function validateUserQuestion(rawQuestion: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!rawQuestion || typeof rawQuestion !== 'string') {
    return { isValid: false, sanitized: '', error: 'Question cannot be empty.' };
  }

  const trimmed = rawQuestion.trim();
  if (trimmed.length === 0) {
    return { isValid: false, sanitized: '', error: 'Question cannot be empty.' };
  }

  if (trimmed.length > 250) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question must not exceed 250 characters.',
    };
  }

  const lower = trimmed.toLowerCase();
  for (const phrase of DISALLOWED_INJECTION_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        isValid: false,
        sanitized: '',
        error: 'Your query contains disallowed instructions. Please ask an objective question about the match.',
      };
    }
  }

  // Sanitize control characters
  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return { isValid: true, sanitized };
}

/**
 * Formats conversation history into a prompt segment.
 */
function formatHistoryBlock(history: Array<{ role: 'user' | 'assistant'; text: string }> = []): string {
  if (!history || history.length === 0) return '';
  return `\n[CONVERSATION_HISTORY]\n${history
    .slice(-4)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n')}\n`;
}

// =============================================================================
// REUSABLE PROMPT TEMPLATES (5 CORE CAPABILITIES)
// =============================================================================

/**
 * Template 1: Match Situation Explanation
 * Explains current in-game equation, required run rates, momentum, and game state.
 */
export function buildMatchSituationPrompt(
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): string {
  const matchTitle = matchContext.metadata?.title || matchContext.metadata?.id || 'this fixture';

  return `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}
${formatHistoryBlock(history)}
[CAPABILITY_OBJECTIVE: MATCH_SITUATION]
You are explaining the current match situation for ${matchTitle}.
Provide a concise, 2-3 paragraph fan-friendly breakdown addressing:
1. VERIFIED CURRENT STATE (Facts): Current scores, innings, overs elapsed, wickets fallen, and target/equation (runs needed off balls remaining, required run rate vs current run rate).
2. TACTICAL CONTEXT (Interpretation): Key batting anchors currently at the crease, recent bowling spells, and which side currently holds match momentum based on the telemetry.
3. GROUNDING & UNCERTAINTY: If the match has not yet started or is completed, explain the corresponding scheduled start or final victory margin. If specific metrics (e.g., pitch wear, ball tracking) are queried but missing from [MATCH_DATA], state clearly that they are unrecorded. Do not forecast guaranteed winners or speculate on betting odds.

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide a concise, lively 2-3 paragraph response strictly grounded in [MATCH_DATA]. Bold key player names, teams, and scores.`;
}

/**
 * Template 2: Player Performance Explanation
 * Evaluates an individual player's match contribution, statistics, and game impact.
 */
export function buildPlayerPerformancePrompt(
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  playerStats?: Record<string, unknown>,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): string {
  const extraBlock = playerStats
    ? `\n[TARGET_PLAYER_DATA]\n${JSON.stringify(playerStats, null, 2)}\n`
    : '';

  return `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}
${extraBlock}${formatHistoryBlock(history)}
[CAPABILITY_OBJECTIVE: PLAYER_PERFORMANCE]
You are evaluating an individual player's performance in this match.
Provide a concise, 2-paragraph fan-friendly explanation addressing:
1. QUANTITATIVE TELEMETRY (Facts): Explicitly cite their batting numbers (runs scored, balls faced, strike rate, boundaries) and/or bowling figures (overs, maidens, runs conceded, wickets taken, economy rate, dot balls).
2. TACTICAL IMPACT (Interpretation): Contextualize how their contribution altered the game (e.g., stabilizing after early wickets, building powerplay pressure, death-overs acceleration, or breakthrough wickets). Clearly distinguish statistical facts from tactical interpretations.
3. BOUNDARIES & UNCERTAINTY: If the player did not bat or bowl, state that clearly. If the user asks about historical career stats, speed gun speeds, or wagon wheels not in [MATCH_DATA], explicitly state that this data is not recorded in the match telemetry. Do not make speculative predictions about future selection or form.

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide a concise, lively 2-paragraph response strictly grounded in [MATCH_DATA]. Bold the player name, scores, and statistics.`;
}

/**
 * Template 3: Fantasy Team Performance Explanation
 * Explains points earned by a fantasy team, captain/vice-captain multipliers, and differentials.
 */
export function buildFantasyTeamPerformancePrompt(
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  fantasyTeamData?: Record<string, unknown>,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): string {
  const extraBlock = fantasyTeamData
    ? `\n[FANTASY_TEAM_DATA]\n${JSON.stringify(fantasyTeamData, null, 2)}\n`
    : '';

  return `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}
${extraBlock}${formatHistoryBlock(history)}
[CAPABILITY_OBJECTIVE: FANTASY_PERFORMANCE]
You are explaining why a fantasy team scored its points in this match.
Provide a lively 2-3 paragraph fan-friendly breakdown addressing:
1. AUTHORITATIVE POINTS & MULTIPLIERS (Facts): Explain the pre-calculated points scored by the team. Highlight the decisive role of Captain (2x multiplier) and Vice-Captain (1.5x multiplier) selections and their calculated returns.
2. TOP CONTRIBUTORS & DIFFERENTIALS (Interpretation): Identify which player picks delivered outsized value (e.g., multi-wicket hauls, milestone bonuses, high strike rates) and which selections underperformed or received penalties (e.g., ducks, high economy).
3. FANTASY RULE BOUNDARIES: Fantasy points in the telemetry are authoritative and pre-calculated by backend scoring rules. Explain how on-field actions earned those points; do not recalculate, modify, or dispute point values. If opponent rosters or contest rank data are missing, state that they are not present in the current dataset. Never guarantee future fantasy contest winnings.

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide a concise, engaging 2-3 paragraph response strictly grounded in [MATCH_DATA] and [FANTASY_TEAM_DATA]. Bold player names and points.`;
}

/**
 * Template 4: Match Summary
 * Summarizes the entire trajectory, innings, and decisive outcomes of a match.
 */
export function buildMatchSummaryPrompt(
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): string {
  const matchTitle = matchContext.metadata?.title || matchContext.metadata?.id || 'this match';

  return `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}
${formatHistoryBlock(history)}
[CAPABILITY_OBJECTIVE: MATCH_SUMMARY]
You are delivering a comprehensive yet concise match summary for ${matchTitle}.
Structure the response in 3 brief, distinct sections:
1. INNINGS RECAP (Facts): State the toss decision, 1st innings total and top contributors, followed by the 2nd innings chase/defense and official result (margin of victory or current state).
2. DECISIVE FACTORS (Interpretation): Explain what tactical factors (e.g., spin choke in the middle overs, death bowling, boundary percentage) shaped the outcome based on verified scorecards.
3. FACTUAL INTEGRITY: Use exact scores and player names from [MATCH_DATA]. Do not fabricate attendance numbers, weather conditions, or player quotes. If the fixture is currently in progress, state that the match is ongoing and summarize events completed so far. Do not predict upcoming series winners.

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide a concise, fan-friendly 3-section summary strictly grounded in [MATCH_DATA]. Bold teams, key player names, and scores.`;
}

/**
 * Template 5: Turning-Point Explanation
 * Explains pivotal shifts in game momentum, turning points, and key dismissals.
 */
export function buildTurningPointPrompt(
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): string {
  return `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}
${formatHistoryBlock(history)}
[CAPABILITY_OBJECTIVE: TURNING_POINTS]
You are analyzing the decisive turning points of this match.
Provide up to 3 distinct, numbered pivotal moments that altered the momentum or win probability of the game:
1. MOMENT TELEMETRY (Facts): For each moment, explicitly state the over number, the score at the time, and the exact players involved (batter, bowler, fielder).
2. TACTICAL SHIFT (Interpretation): Explain why this specific moment decisively shifted game momentum (e.g., breaking a dangerous partnership, an expensive over that ruined the required rate, or a counter-attacking cameo).
3. UNCERTAINTY & BOUNDARIES: Derive turning points strictly from verified events in [MATCH_DATA]. If specific ball-by-ball micro-data (e.g., DRS ball tracking, edge sound spikes) is unrecorded, state that it is not available. Do not claim an event "guaranteed" the result until the match was officially decided.

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide up to 3 numbered, lively pivotal moments strictly grounded in [MATCH_DATA]. Bold over numbers, player names, and scores.`;
}

// =============================================================================
// CENTRALIZED PROMPT DISPATCHER
// =============================================================================

/**
 * Centralized prompt builder dispatching to the appropriate template based on topic.
 */
export function buildPromptPayload(
  topic: AiTopic,
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = [],
  extraDetails?: {
    player?: Record<string, unknown>;
    fantasyTeam?: Record<string, unknown>;
    [key: string]: unknown;
  }
): string {
  switch (topic) {
    case 'MATCH_SUMMARY':
      return buildMatchSummaryPrompt(matchContext, sanitizedQuestion, conversationHistory);

    case 'TURNING_POINTS':
    case 'KEY_MOMENTS':
      return buildTurningPointPrompt(matchContext, sanitizedQuestion, conversationHistory);

    case 'PLAYER_PERFORMANCE':
      return buildPlayerPerformancePrompt(
        matchContext,
        sanitizedQuestion,
        extraDetails?.player || (extraDetails as any)?.targetPlayerId ? (extraDetails as any) : undefined,
        conversationHistory
      );

    case 'FANTASY_PERFORMANCE':
      return buildFantasyTeamPerformancePrompt(
        matchContext,
        sanitizedQuestion,
        extraDetails?.fantasyTeam || (extraDetails as any)?.targetFantasyTeamId ? (extraDetails as any) : undefined,
        conversationHistory
      );

    case 'MATCH_SITUATION':
    case 'MATCH_EXPLANATION':
    default:
      return buildMatchSituationPrompt(matchContext, sanitizedQuestion, conversationHistory);
  }
}
