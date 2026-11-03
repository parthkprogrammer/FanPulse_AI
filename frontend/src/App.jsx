import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Protection
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public & Main Pages
import DashboardPage from './pages/DashboardPage';
import MatchCenterPage from './pages/MatchCenterPage';
import MatchDetailPage from './pages/MatchDetailPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Pages
import MyTeamsPage from './pages/MyTeamsPage';
import FantasyCreatePage from './pages/FantasyCreatePage';
import FantasyComparePage from './pages/FantasyComparePage';
import AiAssistantPage from './pages/AiAssistantPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export const App = () => {
  return (
    <Routes>
      {/* Authentication Layout (Public) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main Application Layout */}
      <Route element={<MainLayout />}>
        {/* Root Redirect to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Cricket Match & Player Routes (Public) */}
        <Route path="/matches" element={<MatchCenterPage />} />
        <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />

        {/* Protected Fantasy League Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/fantasy/teams" element={<MyTeamsPage />} />
          <Route path="/my-teams" element={<Navigate to="/fantasy/teams" replace />} />
          <Route path="/fantasy/create" element={<FantasyCreatePage />} />
          <Route path="/fantasy/compare" element={<FantasyComparePage />} />
          <Route path="/assistant" element={<AiAssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Protected Admin Routes (Requires ROLE_ADMIN) */}
        <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
