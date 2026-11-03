/**
 * FanPulse AI — Fantasy Scoring Service
 *
 * Client-facing service layer for querying active scoring rules, player breakdown
 * points, team fantasy points, and triggering authoritative server-side recalculation.
 *
 * Mirrors deterministic calculation logic from backend Edge Functions
 * conforming strictly to REQUIREMENTS.md (§4.2 BR-SCORE-*) and API_DESIGN.md (§6).
 */

import { apiClient } from './apiClient';
import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './authService';
import {
  DEFAULT_SCORING_RULES,
  SCORING_RULES,
  calculatePlayerScore,
  calculateTeamScore,
  calculateEconomyRate,
  convertOversToBalls,
  applyMultiplier,
} from '../../../supabase/functions/_shared/scoring/index';

export {
  DEFAULT_SCORING_RULES,
  SCORING_RULES,
  calculatePlayerScore,
  calculateTeamScore,
  calculateEconomyRate,
  convertOversToBalls,
  applyMultiplier,
};

export const scoringService = {
  /**
   * Fetches active scoring rules from backend (or fallback defaults)
   */
  async getActiveScoringRules(format = 'ALL', version = 'v1.0') {
    if (isSupabaseConfigured()) {
      try {
        const response = await apiClient.get('/calculate-fantasy-scoring', {
          params: { action: 'get-rules', format, version },
        });
        if (response.data) {
          return { rules: response.data, isDemoData: false };
        }
      } catch {
        // Fallback to local defaults
      }
    }

    return {
      rules: [
        { format: 'ALL', category: 'BATTING', eventKey: 'RUN_SCORED', eventName: 'Run Scored', pointsValue: DEFAULT_SCORING_RULES.RUN, description: 'Each run scored with bat' },
        { format: 'ALL', category: 'BATTING', eventKey: 'BOUNDARY_FOUR', eventName: 'Boundary Four', pointsValue: DEFAULT_SCORING_RULES.BOUNDARY_FOUR, description: 'Boundary four bonus' },
        { format: 'ALL', category: 'BATTING', eventKey: 'BOUNDARY_SIX', eventName: 'Boundary Six', pointsValue: DEFAULT_SCORING_RULES.BOUNDARY_SIX, description: 'Boundary six bonus' },
        { format: 'ALL', category: 'BONUS', eventKey: 'HALF_CENTURY_BONUS', eventName: 'Half-Century Bonus', pointsValue: DEFAULT_SCORING_RULES.HALF_CENTURY_BONUS, conditionThreshold: 50.0, description: '50-99 runs' },
        { format: 'ALL', category: 'BONUS', eventKey: 'CENTURY_BONUS', eventName: 'Century Bonus', pointsValue: DEFAULT_SCORING_RULES.CENTURY_BONUS, conditionThreshold: 100.0, description: '100+ runs' },
        { format: 'ALL', category: 'PENALTY', eventKey: 'DUCK_PENALTY', eventName: 'Duck Dismissal Penalty', pointsValue: DEFAULT_SCORING_RULES.DUCK_PENALTY, conditionThreshold: 0.0, description: '0 runs dismissed' },
        { format: 'ALL', category: 'BOWLING', eventKey: 'WICKET_TAKEN', eventName: 'Wicket Taken', pointsValue: DEFAULT_SCORING_RULES.WICKET, description: 'Bowler wicket' },
        { format: 'ALL', category: 'BOWLING', eventKey: 'MAIDEN_OVER', eventName: 'Maiden Over', pointsValue: DEFAULT_SCORING_RULES.MAIDEN_OVER, description: 'Maiden over bowled' },
        { format: 'ALL', category: 'BONUS', eventKey: 'THREE_WICKET_HAUL', eventName: '3-Wicket Haul Bonus', pointsValue: DEFAULT_SCORING_RULES.THREE_WICKET_HAUL, conditionThreshold: 3.0, description: '3-4 wickets' },
        { format: 'ALL', category: 'BONUS', eventKey: 'FIVE_WICKET_HAUL', eventName: '5-Wicket Haul Bonus', pointsValue: DEFAULT_SCORING_RULES.FIVE_WICKET_HAUL, conditionThreshold: 5.0, description: '5+ wickets' },
        { format: 'ALL', category: 'BONUS', eventKey: 'ECONOMY_RATE_BONUS', eventName: 'Economy Rate Bonus', pointsValue: DEFAULT_SCORING_RULES.ECONOMY_RATE_BONUS, conditionThreshold: 4.0, description: 'Econ <= 4.0 (min 2 ov)' },
        { format: 'ALL', category: 'PENALTY', eventKey: 'ECONOMY_RATE_PENALTY', eventName: 'Economy Rate Penalty', pointsValue: DEFAULT_SCORING_RULES.ECONOMY_RATE_PENALTY, conditionThreshold: 10.0, description: 'Econ >= 10.0 (min 2 ov)' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'CATCH_TAKEN', eventName: 'Catch Taken', pointsValue: DEFAULT_SCORING_RULES.CATCH, description: 'Catch taken' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'RUN_OUT_DIRECT', eventName: 'Direct Run-Out', pointsValue: DEFAULT_SCORING_RULES.RUN_OUT_DIRECT, description: 'Direct hit run out' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'RUN_OUT_INDIRECT', eventName: 'Indirect Run-Out', pointsValue: DEFAULT_SCORING_RULES.RUN_OUT_INDIRECT, description: 'Indirect run out' },
        { format: 'ALL', category: 'FIELDING', eventKey: 'STUMPING', eventName: 'Stumping', pointsValue: DEFAULT_SCORING_RULES.STUMPING, description: 'Wicketkeeper stumping' },
        { format: 'ALL', category: 'MULTIPLIER', eventKey: 'CAPTAIN_MULTIPLIER', eventName: 'Captain Multiplier', pointsValue: DEFAULT_SCORING_RULES.CAPTAIN_MULTIPLIER, description: '2.0x points' },
        { format: 'ALL', category: 'MULTIPLIER', eventKey: 'VICE_CAPTAIN_MULTIPLIER', eventName: 'Vice-Captain Multiplier', pointsValue: DEFAULT_SCORING_RULES.VICE_CAPTAIN_MULTIPLIER, description: '1.5x points' },
      ],
      isDemoData: true,
      dataLabel: 'DEMO RULES',
    };
  },

  /**
   * Retrieves player fantasy points and itemized breakdown for a match
   */
  async getPlayerMatchPoints(matchId, playerId) {
    if (!matchId || !playerId) {
      throw new Error('matchId and playerId are required.');
    }

    if (isSupabaseConfigured()) {
      try {
        const response = await apiClient.get('/calculate-fantasy-scoring', {
          params: { action: 'get-player-points', matchId, playerId },
        });
        if (response.data) {
          return { data: response.data, isDemoData: false };
        }
      } catch {
        // Fallback
      }
    }

    // Deterministic mock calculation for demo mode
    const mockStats = {
      playerId,
      runsScored: 54,
      ballsFaced: 36,
      fours: 5,
      sixes: 2,
      isOut: true,
      catches: 1,
    };

    const calculated = calculatePlayerScore(mockStats, DEFAULT_SCORING_RULES, {
      playerName: 'Player Preview',
      role: 'BATTER',
    });

    return {
      data: {
        matchId,
        playerId,
        playerName: calculated.playerName,
        basePoints: calculated.basePoints,
        breakdown: calculated.breakdown,
        rulesetVersion: calculated.rulesetVersion,
      },
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };
  },

  /**
   * Retrieves total team points and player breakdown for a user's fantasy team
   */
  async getTeamPoints(teamId) {
    if (!teamId) {
      throw new Error('teamId is required.');
    }

    if (isSupabaseConfigured()) {
      try {
        const response = await apiClient.get('/calculate-fantasy-scoring', {
          params: { action: 'get-team-points', teamId },
        });
        if (response.data) {
          return { data: response.data, isDemoData: false };
        }
      } catch {
        // Fallback
      }
    }

    return {
      data: {
        fantasyTeamId: teamId,
        teamName: 'Demo Squad',
        totalPoints: 425.5,
        playerPoints: [],
        calculatedAt: new Date().toISOString(),
      },
      isDemoData: true,
      dataLabel: 'DEMO DATA',
    };
  },

  /**
   * Triggers authoritative server-side fantasy score recalculation for a match (Admin only)
   */
  async recalculateMatchPoints(matchId, rulesetVersion = 'v1.0') {
    if (!matchId) {
      throw new Error('matchId is required.');
    }

    if (isSupabaseConfigured()) {
      const response = await apiClient.post('/calculate-fantasy-scoring', {
        action: 'calculate',
        matchId,
        rulesetVersion,
      });
      return response.data;
    }

    // Demo simulation
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      matchId,
      teamsEvaluated: 2,
      playersScored: 22,
      status: 'SUCCESS',
      calculatedAt: new Date().toISOString(),
      rulesetVersion,
      isDemoData: true,
      dataLabel: 'DEMO RUN',
    };
  },
};

export default scoringService;
