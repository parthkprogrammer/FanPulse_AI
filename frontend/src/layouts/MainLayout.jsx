import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Activity, Trophy, Users, Bot, Menu, X, LogIn } from 'lucide-react';

export const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Match Center', path: '/matches', icon: Trophy },
    { name: 'My Teams', path: '/my-teams', icon: Users },
  ];

  const activeLinkClass = 'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-cricket-green/10 text-cricket-green border border-cricket-green/30';
  const inactiveLinkClass = 'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-pitch-elevated transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-pitch-dark text-gray-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-pitch-card/90 backdrop-blur-md border-b border-pitch-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cricket-green to-emerald-400 flex items-center justify-center shadow-lg shadow-cricket-green/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-pitch-dark stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Fan<span className="text-cricket-green">Pulse</span>
                  </span>
                  <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-cricket-gold/10 text-cricket-gold border border-cricket-gold/30">
                    AI
                  </span>
                </div>
              </Link>

              {/* Demo Mode Indicator */}
              <div className="hidden md:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-full bg-pitch-elevated text-xs font-medium text-gray-300 border border-pitch-border">
                <span className="inline-flex h-2 w-2 rounded-full bg-cricket-gold"></span>
                <span>Frontend Demo Mode</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Auth CTA & AI Assistant Quick Action */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-elevated text-xs font-medium text-cricket-gold border border-cricket-gold/20">
                <Bot className="w-3.5 h-3.5" />
                <span>Gemini Ready</span>
              </div>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark transition-all shadow-md shadow-cricket-green/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-pitch-elevated focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-pitch-card border-b border-pitch-border px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-pitch-border flex items-center justify-between">
              <span className="text-xs text-gray-400">Supabase & Gemini Demo Preview</span>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-cricket-green text-pitch-dark"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-pitch-card border-t border-pitch-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200">FanPulse AI</span>
            <span>&copy; {new Date().getFullYear()} — Contextual Cricket Fantasy Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Supabase &bull; React &bull; Tailwind &bull; Recharts &bull; Gemini API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

