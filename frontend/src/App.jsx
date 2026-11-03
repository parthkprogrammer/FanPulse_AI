import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import MatchCenterPage from './pages/MatchCenterPage';
import MyTeamsPage from './pages/MyTeamsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

export const App = () => {
  return (
    <Routes>
      {/* Main Application Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/matches" element={<MatchCenterPage />} />
        <Route path="/my-teams" element={<MyTeamsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authentication Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
};

export default App;

