import { describe, it, expect, beforeEach, vi } from 'vitest';
import matchService, { DEMO_MATCHES } from '../services/matchService';
import {
  validateMatchInput,
  isValidStatusTransition,
  isMatchLive,
  isMatchCompleted,
  MATCH_STATUSES,
  MATCH_FORMATS,
} from '../../../supabase/functions/_shared/matches/index';

describe('Match Management Module — Domain & Service Layer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Match Data Model & Input Validation', () => {
    it('accepts complete, valid match fixture input', () => {
      const validMatch = {
        title: 'India vs South Africa — ICC Champions Trophy Final',
        team1Id: 'team-ind',
        team2Id: 'team-sa',
        format: 'ODI',
        venue: 'Lord’s Cricket Ground, London',
        matchDate: '2026-11-15T10:00:00Z',
        status: 'UPCOMING',
      };

      const result = validateMatchInput(validMatch);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('rejects match creation if competing teams are identical (team1Id === team2Id)', () => {
      const invalid = {
        title: 'India vs India Test',
        team1Id: 'team-ind',
        team2Id: 'team-ind',
        format: 'TEST',
        venue: 'Eden Gardens, Kolkata',
        matchDate: '2026-12-01T04:00:00Z',
      };

      const result = validateMatchInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Competing teams must be distinct.');
    });

    it('rejects unapproved match formats', () => {
      const invalidFormat = {
        title: 'England vs Australia Exhibition',
        team1Id: 'team-eng',
        team2Id: 'team-aus',
        format: 'THE_HUNDRED',
        venue: 'The Oval, London',
        matchDate: '2026-11-20T14:00:00Z',
      };

      const result = validateMatchInput(invalidFormat);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Format must be one of'))).toBe(true);
    });

    it('rejects invalid or missing ISO match dates', () => {
      const invalidDate = {
        title: 'New Zealand vs Pakistan 3rd T20I',
        team1Id: 'team-nz',
        team2Id: 'team-pak',
        format: 'T20',
        venue: 'Hagley Oval, Christchurch',
        matchDate: 'not-a-valid-date',
      };

      const result = validateMatchInput(invalidDate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A valid ISO-8601 matchDate is required.');
    });
  });

  describe('2. Match Status & Lifecycle Transitions', () => {
    it('correctly evaluates match lifecycle state helpers', () => {
      expect(isMatchLive('LIVE')).toBe(true);
      expect(isMatchLive('IN_PROGRESS')).toBe(true);
      expect(isMatchLive('UPCOMING')).toBe(false);
      expect(isMatchLive('COMPLETED')).toBe(false);

      expect(isMatchCompleted('COMPLETED')).toBe(true);
      expect(isMatchCompleted('LIVE')).toBe(false);
      expect(isMatchCompleted('SCHEDULED')).toBe(false);
    });

    it('validates legal lifecycle transitions', () => {
      // Valid progressions
      expect(isValidStatusTransition('SCHEDULED', 'LIVE')).toBe(true);
      expect(isValidStatusTransition('UPCOMING', 'LIVE')).toBe(true);
      expect(isValidStatusTransition('LIVE', 'COMPLETED')).toBe(true);
      expect(isValidStatusTransition('LIVE', 'ABANDONED')).toBe(true);
      expect(isValidStatusTransition('LIVE', 'LIVE')).toBe(true); // Idempotent

      // Invalid transitions (Terminal state reversals)
      expect(isValidStatusTransition('COMPLETED', 'LIVE')).toBe(false);
      expect(isValidStatusTransition('COMPLETED', 'UPCOMING')).toBe(false);
      expect(isValidStatusTransition('ABANDONED', 'LIVE')).toBe(false);
    });

    it('contains all approved statuses and formats per specification', () => {
      expect(MATCH_STATUSES).toEqual(
        expect.arrayContaining(['SCHEDULED', 'UPCOMING', 'LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
      );
      expect(MATCH_FORMATS).toEqual(expect.arrayContaining(['T20', 'ODI', 'TEST']));
    });
  });

  describe('3. Match Listing, Filters, and Pagination', () => {
    it('retrieves match listings with pagination metadata', async () => {
      const response = await matchService.getMatches({ page: 1, pageSize: 2 });
      expect(response).toBeDefined();
      expect(Array.isArray(response.matches)).toBe(true);
      expect(response.matches.length).toBeLessThanOrEqual(2);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(2);
      expect(response.total).toBeGreaterThan(0);
      expect(response.totalPages).toBeGreaterThanOrEqual(1);
      expect(response.dataLabel).toBe('DEMO DATA');
    });

    it('filters matches strictly by match status', async () => {
      const liveResponse = await matchService.getMatches({ status: 'LIVE' });
      expect(liveResponse.matches.length).toBeGreaterThan(0);
      liveResponse.matches.forEach((m) => {
        expect(m.status.toUpperCase()).toBe('LIVE');
      });

      const upcomingResponse = await matchService.getMatches({ status: 'UPCOMING' });
      expect(upcomingResponse.matches.length).toBeGreaterThan(0);
      upcomingResponse.matches.forEach((m) => {
        expect(m.status.toUpperCase()).toBe('UPCOMING');
      });
    });

    it('filters matches by format (T20, ODI, TEST)', async () => {
      const odiResponse = await matchService.getMatches({ format: 'ODI' });
      expect(odiResponse.matches.length).toBeGreaterThan(0);
      odiResponse.matches.forEach((m) => {
        expect(m.format.toUpperCase()).toBe('ODI');
      });
    });

    it('filters matches by venue search term', async () => {
      const response = await matchService.getMatches({ search: 'Melbourne' });
      expect(response.matches.length).toBe(1);
      expect(response.matches[0].venue).toContain('Melbourne');
    });
  });

  describe('4. Scorecard & Innings Information', () => {
    it('retrieves detailed match scorecard with innings breakdown', async () => {
      const scorecard = await matchService.getMatchScorecard('m-ind-aus-t20');
      expect(scorecard).toBeDefined();
      expect(scorecard.matchId).toBe('m-ind-aus-t20');
      expect(Array.isArray(scorecard.innings)).toBe(true);
      expect(scorecard.innings.length).toBe(2);

      const inn1 = scorecard.innings[0];
      expect(inn1.inningsNumber).toBe(1);
      expect(inn1.battingTeam).toBe('Australia');
      expect(inn1.totalRuns).toBe(178);
      expect(inn1.totalWickets).toBe(8);
      expect(Array.isArray(inn1.batting)).toBe(true);
      expect(Array.isArray(inn1.bowling)).toBe(true);
    });

    it('retrieves ball-by-ball events for match innings', async () => {
      const ballEvents = await matchService.getMatchBallEvents('m-ind-aus-t20', 2);
      expect(ballEvents).toBeDefined();
      expect(ballEvents.matchId).toBe('m-ind-aus-t20');
      expect(Array.isArray(ballEvents.events)).toBe(true);
      expect(ballEvents.events.length).toBeGreaterThan(0);
      expect(ballEvents.events[0]).toHaveProperty('overNumber');
      expect(ballEvents.events[0]).toHaveProperty('bowlerName');
      expect(ballEvents.events[0]).toHaveProperty('batterName');
    });
  });

  describe('5. Match Creation and Updates for Authorized Administrators', () => {
    it('validates required fields before creating a match fixture', async () => {
      await expect(
        matchService.createMatch({
          title: 'Incomplete Match',
          // Missing team1Id, team2Id, format, venue
        })
      ).rejects.toThrow(/missing required match creation fields/i);
    });

    it('creates a new match fixture in development mock mode', async () => {
      const newFixture = {
        title: 'West Indies vs Sri Lanka — 1st T20I',
        team1Id: 'WI',
        team2Id: 'SL',
        format: 'T20',
        venue: 'Kensington Oval, Bridgetown',
        matchDate: '2026-11-25T18:00:00Z',
        status: 'UPCOMING',
      };

      const result = await matchService.createMatch(newFixture);
      expect(result).toBeDefined();
      expect(result.match).toBeDefined();
      expect(result.match.title).toBe(newFixture.title);
      expect(result.match.venue).toBe(newFixture.venue);
      expect(result.match.format).toBe('T20');
      expect(result.match.dataLabel).toBe('DEMO DATA');
    });

    it('updates match fixture details', async () => {
      const result = await matchService.updateMatch('m-ind-aus-t20', {
        venue: 'Melbourne Cricket Ground (Updated)',
      });

      expect(result).toBeDefined();
      expect(result.match).toBeDefined();
      expect(result.match.venue).toBe('Melbourne Cricket Ground (Updated)');
    });

    it('updates match status to COMPLETED with result summary', async () => {
      const result = await matchService.updateMatchStatus('m-ind-aus-t20', {
        status: 'COMPLETED',
        resultSummary: 'India won by 6 wickets',
      });

      expect(result).toBeDefined();
      expect(result.match).toBeDefined();
      expect(result.match.status).toBe('COMPLETED');
      expect(result.match.resultSummary).toBe('India won by 6 wickets');
      expect(result.match.isLive).toBe(false);
    });
  });
});

