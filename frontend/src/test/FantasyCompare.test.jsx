import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FantasyComparePage from '../pages/FantasyComparePage';
import fantasyService from '../services/fantasyService';

// Mock Recharts ResponsiveContainer since JSDOM lacks real dimensions
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: '800px', height: '300px' }}>{children}</div>
    ),
  };
});

describe('Fantasy Team Comparison UI Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComparison = (path = '/fantasy/compare') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/fantasy/compare" element={<FantasyComparePage />} />
          <Route path="/my-teams/compare" element={<FantasyComparePage />} />
          <Route path="/fantasy/teams" element={<div>My Fantasy Teams</div>} />
          <Route path="/fantasy/create" element={<div>Create Fantasy Squad</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders side-by-side teams, total fantasy points, and point differential', async () => {
    renderComparison();

    // Wait for resolution
    expect(await screen.findByText(/Fantasy Team Comparison/i)).toBeInTheDocument();

    // Verify both teams are displayed
    expect((await screen.findAllByText(/Men in Blue Titans/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Royal Strikers XI/i).length).toBeGreaterThan(0);

    // Verify points after comparison resolution
    expect(await screen.findByText('842')).toBeInTheDocument();
    expect(screen.getByText('788.5')).toBeInTheDocument();

    // Verify differential indicator
    expect(screen.getByText(/LEADING \(\+53\.5 pts\)/i)).toBeInTheDocument();

    // Verify Captain and Vice-Captain displays
    expect(screen.getAllByText(/Virat Kohli/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jasprit Bumrah/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rohit Sharma/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Travis Head/i).length).toBeGreaterThan(0);
  });

  it('renders Captain and Vice-Captain contribution widget with multipliers', async () => {
    renderComparison();

    expect(await screen.findByText(/Captain & Vice-Captain Impact/i)).toBeInTheDocument();
    expect(screen.getByText(/MULTIPLIER ANALYSIS/i)).toBeInTheDocument();

    // Verify multiplier breakdowns
    expect(screen.getByText(/Men in Blue Titans Leaders/i)).toBeInTheDocument();
    expect(screen.getByText(/Royal Strikers XI Leaders/i)).toBeInTheDocument();
    expect(screen.getByText(/371 pts \(44\.1% of squad\)/i)).toBeInTheDocument();
    expect(screen.getByText(/286 pts \(36\.3% of squad\)/i)).toBeInTheDocument();
  });

  it('renders Top Contributors widget highlighting key MVPs for both squads', async () => {
    renderComparison();

    expect(await screen.findByText(/Top Scoring Contributors/i)).toBeInTheDocument();
    expect(screen.getByText(/Men in Blue Titans Key MVPs/i)).toBeInTheDocument();
    expect(screen.getByText(/Royal Strikers XI Key MVPs/i)).toBeInTheDocument();
  });

  it('renders player-by-player comparison table with status tags and differentials', async () => {
    renderComparison();

    expect(await screen.findByText(/Player-by-Player Head-to-Head Breakdown/i)).toBeInTheDocument();

    // Verify common and exclusive badges
    expect(screen.getAllByText(/COMMON PICK/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TEAM 1 ONLY/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TEAM 2 ONLY/i).length).toBeGreaterThan(0);

    // Verify differential calculations in the table
    expect(screen.getByText(/\+112\.0/i)).toBeInTheDocument();
    expect(screen.getByText(/-74\.0/i)).toBeInTheDocument();
  });

  it('filters comparison table to differentials only', async () => {
    renderComparison();

    await screen.findByText(/Player-by-Player Head-to-Head Breakdown/i);

    // Click "Differentials Only" filter button
    const diffButton = screen.getByRole('button', { name: /Differentials Only/i });
    fireEvent.click(diffButton);

    // Hardik Pandya (Team 1 only) should remain
    expect(screen.getByText('Hardik Pandya')).toBeInTheDocument();

    // Glenn Maxwell (Common pick) should be filtered out
    expect(screen.queryByText('Glenn Maxwell')).not.toBeInTheDocument();
  });

  it('filters comparison table to common picks only', async () => {
    renderComparison();

    await screen.findByText(/Player-by-Player Head-to-Head Breakdown/i);

    // Click "Common Picks" filter button
    const commonButton = screen.getByRole('button', { name: /Common Picks/i });
    fireEvent.click(commonButton);

    // Glenn Maxwell (Common pick) should be visible
    expect(screen.getByText('Glenn Maxwell')).toBeInTheDocument();

    // Hardik Pandya (Team 1 only) should be filtered out
    expect(screen.queryByText('Hardik Pandya')).not.toBeInTheDocument();
  });

  it('displays error alert with retry button when comparison fails (e.g. privacy policy)', async () => {
    vi.spyOn(fantasyService, 'compareFantasyTeams').mockRejectedValueOnce(
      new Error('Privacy Policy Violation: You can only compare fantasy teams that belong to your account.')
    );

    renderComparison();

    expect(await screen.findByText(/Comparison Service Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy Violation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Comparison/i })).toBeInTheDocument();
  });

  it('displays empty state when user has fewer than 2 squads for the fixture', async () => {
    vi.spyOn(fantasyService, 'getComparableTeams').mockResolvedValueOnce({
      matchId: 'm-ind-aus-t20',
      teams: [
        {
          id: 'single-team-1',
          matchId: 'm-ind-aus-t20',
          teamName: 'Solo Squad',
          totalPoints: 100,
        },
      ],
    });

    renderComparison();

    expect(await screen.findByText(/Two Fantasy Squads Required/i)).toBeInTheDocument();
    expect(screen.getByText(/To compare fantasy teams, you need at least two lineups/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Draft Second Lineup/i })).toBeInTheDocument();
  });
});
