import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { toggleMobileMenu } from '@/features/ui/uiSlice';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-cricket-green font-semibold border-b-2 border-cricket-green'
      : 'text-gray-300 hover:text-white transition-colors';
  };

  return (
    <div className="min-h-screen bg-pitch-dark text-gray-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-pitch-dark/90 border-b border-pitch-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cricket-green-dark to-cricket-green flex items-center justify-center text-white shadow-lg shadow-cricket-green/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                    FanPulse <span className="text-cricket-green">AI</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block -mt-1 font-medium">
                    Cricket & Fantasy
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <Link to="/" className={`py-5 ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/matches" className={`py-5 flex items-center gap-1.5 ${isActive('/matches')}`}>
                <Activity className="w-4 h-4 text-cricket-live animate-pulse" />
                Match Center
              </Link>
              <Link to="/my-teams" className={`py-5 flex items-center gap-1.5 ${isActive('/my-teams')}`}>
                <Trophy className="w-4 h-4 text-cricket-gold" />
                My Teams
              </Link>
            </nav>

            {/* User Profile / Auth Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white block">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-gray-400 block flex items-center justify-end gap-1">
                      {user.role === 'ROLE_ADMIN' ? (
                        <span className="text-cricket-gold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        'Cricket Fan'
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => dispatch(logout())}
                    title="Log Out"
                    className="p-2 rounded-lg bg-pitch-card hover:bg-pitch-elevated text-gray-300 hover:text-red-400 border border-pitch-border transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-cricket-green-dark hover:bg-cricket-green rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-cricket-green/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="p-2 rounded-lg bg-pitch-card text-gray-300 hover:text-white border border-pitch-border"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-pitch-card border-b border-pitch-border px-4 pt-3 pb-5 space-y-3">
            <Link
              to="/"
              onClick={() => dispatch(toggleMobileMenu())}
              className="block py-2 text-base font-medium text-gray-200 hover:text-cricket-green"
            >
              Dashboard
            </Link>
            <Link
              to="/matches"
              onClick={() => dispatch(toggleMobileMenu())}
              className="block py-2 text-base font-medium text-gray-200 hover:text-cricket-green"
            >
              Match Center
            </Link>
            <Link
              to="/my-teams"
              onClick={() => dispatch(toggleMobileMenu())}
              className="block py-2 text-base font-medium text-gray-200 hover:text-cricket-green"
            >
              My Fantasy Teams
            </Link>

            <div className="pt-3 border-t border-pitch-border">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.displayName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      dispatch(toggleMobileMenu());
                    }}
                    className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/10"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => dispatch(toggleMobileMenu())}
                    className="text-center py-2 text-sm text-gray-200 bg-pitch-elevated rounded-lg border border-pitch-border"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => dispatch(toggleMobileMenu())}
                    className="text-center py-2 text-sm text-white bg-cricket-green-dark rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-pitch-card border-t border-pitch-border py-8 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-gray-300">
            FanPulse AI — Cricket-Only, AI-Powered Live Sports & Fantasy Companion
          </p>
          <p>
            Match scores and player statistics are grounded in application data. Free-to-play fantasy platform.
          </p>
          <p className="text-gray-400">© 2026 FanPulse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

