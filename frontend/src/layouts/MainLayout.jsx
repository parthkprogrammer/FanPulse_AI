import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Trophy,
  Users,
  Bot,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, signOut, logout, toggleDemoAuth } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (signOut) {
      signOut();
    } else if (logout) {
      logout();
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Matches', path: '/matches', icon: Trophy },
    { name: 'Fantasy', path: '/fantasy/teams', icon: Users },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
  ];

  if (isAuthenticated && user?.role === 'ROLE_ADMIN') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const activeLinkClass =
    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-cricket-green/10 text-cricket-green border border-cricket-green/30';
  const inactiveLinkClass =
    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-pitch-elevated transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-pitch-dark text-gray-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-pitch-card/90 backdrop-blur-md border-b border-pitch-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Status Badge */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 group">
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
              <div className="hidden lg:flex items-center ml-3">
                <Badge variant="gold" size="xs" dot>
                  Demo Mode
                </Badge>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Session & CTA Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Quick Auth Simulation Toggle for testing protected routes */}
              <button
                type="button"
                onClick={toggleDemoAuth}
                title="Toggle authenticated state to test protected routes"
                className="text-[11px] px-2 py-1 rounded bg-pitch-elevated hover:bg-pitch-border text-gray-400 hover:text-white border border-pitch-border transition-colors"
              >
                {isAuthenticated ? 'Simulate Guest' : 'Simulate Auth'}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-pitch-border">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-pitch-elevated text-xs font-medium text-white transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-cricket-green/20 text-cricket-green flex items-center justify-center font-bold">
                      {user?.displayName ? user.displayName[0] : 'U'}
                    </div>
                    <span className="hidden xl:inline">{user?.displayName || 'Profile'}</span>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-1.5 text-gray-400 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="primary" size="sm" leftIcon={LogIn}>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center gap-2">
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 mt-2 border-t border-pitch-border flex items-center justify-between">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-white"
                  >
                    <User className="w-4 h-4 text-cricket-green" />
                    <span>{user?.displayName || 'My Profile'}</span>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => {
                      toggleDemoAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-cricket-gold"
                  >
                    Simulate Auth
                  </button>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" leftIcon={LogIn}>
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
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
            <span className="text-gray-400">React 18 &bull; Tailwind CSS &bull; Supabase &bull; Recharts &bull; Gemini API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
