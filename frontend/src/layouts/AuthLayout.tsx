import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-pitch-dark text-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cricket-green-dark to-cricket-green flex items-center justify-center text-white shadow-xl shadow-cricket-green/30 group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              FanPulse <span className="text-cricket-green">AI</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-medium">
            Live Cricket & Fantasy Companion
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="bg-pitch-card border border-pitch-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cricket-green/10 rounded-full blur-3xl pointer-events-none" />
          <Outlet />
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-cricket-green transition-colors"
          >
            ← Back to Match Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

