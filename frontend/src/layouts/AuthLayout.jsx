import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pitch-dark px-4 sm:px-6 lg:px-8 py-12">
      {/* Return to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-cricket-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to FanPulse AI</span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-pitch-card border border-pitch-border rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cricket-green to-emerald-400 flex items-center justify-center shadow-lg shadow-cricket-green/20 mb-3">
            <Activity className="w-7 h-7 text-pitch-dark stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Fan<span className="text-cricket-green">Pulse</span> AI
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to access contextual cricket analytics & fantasy predictions
          </p>
        </div>

        <Outlet />
      </div>

      {/* Footer Note */}
      <p className="mt-8 text-center text-xs text-gray-500">
        Secured with Supabase Auth &bull; 100% Verified Match Statistics
      </p>
    </div>
  );
};

export default AuthLayout;

