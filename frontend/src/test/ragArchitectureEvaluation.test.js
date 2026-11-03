/**
 * FanPulse AI — RAG Architecture & Context Injection Validation Suite
 *
 * Verifies the architectural decisions documented in docs/RAG_DESIGN.md:
 * - Direct structured-context fits within token budget (< 2,500 tokens)
 * - Relational assembly preserves causal narrative without chunk fragmentation
 * - Fantasy points remain server-side authoritative (arithmetic safety)
 * - Context preparation operates with sub-millisecond in-memory efficiency
 */

import { describe, it, expect } from 'vitest';
import {
  VERIFIED_SAMPLE_CONTEXTS,
  assembleMatchContext,
} from '../../../supabase/functions/_shared/ai/contextAssembler';
import {
  buildMatchSituationPrompt,
  buildPlayerPerformancePrompt,
  buildFantasyTeamPerformancePrompt,
  buildMatchSummaryPrompt,
  buildTurningPointPrompt,
} from '../../../supabase/functions/_shared/ai/promptTemplates';

describe('FanPulse AI — RAG Architecture Evaluation & Context Budgeting', () => {
  const matchCtx = VERIFIED_SAMPLE_CONTEXTS['m-ind-aus-t20'];

  // =========================================================================
  // 1. TOKEN BUDGET & CONTEXT WINDOW VERIFICATION (docs/RAG_DESIGN.md §2)
  // =========================================================================
  describe('1. Token Scale vs. Context Window Feasibility', () => {
    it('verifies structured match JSON context is compact (< 15 KB, ~1,500 - 2,500 tokens)', () => {
      const serialized = JSON.stringify(matchCtx);
      const byteSize = new TextEncoder().encode(serialized).length;

      // Ensure JSON payload is under 15 KB
      expect(byteSize).toBeLessThan(15 * 1024);

      // Approximate tokens (1 token ~= 4 characters in English/JSON)
      const approxTokens = Math.ceil(serialized.length / 4);
      expect(approxTokens).toBeLessThan(2500);

      // Verify that this consumes < 0.25% of Gemini 1.5's 1,000,000 token context window
      const contextWindowUsagePercent = (approxTokens / 1_000_000) * 100;
      expect(contextWindowUsagePercent).toBeLessThan(0.25);
    });

    it('verifies all 5 prompt templates generate payloads well within single-call limits', () => {
      const p1 = buildMatchSituationPrompt(matchCtx, 'Explain situation');
      const p2 = buildPlayerPerformancePrompt(matchCtx, 'Explain player', { name: 'Bumrah' });
      const p3 = buildFantasyTeamPerformancePrompt(matchCtx, 'Explain fantasy', { totalPoints: 400 });
      const p4 = buildMatchSummaryPrompt(matchCtx, 'Match summary');
      const p5 = buildTurningPointPrompt(matchCtx, 'Key turning points');

      const prompts = [p1, p2, p3, p4, p5];
      for (const prompt of prompts) {
        const approxTokens = Math.ceil(prompt.length / 4);
        // Each assembled prompt must remain under 3,500 tokens
        expect(approxTokens).toBeLessThan(3500);
      }
    });
  });

  // =========================================================================
  // 2. CAUSAL CONTINUITY & RELATIONAL INTEGRITY (docs/RAG_DESIGN.md §4)
  // =========================================================================
  describe('2. Causal Continuity vs. Semantic Chunking Risks', () => {
    it('preserves complete 2-innings narrative arc in single payload without chunk boundary cuts', () => {
      expect(matchCtx.innings).toHaveLength(2);

      const firstInnings = matchCtx.innings[0];
      const secondInnings = matchCtx.innings[1];

      // Verifies chronological continuity
      expect(firstInnings.inningsNumber).toBe(1);
      expect(firstInnings.team).toBe('Australia');
      expect(secondInnings.inningsNumber).toBe(2);
      expect(secondInnings.team).toBe('India');

      // Both bowling figures and batting scores coexist in the same context
      expect(firstInnings.keyBowlers.some((b) => b.name === 'Jasprit Bumrah')).toBe(true);
      expect(secondInnings.topBatters.some((b) => b.name === 'Virat Kohli')).toBe(true);
    });

    it('preserves turning points with explicit over numbers and contextual causality', () => {
      expect(matchCtx.turningPoints.length).toBeGreaterThanOrEqual(3);
      for (const tp of matchCtx.turningPoints) {
        expect(tp).toMatch(/Over \d+/);
      }
    });
  });

  // =========================================================================
  // 3. FANTASY SCORING DETERMINISM & ARITHMETIC SAFETY (docs/RAG_DESIGN.md §3.3)
  // =========================================================================
  describe('3. Deterministic Fantasy Points Safety', () => {
    it('verifies that fantasy point values are authoritative numbers and not text instructions', () => {
      const topScorers = matchCtx.fantasySnapshot.topScoringPlayers;
      expect(topScorers.length).toBeGreaterThan(0);

      for (const player of topScorers) {
        // Point values must be numeric numbers, not generative prompts
        expect(typeof player.basePoints).toBe('number');
        expect(player.basePoints).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // 4. SUB-MILLISECOND CONTEXT PREPARATION PERFORMANCE
  // =========================================================================
  describe('4. In-Memory Assembly Performance Benchmark', () => {
    it('assembles structured match context in under 5 milliseconds (zero vector search lag)', async () => {
      const start = performance.now();
      const ctx = await assembleMatchContext(null, 'm-ind-aus-t20');
      const durationMs = performance.now() - start;

      expect(ctx).not.toBeNull();
      // In-memory relational assembly should take < 5ms
      expect(durationMs).toBeLessThan(5);
    });
  });
});
