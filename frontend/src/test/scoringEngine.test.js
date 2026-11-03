/**
 * FanPulse AI — Deterministic Fantasy Scoring Engine Test Suite
 *
 * Exhaustive unit and edge-case testing covering:
 * - Batting points (BR-SCORE-BAT-01 through 06)
 * - Bowling points (BR-SCORE-BOWL-01 through 06)
 * - Fielding points (BR-SCORE-FIELD-01 through 04)
 * - Multipliers (BR-SCORE-MULT-01 and 02)
 * - Team-level score aggregation (sum of 11 players)
 * - Incomplete and absent statistics handling
 * - Deterministic repeatability & idempotency
 * - Versioned configuration-driven rules
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SCORING_RULES,
  calculatePlayerScore,
  calculateTeamScore,
  calculateEconomyRate,
  convertOversToBalls,
  applyMultiplier,
} from '../../../supabase/functions/_shared/scoring/index';
import { scoringService } from '../services/scoringService';

describe('FanPulse AI — Deterministic Fantasy Scoring Engine', () => {
  // =========================================================================
  // 1. OVERS PARSING & ECONOMY RATE UTILITIES
  // =========================================================================
  describe('1. Cricket Overs & Economy Calculations', () => {
    it('converts cricket overs to legal deliveries accurately', () => {
      expect(convertOversToBalls(0)).toBe(0);
      expect(convertOversToBalls(1.0)).toBe(6);
      expect(convertOversToBalls(3.4)).toBe(22); // 3*6 + 4 = 22
      expect(convertOversToBalls(4.0)).toBe(24);
      expect(convertOversToBalls(10.0)).toBe(60);
      expect(convertOversToBalls(null)).toBe(0);
    });

    it('calculates economy rate per legal 6-ball over', () => {
      // 24 runs conceded in 4.0 overs = 6.00
      expect(calculateEconomyRate(24, 4.0)).toBe(6.0);
      // 12 runs in 3.0 overs = 4.00
      expect(calculateEconomyRate(12, 3.0)).toBe(4.0);
      // 22 runs in 3.4 overs (22 balls): (22 / 22) * 6 = 6.00
      expect(calculateEconomyRate(22, 3.4)).toBe(6.0);
      // 0 balls bowled returns null
      expect(calculateEconomyRate(0, 0)).toBeNull();
    });
  });

  // =========================================================================
  // 2. BATTING SCORING RULES (BR-SCORE-BAT-01 through 06)
  // =========================================================================
  describe('2. Batting Scoring Rules', () => {
    it('awards +1.0 point per run scored (BR-SCORE-BAT-01)', () => {
      const result = calculatePlayerScore({ runsScored: 24, ballsFaced: 18 });
      const runItem = result.breakdown.find((b) => b.eventKey === 'RUN_SCORED');
      expect(runItem).toBeDefined();
      expect(runItem.points).toBe(24.0);
      expect(result.basePoints).toBe(24.0);
    });

    it('awards +1.0 bonus per boundary four (BR-SCORE-BAT-02)', () => {
      const result = calculatePlayerScore({ runsScored: 20, fours: 4 });
      const fourItem = result.breakdown.find((b) => b.eventKey === 'BOUNDARY_FOUR');
      expect(fourItem).toBeDefined();
      expect(fourItem.points).toBe(4.0); // 4 * 1.0
      // 20 runs + 4 fours = 24.0
      expect(result.basePoints).toBe(24.0);
    });

    it('awards +2.0 bonus per boundary six (BR-SCORE-BAT-03)', () => {
      const result = calculatePlayerScore({ runsScored: 18, sixes: 3 });
      const sixItem = result.breakdown.find((b) => b.eventKey === 'BOUNDARY_SIX');
      expect(sixItem).toBeDefined();
      expect(sixItem.points).toBe(6.0); // 3 * 2.0
      // 18 runs + 6 bonus = 24.0
      expect(result.basePoints).toBe(24.0);
    });

    it('awards +10.0 bonus for half-century (50-99 runs) (BR-SCORE-BAT-04)', () => {
      const result = calculatePlayerScore({ runsScored: 54, fours: 5, sixes: 2 });
      const halfCentury = result.breakdown.find((b) => b.eventKey === 'HALF_CENTURY_BONUS');
      const century = result.breakdown.find((b) => b.eventKey === 'CENTURY_BONUS');
      expect(halfCentury).toBeDefined();
      expect(halfCentury.points).toBe(10.0);
      expect(century).toBeUndefined();
      // 54 runs + 5 (fours) + 4 (sixes) + 10 (50 bonus) = 73.0
      expect(result.basePoints).toBe(73.0);
    });

    it('awards +25.0 bonus for century (100+ runs) without double-counting 50 bonus (BR-SCORE-BAT-05)', () => {
      const result = calculatePlayerScore({ runsScored: 104, fours: 10, sixes: 4 });
      const century = result.breakdown.find((b) => b.eventKey === 'CENTURY_BONUS');
      const halfCentury = result.breakdown.find((b) => b.eventKey === 'HALF_CENTURY_BONUS');
      expect(century).toBeDefined();
      expect(century.points).toBe(25.0);
      expect(halfCentury).toBeUndefined();
      // 104 runs + 10 (fours) + 8 (sixes) + 25 (100 bonus) = 147.0
      expect(result.basePoints).toBe(147.0);
    });

    it('applies -5.0 duck penalty when dismissed for 0 runs (BR-SCORE-BAT-06)', () => {
      const result = calculatePlayerScore(
        { runsScored: 0, ballsFaced: 3, isOut: true, role: 'BATTER' },
        DEFAULT_SCORING_RULES,
        { format: 'T20', role: 'BATTER' }
      );
      const duck = result.breakdown.find((b) => b.eventKey === 'DUCK_PENALTY');
      expect(duck).toBeDefined();
      expect(duck.points).toBe(-5.0);
      expect(result.basePoints).toBe(-5.0);
    });

    it('exempts bowlers from duck penalty in ODI and TEST formats (BR-SCORE-BAT-06)', () => {
      const odiBowler = calculatePlayerScore(
        { runsScored: 0, ballsFaced: 4, isOut: true, role: 'BOWLER' },
        DEFAULT_SCORING_RULES,
        { format: 'ODI', role: 'BOWLER' }
      );
      expect(odiBowler.breakdown.find((b) => b.eventKey === 'DUCK_PENALTY')).toBeUndefined();

      const testBowler = calculatePlayerScore(
        { runsScored: 0, ballsFaced: 8, isOut: true, role: 'BOWLER' },
        DEFAULT_SCORING_RULES,
        { format: 'TEST', role: 'BOWLER' }
      );
      expect(testBowler.breakdown.find((b) => b.eventKey === 'DUCK_PENALTY')).toBeUndefined();

      // Bowlers in T20 are NOT exempt
      const t20Bowler = calculatePlayerScore(
        { runsScored: 0, ballsFaced: 2, isOut: true, role: 'BOWLER' },
        DEFAULT_SCORING_RULES,
        { format: 'T20', role: 'BOWLER' }
      );
      expect(t20Bowler.breakdown.find((b) => b.eventKey === 'DUCK_PENALTY')).toBeDefined();
    });

    it('does NOT apply duck penalty if batsman was NOT OUT (0 runs not out)', () => {
      const result = calculatePlayerScore(
        { runsScored: 0, ballsFaced: 2, isOut: false, dismissalType: 'NOT_OUT', role: 'BATTER' },
        DEFAULT_SCORING_RULES,
        { format: 'T20', role: 'BATTER' }
      );
      expect(result.breakdown.find((b) => b.eventKey === 'DUCK_PENALTY')).toBeUndefined();
      expect(result.basePoints).toBe(0.0);
    });
  });

  // =========================================================================
  // 3. BOWLING SCORING RULES (BR-SCORE-BOWL-01 through 06)
  // =========================================================================
  describe('3. Bowling Scoring Rules', () => {
    it('awards +25.0 points per wicket taken (BR-SCORE-BOWL-01)', () => {
      const result = calculatePlayerScore({ wicketsTaken: 2, oversBowled: 4.0, runsConceded: 28 });
      const wicketItem = result.breakdown.find((b) => b.eventKey === 'WICKET_TAKEN');
      expect(wicketItem).toBeDefined();
      expect(wicketItem.points).toBe(50.0); // 2 * 25.0
    });

    it('awards +10.0 points per maiden over (BR-SCORE-BOWL-02)', () => {
      const result = calculatePlayerScore({ maidens: 2, oversBowled: 4.0, runsConceded: 16 });
      const maidenItem = result.breakdown.find((b) => b.eventKey === 'MAIDEN_OVER');
      expect(maidenItem).toBeDefined();
      expect(maidenItem.points).toBe(20.0); // 2 * 10.0
    });

    it('awards +10.0 bonus for 3-wicket haul (3-4 wickets) (BR-SCORE-BOWL-03)', () => {
      const result = calculatePlayerScore({ wicketsTaken: 3, oversBowled: 4.0, runsConceded: 30 });
      const threeHaul = result.breakdown.find((b) => b.eventKey === 'THREE_WICKET_HAUL');
      const fiveHaul = result.breakdown.find((b) => b.eventKey === 'FIVE_WICKET_HAUL');
      expect(threeHaul).toBeDefined();
      expect(threeHaul.points).toBe(10.0);
      expect(fiveHaul).toBeUndefined();
      // 3 wickets (75) + 3-haul bonus (10) = 85.0
      expect(result.basePoints).toBe(85.0);
    });

    it('awards +25.0 bonus for 5-wicket haul (5+ wickets) (BR-SCORE-BOWL-04)', () => {
      const result = calculatePlayerScore({ wicketsTaken: 5, oversBowled: 4.0, runsConceded: 20 });
      const fiveHaul = result.breakdown.find((b) => b.eventKey === 'FIVE_WICKET_HAUL');
      const threeHaul = result.breakdown.find((b) => b.eventKey === 'THREE_WICKET_HAUL');
      expect(fiveHaul).toBeDefined();
      expect(fiveHaul.points).toBe(25.0);
      expect(threeHaul).toBeUndefined();
      // 5 wickets (125) + 5-haul bonus (25) = 150.0
      expect(result.basePoints).toBe(150.0);
    });

    it('awards +10.0 economy bonus when economy <= 4.0 with minimum 2 overs (BR-SCORE-BOWL-05)', () => {
      // 8 runs in 2.0 overs -> econ = 4.00
      const result = calculatePlayerScore({ oversBowled: 2.0, runsConceded: 8, wicketsTaken: 1 });
      const econBonus = result.breakdown.find((b) => b.eventKey === 'ECONOMY_RATE_BONUS');
      expect(econBonus).toBeDefined();
      expect(econBonus.points).toBe(10.0);
    });

    it('applies -10.0 economy penalty when economy >= 10.0 with minimum 2 overs (BR-SCORE-BOWL-06)', () => {
      // 25 runs in 2.0 overs -> econ = 12.50
      const result = calculatePlayerScore({ oversBowled: 2.0, runsConceded: 25, wicketsTaken: 0 });
      const econPenalty = result.breakdown.find((b) => b.eventKey === 'ECONOMY_RATE_PENALTY');
      expect(econPenalty).toBeDefined();
      expect(econPenalty.points).toBe(-10.0);
    });

    it('ignores economy bonus and penalty when overs bowled is under 2.0 overs', () => {
      // 2 runs in 1.0 over (econ = 2.00, but only 1 over)
      const underOversBonus = calculatePlayerScore({ oversBowled: 1.0, runsConceded: 2 });
      expect(underOversBonus.breakdown.find((b) => b.eventKey === 'ECONOMY_RATE_BONUS')).toBeUndefined();

      // 14 runs in 1.0 over (econ = 14.00, but only 1 over)
      const underOversPenalty = calculatePlayerScore({ oversBowled: 1.0, runsConceded: 14 });
      expect(underOversPenalty.breakdown.find((b) => b.eventKey === 'ECONOMY_RATE_PENALTY')).toBeUndefined();
    });
  });

  // =========================================================================
  // 4. FIELDING SCORING RULES (BR-SCORE-FIELD-01 through 04)
  // =========================================================================
  describe('4. Fielding Scoring Rules', () => {
    it('awards +10.0 points per catch taken (BR-SCORE-FIELD-01)', () => {
      const result = calculatePlayerScore({ catches: 2 });
      const catchItem = result.breakdown.find((b) => b.eventKey === 'CATCH_TAKEN');
      expect(catchItem).toBeDefined();
      expect(catchItem.points).toBe(20.0); // 2 * 10.0
    });

    it('awards +15.0 points for direct hit run-out (BR-SCORE-FIELD-02)', () => {
      const result = calculatePlayerScore({ runOutsDirect: 1 });
      const roItem = result.breakdown.find((b) => b.eventKey === 'RUN_OUT_DIRECT');
      expect(roItem).toBeDefined();
      expect(roItem.points).toBe(15.0);
    });

    it('awards +10.0 points for indirect run-out (BR-SCORE-FIELD-03)', () => {
      const result = calculatePlayerScore({ runOutsIndirect: 1 });
      const roItem = result.breakdown.find((b) => b.eventKey === 'RUN_OUT_INDIRECT');
      expect(roItem).toBeDefined();
      expect(roItem.points).toBe(10.0);
    });

    it('awards +15.0 points per stumping (BR-SCORE-FIELD-04)', () => {
      const result = calculatePlayerScore({ stumpings: 2 });
      const stumpingItem = result.breakdown.find((b) => b.eventKey === 'STUMPING');
      expect(stumpingItem).toBeDefined();
      expect(stumpingItem.points).toBe(30.0); // 2 * 15.0
    });
  });

  // =========================================================================
  // 5. MULTIPLIERS (BR-SCORE-MULT-01 and 02)
  // =========================================================================
  describe('5. Multipliers', () => {
    it('applies exact 2.0x multiplier to Captain base points', () => {
      const capScore = calculatePlayerScore(
        { runsScored: 50, fours: 5 },
        DEFAULT_SCORING_RULES,
        { isCaptain: true }
      );
      // Base: 50 + 5 (fours) + 10 (50 bonus) = 65.0
      expect(capScore.basePoints).toBe(65.0);
      expect(capScore.multiplier).toBe(2.0);
      expect(capScore.finalPoints).toBe(130.0);
      expect(capScore.isCaptain).toBe(true);
      expect(capScore.isViceCaptain).toBe(false);
    });

    it('applies exact 1.5x multiplier to Vice-Captain base points', () => {
      const vcScore = calculatePlayerScore(
        { wicketsTaken: 2 },
        DEFAULT_SCORING_RULES,
        { isViceCaptain: true }
      );
      // Base: 2 * 25 = 50.0
      expect(vcScore.basePoints).toBe(50.0);
      expect(vcScore.multiplier).toBe(1.5);
      expect(vcScore.finalPoints).toBe(75.0);
      expect(vcScore.isViceCaptain).toBe(true);
      expect(vcScore.isCaptain).toBe(false);
    });

    it('defaults standard players to 1.0x multiplier', () => {
      const regScore = calculatePlayerScore({ runsScored: 20 });
      expect(regScore.basePoints).toBe(20.0);
      expect(regScore.multiplier).toBe(1.0);
      expect(regScore.finalPoints).toBe(20.0);
    });
  });

  // =========================================================================
  // 6. TEAM-LEVEL SCORING & AGGREGATION
  // =========================================================================
  describe('6. Team-Level Scoring', () => {
    const mockSquad = [
      { id: 'p1', name: 'Virat Kohli', role: 'BATTER' },
      { id: 'p2', name: 'Rohit Sharma', role: 'BATTER' },
      { id: 'p3', name: 'KL Rahul', role: 'WICKET_KEEPER' },
      { id: 'p4', name: 'Hardik Pandya', role: 'ALL_ROUNDER' },
      { id: 'p5', name: 'Ravindra Jadeja', role: 'ALL_ROUNDER' },
      { id: 'p6', name: 'Jasprit Bumrah', role: 'BOWLER' },
      { id: 'p7', name: 'Mohammed Shami', role: 'BOWLER' },
      { id: 'p8', name: 'Kuldeep Yadav', role: 'BOWLER' },
      { id: 'p9', name: 'Travis Head', role: 'BATTER' },
      { id: 'p10', name: 'Steve Smith', role: 'BATTER' },
      { id: 'p11', name: 'Pat Cummins', role: 'BOWLER' },
    ];

    const mockStatsMap = {
      p1: { runsScored: 72, fours: 6, sixes: 2, catches: 1 }, // 72 + 6 + 4 + 10(50s) + 10(catches) = 102 base
      p2: { runsScored: 30, fours: 4 }, // 30 + 4 = 34 base
      p3: { runsScored: 20, stumpings: 1 }, // 20 + 15 = 35 base
      p4: { runsScored: 25, wicketsTaken: 1 }, // 25 + 25 = 50 base
      p5: { wicketsTaken: 2, oversBowled: 4.0, runsConceded: 20 }, // 50 base
      p6: { wicketsTaken: 3, oversBowled: 4.0, runsConceded: 16, maidens: 1 }, // 75 + 10(haul) + 10(maiden) + 10(econ <= 4) = 105 base
      p7: { wicketsTaken: 1 }, // 25 base
      p8: { wicketsTaken: 1 }, // 25 base
      p9: { runsScored: 45, fours: 5 }, // 45 + 5 = 50 base
      p10: { runsScored: 15 }, // 15 base
      p11: { wicketsTaken: 1 }, // 25 base
    };

    it('calculates total team score as exact sum of 11 players including multipliers', () => {
      const teamResult = calculateTeamScore(
        {
          id: 'team-ind-xi',
          teamName: 'India Champions',
          matchId: 'm-ind-aus-t20',
          captainPlayerId: 'p1', // 102 * 2.0 = 204.0
          viceCaptainPlayerId: 'p6', // 105 * 1.5 = 157.5
          players: mockSquad,
        },
        mockStatsMap,
        DEFAULT_SCORING_RULES
      );

      expect(teamResult.fantasyTeamId).toBe('team-ind-xi');
      expect(teamResult.playerPoints.length).toBe(11);

      // Verify captain points
      const p1 = teamResult.playerPoints.find((p) => p.playerId === 'p1');
      expect(p1.isCaptain).toBe(true);
      expect(p1.basePoints).toBe(102.0);
      expect(p1.finalPoints).toBe(204.0);

      // Verify vice-captain points
      const p6 = teamResult.playerPoints.find((p) => p.playerId === 'p6');
      expect(p6.isViceCaptain).toBe(true);
      expect(p6.basePoints).toBe(105.0);
      expect(p6.finalPoints).toBe(157.5);

      // Verify total score is the exact sum of all 11 player final points
      const manualSum = teamResult.playerPoints.reduce((acc, p) => acc + p.finalPoints, 0);
      expect(teamResult.totalPoints).toBe(Number(manualSum.toFixed(2)));
    });

    it('handles incomplete or absent player statistics safely with zero points', () => {
      // Squad with only p1 having stats, others missing completely
      const teamResult = calculateTeamScore(
        {
          id: 'team-partial',
          teamName: 'Partial Stats XI',
          captainPlayerId: 'p1',
          viceCaptainPlayerId: 'p2',
          players: mockSquad,
        },
        { p1: { runsScored: 10 } }, // Only p1 has stats
        DEFAULT_SCORING_RULES
      );

      expect(teamResult.playerPoints.length).toBe(11);
      // p1: 10 * 2.0 (cap) = 20.0
      expect(teamResult.totalPoints).toBe(20.0);

      // Missing player p5 has 0 points safely
      const p5 = teamResult.playerPoints.find((p) => p.playerId === 'p5');
      expect(p5.basePoints).toBe(0.0);
      expect(p5.finalPoints).toBe(0.0);
    });
  });

  // =========================================================================
  // 7. DETERMINISM, IDEMPOTENCY & VERSIONING
  // =========================================================================
  describe('7. Determinism, Idempotency & Versioning', () => {
    it('produces identical calculations on repeated calls (repeatable & stateless)', () => {
      const stats = { runsScored: 52, fours: 4, sixes: 1, catches: 1 };
      const run1 = calculatePlayerScore(stats, DEFAULT_SCORING_RULES, { isCaptain: true });
      const run2 = calculatePlayerScore(stats, DEFAULT_SCORING_RULES, { isCaptain: true });

      expect(run1.basePoints).toBe(run2.basePoints);
      expect(run1.finalPoints).toBe(run2.finalPoints);
      expect(run1.breakdown).toEqual(run2.breakdown);
    });

    it('respects custom ruleset versions and modified point configurations', () => {
      const customRules = {
        ...DEFAULT_SCORING_RULES,
        version: 'v2.0-custom',
        RUN: 2.0, // 2 points per run in custom ruleset
        WICKET: 30.0,
      };

      const result = calculatePlayerScore({ runsScored: 10, wicketsTaken: 1 }, customRules);
      // 10 * 2.0 + 30.0 = 50.0
      expect(result.basePoints).toBe(50.0);
      expect(result.rulesetVersion).toBe('v2.0-custom');
    });
  });

  // =========================================================================
  // 8. SERVICE LAYER INTEGRATION
  // =========================================================================
  describe('8. Scoring Service Integration Layer', () => {
    it('retrieves active scoring rules with approved point values', async () => {
      const response = await scoringService.getActiveScoringRules();
      expect(response.rules).toBeDefined();
      expect(response.rules.length).toBeGreaterThanOrEqual(16);

      const runRule = response.rules.find((r) => r.eventKey === 'RUN_SCORED');
      expect(runRule.pointsValue).toBe(1.0);

      const wicketRule = response.rules.find((r) => r.eventKey === 'WICKET_TAKEN');
      expect(wicketRule.pointsValue).toBe(25.0);
    });

    it('retrieves player match points breakdown', async () => {
      const result = await scoringService.getPlayerMatchPoints('m-ind-aus-t20', 'p-virat-k');
      expect(result.data).toBeDefined();
      expect(result.data.playerId).toBe('p-virat-k');
      expect(result.data.basePoints).toBeGreaterThan(0);
      expect(result.data.breakdown.length).toBeGreaterThan(0);
    });

    it('simulates match scoring recalculation for demo environments', async () => {
      const result = await scoringService.recalculateMatchPoints('m-ind-aus-t20', 'v1.0');
      expect(result.status).toBe('SUCCESS');
      expect(result.matchId).toBe('m-ind-aus-t20');
      expect(result.teamsEvaluated).toBe(2);
    });
  });
});
