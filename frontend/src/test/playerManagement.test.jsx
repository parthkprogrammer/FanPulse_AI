import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import playerService, { CONTROLLED_SAMPLE_PLAYERS } from '../services/playerService';
import PlayerDetailPage from '../pages/PlayerDetailPage';
import {
  validatePlayerInput,
  PLAYER_ROLES,
} from '../../../supabase/functions/_shared/players/index';

describe('Player Management Module — Domain & Service Layer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Player Input Validation & Domain Constraints', () => {
    it('accepts valid, complete player creation input', () => {
      const valid = {
        name: 'Jasprit Bumrah',
        shortName: 'J Bumrah',
        country: 'India',
        primaryRole: 'BOWLER',
      };

      const result = validatePlayerInput(valid);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('rejects player with missing or short names', () => {
      const invalid = {
        name: 'A',
        shortName: '',
        country: 'India',
        primaryRole: 'BATTER',
      };

      const result = validatePlayerInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player full name must be at least 2 characters.');
      expect(result.errors).toContain('Player short name / abbreviation is required.');
    });

    it('rejects unapproved player roles', () => {
      const invalid = {
        name: 'MS Dhoni',
        shortName: 'MSD',
        country: 'India',
        primaryRole: 'COACH',
      };

      const result = validatePlayerInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('primaryRole must be one of'))).toBe(true);
    });

    it('contains all approved player roles from specification', () => {
      expect(PLAYER_ROLES).toEqual(
        expect.arrayContaining(['BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'])
      );
    });
  });

  describe('2. Player Repository & Query Service', () => {
    it('retrieves player list with pagination metadata', async () => {
      const response = await playerService.getPlayers({ page: 1, pageSize: 3 });
      expect(response).toBeDefined();
      expect(Array.isArray(response.players)).toBe(true);
      expect(response.players.length).toBeLessThanOrEqual(3);
      expect(response.total).toBe(CONTROLLED_SAMPLE_PLAYERS.length);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(3);
      expect(response.totalPages).toBe(Math.ceil(CONTROLLED_SAMPLE_PLAYERS.length / 3));
    });

    it('filters players by primary role', async () => {
      const response = await playerService.getPlayers({ role: 'BOWLER' });
      expect(response.players.length).toBeGreaterThan(0);
      response.players.forEach((p) => {
        expect(p.primaryRole).toBe('BOWLER');
      });
    });

    it('filters players by country', async () => {
      const response = await playerService.getPlayers({ country: 'Australia' });
      expect(response.players.length).toBeGreaterThan(0);
      response.players.forEach((p) => {
        expect(p.country).toBe('Australia');
      });
    });

    it('searches players by keyword', async () => {
      const response = await playerService.getPlayers({ search: 'Kohli' });
      expect(response.players.length).toBe(1);
      expect(response.players[0].name).toBe('Virat Kohli');
    });
  });

  describe('3. Player Details & Career Batting / Bowling Statistics', () => {
    it('retrieves player details by ID with career statistics', async () => {
      const player = await playerService.getPlayerById('p-virat-k');
      expect(player).toBeDefined();
      expect(player.id).toBe('p-virat-k');
      expect(player.name).toBe('Virat Kohli');
      expect(player.country).toBe('India');
      expect(player.primaryRole).toBe('BATTER');

      // Batting Career stats
      expect(player.battingStats).toBeDefined();
      expect(player.battingStats.matches).toBe(117);
      expect(player.battingStats.runs).toBe(4188);
      expect(player.battingStats.highestScore).toBe(122);
      expect(player.battingStats.strikeRate).toBe(137.04);
      expect(player.battingStats.centuries).toBe(1);
      expect(player.battingStats.halfCenturies).toBe(38);

      // Bowling Career stats
      expect(player.bowlingStats).toBeDefined();
      expect(player.bowlingStats.wickets).toBe(4);
    });

    it('handles missing player records gracefully by returning null', async () => {
      const nonExistent = await playerService.getPlayerById('p-non-existent-12345');
      expect(nonExistent).toBeNull();

      const nullId = await playerService.getPlayerById(null);
      expect(nullId).toBeNull();
    });
  });

  describe('4. Player Match Performance Statistics', () => {
    it('retrieves individual match performance statistics for fixture', async () => {
      const perf = await playerService.getPlayerMatchPerformance('p-virat-k', 'm-ind-aus-t20');
      expect(perf).toBeDefined();
      expect(perf.playerId).toBe('p-virat-k');
      expect(perf.playerName).toBe('Virat Kohli');
      expect(perf.team).toBe('India');
      expect(perf.batting.runsScored).toBe(74);
      expect(perf.batting.ballsFaced).toBe(48);
      expect(perf.batting.fours).toBe(6);
      expect(perf.batting.sixes).toBe(2);
      expect(perf.batting.strikeRate).toBe(154.2);
    });

    it('returns null for match performance of unrecorded player', async () => {
      const missing = await playerService.getPlayerMatchPerformance('p-unknown-player', 'm-ind-aus-t20');
      expect(missing).toBeNull();
    });
  });

  describe('5. Protected Administrative Operations', () => {
    it('rejects player creation when missing mandatory fields', async () => {
      await expect(
        playerService.createPlayer({
          name: '',
          // Missing shortName, country, primaryRole
        })
      ).rejects.toThrow(/missing required player fields/i);
    });

    it('creates a new player profile in development mock mode', async () => {
      const newPlayer = {
        name: 'Sunil Narine',
        shortName: 'SP Narine',
        country: 'West Indies',
        primaryRole: 'ALL_ROUNDER',
        battingStyle: 'LEFT_HAND_BAT',
        bowlingStyle: 'RIGHT_ARM_OFFBREAK',
      };

      const result = await playerService.createPlayer(newPlayer);
      expect(result).toBeDefined();
      expect(result.player).toBeDefined();
      expect(result.player.name).toBe('Sunil Narine');
      expect(result.player.primaryRole).toBe('ALL_ROUNDER');
    });

    it('updates existing player profile in development mock mode', async () => {
      const result = await playerService.updatePlayer('p-virat-k', {
        credits: 10.5,
      });

      expect(result).toBeDefined();
      expect(result.player).toBeDefined();
      expect(result.player.credits).toBe(10.5);
    });
  });

  describe('6. PlayerDetailPage Component UI Integration', () => {
    const renderPlayerDetail = (playerId) => {
      return render(
        <MemoryRouter initialEntries={[`/players/${playerId}`]}>
          <Routes>
            <Route path="/players/:playerId" element={<PlayerDetailPage />} />
            <Route path="/matches" element={<div>Match Center Screen</div>} />
          </Routes>
        </MemoryRouter>
      );
    };

    it('renders player detail with career batting and bowling statistics', async () => {
      renderPlayerDetail('p-virat-k');

      await waitFor(() => {
        expect(screen.getByText('Virat Kohli')).toBeInTheDocument();
      });

      expect(screen.getByText('Career Batting Statistics')).toBeInTheDocument();
      expect(screen.getByText('Career Bowling Statistics')).toBeInTheDocument();
      expect(screen.getByText('4,188')).toBeInTheDocument(); // Career runs
      expect(screen.getByText('137.04')).toBeInTheDocument(); // Strike rate
    });

    it('displays Player Record Not Found for unknown playerId', async () => {
      renderPlayerDetail('p-unknown-ghost-player');

      await waitFor(() => {
        expect(screen.getByText(/Player Record Not Found/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Back to Match Center/i })).toBeInTheDocument();
    });
  });
});

