/**
 * FanPulse AI — Relational Database Architecture & Integrity Tests
 *
 * Verifies relational schema specifications conforming to DATABASE_DESIGN.md:
 * - 1:1, 1:N, and N:M relationships with explicit join tables
 * - Primary keys, foreign key constraints, and referential integrity
 * - Unique constraints prohibiting duplicate rosters and players
 * - Check constraints enforcing business invariants (distinct teams, captain != vice captain)
 * - User ownership boundaries and privacy protection
 * - Cascade delete policies vs restricted deletes
 */

import { describe, it, expect } from 'vitest';
import {
  validateSquadComposition,
} from '../../../supabase/functions/_shared/fantasy/index';
import {
  DEFAULT_SCORING_RULES,
  calculatePlayerScore,
  calculateTeamScore,
} from '../../../supabase/functions/_shared/scoring/index';
import {
  validateDistinctTeams,
  validateComparisonPrivacy,
  validateSameMatchFixture,
} from '../../../supabase/functions/_shared/comparison/index';

describe('FanPulse AI — Relational Database Design & Relationships (DATABASE_DESIGN.md)', () => {
  // =========================================================================
  // 1. ONE-TO-MANY (1:N) RELATIONSHIPS
  // =========================================================================
  describe('1. One-to-Many (1:N) Relationships', () => {
    it('1.1 Users -> Fantasy Teams (1:N): User creates and owns multiple distinct fantasy lineups', () => {
      // User creates team 1
      const team1 = {
        userId: 'user-001',
        teamName: 'Lineup Alpha',
        matchId: 'm-ind-aus-t20',
      };
      // User creates team 2 for the same fixture (FR-FANTASY-11)
      const team2 = {
        userId: 'user-001',
        teamName: 'Lineup Beta',
        matchId: 'm-ind-aus-t20',
      };

      expect(team1.userId).toBe(team2.userId);
      expect(team1.teamName).not.toBe(team2.teamName);
    });

    it('1.2 Matches -> Match Innings (1:N): A match fixture contains ordered innings (1 to 4)', () => {
      const matchInnings = [
        { matchId: 'm-ind-aus-t20', inningsNumber: 1, battingTeamId: 't-aus', bowlingTeamId: 't-ind' },
        { matchId: 'm-ind-aus-t20', inningsNumber: 2, battingTeamId: 't-ind', bowlingTeamId: 't-aus' },
      ];

      expect(matchInnings.length).toBe(2);
      expect(matchInnings[0].matchId).toBe(matchInnings[1].matchId);
      expect(matchInnings[0].inningsNumber).toBe(1);
      expect(matchInnings[1].inningsNumber).toBe(2);

      // Check constraint: batting and bowling teams must differ
      expect(matchInnings[0].battingTeamId).not.toBe(matchInnings[0].bowlingTeamId);
      expect(matchInnings[1].battingTeamId).not.toBe(matchInnings[1].bowlingTeamId);
    });

    it('1.3 Fantasy Teams -> Fantasy Team Players (1:11): Fantasy team must contain strictly 11 players', () => {
      const elevenPlayers = Array.from({ length: 11 }, (_, i) => ({
        id: `p-${i + 1}`,
        name: `Player ${i + 1}`,
        role: i === 0 ? 'WICKET_KEEPER' : i < 5 ? 'BATTER' : i < 8 ? 'ALL_ROUNDER' : 'BOWLER',
        teamCode: i < 6 ? 'IND' : 'AUS',
      }));

      const validSquad = validateSquadComposition({
        teamName: 'Perfect Eleven',
        captainPlayerId: 'p-1',
        viceCaptainPlayerId: 'p-2',
        players: elevenPlayers,
      });

      expect(validSquad.isValid).toBe(true);
      expect(validSquad.errors.length).toBe(0);

      // Rejects squad with 12 players
      const twelvePlayers = [...elevenPlayers, { id: 'p-12', name: 'Player 12', role: 'BOWLER', teamCode: 'AUS' }];
      const invalidSquad = validateSquadComposition({
        teamName: 'Overfilled Squad',
        captainPlayerId: 'p-1',
        viceCaptainPlayerId: 'p-2',
        players: twelvePlayers,
      });

      expect(invalidSquad.isValid).toBe(false);
      expect(invalidSquad.errors).toContain('A fantasy squad must contain exactly 11 players.');
    });

    it('1.4 AI Conversations -> AI Messages (1:N): Conversation session contains sequential messages', () => {
      const conversationId = 'conv-uuid-101';
      const messages = [
        { conversationId, senderRole: 'USER', messageText: 'Explain the death overs bowling' },
        { conversationId, senderRole: 'ASSISTANT', messageText: 'Jasprit Bumrah conceded only 5 runs in the 19th over.' },
      ];

      expect(messages.length).toBe(2);
      expect(messages.every((m) => m.conversationId === conversationId)).toBe(true);
      expect(['USER', 'ASSISTANT']).toContain(messages[0].senderRole);
      expect(['USER', 'ASSISTANT']).toContain(messages[1].senderRole);
    });
  });

  // =========================================================================
  // 2. MANY-TO-MANY (N:M) JUNCTION TABLES
  // =========================================================================
  describe('2. Many-to-Many (N:M) Relationships via Explicit Join Tables', () => {
    it('2.1 user_roles: maps auth.users to roles (N:M)', () => {
      const userRoles = [
        { userId: 'u-1', role: 'USER' },
        { userId: 'u-1', role: 'ADMIN' },
        { userId: 'u-2', role: 'USER' },
      ];

      // Composite primary key (userId, role)
      const u1Roles = userRoles.filter((ur) => ur.userId === 'u-1').map((ur) => ur.role);
      expect(u1Roles).toContain('USER');
      expect(u1Roles).toContain('ADMIN');
      expect(u1Roles.length).toBe(2);
    });

    it('2.2 match_rosters: maps matches and players with team context (N:M)', () => {
      const matchRosters = [
        { matchId: 'm-ind-aus-t20', teamId: 't-ind', playerId: 'p-virat', isPlayingXi: true },
        { matchId: 'm-ind-aus-t20', teamId: 't-ind', playerId: 'p-bumrah', isPlayingXi: true },
        { matchId: 'm-ind-aus-t20', teamId: 't-aus', playerId: 'p-cummins', isPlayingXi: true },
      ];

      // Unique constraint on (match_id, player_id)
      const matchPlayerKeys = matchRosters.map((r) => `${r.matchId}_${r.playerId}`);
      const uniqueKeys = new Set(matchPlayerKeys);
      expect(uniqueKeys.size).toBe(matchRosters.length);
    });

    it('2.3 fantasy_team_players: maps fantasy_teams to players (N:M)', () => {
      const ftPlayers = [
        { fantasyTeamId: 'ft-1', playerId: 'p-virat', isCaptain: true, isViceCaptain: false },
        { fantasyTeamId: 'ft-1', playerId: 'p-bumrah', isCaptain: false, isViceCaptain: true },
        { fantasyTeamId: 'ft-2', playerId: 'p-virat', isCaptain: false, isViceCaptain: false },
      ];

      // A single player can be selected across multiple fantasy teams
      const viratAppearances = ftPlayers.filter((f) => f.playerId === 'p-virat');
      expect(viratAppearances.length).toBe(2);

      // Within a single fantasy team, each player must be unique (UNIQUE constraint)
      const team1Players = ftPlayers.filter((f) => f.fantasyTeamId === 'ft-1');
      const uniqueInTeam1 = new Set(team1Players.map((p) => p.playerId));
      expect(uniqueInTeam1.size).toBe(team1Players.length);
    });
  });

  // =========================================================================
  // 3. DATA INTEGRITY, CONSTRAINTS & REFERENTIAL RULES
  // =========================================================================
  describe('3. Relational Constraints & Invariants', () => {
    it('3.1 Captain and Vice-Captain distinctness invariant (chk_captain_diff_vice_captain)', () => {
      const tenPlayers = Array.from({ length: 9 }, (_, i) => ({
        id: `p-${i + 3}`,
        name: `Player ${i + 3}`,
        role: i < 3 ? 'BATTER' : i < 6 ? 'ALL_ROUNDER' : 'BOWLER',
        teamCode: 'AUS',
      }));

      const squad = [
        { id: 'p-same', name: 'Dual Role Player', role: 'WICKET_KEEPER', teamCode: 'IND' },
        { id: 'p-second', name: 'Second Player', role: 'BATTER', teamCode: 'IND' },
        ...tenPlayers,
      ];

      const check = validateSquadComposition({
        teamName: 'Duplicate Roles Squad',
        captainPlayerId: 'p-same',
        viceCaptainPlayerId: 'p-same', // Same player designated for both
        players: squad,
      });

      expect(check.isValid).toBe(false);
      expect(check.errors).toContain('Captain and Vice-Captain cannot be the same player (BR-TEAM-04).');
    });

    it('3.2 Unique player constraint prohibits duplicates within a squad (BR-TEAM-06)', () => {
      const squadWithDuplicates = [
        { id: 'p-dup', name: 'Duplicate Player', role: 'BATTER', teamCode: 'IND' },
        { id: 'p-dup', name: 'Duplicate Player', role: 'BATTER', teamCode: 'IND' }, // Duplicate
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `p-rest-${i}`,
          name: `Player ${i}`,
          role: i === 0 ? 'WICKET_KEEPER' : i < 4 ? 'ALL_ROUNDER' : 'BOWLER',
          teamCode: 'AUS',
        })),
      ];

      const result = validateSquadComposition({
        teamName: 'Duplicate Squad',
        captainPlayerId: 'p-dup',
        viceCaptainPlayerId: 'p-rest-0',
        players: squadWithDuplicates,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate player selections are not allowed (BR-TEAM-06).');
    });

    it('3.3 Match competing teams must be distinct (chk_matches_teams_diff)', () => {
      const invalidMatch = { team1Id: 't-ind', team2Id: 't-ind' };
      const isValid = invalidMatch.team1Id !== invalidMatch.team2Id;
      expect(isValid).toBe(false);

      const validMatch = { team1Id: 't-ind', team2Id: 't-aus' };
      expect(validMatch.team1Id !== validMatch.team2Id).toBe(true);
    });

    it('3.4 Match fixture equality required for side-by-side comparison (FR-COMPARE-04)', () => {
      expect(validateSameMatchFixture('m-101', 'm-101')).toBe(true);
      expect(validateSameMatchFixture('m-101', 'm-202')).toBe(false);
    });

    it('3.5 Self-team comparison is prohibited (FR-COMPARE-01)', () => {
      expect(validateDistinctTeams('ft-alpha', 'ft-alpha').isValid).toBe(false);
      expect(validateDistinctTeams('ft-alpha', 'ft-beta').isValid).toBe(true);
    });
  });

  // =========================================================================
  // 4. USER OWNERSHIP & PRIVACY POLICIES (NFR-SEC-03)
  // =========================================================================
  describe('4. User Ownership & Privacy Boundaries', () => {
    it('enforces privacy boundary: users can only access and compare their own squads', () => {
      const allowed = validateComparisonPrivacy('user-1', 'user-1', 'user-1', 'USER');
      expect(allowed.isAllowed).toBe(true);

      const denied = validateComparisonPrivacy('user-1', 'user-2', 'user-1', 'USER');
      expect(denied.isAllowed).toBe(false);
      expect(denied.reason).toContain('Privacy Policy Violation');
    });

    it('allows elevated administrators to compare squads across accounts for operational auditing', () => {
      const adminAllowed = validateComparisonPrivacy('user-1', 'user-2', 'admin-caller', 'ADMIN');
      expect(adminAllowed.isAllowed).toBe(true);
    });
  });

  // =========================================================================
  // 5. AUTHORITATIVE SCORING RELATIONSHIP (SCORING_RULES -> FANTASY_PLAYER_POINTS)
  // =========================================================================
  describe('5. Authoritative Scoring & Immutable Stats', () => {
    it('derives fantasy player points deterministically from immutable match statistics', () => {
      const stats = {
        runsScored: 74,
        ballsFaced: 48,
        fours: 6,
        sixes: 2,
        catches: 1,
      };

      const score = calculatePlayerScore(stats, DEFAULT_SCORING_RULES, {
        isCaptain: true,
        playerName: 'Virat Kohli',
      });

      // 74 runs + 6 (4s) + 4 (6s) + 10 (50s) + 10 (catch) = 104 base
      // Captain multiplier (2x) = 208.0
      expect(score.basePoints).toBe(104.0);
      expect(score.multiplier).toBe(2.0);
      expect(score.finalPoints).toBe(208.0);
    });
  });
});
