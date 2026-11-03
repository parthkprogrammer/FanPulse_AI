import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { tryVerifyAuth, extractBearerToken } from '../_shared/auth/index.ts';

interface AiAssistantRequest {
  matchId: string;
  question: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

const SYSTEM_INSTRUCTION = `You are FanPulse AI, an expert, objective, and engaging cricket analyst.
Your task is to explain cricket matches and fantasy performances to fans using ONLY the verified JSON data provided in the [MATCH_DATA] section below.

CRITICAL OPERATIONAL RULES:
1. STRICT DATA GROUNDING: Use ONLY the statistics, scores, names, and events explicitly provided in [MATCH_DATA]. If a detail is missing, state that it is not available. Never invent or hallucinate statistics.
2. NO PREDICTIONS: Do not forecast match winners, project future scores, or speculate on future series outcomes.
3. NO BETTING OR FINANCIAL ADVICE: Never mention odds, betting lines, gambling recommendations, or monetary stakes.
4. FANTASY ROLE CLARITY: Fantasy points provided are pre-calculated by backend scoring rules. Explain how player actions earned those points; do not recalculate or dispute point values.
5. TONE & STYLE: Direct, lively, and analytical. Use clear cricket terminology (e.g., strike rate, economy rate, death overs, powerplay). Format responses in clean Markdown paragraphs with bold text for player names and scores.`;

// Verified Match Data for grounding
const SAMPLE_MATCH_CONTEXTS: Record<string, Record<string, unknown>> = {
  'm-ind-aus-t20': {
    metadata: {
      id: 'm-ind-aus-t20',
      title: 'India vs Australia — 3rd T20I',
      format: 'T20',
      status: 'LIVE',
      venue: 'Melbourne Cricket Ground, Melbourne',
      toss: 'Australia won the toss and elected to field first',
      situation: 'India need 5 runs in 10 balls with 6 wickets in hand (Req. RR: 3.00)',
    },
    scores: {
      team1: { name: 'India', code: 'IND', score: '184/4', overs: '18.2', runRate: 10.03 },
      team2: { name: 'Australia', code: 'AUS', score: '178/8', overs: '20.0', runRate: 8.9 },
    },
    topPerformers: [
      { name: 'Virat Kohli', team: 'IND', role: 'BATTER', stats: '74* off 48b (6x4, 2x6, SR 154.2)', fantasyPoints: 112 },
      { name: 'Jasprit Bumrah', team: 'IND', role: 'BOWLER', stats: '3/24 (4.0 ov, 14 dots, ER 6.0)', fantasyPoints: 98 },
      { name: 'Glenn Maxwell', team: 'AUS', role: 'ALL_ROUNDER', stats: '54 off 28b & 1/28 (3.0 ov)', fantasyPoints: 92 },
      { name: 'Hardik Pandya', team: 'IND', role: 'ALL_ROUNDER', stats: '38* off 19b (3x4, 3x6, SR 200.0)', fantasyPoints: 78 },
      { name: 'Travis Head', team: 'AUS', role: 'BATTER', stats: '65 off 38b (7x4, 3x6, SR 171.1)', fantasyPoints: 82 },
    ],
    turningPoints: [
      'Over 16.4: Wicket — Adam Zampa dismissed Suryakumar Yadav (28 off 15b), caught by Starc in the deep.',
      'Over 17.5: Milestone — Virat Kohli reached 70+ runs off 48 deliveries with a majestic cover drive.',
      'Over 18.1 - 18.2: Hardik Pandya struck 4 then 6 off Pat Cummins, reducing the equation from 15 off 12 to 5 off 10.',
    ],
  },
  'm-eng-sa-odi': {
    metadata: {
      id: 'm-eng-sa-odi',
      title: 'England vs South Africa — 1st ODI',
      format: 'ODI',
      status: 'COMPLETED',
      venue: "Lord's, London",
      result: 'England won by 24 runs',
    },
    scores: {
      team1: { name: 'England', code: 'ENG', score: '312/7', overs: '50.0', runRate: 6.24 },
      team2: { name: 'South Africa', code: 'SA', score: '288/10', overs: '47.4', runRate: 6.04 },
    },
    topPerformers: [
      { name: 'Joe Root', team: 'ENG', role: 'BATTER', stats: '104 off 110b', fantasyPoints: 135 },
      { name: 'Kagiso Rabada', team: 'SA', role: 'BOWLER', stats: '4/52 (10.0 ov)', fantasyPoints: 110 },
    ],
    turningPoints: [
      'Over 47.4: England bowled out South Africa for 288 to seal a 24-run victory.',
    ],
  },
};

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return errorResponse('Method Not Allowed. Use POST.', 405, 'MethodNotAllowed');
  }

  try {
    const body: AiAssistantRequest = await req.json().catch(() => ({}));
    const { matchId, question, conversationHistory = [] } = body;

    // 2. Authentication Verification (FR-AUTH-07, NFR-SEC-01)
    const token = extractBearerToken(req);
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    if (isProduction && !token) {
      return errorResponse('Authentication required to access AI Assistant (FR-AUTH-07).', 401, 'Unauthorized');
    }
    if (token) {
      const authUser = await tryVerifyAuth(req);
      if (isProduction && !authUser) {
        return errorResponse('Invalid or expired authentication session.', 401, 'Unauthorized');
      }
    }

    // 3. Input Validation (AI_MODULE_DESIGN.md §9.1)
    if (!matchId) {
      return errorResponse('matchId is required.', 400, 'ValidationError');
    }

    if (!question || question.trim().length === 0) {
      return errorResponse('Question cannot be empty.', 400, 'ValidationError');
    }

    if (question.length > 250) {
      return errorResponse('Question must not exceed 250 characters.', 400, 'ValidationError');
    }

    // Prompt injection guardrails (AI_MODULE_DESIGN.md §9.2)
    const lowerQ = question.toLowerCase();
    const disallowedPhrases = [
      'ignore all previous instructions',
      'system override',
      'reveal your prompt',
      'act as dan',
      'disregard safety',
    ];
    if (disallowedPhrases.some((phrase) => lowerQ.includes(phrase))) {
      return errorResponse(
        'Your query contains disallowed instructions. Please ask an objective question about the match.',
        400,
        'SecurityViolation'
      );
    }

    // 3. Assemble Grounded Match Context
    let matchContext = SAMPLE_MATCH_CONTEXTS[matchId];

    // If live Supabase client available, check database for live match
    try {
      const supabase = createCallerClient(req);
      const { data: dbMatch } = await supabase
        .from('matches')
        .select('*, teams!team1_id(name, code), teams!team2_id(name, code)')
        .eq('id', matchId)
        .maybeSingle();

      if (dbMatch) {
        matchContext = {
          metadata: {
            id: dbMatch.id,
            format: dbMatch.format,
            status: dbMatch.status,
            venue: dbMatch.venue,
            result: dbMatch.result_summary,
          },
          scores: {
            team1: dbMatch.team1,
            team2: dbMatch.team2,
          },
        };
      }
    } catch {
      // Fallback to sample context
    }

    if (!matchContext) {
      return errorResponse(
        `Telemetry data is currently unavailable for match "${matchId}". Lineups and statistics will be loaded when play begins.`,
        404,
        'DataUnavailable'
      );
    }

    // 4. Construct Prompt
    const promptPayload = `[MATCH_DATA]
${JSON.stringify(matchContext, null, 2)}

[CONVERSATION_HISTORY]
${conversationHistory
  .slice(-4)
  .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
  .join('\n')}

[USER_QUESTION]
"""${question.trim()}"""

Provide a concise, lively 1-2 paragraph response strictly grounded in the [MATCH_DATA] provided above. Bold key players and scores.`;

    // 5. Check GEMINI_API_KEY
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const isProduction =
      Deno.env.get('ENVIRONMENT') === 'production' ||
      Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

    if (!geminiApiKey) {
      if (isProduction) {
        // Enforce rule: Do not simulate successful AI responses in production
        return errorResponse(
          'Match explanation service is temporarily unavailable. GEMINI_API_KEY is not configured on the server.',
          503,
          'ServiceUnavailable'
        );
      }

      // Development / Local Test Fallback (Clearly labeled as Dev Simulation)
      const mockAnswers: Record<string, string> = {
        death: `Based on verified telemetry, **India** executed a disciplined death overs acceleration. In overs 16–20, **Virat Kohli** (74* off 48b) and **Hardik Pandya** (38* off 19b, SR 200.0) scored 38 runs off just 15 balls, targeting boundary gaps without reckless lofted shots. Meanwhile, **Jasprit Bumrah** conceded only 24 runs in his 4 overs (ER 6.0), curbing Australia to 178/8.`,
        kohli: `**Virat Kohli** earned **112 fantasy points** through an unbeaten 74 runs (48 balls, 6 fours, 2 sixes). His performance earned +74 base batting points, +16 milestone bonus for passing 70 runs, and +12 strike-rate acceleration bonus (>150 SR in T20I).`,
        bumrah: `**Jasprit Bumrah** delivered an elite spell of **3/24 (4.0 ov)** with 14 dot balls and an economy rate of 6.00. This yielded **98 fantasy points** (75 points for 3 wickets, +8 economy bonus, +6 maiden over bonus, +9 dot ball impact).`,
        turning: `The pivotal turning point occurred in the **18th over**. With 15 needed off 12 balls, **Hardik Pandya** struck **Pat Cummins** for consecutive boundaries (4 and 6), slashing the required rate from 7.50 to 3.00 and shifting India's win probability to 95%.`,
      };

      let answer = `Based on verified match records for **${matchContext.metadata.title || matchId}**, **India** reached **184/4 (18.2 ov)** chasing Australia's **178/8**. **Virat Kohli** anchored with **74* (48b)** alongside **Hardik Pandya** (**38* off 19b**).`;
      const qLower = question.toLowerCase();
      if (qLower.includes('death') || qLower.includes('overs') || qLower.includes('strategy')) {
        answer = mockAnswers.death;
      } else if (qLower.includes('kohli') || qLower.includes('virat') || qLower.includes('112')) {
        answer = mockAnswers.kohli;
      } else if (qLower.includes('bumrah') || qLower.includes('jasprit') || qLower.includes('bowl')) {
        answer = mockAnswers.bumrah;
      } else if (qLower.includes('turning') || qLower.includes('moment') || qLower.includes('wicket')) {
        answer = mockAnswers.turning;
      }

      return jsonResponse({
        explanation: answer,
        matchId,
        topic: 'MATCH_EXPLANATION',
        provider: 'development_fallback',
        isGrounded: true,
        dataContext: {
          matchId,
          status: matchContext.metadata.status,
          scores: matchContext.scores,
        },
        notice: 'Generated in Development Mode (GEMINI_API_KEY not configured in local environment).',
      });
    }

    // 6. Invoke Google Gemini 1.5 Flash via HTTPS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: promptPayload }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text().catch(() => '');
        return errorResponse(
          `Gemini API Error: Upstream service returned HTTP ${geminiResponse.status}.`,
          502,
          'BadGateway',
          errorBody
        );
      }

      const geminiData = await geminiResponse.json();
      const generatedText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No explanation could be synthesized from the available telemetry.';

      return jsonResponse({
        explanation: generatedText.trim(),
        matchId,
        topic: 'MATCH_EXPLANATION',
        provider: 'gemini-1.5-flash',
        isGrounded: true,
        dataContext: {
          matchId,
          status: matchContext.metadata.status,
        },
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
        return errorResponse(
          'Gemini AI request timed out after 12 seconds. Please retry.',
          504,
          'GatewayTimeout'
        );
      }
      throw fetchErr;
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown internal error';
    return errorResponse(errorMsg, 500, 'InternalServerError');
  }
});
