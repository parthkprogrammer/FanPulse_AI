import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import DashboardPage from '../pages/DashboardPage';

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

describe('DashboardPage Component', () => {
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
