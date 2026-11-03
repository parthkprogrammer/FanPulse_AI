import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createCallerClient } from '../_shared/supabaseClient.ts';
import { tryVerifyAuth, extractBearerToken } from '../_shared/auth/index.ts';
import { handleError, UnauthorizedError, ValidationError, NotFoundError, RateLimitError } from '../_shared/utils/errors.ts';
import { logger } from '../_shared/utils/logger.ts';
import {
  AiAssistantRequest,
  AiTopic,
  aiRateLimiter,
  assembleMatchContext,
  buildPromptPayload,
  validateUserQuestion,
  validateAiOutput,
  geminiClient,
  BASE_SYSTEM_INSTRUCTION,
} from '../_shared/ai/index.ts';

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return errorResponse('Method Not Allowed. Use POST.', 405, 'MethodNotAllowed');
  }

  try {
    const startTime = Date.now();

    // 2. Authentication Verification
    const token = extractBearerToken(req);
    const isProduction =
      Deno.env.get('ENVIRONMENT') === 'production' ||
      Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

    let authUser: any = null;
    if (token) {
      authUser = await tryVerifyAuth(req);
      if (isProduction && !authUser) {
        throw new UnauthorizedError('Invalid or expired authentication session.');
      }
    } else if (isProduction) {
      throw new UnauthorizedError('Authentication required to access AI Assistant (FR-AUTH-07).');
    }

    // 3. Rate Limiting Check (Burst: 10/min, Daily: 50/day per user/IP)
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'anonymous-client';
    const rateLimitKey = authUser?.id || clientIp;
    const rateCheck = aiRateLimiter.checkLimit(rateLimitKey);

    if (!rateCheck.allowed) {
      logger.warn('ai-assistant', `Rate limit exceeded for ${rateLimitKey}: ${rateCheck.reason}`);
      throw new RateLimitError(rateCheck.reason || 'AI query rate limit exceeded.');
    }

    // 4. Parse & Validate Request Body
    const body: AiAssistantRequest = await req.json().catch(() => ({}));
    const {
      matchId,
      question,
      topic = 'MATCH_EXPLANATION',
      playerId,
      fantasyTeamId,
      conversationHistory = [],
    } = body;

    if (!matchId) {
      throw new ValidationError('matchId is required.');
    }

    const validation = validateUserQuestion(question);
    if (!validation.isValid) {
      throw new ValidationError(validation.error || 'Invalid question submitted.');
    }

    // 5. Read-Only Match Context Assembly from Supabase / Grounded Datasets
    let supabase = null;
    try {
      supabase = createCallerClient(req);
    } catch {
      // Fallback if caller client cannot be initialized
    }

    const matchContext = await assembleMatchContext(supabase, matchId);
    if (!matchContext) {
      throw new NotFoundError(
        `Telemetry data is currently unavailable for match "${matchId}". Lineups and statistics will be loaded when play begins.`
      );
    }

    // 6. Build Token-Budgeted Prompt Payload
    const promptPayload = buildPromptPayload(
      topic as AiTopic,
      matchContext,
      validation.sanitized,
      conversationHistory,
      playerId || fantasyTeamId
        ? {
            ...(playerId ? { targetPlayerId: playerId } : {}),
            ...(fantasyTeamId ? { targetFantasyTeamId: fantasyTeamId } : {}),
          }
        : undefined
    );

    // 7. Invoke Gemini API Client
    const geminiResult = await geminiClient.generateContent(promptPayload, {
      systemInstruction: BASE_SYSTEM_INSTRUCTION,
      matchContextFallback: matchContext,
    });

    // 8. Output Validation & Hallucination Sanitization
    const outputValidation = validateAiOutput(
      geminiResult.text,
      `Match situation for ${matchContext.metadata.title}: ${matchContext.scores?.summary || 'Scores recorded in match telemetry.'}`
    );

    const responseDurationMs = Date.now() - startTime;

    // 9. Structured Audit Log (without secrets or PII)
    logger.info('ai-assistant', 'AI generation completed successfully', {
      matchId,
      userId: authUser?.id || 'anonymous',
      topic,
      provider: geminiResult.provider,
      latencyMs: responseDurationMs,
      tokenCount: geminiResult.tokenCount,
      warnings: outputValidation.warnings,
    });

    // 10. Optional Message History Persistence if authenticated and conversation exists
    if (authUser && supabase) {
      try {
        const { data: conv } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', authUser.id)
          .eq('match_id', matchId)
          .maybeSingle();

        if (conv?.id) {
          // Record user prompt and assistant response
          await supabase.from('ai_messages').insert([
            {
              conversation_id: conv.id,
              sender_role: 'USER',
              message_text: validation.sanitized,
            },
            {
              conversation_id: conv.id,
              sender_role: 'ASSISTANT',
              message_text: outputValidation.sanitizedText,
              data_context_snapshot: {
                matchId,
                status: matchContext.metadata.status,
              },
              token_count: geminiResult.tokenCount?.totalTokens || null,
              response_time_ms: responseDurationMs,
            },
          ]);
        }
      } catch {
        // Non-blocking history persistence
      }
    }

    // 11. Return Standard Response Envelope
    return jsonResponse({
      explanation: outputValidation.sanitizedText,
      matchId,
      topic,
      provider: geminiResult.provider,
      isGrounded: true,
      isSimulated: geminiResult.isSimulated,
      dataContext: {
        matchId,
        status: matchContext.metadata.status,
        venue: matchContext.metadata.venue,
        scores: matchContext.scores,
      },
      tokenCount: geminiResult.tokenCount,
      timestamp: new Date().toISOString(),
      ...(outputValidation.warnings.length > 0 ? { notices: outputValidation.warnings } : {}),
    });
  } catch (err: unknown) {
    return handleError(err, 'ai-assistant');
  }
});
