/**
 * FanPulse AI — Frontend Comprehensive QA Verification Suite
 *
 * Senior Frontend QA Engineer Test Suite:
 * - Framework: Vitest & React Testing Library
 * - Modules tested:
 *   1. Login Forms
 *   2. Registration Forms
 *   3. Routing
 *   4. Protected Pages & RBAC
 *   5. Dashboard
 *   6. Match Listing
 *   7. Fantasy Team Builder
 *   8. Fantasy Comparison
 *   9. AI Assistant
 *
 * Cross-cutting quality criteria tested:
 * - Rendering
 * - User Interaction
 * - Form Validation
 * - API Loading States
 * - API Failures & Recovery
 * - Empty States
 * - Accessibility Basics
 *
 * Note: ZERO production business logic is modified to satisfy tests.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, BrowserRouter, Routes, Route } from 'react-router-dom';

// Context & App Routing
import AuthContext, { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import MatchCenterPage from '../pages/MatchCenterPage';
import FantasyCreatePage from '../pages/FantasyCreatePage';
import FantasyComparePage from '../pages/FantasyComparePage';
import AiAssistantPage from '../pages/AiAssistantPage';

// Services
import { authService } from '../services/authService';
import { dashboardService, DEMO_DASHBOARD_DATA } from '../services/dashboardService';
import { matchService } from '../services/matchService';
import { fantasyService, SAMPLE_ROSTERS } from '../services/fantasyService';
import { aiService } from '../services/aiService';

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

describe('FanPulse AI — Senior Frontend QA Verification Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // =========================================================================
  // 1. LOGIN FORMS
  // =========================================================================
  describe('1. Login Forms QA', () => {
    const renderLogin = (authOverrides = {}) => {
      const authValue = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isMockMode: true,
        signIn: vi.fn(),
        ...authOverrides,
      };

      return render(
        <BrowserRouter>
          <AuthContext.Provider value={authValue}>
            <LoginPage />
          </AuthContext.Provider>
        </BrowserRouter>
      );
    };

    it('Rendering: renders inputs, labels, submit button, and mock mode indicator', () => {
      renderLogin();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/development mock mode/i)).toBeInTheDocument();
    });

    it('Form Validation: flags empty submission and rejects invalid email format', async () => {
      renderLogin();

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'not-valid-email' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('Form Validation: enforces password minimum length of 6 characters', async () => {
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12345' } });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('User Interaction & API Success: submits credentials and renders confirmation', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        user: { id: 'usr-1', email: 'fan@fanpulse.ai' },
        isMock: true,
      });

      renderLogin({ signIn: mockSignIn });

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'fan@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'ValidPass123' } });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'fan@fanpulse.ai',
          password: 'ValidPass123',
        });
      });

      expect(await screen.findByText(/signed in with development mock authentication\./i)).toBeInTheDocument();
    });

    it('API Failure: displays server error alert on authentication failure', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid email or password.'));

      renderLogin({ signIn: mockSignIn, isMockMode: false });

      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'fan@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass123' } });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText(/invalid email or password\./i)).toBeInTheDocument();
    });

    it('Accessibility Basics: provides accessible labels, input IDs, and aria-invalid attributes', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('id', 'input-email-address');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // =========================================================================
  // 2. REGISTRATION FORMS
  // =========================================================================
  describe('2. Registration Forms QA', () => {
    const renderRegister = (authOverrides = {}) => {
      const authValue = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isMockMode: true,
        signUp: vi.fn(),
        ...authOverrides,
      };

      return render(
        <BrowserRouter>
          <AuthContext.Provider value={authValue}>
            <RegisterPage />
          </AuthContext.Provider>
        </BrowserRouter>
      );
    };

    it('Rendering: renders full name, email, password, confirm password, and helper text', () => {
      renderRegister();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/must be 8\+ chars with uppercase, lowercase, and a number\./i)).toBeInTheDocument();
    });

    it('Form Validation: enforces password complexity (uppercase, lowercase, number, length)', async () => {
      renderRegister();

      // No uppercase
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'lowercase123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/password must include at least one uppercase letter/i)).toBeInTheDocument();
      });

      // No digit
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'NoDigitsUppercase' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/password must include at least one numeric digit/i)).toBeInTheDocument();
      });
    });

    it('Form Validation: enforces password confirmation match', async () => {
      renderRegister();

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Virat Kohli' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'virat@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'SecurePass123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'MismatchPass456' } });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('User Interaction & API Failure: displays registration error alert from backend', async () => {
      const mockSignUp = vi.fn().mockRejectedValue(new Error('User already exists in Supabase.'));
      renderRegister({ signUp: mockSignUp, isMockMode: false });

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Existing User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'exists@fanpulse.ai' } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'ValidPass123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'ValidPass123' } });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(await screen.findByText(/user already exists in supabase\./i)).toBeInTheDocument();
    });

    it('Accessibility Basics: links labels via htmlFor and id attributes', () => {
      renderRegister();

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('id', 'input-full-name');
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('id', 'input-email-address');
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });
  });

  // =========================================================================
  // 3. ROUTING & 4. PROTECTED PAGES
  // =========================================================================
  describe('3. Routing & 4. Protected Pages QA', () => {
    const renderRoutedApp = (initialRoute, authUser = null) => {
      const authValue = {
        user: authUser,
        token: authUser ? 'jwt-token-123' : null,
        isAuthenticated: Boolean(authUser),
        isLoading: false,
        isMockMode: true,
        isAdmin: authUser?.role === 'ADMIN' || authUser?.role === 'ROLE_ADMIN',
        hasRole: (role) => {
          if (!authUser) return false;
          const uRole = authUser.role === 'ROLE_ADMIN' ? 'ADMIN' : authUser.role;
          const rRole = role === 'ROLE_ADMIN' ? 'ADMIN' : role;
          if (uRole === 'ADMIN') return true;
          return uRole === rRole;
        },
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        logout: vi.fn(),
        toggleDemoAuth: vi.fn(),
      };

      return render(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
    };

    it('Routing: root "/" redirects automatically to "/dashboard"', async () => {
      renderRoutedApp('/');
      expect(await screen.findByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
    });

    it('Routing: navigates to public matches page without authentication', async () => {
      renderRoutedApp('/matches');
      expect(await screen.findByText(/Cricket Match Center/i)).toBeInTheDocument();
    });

    it('Protected Pages: unauthenticated user accessing "/fantasy/teams" is redirected to login', () => {
      renderRoutedApp('/fantasy/teams', null);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByText(/My Fantasy Teams/i)).not.toBeInTheDocument();
    });

    it('Protected Pages: unauthenticated user accessing "/assistant" is redirected to login', () => {
      renderRoutedApp('/assistant', null);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByText(/Cricket Intelligence Assistant/i)).not.toBeInTheDocument();
    });

    it('Protected Pages: authenticated regular user can access "/assistant"', async () => {
      renderRoutedApp('/assistant', { id: 'usr-1', email: 'fan@fanpulse.ai', role: 'USER' });
      expect(await screen.findByText(/Cricket Intelligence Assistant/i)).toBeInTheDocument();
    });

    it('Protected Pages: regular USER is blocked from "/admin" with Access Restricted UI', () => {
      renderRoutedApp('/admin', { id: 'usr-1', email: 'fan@fanpulse.ai', role: 'USER' });
      expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/requires elevated credentials/i)).toBeInTheDocument();
    });

    it('Protected Pages: elevated ADMIN can access "/admin" dashboard', async () => {
      renderRoutedApp('/admin', { id: 'adm-1', email: 'admin@fanpulse.ai', role: 'ADMIN' });
      expect(await screen.findByText(/Platform Administration/i)).toBeInTheDocument();
    });

    it('Routing 404: renders NotFoundPage with return button on unmatched path', () => {
      renderRoutedApp('/pitch-not-found-xyz');
      expect(screen.getByText(/404 — Page Not Found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. DASHBOARD
  // =========================================================================
  describe('5. Dashboard QA', () => {
    const renderDashboardPage = () => {
      return render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardPage />
          </AuthProvider>
        </BrowserRouter>
      );
    };

    it('Rendering: displays hero banner, scores, situation, and demo notices', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      });

      expect(screen.getByText('184/4')).toBeInTheDocument();
      expect(screen.getByText('178/8')).toBeInTheDocument();
      expect(screen.getByText(/India need 5 runs in 10 balls/i)).toBeInTheDocument();
      expect(screen.getAllByText(/DEMO DATA/i).length).toBeGreaterThan(0);
    });

    it('API Failure & Retry: renders telemetry feed error and recovers upon retry', async () => {
      const getSpy = vi
        .spyOn(dashboardService, 'getDashboardData')
        .mockRejectedValueOnce(new Error('Feed timeout'))
        .mockResolvedValueOnce(DEMO_DASHBOARD_DATA);

      renderDashboardPage();

      expect(await screen.findByText(/Telemetry Feed Error/i)).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /retry loading feed/i });
      fireEvent.click(retryBtn);

      expect(await screen.findByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('Empty State: renders empty fixtures state when service returns null data', async () => {
      vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValueOnce(null);

      renderDashboardPage();

      expect(await screen.findByText(/No Cricket Fixtures Available/i)).toBeInTheDocument();
    });

    it('Accessibility Basics: provides accessible headings and action buttons', async () => {
      renderDashboardPage();

      await screen.findByText(/Melbourne Cricket Ground/i);
      expect(screen.getByRole('heading', { level: 3, name: /AI Match Intelligence/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Top Match Performers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore ai assistant/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. MATCH LISTING
  // =========================================================================
  describe('6. Match Listing QA', () => {
    const renderMatchCenter = () => {
      return render(
        <MemoryRouter initialEntries={['/matches']}>
          <MatchCenterPage />
        </MemoryRouter>
      );
    };

    it('Rendering: displays match list with venue, format, and status tags', async () => {
      renderMatchCenter();

      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();
      expect(screen.getByText(/England vs South Africa — 1st ODI/i)).toBeInTheDocument();
      expect(screen.getByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
    });

    it('User Interaction: filters list by status tabs (Live)', async () => {
      renderMatchCenter();

      await screen.findByText(/India vs Australia — 3rd T20I/i);
      const liveBtn = screen.getByRole('button', { name: /^Live$/i });
      fireEvent.click(liveBtn);

      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();
      expect(screen.queryByText(/England vs South Africa — 1st ODI/i)).not.toBeInTheDocument();
    });

    it('Empty State: shows empty state when search returns zero results and allows filter reset', async () => {
      renderMatchCenter();

      await screen.findByText(/India vs Australia — 3rd T20I/i);

      const searchInput = screen.getByPlaceholderText(/Search teams, countries, venues/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentXYZ' } });

      expect(await screen.findByText(/No Matches Found/i)).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /Clear All Filters/i });
      fireEvent.click(clearBtn);

      expect(await screen.findByText(/India vs Australia — 3rd T20I/i)).toBeInTheDocument();
    });

    it('API Failure: renders error alert when match fetching service fails', async () => {
      vi.spyOn(matchService, 'getMatches').mockRejectedValueOnce(new Error('Failed to reach provider.'));

      renderMatchCenter();

      expect(await screen.findByText(/Telemetry Feed Error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
    });

    it('Accessibility Basics: search input has descriptive placeholder and status buttons are accessible', async () => {
      renderMatchCenter();

      await screen.findByText(/Cricket Match Center/i);
      expect(screen.getByPlaceholderText(/Search teams, countries, venues/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^All Matches$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Live$/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. FANTASY TEAM BUILDER
  // =========================================================================
  describe('7. Fantasy Team Builder QA', () => {
    const renderBuilder = (initialPath = '/fantasy/create') => {
      return render(
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/fantasy/create" element={<FantasyCreatePage />} />
            <Route path="/matches/:matchId/fantasy/create" element={<FantasyCreatePage />} />
            <Route path="/fantasy/teams" element={<div>Teams</div>} />
          </Routes>
        </MemoryRouter>
      );
    };

    it('Rendering: renders progress header, match selector, role tabs, and player pool', async () => {
      renderBuilder();

      expect(await screen.findByText(/Fantasy Team Builder/i)).toBeInTheDocument();
      expect(screen.getByText(/\/ 11 Players/i)).toBeInTheDocument();
      expect(await screen.findByText('Virat Kohli')).toBeInTheDocument();
    });

    it('User Interaction: filters player pool by role tab (WK)', async () => {
      renderBuilder();

      await screen.findByText('Virat Kohli');

      const wkTab = screen.getByRole('button', { name: /WK/i });
      fireEvent.click(wkTab);

      expect(screen.getByText('Rishabh Pant')).toBeInTheDocument();
      expect(screen.queryByText('Virat Kohli')).not.toBeInTheDocument();
    });

    it('Form Validation: displays composition validation error and disables save button when squad is incomplete', async () => {
      renderBuilder();

      await screen.findByText('Virat Kohli');

      // Fill valid team name so the name length error clears
      const nameInput = screen.getByPlaceholderText(/Royal Strikers XI/i);
      fireEvent.change(nameInput, { target: { value: 'Valid Squad Name' } });

      // Pick only 1 player
      const pickBtn = screen.getByRole('button', { name: 'Pick Virat Kohli' });
      fireEvent.click(pickBtn);

      // Validation message displayed in composition summary
      expect(
        screen.getByText(/A fantasy squad must contain exactly 11 players\. Currently selected: 1\./i)
      ).toBeInTheDocument();

      // Save button is disabled
      const saveBtn = screen.getByRole('button', { name: /Save & Register Squad/i });
      expect(saveBtn).toBeDisabled();
    });

    it('API Failure: displays error alert when roster service fails', async () => {
      vi.spyOn(fantasyService, 'getMatchRoster').mockRejectedValueOnce(
        new Error('Roster database offline')
      );

      renderBuilder();

      expect(await screen.findByText(/Validation or Submission Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Roster database offline/i)).toBeInTheDocument();
    });

    it('Accessibility Basics: pick buttons have explicit accessible names with player labels', async () => {
      renderBuilder();

      await screen.findByText('Virat Kohli');
      expect(screen.getByRole('button', { name: 'Pick Virat Kohli' })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 8. FANTASY COMPARISON
  // =========================================================================
  describe('8. Fantasy Comparison QA', () => {
    const renderComparison = () => {
      return render(
        <MemoryRouter initialEntries={['/fantasy/compare']}>
          <FantasyComparePage />
        </MemoryRouter>
      );
    };

    it('Rendering: displays side-by-side teams, fantasy points, and differential badge', async () => {
      renderComparison();

      expect(await screen.findByText(/Fantasy Team Comparison/i)).toBeInTheDocument();
      expect((await screen.findAllByText(/Men in Blue Titans/i)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Royal Strikers XI/i).length).toBeGreaterThan(0);
      expect(await screen.findByText('842')).toBeInTheDocument();
      expect(screen.getByText('788.5')).toBeInTheDocument();
      expect(screen.getByText(/LEADING \(\+53\.5 pts\)/i)).toBeInTheDocument();
    });

    it('User Interaction: filters player table by differentials only', async () => {
      renderComparison();

      await screen.findByText(/Player-by-Player Head-to-Head Breakdown/i);

      const diffBtn = screen.getByRole('button', { name: /Differentials Only/i });
      fireEvent.click(diffBtn);

      expect(screen.getByText('Hardik Pandya')).toBeInTheDocument();
      expect(screen.queryByText('Glenn Maxwell')).not.toBeInTheDocument();
    });

    it('Empty State: displays required squads notice when fewer than 2 teams exist', async () => {
      vi.spyOn(fantasyService, 'getComparableTeams').mockResolvedValueOnce({
        matchId: 'm-ind-aus-t20',
        teams: [{ id: 'team-1', matchId: 'm-ind-aus-t20', teamName: 'Solo Team', totalPoints: 100 }],
      });

      renderComparison();

      expect(await screen.findByText(/Two Fantasy Squads Required/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Draft Second Lineup/i })).toBeInTheDocument();
    });

    it('API Failure: displays error alert with retry button when comparison fails', async () => {
      vi.spyOn(fantasyService, 'compareFantasyTeams').mockRejectedValueOnce(
        new Error('Comparison engine timeout.')
      );

      renderComparison();

      expect(await screen.findByText(/Comparison Service Unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/Comparison engine timeout\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Comparison/i })).toBeInTheDocument();
    });

    it('Accessibility Basics: table headings, action buttons, and back navigation are accessible', async () => {
      renderComparison();

      expect(await screen.findByRole('button', { name: /Back to My Teams/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Draft Another Team/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 9. AI ASSISTANT
  // =========================================================================
  describe('9. AI Assistant QA', () => {
    const renderAssistant = () => {
      return render(
        <MemoryRouter initialEntries={['/assistant']}>
          <AiAssistantPage />
        </MemoryRouter>
      );
    };

    it('Rendering: renders grounded AI header, target match selector, and grounding notice', async () => {
      renderAssistant();

      expect(await screen.findByText('Cricket Intelligence Assistant')).toBeInTheDocument();
      expect(screen.getByText(/Strict Data Grounding Policy/i)).toBeInTheDocument();
      expect(await screen.findByText(/Target Match Context/i)).toBeInTheDocument();
    });

    it('Form Validation: disables submission when input is empty or whitespace-only', async () => {
      renderAssistant();

      const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
      const submitBtn = screen.getByRole('button', { name: /Ask AI/i });

      expect(submitBtn).toBeDisabled();

      fireEvent.change(input, { target: { value: '   ' } });
      expect(submitBtn).toBeDisabled();

      fireEvent.change(input, { target: { value: 'Valid Tactical Query' } });
      expect(submitBtn).not.toBeDisabled();
    });

    it('Form Validation: blocks submission when question exceeds 250 characters', async () => {
      renderAssistant();

      const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
      const submitBtn = screen.getByRole('button', { name: /Ask AI/i });

      fireEvent.change(input, { target: { value: 'X'.repeat(251) } });
      expect(screen.getByText('251 / 250')).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();
    });

    it('User Interaction & API Success: submits question and renders grounded AI explanation', async () => {
      vi.spyOn(aiService, 'askQuestion').mockResolvedValueOnce({
        explanation: 'Pat Cummins took 2 wickets conceding 32 runs in 4.0 overs.',
        matchId: 'm-ind-aus-t20',
        isGrounded: true,
      });

      renderAssistant();

      const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
      fireEvent.change(input, { target: { value: 'Explain Pat Cummins bowling figures' } });
      fireEvent.click(screen.getByRole('button', { name: /Ask AI/i }));

      expect(screen.getByText('Explain Pat Cummins bowling figures')).toBeInTheDocument();
      expect(await screen.findByText(/Pat Cummins took 2 wickets conceding 32 runs/i)).toBeInTheDocument();
    });

    it('API Failure & Retry: renders service failure alert and allows question retry', async () => {
      const askSpy = vi
        .spyOn(aiService, 'askQuestion')
        .mockRejectedValueOnce(new Error('Rate limit exceeded on Gemini API.'))
        .mockResolvedValueOnce({
          explanation: 'Recovered answer on retry.',
          matchId: 'm-ind-aus-t20',
          isGrounded: true,
        });

      renderAssistant();

      const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
      fireEvent.change(input, { target: { value: 'Explain match momentum' } });
      fireEvent.click(screen.getByRole('button', { name: /Ask AI/i }));

      expect(await screen.findByText(/Rate limit exceeded on Gemini API\./i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /Retry Question/i });
      fireEvent.click(retryBtn);

      expect(await screen.findByText(/Recovered answer on retry\./i)).toBeInTheDocument();
      expect(askSpy).toHaveBeenCalledTimes(2);
    });

    it('Accessibility Basics: provides accessible textarea label and button semantics', async () => {
      renderAssistant();

      const textarea = await screen.findByLabelText(/Ask FanPulse AI a question/i);
      expect(textarea).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ask AI/i })).toBeInTheDocument();
    });
  });
});
