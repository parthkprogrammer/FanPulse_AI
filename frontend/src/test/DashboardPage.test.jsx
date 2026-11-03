import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import DashboardPage from '../pages/DashboardPage';
import { dashboardService, DEMO_DASHBOARD_DATA } from '../services/dashboardService';

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

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage Component — QA Verification Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Data Display', () => {
    it('renders loading skeleton and then resolves with dashboard data', async () => {
      renderDashboard();

      // After async service resolution, check venue and teams
      await waitFor(() => {
        expect(screen.getByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      });

      // Verify scores and situation
      expect(screen.getByText('184/4')).toBeInTheDocument();
      expect(screen.getByText('178/8')).toBeInTheDocument();
      expect(screen.getByText(/India need 5 runs in 10 balls/i)).toBeInTheDocument();

      // Verify prominent DEMO DATA badges
      const demoBadges = screen.getAllByText(/DEMO DATA/i);
      expect(demoBadges.length).toBeGreaterThan(0);

      // Verify Top Performers
      expect(screen.getByText('Virat Kohli')).toBeInTheDocument();
      expect(screen.getByText('+112 pts')).toBeInTheDocument();
      expect(screen.getByText('Jasprit Bumrah')).toBeInTheDocument();

      // Verify User Fantasy Summary
      expect(screen.getByText('Men in Blue Titans')).toBeInTheDocument();
      expect(screen.getAllByText(/842 pts/i).length).toBeGreaterThan(0);

      // Verify AI insights
      expect(screen.getByText(/AI Match Intelligence/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore AI Assistant/i)).toBeInTheDocument();
    });
  });

  describe('2. API Failure & Retry Recovery', () => {
    it('displays error empty state when telemetry feed fails and recovers on retry', async () => {
      const getSpy = vi
        .spyOn(dashboardService, 'getDashboardData')
        .mockRejectedValueOnce(new Error('Connection timeout to cricket scoring feeds.'))
        .mockResolvedValueOnce(DEMO_DASHBOARD_DATA);

      renderDashboard();

      // Verify Error state
      expect(await screen.findByText(/Telemetry Feed Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Connection timeout to cricket scoring feeds\./i)).toBeInTheDocument();

      // Click Retry
      const retryBtn = screen.getByRole('button', { name: /retry loading feed/i });
      fireEvent.click(retryBtn);

      // Should recover
      expect(await screen.findByText(/Melbourne Cricket Ground/i)).toBeInTheDocument();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('3. Empty State Handling', () => {
    it('renders empty fixtures state when service returns no match data', async () => {
      vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValueOnce(null);

      renderDashboard();

      expect(await screen.findByText(/No Cricket Fixtures Available/i)).toBeInTheDocument();
      expect(
        screen.getByText(/there are currently no active or scheduled matches in the database/i)
      ).toBeInTheDocument();
    });
  });

  describe('4. Accessibility Basics', () => {
    it('provides accessible headings, buttons, and semantic landmarks', async () => {
      renderDashboard();

      await screen.findByText(/Melbourne Cricket Ground/i);

      // Verify accessible headings and links
      expect(screen.getByRole('heading', { level: 3, name: /AI Match Intelligence/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore ai assistant/i })).toBeInTheDocument();
    });
  });
});
