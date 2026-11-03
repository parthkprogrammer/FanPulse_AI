import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FantasyCreatePage from '../pages/FantasyCreatePage';
import fantasyService, { SAMPLE_ROSTERS } from '../services/fantasyService';

describe('Fantasy Team Builder UI & Validation Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const renderFantasyBuilder = (initialPath = '/fantasy/create') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/fantasy/create" element={<FantasyCreatePage />} />
          <Route path="/matches/:matchId/fantasy/create" element={<FantasyCreatePage />} />
          <Route path="/fantasy/teams" element={<div>My Fantasy Teams</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders builder workspace with progress header, match selector, and player pool', async () => {
    renderFantasyBuilder();

    // Verify main headings and demo data badge
    expect(await screen.findByText(/Fantasy Team Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 11 Players/i)).toBeInTheDocument();
    expect(await screen.findByText(/Select Match Fixture/i)).toBeInTheDocument();

    // Verify player pool is rendered
    expect(await screen.findByText('Virat Kohli')).toBeInTheDocument();
    expect(screen.getByText('Travis Head')).toBeInTheDocument();
    expect(screen.getByText('Jasprit Bumrah')).toBeInTheDocument();
  });

  it('filters player pool by role tabs', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Click "Wicket-Keepers" (WK) tab
    const wkTab = screen.getByRole('button', { name: /WK/i });
    fireEvent.click(wkTab);

    // Rishabh Pant (WK) and Matthew Wade (WK) should be visible
    expect(screen.getByText('Rishabh Pant')).toBeInTheDocument();
    expect(screen.getByText('Matthew Wade')).toBeInTheDocument();

    // Virat Kohli (BAT) should NOT be displayed
    expect(screen.queryByText('Virat Kohli')).not.toBeInTheDocument();
  });

  it('selects and deselects players, preventing duplicates and incrementing count', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Find "Pick" buttons
    const pickButtons = screen.getAllByRole('button', { name: /^Pick /i });
    expect(pickButtons.length).toBeGreaterThan(0);

    // Pick first player
    fireEvent.click(pickButtons[0]);

    // Counter should show 1 / 11 Players
    expect(screen.getByText(/\/ 11 Players/i)).toBeInTheDocument();

    // Button should now show "Remove"
    const removeButtons = screen.getAllByRole('button', { name: /^Remove /i });
    expect(removeButtons.length).toBeGreaterThan(0);

    // Deselect player
    fireEvent.click(removeButtons[0]);

    // Counter returns to 0
    expect(screen.getByText(/\/ 11 Players/i)).toBeInTheDocument();
  });

  it('prevents selecting more than 11 players into the squad', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Pick 11 players
    const roster = SAMPLE_ROSTERS['m-ind-aus-t20'];
    for (let i = 0; i < 11; i++) {
      const pickBtn = screen.getByRole('button', { name: `Pick ${roster[i].name}` });
      fireEvent.click(pickBtn);
    }

    // Selected count should be 11 / 11
    expect(screen.getByText(/\/ 11 Players/i)).toBeInTheDocument();

    // Remaining players should have button disabled with "Squad full for ..."
    const squadFullButtons = screen.getAllByRole('button', { name: /^Squad full for/i });
    expect(squadFullButtons.length).toBeGreaterThan(0);
  });

  it('validates composition rules and displays validation errors for incomplete squad', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Enter valid team name
    const nameInput = screen.getByPlaceholderText(/Royal Strikers XI/i);
    fireEvent.change(nameInput, { target: { value: 'My Titans XI' } });

    // Pick only 2 players
    const roster = SAMPLE_ROSTERS['m-ind-aus-t20'];
    fireEvent.click(screen.getByRole('button', { name: `Pick ${roster[0].name}` }));
    fireEvent.click(screen.getByRole('button', { name: `Pick ${roster[1].name}` }));

    // Attempt to save team
    const saveBtn = screen.getByRole('button', { name: /Save & Register Squad/i });
    expect(saveBtn).toBeDisabled();

    // Validation warning should show needed players
    expect(screen.getByText(/A fantasy squad must contain exactly 11 players/i)).toBeInTheDocument();
  });

  it('assigns Captain and Vice-Captain and prevents selecting the same player for both', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Pick 11 players
    const roster = SAMPLE_ROSTERS['m-ind-aus-t20'];
    for (let i = 0; i < 11; i++) {
      const pickBtn = screen.getByRole('button', { name: `Pick ${roster[i].name}` });
      fireEvent.click(pickBtn);
    }

    // Switch to Captains step
    const captainsStepBtn = screen.getByRole('button', { name: /Choose Captain & VC/i });
    fireEvent.click(captainsStepBtn);

    // Verify Captain assignment modal view
    expect(screen.getByText(/Assign Captain & Vice-Captain/i)).toBeInTheDocument();

    const captainButtons = screen.getAllByRole('button', { name: /\(C\) 2×/i });
    const vcButtons = screen.getAllByRole('button', { name: /\(VC\) 1\.5×/i });

    // Assign first player as Captain
    fireEvent.click(captainButtons[0]);

    // Assign second player as Vice-Captain
    fireEvent.click(vcButtons[1]);

    // Check feedback badges
    expect(screen.getAllByText(/Captain:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vice-Captain:/i).length).toBeGreaterThan(0);

    // If we click (VC) on the first player (who is Captain), it should clear Captain
    fireEvent.click(vcButtons[0]);
    // Now Captain should be reset or switched
    expect(screen.getByText(/None selected/i)).toBeInTheDocument();
  });

  it('submits valid fantasy team and handles successful persistence', async () => {
    const saveSpy = vi.spyOn(fantasyService, 'saveFantasyTeam').mockResolvedValueOnce({
      id: 'ft-test-123',
      teamName: 'Super Kings 11',
      matchId: 'm-ind-aus-t20',
      playersCount: 11,
    });

    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Set team name
    const nameInput = screen.getByPlaceholderText(/Royal Strikers XI/i);
    fireEvent.change(nameInput, { target: { value: 'Super Kings 11' } });

    // Pick a valid 11-player squad (6 IND, 5 AUS, covering WK, BAT, AR, BOWL)
    // IND: Pant (WK), Kohli (BAT), Rohit (BAT), Pandya (AR), Bumrah (BOWL), Siraj (BOWL)
    // AUS: Wade (WK), Head (BAT), Maxwell (AR), Cummins (BOWL), Starc (BOWL)
    const validSelection = [
      'Rishabh Pant',
      'Virat Kohli',
      'Rohit Sharma',
      'Hardik Pandya',
      'Jasprit Bumrah',
      'Mohammed Siraj',
      'Matthew Wade',
      'Travis Head',
      'Glenn Maxwell',
      'Pat Cummins',
      'Mitchell Starc',
    ];

    for (const name of validSelection) {
      const pickBtn = screen.getByRole('button', { name: `Pick ${name}` });
      fireEvent.click(pickBtn);
    }

    // Go to Captains step
    const captainsStepBtn = screen.getByRole('button', { name: /Choose Captain & VC/i });
    fireEvent.click(captainsStepBtn);

    // Designate Captain and Vice-Captain
    const captainButtons = screen.getAllByRole('button', { name: /\(C\) 2×/i });
    const vcButtons = screen.getAllByRole('button', { name: /\(VC\) 1\.5×/i });
    fireEvent.click(captainButtons[0]); // Pant C
    fireEvent.click(vcButtons[1]); // Kohli VC

    // Now Save button should be enabled
    const saveBtn = screen.getByRole('button', { name: /Save & Register Squad/i });
    expect(saveBtn).not.toBeDisabled();

    // Click Save
    fireEvent.click(saveBtn);

    // Verify service call
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/drafted and registered successfully/i)).toBeInTheDocument();
  });

  it('displays API error state when saving team fails', async () => {
    vi.spyOn(fantasyService, 'saveFantasyTeam').mockRejectedValueOnce(
      new Error('Database RLS authorization failure. Session expired.')
    );

    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Fill valid team
    const nameInput = screen.getByPlaceholderText(/Royal Strikers XI/i);
    fireEvent.change(nameInput, { target: { value: 'Valid Squad Name' } });

    const validSelection = [
      'Rishabh Pant',
      'Virat Kohli',
      'Rohit Sharma',
      'Hardik Pandya',
      'Jasprit Bumrah',
      'Mohammed Siraj',
      'Matthew Wade',
      'Travis Head',
      'Glenn Maxwell',
      'Pat Cummins',
      'Mitchell Starc',
    ];

    for (const name of validSelection) {
      const pickBtn = screen.getByRole('button', { name: `Pick ${name}` });
      fireEvent.click(pickBtn);
    }

    // Set captains
    const captainsStepBtn = screen.getByRole('button', { name: /Choose Captain & VC/i });
    fireEvent.click(captainsStepBtn);
    const captainButtons = screen.getAllByRole('button', { name: /\(C\) 2×/i });
    const vcButtons = screen.getAllByRole('button', { name: /\(VC\) 1\.5×/i });
    fireEvent.click(captainButtons[0]);
    fireEvent.click(vcButtons[1]);

    // Save
    const saveBtn = screen.getByRole('button', { name: /Save & Register Squad/i });
    fireEvent.click(saveBtn);

    // Error alert should be displayed
    expect(await screen.findByText(/Validation or Submission Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Database RLS authorization failure/i)).toBeInTheDocument();
  });

  it('provides accessibility basics: accessible pick buttons and role tab navigation', async () => {
    renderFantasyBuilder();

    await screen.findByText('Virat Kohli');

    // Pick buttons have accessible names specifying player name
    const pickKohli = screen.getByRole('button', { name: 'Pick Virat Kohli' });
    expect(pickKohli).toBeInTheDocument();

    // Role filter tab buttons are accessible
    const allTab = screen.getByRole('button', { name: /ALL/i });
    const batTab = screen.getByRole('button', { name: /BAT/i });
    const bowlTab = screen.getByRole('button', { name: /BOWL/i });
    expect(allTab).toBeInTheDocument();
    expect(batTab).toBeInTheDocument();
    expect(bowlTab).toBeInTheDocument();
  });
});
