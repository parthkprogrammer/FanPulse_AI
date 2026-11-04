import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchCenterPage from '../pages/MatchCenterPage';
import MatchDetailPage from '../pages/MatchDetailPage';
import matchService from '../services/matchService';

describe('Match Center & Match Details UI Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('MatchCenterPage Component', () => {
    const renderMatchCenter = () => {
      return render(
        <MemoryRouter initialEntries={['/matches']}>
          <Routes>
            <Route path="/matches" element={<MatchCenterPage />} />
          </Routes>
        </MemoryRouter>
      );
    };

    it('renders match listing with DEMO DATA badges and venue info', async () => {
      renderMatchCenter();

      // Wait for service resolution
      await waitFor(() => {
        expect(screen.getByText(/Cricket Match Center/i)).toBeInTheDocument();
      });

      // Verify matches rendered
      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();
      expect(screen.getByText(/England vs South Africa — 1st ODI/i)).toBeInTheDocument();
      expect(screen.getByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();

      // Verify demo data notices
      const demoBadges = screen.getAllByText(/DEMO DATA/i);
      expect(demoBadges.length).toBeGreaterThan(0);
    });

    it('filters matches by status when clicking status tabs', async () => {
      renderMatchCenter();

      await screen.findByText(/India vs Australia — 3rd T20I/i);

      // Click "Live" status tab
      const liveTab = screen.getByRole('button', { name: /^Live$/i });
      fireEvent.click(liveTab);

      // India vs Australia (Live) should be visible after async fetch
      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();

      // England vs South Africa (Completed) should NOT be present
      expect(screen.queryByText(/England vs South Africa — 1st ODI/i)).not.toBeInTheDocument();
    });

    it('filters matches by search keyword', async () => {
      renderMatchCenter();

      await screen.findByText(/India vs Australia — 3rd T20I/i);

      // Find search input and type "Lord's"
      const searchInput = screen.getByPlaceholderText(/Search teams, countries, venues/i);
      fireEvent.change(searchInput, { target: { value: "Lord's" } });

      // England match at Lord's should be present
      expect(await screen.findByText(/England vs South Africa — 1st ODI/i)).toBeInTheDocument();

      // India match at MCG should be filtered out
      expect(screen.queryByText(/India vs Australia — 3rd T20I/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no match matches search and allows clearing filters', async () => {
      renderMatchCenter();

      await screen.findByText(/India vs Australia — 3rd T20I/i);

      // Search non-existent query
      const searchInput = screen.getByPlaceholderText(/Search teams, countries, venues/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentTeamXYZ' } });

      // Verify Empty State is displayed
      expect(await screen.findByText(/No Matches Found/i)).toBeInTheDocument();

      // Click "Clear All Filters"
      const clearBtn = screen.getByRole('button', { name: /Clear All Filters/i });
      fireEvent.click(clearBtn);

      // All matches should re-appear
      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();
    });

    it('renders error alert with retry button when service fails', async () => {
      vi.spyOn(matchService, 'getMatches').mockRejectedValueOnce(
        new Error('Network error connecting to cricket feeds.')
      );

      renderMatchCenter();

      expect(await screen.findByText(/Telemetry Feed Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error connecting to cricket feeds/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
    });

    it('provides accessibility basics: accessible filter controls and search inputs', async () => {
      renderMatchCenter();

      await screen.findByText(/Cricket Match Center/i);

      // Search input has accessible placeholder
      const searchInput = screen.getByPlaceholderText(/Search teams, countries, venues/i);
      expect(searchInput).toBeInTheDocument();

      // Status buttons have accessible names
      expect(screen.getByRole('button', { name: /^All Matches$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Live$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Upcoming$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Completed$/i })).toBeInTheDocument();
    });
  });

  describe('MatchDetailPage Component', () => {
    const renderMatchDetail = (matchId = 'm-ind-aus-t20') => {
      return render(
        <MemoryRouter initialEntries={[`/matches/${matchId}`]}>
          <Routes>
            <Route path="/matches/:matchId" element={<MatchDetailPage />} />
            <Route path="/matches" element={<div>Match Center Page</div>} />
          </Routes>
        </MemoryRouter>
      );
    };

    it('renders match scores, situation, and scorecard tables', async () => {
      renderMatchDetail('m-ind-aus-t20');

      // Wait for match header resolution
      await waitFor(() => {
        expect(screen.getByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      });

      // Verify scores
      expect(screen.getByText('184/4')).toBeInTheDocument();
      expect(screen.getByText('178/8')).toBeInTheDocument();
      expect(screen.getByText(/India need 5 runs in 10 balls/i)).toBeInTheDocument();

      // Verify full scorecard renders (batters and bowlers)
      expect(screen.getByText(/Full Scorecard/i)).toBeInTheDocument();
      expect(screen.getByText('Rohit Sharma (c)')).toBeInTheDocument();
      expect(screen.getByText('Virat Kohli')).toBeInTheDocument();
      expect(screen.getByText('Josh Hazlewood')).toBeInTheDocument();
      expect(screen.getByText('Pat Cummins')).toBeInTheDocument();
    });

    it('switches between innings tabs in the scorecard', async () => {
      renderMatchDetail('m-ind-aus-t20');

      await screen.findByText(/Full Scorecard/i);

      // Initially active innings is 2nd Innings (India chase)
      expect(screen.getByText('Rohit Sharma (c)')).toBeInTheDocument();

      // Switch to 1st Innings (Australia)
      const firstInningsBtn = screen.getByRole('button', { name: /1st Innings \(AUS\)/i });
      fireEvent.click(firstInningsBtn);

      // Australia batting scorecard elements should now be visible
      expect(await screen.findByText('Travis Head')).toBeInTheDocument();
      expect(screen.getByText('Glenn Maxwell')).toBeInTheDocument();
      expect(screen.getByText('Jasprit Bumrah')).toBeInTheDocument();
    });

    it('switches to ball-by-ball timeline stream and filters boundaries', async () => {
      renderMatchDetail('m-ind-aus-t20');

      await screen.findByText(/Full Scorecard/i);

      // Click Ball-by-Ball Timeline tab
      const timelineTab = screen.getByRole('button', { name: /Ball-by-Ball Timeline/i });
      fireEvent.click(timelineTab);

      // Verify ball deliveries and commentary are visible
      const bowlerBalls = await screen.findAllByText(/Pat Cummins to Hardik Pandya/i);
      expect(bowlerBalls.length).toBeGreaterThan(0);
      expect(screen.getByText(/Smashed high and handsome/i)).toBeInTheDocument();

      // Click Boundaries filter
      const boundariesBtn = screen.getByRole('button', { name: /Boundaries Only/i });
      fireEvent.click(boundariesBtn);

      // Boundary events remain
      expect(screen.getAllByText(/MAXIMUM 6/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/FOUR 4/i).length).toBeGreaterThan(0);
    });

    it('displays invalid match ID empty state with return button', async () => {
      renderMatchDetail('non-existent-match-id-999');

      expect(await screen.findByText(/Match Not Found/i)).toBeInTheDocument();
      expect(screen.getByText(/non-existent-match-id-999/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Return to Match Center/i })).toBeInTheDocument();
    });
  });
});
