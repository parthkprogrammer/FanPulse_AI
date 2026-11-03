import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyTeamsPage } from '../pages/MyTeamsPage';
import { fantasyService } from '../services/fantasyService';

const renderMyTeamsPage = () => {
  return render(
    <MemoryRouter initialEntries={['/fantasy/teams']}>
      <MyTeamsPage />
    </MemoryRouter>
  );
};

describe('MyTeamsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page header, badges, and action buttons', async () => {
    vi.spyOn(fantasyService, 'getUserFantasyTeams').mockResolvedValueOnce({
      teams: [],
      isDemoData: true,
    });

    renderMyTeamsPage();

    expect(screen.getByText('Fantasy Teams')).toBeInTheDocument();
    expect(screen.getByText('DEMO DATA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Composition Rules/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare Teams/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Team/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No Fantasy Teams Created Yet/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when user has no teams drafted', async () => {
    vi.spyOn(fantasyService, 'getUserFantasyTeams').mockResolvedValueOnce({
      teams: [],
      isDemoData: true,
    });

    renderMyTeamsPage();

    await waitFor(() => {
      expect(screen.getByText(/No Fantasy Teams Created Yet/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Draft First Squad/i })).toBeInTheDocument();
  });

  it('renders squad cards when user fantasy teams exist', async () => {
    const mockTeams = [
      {
        id: 'ft-test-1',
        matchId: 'm-ind-aus-t20',
        teamName: 'Super Kings 11',
        totalPoints: 850.5,
        captainPlayerId: 'p-virat-k',
        viceCaptainPlayerId: 'p-jasprit-b',
      },
      {
        id: 'ft-test-2',
        matchId: 'm-ind-aus-t20',
        teamName: 'Thunder Strikers',
        totalPoints: 792.0,
        captainPlayerId: 'p-rohit-s',
        viceCaptainPlayerId: 'p-travis-h',
      },
    ];

    vi.spyOn(fantasyService, 'getUserFantasyTeams').mockResolvedValueOnce({
      teams: mockTeams,
      isDemoData: false,
    });

    renderMyTeamsPage();

    await waitFor(() => {
      expect(screen.getByText('Super Kings 11')).toBeInTheDocument();
      expect(screen.getByText('Thunder Strikers')).toBeInTheDocument();
    });

    expect(screen.getByText('850.5 pts')).toBeInTheDocument();
    expect(screen.getByText('792 pts')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Compare$/i }).length).toBe(2);
  });

  it('opens and closes the Composition Rules modal', async () => {
    vi.spyOn(fantasyService, 'getUserFantasyTeams').mockResolvedValueOnce({
      teams: [],
      isDemoData: true,
    });

    renderMyTeamsPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Composition Rules/i })).toBeInTheDocument();
    });

    const rulesBtn = screen.getByRole('button', { name: /Composition Rules/i });
    fireEvent.click(rulesBtn);

    expect(await screen.findByText('Fantasy Squad Builder Rules')).toBeInTheDocument();
    expect(screen.getByText(/Exactly 11 players per drafted fantasy squad/i)).toBeInTheDocument();

    // Click exact "Close" button in modal footer
    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Fantasy Squad Builder Rules')).not.toBeInTheDocument();
    });
  });
});
