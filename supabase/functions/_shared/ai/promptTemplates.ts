/**
 * FanPulse AI — Prompt Template Manager & Input Defense
 * Conforms to AI_MODULE_DESIGN.md §8 and §9.
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
1. STRICT DATA GROUNDING: Use ONLY the statistics, scores, names, and events explicitly provided in [MATCH_DATA]. If a requested detail, wagon wheel, ball trajectory, or stat is missing, explicitly explain that it is not available in the match telemetry. Never invent or hallucinate players, statistics, or scores.
2. NO PREDICTIONS: Do not forecast match winners, project future scores, or speculate on future tournament outcomes.
3. NO BETTING OR FINANCIAL ADVICE: Never mention odds, betting lines, gambling recommendations, or monetary stakes. Impartial sports analysis only.
4. FANTASY ROLE CLARITY: Fantasy points provided in the data are authoritative, calculated by backend scoring rules. Explain how player actions earned those points; do not recalculate, re-score, or dispute point values.
5. EXPLAIN UNCERTAINTY: Clearly state when data is partial, pending, or unrecorded.
6. TONE & STYLE: Direct, lively, and analytical. Use clear cricket terminology (e.g., strike rate, economy rate, death overs, powerplay). Format responses in clean Markdown paragraphs with bold text for player names and scores.`;

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
 * Assembles a structured prompt for the Gemini API based on topic and match context.
 */
export function buildPromptPayload(
  topic: AiTopic,
  matchContext: GroundedMatchContext,
  sanitizedQuestion: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = [],
  extraDetails?: {
    player?: Record<string, unknown>;
    fantasyTeam?: Record<string, unknown>;
  }
): string {
  const matchJson = JSON.stringify(matchContext, null, 2);

  let userInstruction = '';
  switch (topic) {
    case 'KEY_MOMENTS':
      userInstruction = `Analyze the key turning points of this match.
Provide up to 3 distinct, numbered pivotal moments that altered the win probability or momentum of the game. For each moment:
- Mention the over and score when it occurred.
- Identify the players involved.
- Explain why it decisively impacted the final outcome.`;
      break;

    case 'PLAYER_PERFORMANCE':
      userInstruction = `Explain the selected player's performance in this match in 2 concise paragraphs.
Evaluate:
1. Their quantitative contribution (runs scored, strike rate, wickets taken, economy).
2. The contextual impact on their team's performance (e.g. powerplay restraint, death-overs acceleration, crucial breakthrough).`;
      break;

    case 'FANTASY_PERFORMANCE':
      userInstruction = `Provide a lively breakdown of why this fantasy team scored its points.
Explain:
1. The decisive impact of the Captain and Vice-Captain selections.
2. The top individual differential contributors.
3. Any underperforming picks that penalized the team score.`;
      break;

    case 'MATCH_EXPLANATION':
    default:
      userInstruction = `Provide a concise, 2-3 paragraph explanation of the current match situation for ${
        matchContext.metadata.title || matchContext.metadata.id
      }.
Explain:
1. The overall narrative of the game (who is on top and why).
2. Key batting anchors and bowling performances that shaped this position.
3. The exact match equation (runs needed, overs left, required run rate) or the margin of victory.`;
      break;
  }

  // Format conversation history (up to last 4 messages)
  const historyBlock =
    conversationHistory.length > 0
      ? `\n[CONVERSATION_HISTORY]\n${conversationHistory
          .slice(-4)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
          .join('\n')}\n`
      : '';

  const extraBlock = extraDetails
    ? `\n[ADDITIONAL_FOCUS_DATA]\n${JSON.stringify(extraDetails, null, 2)}\n`
    : '';

  return `[MATCH_DATA]
${matchJson}
${extraBlock}${historyBlock}
[CAPABILITY_OBJECTIVE]
${userInstruction}

[USER_QUESTION]
"""${sanitizedQuestion}"""

Provide a concise, lively 1-3 paragraph response strictly grounded in the [MATCH_DATA] provided above. Bold key player names, scores, and numbers. If uncertain or unrecorded in the data, explain that clearly.`;
}
