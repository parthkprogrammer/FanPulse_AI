/**
 * FanPulse AI — Fantasy Team Comparison Module Test Suite
 *
 * Exhaustive domain and integration testing covering:
 * - Same team comparison rejection (400)
 * - Different match fixture rejection (400)
 * - Unauthorized access & privacy policy enforcement (403 NFR-SEC-03)
 * - Missing team validation (404)
 * - Zero points / upcoming match handling
 * - Shared (COMMON) and unique (DIFFERENTIAL) player identification
 * - Authoritative point differences and top contributor rankings
 * - Protection of sensitive user information
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateDistinctTeams,
  validateComparisonPrivacy,
  validateSameMatchFixture,
  buildPlayerComparisonList,
  calculateRoleBreakdown,
  identifyTopContributors,
  computeTeamComparison,
} from '../../../supabase/functions/_shared/comparison/index';
import fantasyService from '../services/fantasyService';

describe('FanPulse AI — Fantasy Team Comparison Module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockTeam1 = {
    id: 'team-alpha',
    team_name: 'Men in Blue Titans',
    match_id: 'm-ind-aus-t20',
    user_id: 'user-parth-123',
    captain_player_id: 'p-virat',
    vice_captain_player_id: 'p-bumrah',
    players: [
      { id: 'p-virat', name: 'Virat Kohli', role: 'BATTER', team_code: 'IND' },
      { id: 'p-bumrah', name: 'Jasprit Bumrah', role: 'BOWLER', team_code: 'IND' },
      { id: 'p-rohit', name: 'Rohit Sharma', role: 'BATTER', team_code: 'IND' },
      { id: 'p-hardik', name: 'Hardik Pandya', role: 'ALL_ROUNDER', team_code: 'IND' },
      { id: 'p-rahul', name: 'KL Rahul', role: 'WICKET_KEEPER', team_code: 'IND' },
      { id: 'p-head', name: 'Travis Head', role: 'BATTER', team_code: 'AUS' },
      { id: 'p-cummins', name: 'Pat Cummins', role: 'BOWLER', team_code: 'AUS' },
      { id: 'p-starc', name: 'Mitchell Starc', role: 'BOWLER', team_code: 'AUS' },
      { id: 'p-maxwell', name: 'Glenn Maxwell', role: 'ALL_ROUNDER', team_code: 'AUS' },
      { id: 'p-zampa', name: 'Adam Zampa', role: 'BOWLER', team_code: 'AUS' },
      { id: 'p-shami', name: 'Mohammed Shami', role: 'BOWLER', team_code: 'IND' },
    ],
  };

  const mockTeam2 = {
    id: 'team-beta',
    team_name: 'Royal Strikers XI',
    match_id: 'm-ind-aus-t20',
    user_id: 'user-parth-123',
    captain_player_id: 'p-rohit',
    vice_captain_player_id: 'p-head',
    players: [
      { id: 'p-virat', name: 'Virat Kohli', role: 'BATTER', team_code: 'IND' },
      { id: 'p-bumrah', name: 'Jasprit Bumrah', role: 'BOWLER', team_code: 'IND' },
      { id: 'p-rohit', name: 'Rohit Sharma', role: 'BATTER', team_code: 'IND' },
      { id: 'p-hardik', name: 'Hardik Pandya', role: 'ALL_ROUNDER', team_code: 'IND' },
      { id: 'p-rahul', name: 'KL Rahul', role: 'WICKET_KEEPER', team_code: 'IND' },
      { id: 'p-head', name: 'Travis Head', role: 'BATTER', team_code: 'AUS' },
      { id: 'p-cummins', name: 'Pat Cummins', role: 'BOWLER', team_code: 'AUS' },
      { id: 'p-warner', name: 'David Warner', role: 'BATTER', team_code: 'AUS' }, // Differential Team 2
      { id: 'p-smith', name: 'Steve Smith', role: 'BATTER', team_code: 'AUS' }, // Differential Team 2
      { id: 'p-hazlewood', name: 'Josh Hazlewood', role: 'BOWLER', team_code: 'AUS' }, // Differential Team 2
      { id: 'p-pant', name: 'Rishabh Pant', role: 'WICKET_KEEPER', team_code: 'IND' }, // Differential Team 2
    ],
  };

  // =========================================================================
  // 1. SAME TEAM COMPARISON REJECTION
  // =========================================================================
  describe('1. Same Team Comparison Rejection', () => {
    it('rejects comparing a fantasy team with itself', () => {
      const result = validateDistinctTeams('team-alpha', 'team-alpha');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Cannot compare a fantasy team with itself');
    });

    it('rejects comparison when team ID is missing or empty', () => {
      expect(validateDistinctTeams('', 'team-beta').isValid).toBe(false);
      expect(validateDistinctTeams('team-alpha', '').isValid).toBe(false);
      expect(validateDistinctTeams(null, undefined).isValid).toBe(false);
    });

    it('accepts two distinct squad IDs', () => {
      const result = validateDistinctTeams('team-alpha', 'team-beta');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('service layer throws error when comparing identical squads', async () => {
      await expect(
        fantasyService.compareFantasyTeams({ team1Id: 'team-same', team2Id: 'team-same' })
      ).rejects.toThrow(/Cannot compare a fantasy squad with itself/i);
    });
  });

  // =========================================================================
  // 2. DIFFERENT MATCH FIXTURE COMPARISON REJECTION
  // =========================================================================
  describe('2. Different Match Comparison Rejection', () => {
    it('rejects comparison when teams belong to different matches (FR-COMPARE-04)', () => {
      const match1 = 'm-ind-aus-t20';
      const match2 = 'm-eng-sa-odi';
      expect(validateSameMatchFixture(match1, match2)).toBe(false);
    });

    it('confirms match fixture compatibility when matches are identical', () => {
      expect(validateSameMatchFixture('m-ind-aus-t20', 'm-ind-aus-t20')).toBe(true);
    });

    it('handles null, undefined, or empty match IDs safely', () => {
      expect(validateSameMatchFixture(null, 'm-ind-aus-t20')).toBe(false);
      expect(validateSameMatchFixture('m-ind-aus-t20', undefined)).toBe(false);
      expect(validateSameMatchFixture('', '')).toBe(false);
    });
  });

  // =========================================================================
  // 3. UNAUTHORIZED ACCESS & PRIVACY POLICY ENFORCEMENT
  // =========================================================================
  describe('3. Unauthorized Access & Privacy Policy', () => {
    it('permits comparison when caller owns both fantasy squads (NFR-SEC-03)', () => {
      const privacyCheck = validateComparisonPrivacy(
        'user-owner-1',
        'user-owner-1',
        'user-owner-1',
        'USER'
      );
      expect(privacyCheck.isAllowed).toBe(true);
      expect(privacyCheck.reason).toBeUndefined();
    });

    it('denies comparison when caller attempts to access another user’s squad', () => {
      // Team 2 belongs to a different user
      const privacyCheck = validateComparisonPrivacy(
        'user-parth',
        'user-stranger',
        'user-parth',
        'USER'
      );
      expect(privacyCheck.isAllowed).toBe(false);
      expect(privacyCheck.reason).toContain('Privacy Policy Violation');
      expect(privacyCheck.reason).toContain('NFR-SEC-03');
    });

    it('allows elevated administrators to compare squads across accounts', () => {
      const adminCheck = validateComparisonPrivacy(
        'user-1',
        'user-2',
        'admin-user',
        'ADMIN'
      );
      expect(adminCheck.isAllowed).toBe(true);
    });

    it('protects private user info and does NOT include user IDs or credentials in output', () => {
      const comparison = computeTeamComparison(mockTeam1, mockTeam2);
      expect(comparison).not.toHaveProperty('user_id');
      expect(comparison).not.toHaveProperty('userId');
      expect(comparison.team1).not.toHaveProperty('user_id');
      expect(comparison.team2).not.toHaveProperty('user_id');
      expect(comparison.team1).not.toHaveProperty('email');
      expect(comparison.team2).not.toHaveProperty('email');
    });
  });

  // =========================================================================
  // 4. MISSING TEAM VALIDATION
  // =========================================================================
  describe('4. Missing Team Validation', () => {
    it('rejects comparison when team1 or team2 does not exist', async () => {
      await expect(
        fantasyService.compareFantasyTeams({ team1Id: '', team2Id: 'valid-id' })
      ).rejects.toThrow(/Both Team 1 and Team 2 must be selected/i);
    });
  });

  // =========================================================================
  // 5. ZERO POINTS / UPCOMING MATCH HANDLING
  // =========================================================================
  describe('5. Zero Points & Upcoming Match Handling', () => {
    it('handles zero points gracefully for upcoming or unscored fixtures', () => {
      // Both teams have 0 fantasy points
      const emptyPointsMap1 = {};
      const emptyPointsMap2 = {};

      const comparison = computeTeamComparison(
        mockTeam1,
        mockTeam2,
        emptyPointsMap1,
        emptyPointsMap2,
        'India vs Australia — Upcoming'
      );

      expect(comparison.team1.totalPoints).toBe(0.0);
      expect(comparison.team2.totalPoints).toBe(0.0);
      expect(comparison.pointsDifference).toBe(0.0);
      expect(comparison.isDraw).toBe(true);
      expect(comparison.leadingTeamId).toBeNull();

      // Multiplier points and percent of team are 0
      expect(comparison.captainContributions.team1.totalMultiplierPoints).toBe(0.0);
      expect(comparison.captainContributions.team1.percentOfTeam).toBe(0.0);
      expect(comparison.captainContributions.team2.totalMultiplierPoints).toBe(0.0);
      expect(comparison.captainContributions.team2.percentOfTeam).toBe(0.0);

      // Positional breakdown points are 0
      for (const role of comparison.roleBreakdown) {
        expect(role.team1Points).toBe(0.0);
        expect(role.team2Points).toBe(0.0);
      }
    });
  });

  // =========================================================================
  // 6. SHARED AND UNIQUE PLAYERS IDENTIFICATION
  // =========================================================================
  describe('6. Shared and Unique Players Identification', () => {
    const points1 = {
      'p-virat': 196.0, // Captain (2x)
      'p-bumrah': 147.0, // Vice-Captain (1.5x)
      'p-rohit': 34.0,
      'p-hardik': 50.0,
      'p-rahul': 35.0,
      'p-head': 50.0,
      'p-cummins': 25.0,
      'p-starc': 25.0, // Unique to Team 1
      'p-maxwell': 40.0, // Unique to Team 1
      'p-zampa': 30.0, // Unique to Team 1
      'p-shami': 25.0, // Unique to Team 1
    };

    const points2 = {
      'p-virat': 98.0, // Player (1x)
      'p-bumrah': 98.0, // Player (1x)
      'p-rohit': 68.0, // Captain (2x)
      'p-hardik': 50.0,
      'p-rahul': 35.0,
      'p-head': 75.0, // Vice-Captain (1.5x)
      'p-cummins': 25.0,
      'p-warner': 45.0, // Unique to Team 2
      'p-smith': 30.0, // Unique to Team 2
      'p-hazlewood': 25.0, // Unique to Team 2
      'p-pant': 35.0, // Unique to Team 2
    };

    it('correctly classifies shared players as COMMON and calculates point differences', () => {
      const playerList = buildPlayerComparisonList(
        mockTeam1.players,
        mockTeam2.players,
        points1,
        points2,
        'p-virat',
        'p-bumrah',
        'p-rohit',
        'p-head'
      );

      // 7 players are in both rosters
      const sharedPlayers = playerList.filter((p) => p.status === 'COMMON');
      expect(sharedPlayers.length).toBe(7);

      // Verify Virat Kohli (Captain in Team 1, Regular in Team 2)
      const virat = playerList.find((p) => p.playerId === 'p-virat');
      expect(virat.status).toBe('COMMON');
      expect(virat.team1Designation).toBe('CAPTAIN (2×)');
      expect(virat.team2Designation).toBe('PLAYER (1×)');
      expect(virat.team1Points).toBe(196.0);
      expect(virat.team2Points).toBe(98.0);
      expect(virat.difference).toBe(98.0); // 196 - 98 = 98

      // Verify Rohit Sharma (Regular in Team 1, Captain in Team 2)
      const rohit = playerList.find((p) => p.playerId === 'p-rohit');
      expect(rohit.status).toBe('COMMON');
      expect(rohit.team1Designation).toBe('PLAYER (1×)');
      expect(rohit.team2Designation).toBe('CAPTAIN (2×)');
      expect(rohit.team1Points).toBe(34.0);
      expect(rohit.team2Points).toBe(68.0);
      expect(rohit.difference).toBe(-34.0); // 34 - 68 = -34
    });

    it('correctly classifies unique players as TEAM_1_EXCLUSIVE and TEAM_2_EXCLUSIVE', () => {
      const playerList = buildPlayerComparisonList(
        mockTeam1.players,
        mockTeam2.players,
        points1,
        points2
      );

      // 4 unique players to Team 1
      const t1Differentials = playerList.filter((p) => p.status === 'TEAM_1_EXCLUSIVE');
      expect(t1Differentials.length).toBe(4);
      expect(t1Differentials.map((p) => p.playerId)).toEqual(
        expect.arrayContaining(['p-starc', 'p-maxwell', 'p-zampa', 'p-shami'])
      );

      const starc = playerList.find((p) => p.playerId === 'p-starc');
      expect(starc.team1Designation).toBe('PLAYER (1×)');
      expect(starc.team2Designation).toBe('NOT_IN_SQUAD');
      expect(starc.team1Points).toBe(25.0);
      expect(starc.team2Points).toBeNull();
      expect(starc.difference).toBe(25.0);

      // 4 unique players to Team 2
      const t2Differentials = playerList.filter((p) => p.status === 'TEAM_2_EXCLUSIVE');
      expect(t2Differentials.length).toBe(4);
      expect(t2Differentials.map((p) => p.playerId)).toEqual(
        expect.arrayContaining(['p-warner', 'p-smith', 'p-hazlewood', 'p-pant'])
      );

      const warner = playerList.find((p) => p.playerId === 'p-warner');
      expect(warner.team1Designation).toBe('NOT_IN_SQUAD');
      expect(warner.team2Designation).toBe('PLAYER (1×)');
      expect(warner.team1Points).toBeNull();
      expect(warner.team2Points).toBe(45.0);
      expect(warner.difference).toBe(-45.0);
    });

    it('identifies top scoring contributors for each squad with badges', () => {
      const playerList = buildPlayerComparisonList(
        mockTeam1.players,
        mockTeam2.players,
        points1,
        points2,
        'p-virat',
        'p-bumrah',
        'p-rohit',
        'p-head'
      );

      const topContributors = identifyTopContributors(playerList, 3);

      expect(topContributors.team1.length).toBe(3);
      expect(topContributors.team1[0].name).toContain('Virat Kohli (C)');
      expect(topContributors.team1[0].badge).toBe('Captain 2×');
      expect(topContributors.team1[0].points).toBe(196.0);

      expect(topContributors.team1[1].name).toContain('Jasprit Bumrah (VC)');
      expect(topContributors.team1[1].badge).toBe('Vice-Captain 1.5×');
      expect(topContributors.team1[1].points).toBe(147.0);

      expect(topContributors.team2.length).toBe(3);
      expect(topContributors.team2[0].name).toContain('Virat Kohli'); // 98 pts
      expect(topContributors.team2[0].badge).toBe('Base');
    });

    it('aggregates positional role breakdown correctly', () => {
      const playerList = buildPlayerComparisonList(
        mockTeam1.players,
        mockTeam2.players,
        points1,
        points2
      );

      const roles = calculateRoleBreakdown(playerList);
      expect(roles.length).toBe(4);
      expect(roles.map((r) => r.role)).toEqual([
        'Batters',
        'Bowlers',
        'All-Rounders',
        'Wicket-Keepers',
      ]);

      const wicketKeepers = roles.find((r) => r.role === 'Wicket-Keepers');
      // Team 1: Rahul (35); Team 2: Rahul (35) + Pant (35) = 70
      expect(wicketKeepers.team1Points).toBe(35.0);
      expect(wicketKeepers.team2Points).toBe(70.0);
    });

    it('computes total team points, point difference, and leading squad', () => {
      const comparison = computeTeamComparison(
        mockTeam1,
        mockTeam2,
        points1,
        points2,
        'India vs Australia — 3rd T20I'
      );

      // Team 1: 196 + 147 + 34 + 50 + 35 + 50 + 25 + 25 + 40 + 30 + 25 = 657.0
      // Team 2: 98 + 98 + 68 + 50 + 35 + 75 + 25 + 45 + 30 + 25 + 35 = 584.0
      expect(comparison.team1.totalPoints).toBe(657.0);
      expect(comparison.team2.totalPoints).toBe(584.0);
      expect(comparison.pointsDifference).toBe(73.0); // 657 - 584 = 73
      expect(comparison.leadingTeamId).toBe('team-alpha');
      expect(comparison.isDraw).toBe(false);
      expect(comparison.sharedPlayersCount).toBe(7);
      expect(comparison.differentialPlayersCount).toBe(8);
    });
  });
});
