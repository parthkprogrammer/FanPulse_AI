import { describe, it, expect, beforeEach, vi } from 'vitest';
import fantasyService, { SAMPLE_ROSTERS } from '../services/fantasyService';
import {
  validateSquadComposition,
  FANTASY_RULES,
} from '../../../supabase/functions/_shared/fantasy/index';

describe('Fantasy Team Management Module — Domain & Service Layer Tests', () => {
  const validPlayers = [
    { id: 'p-rohit-s', name: 'Rohit Sharma', role: 'BATTER', teamCode: 'IND' },
    { id: 'p-shubman-g', name: 'Shubman Gill', role: 'BATTER', teamCode: 'IND' },
    { id: 'p-virat-k', name: 'Virat Kohli', role: 'BATTER', teamCode: 'IND' },
    { id: 'p-steve-s', name: 'Steve Smith', role: 'BATTER', teamCode: 'AUS' },
    { id: 'p-rishabh-p', name: 'Rishabh Pant', role: 'WICKET_KEEPER', teamCode: 'IND' },
    { id: 'p-hardik-p', name: 'Hardik Pandya', role: 'ALL_ROUNDER', teamCode: 'IND' },
    { id: 'p-ravindra-j', name: 'Ravindra Jadeja', role: 'ALL_ROUNDER', teamCode: 'IND' },
    { id: 'p-jasprit-b', name: 'Jasprit Bumrah', role: 'BOWLER', teamCode: 'IND' },
    { id: 'p-travis-h', name: 'Travis Head', role: 'BATTER', teamCode: 'AUS' },
    { id: 'p-glenn-m', name: 'Glenn Maxwell', role: 'ALL_ROUNDER', teamCode: 'AUS' },
    { id: 'p-pat-c', name: 'Pat Cummins', role: 'BOWLER', teamCode: 'AUS' },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Authoritative Squad Composition Validation (BR-TEAM-01 through BR-TEAM-06)', () => {
    it('validates a compliant 11-player squad meeting all criteria', () => {
      const validSquad = {
        teamName: 'Dominant XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      };

      const result = validateSquadComposition(validSquad);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('rejects squad if player count is not exactly 11 (BR-TEAM-01)', () => {
      // 10 players
      const result10 = validateSquadComposition({
        teamName: 'Understaffed XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers.slice(0, 10),
      });
      expect(result10.isValid).toBe(false);
      expect(result10.errors.some((e) => e.includes('exactly 11 players'))).toBe(true);
    });

    it('rejects duplicate player selections (BR-TEAM-06)', () => {
      const duplicateLineup = [
        ...validPlayers.slice(0, 10),
        { ...validPlayers[0] }, // Duplicate of Rohit Sharma
      ];

      const result = validateSquadComposition({
        teamName: 'Duplicate XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: duplicateLineup,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate player'))).toBe(true);
    });

    it('rejects squad when Captain and Vice-Captain are identical (BR-TEAM-04)', () => {
      const result = validateSquadComposition({
        teamName: 'Same Captain XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-virat-k',
        players: validPlayers,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('cannot be the same player'))).toBe(true);
    });

    it('rejects squad if designated Captain is not drafted in the 11 (BR-TEAM-04)', () => {
      const result = validateSquadComposition({
        teamName: 'External Captain XI',
        captainPlayerId: 'p-external-ghost',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Captain must be in the selected 11'))).toBe(true);
    });

    it('rejects squad missing minimum role requirements (BR-TEAM-03)', () => {
      // Lineup without a Wicket-Keeper (replace Pant with a batter)
      const noWkLineup = validPlayers.map((p) =>
        p.role === 'WICKET_KEEPER' ? { ...p, role: 'BATTER' } : p
      );

      const result = validateSquadComposition({
        teamName: 'No WK XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: noWkLineup,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Wicket-Keeper'))).toBe(true);
    });

    it('rejects squad representing only one competing team (BR-TEAM-02)', () => {
      // Force all 11 players to IND
      const singleTeamLineup = validPlayers.map((p) => ({ ...p, teamCode: 'IND' }));

      const result = validateSquadComposition({
        teamName: 'Single Country XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: singleTeamLineup,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('both competing teams'))).toBe(true);
    });
  });

  describe('2. Fantasy Team Persistence & Lifecycle Management', () => {
    it('creates, saves, and retrieves a fantasy team', async () => {
      const newSquadData = {
        matchId: 'm-ind-aus-t20',
        teamName: 'Thunderbolts XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      };

      const createdTeam = await fantasyService.saveFantasyTeam(newSquadData);
      expect(createdTeam).toBeDefined();
      expect(createdTeam.id).toBeDefined();
      expect(createdTeam.teamName).toBe('Thunderbolts XI');
      expect(createdTeam.players.length).toBe(11);

      // Retrieve by ID
      const retrieved = await fantasyService.getFantasyTeamById(createdTeam.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(createdTeam.id);
      expect(retrieved.teamName).toBe('Thunderbolts XI');
    });

    it('updates an existing fantasy team', async () => {
      const team = await fantasyService.saveFantasyTeam({
        matchId: 'm-ind-aus-t20',
        teamName: 'Original Lineup',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      const updated = await fantasyService.updateFantasyTeam(team.id, {
        matchId: 'm-ind-aus-t20',
        teamName: 'Updated Thunderbolts',
        captainPlayerId: 'p-rohit-s',
        viceCaptainPlayerId: 'p-hardik-p',
        players: validPlayers,
      });

      expect(updated).toBeDefined();
      expect(updated.teamName).toBe('Updated Thunderbolts');
      expect(updated.captainPlayerId).toBe('p-rohit-s');
      expect(updated.viceCaptainPlayerId).toBe('p-hardik-p');
    });

    it('re-assigns Captain and Vice-Captain roles via quick action', async () => {
      const team = await fantasyService.saveFantasyTeam({
        matchId: 'm-ind-aus-t20',
        teamName: 'Roles Test XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      const reassigned = await fantasyService.assignTeamRoles(team.id, {
        captainPlayerId: 'p-hardik-p',
        viceCaptainPlayerId: 'p-travis-h',
      });

      expect(reassigned).toBeDefined();
      expect(reassigned.captainPlayerId).toBe('p-hardik-p');
      expect(reassigned.viceCaptainPlayerId).toBe('p-travis-h');

      const verified = await fantasyService.getFantasyTeamById(team.id);
      expect(verified.captainPlayerId).toBe('p-hardik-p');
      expect(verified.viceCaptainPlayerId).toBe('p-travis-h');
    });

    it('rejects role assignment when Captain and Vice-Captain are identical', async () => {
      await expect(
        fantasyService.assignTeamRoles('ft-test-123', {
          captainPlayerId: 'p-virat-k',
          viceCaptainPlayerId: 'p-virat-k',
        })
      ).rejects.toThrow(/cannot be the same player/i);
    });

    it('deletes a fantasy team prior to match start', async () => {
      const team = await fantasyService.saveFantasyTeam({
        matchId: 'm-ind-aus-t20',
        teamName: 'Disposable XI',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      const deleteResult = await fantasyService.deleteFantasyTeam(team.id);
      expect(deleteResult.success).toBe(true);

      const afterDelete = await fantasyService.getFantasyTeamById(team.id);
      expect(afterDelete).toBeNull();
    });

    it('retrieves user fantasy teams filtered by match ID', async () => {
      await fantasyService.saveFantasyTeam({
        matchId: 'm-ind-aus-t20',
        teamName: 'IND-AUS Squad 1',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      await fantasyService.saveFantasyTeam({
        matchId: 'm-eng-sa-odi',
        teamName: 'ENG-SA Squad 1',
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
        players: validPlayers,
      });

      const matchSpecific = await fantasyService.getUserFantasyTeams({ matchId: 'm-ind-aus-t20' });
      expect(matchSpecific.teams.length).toBeGreaterThanOrEqual(1);
      matchSpecific.teams.forEach((t) => {
        expect(t.matchId || t.match_id).toBe('m-ind-aus-t20');
      });
    });
  });

  describe('3. Match Roster Provider Integration', () => {
    it('retrieves eligible player roster for match drafting', async () => {
      const roster = await fantasyService.getMatchRoster('m-ind-aus-t20');
      expect(roster).toBeDefined();
      expect(roster.matchId).toBe('m-ind-aus-t20');
      expect(Array.isArray(roster.players)).toBe(true);
      expect(roster.players.length).toBe(22); // 11 IND + 11 AUS
    });
  });
});

