import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Trophy, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-pitch-card via-pitch-elevated to-pitch-card border border-pitch-border p-6 md:p-10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cricket-green/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cricket-green/10 border border-cricket-green/30 text-cricket-green text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Cricket Companion
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            One Unified Platform for <span className="text-cricket-green">Live Cricket</span> & <span className="text-cricket-gold">Fantasy Strategy</span>.
          </h1>
          
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            Eliminate app-switching fatigue. Track live match scorecards, explore deep player statistics, draft 11-player fantasy teams with deterministic scoring, and receive grounded AI match explanations.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/matches"
              className="px-5 py-2.5 bg-cricket-green hover:bg-cricket-green-dark text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-cricket-green/25"
            >
              Explore Live Matches
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/my-teams"
              className="px-5 py-2.5 bg-pitch-card hover:bg-pitch-elevated border border-pitch-border text-gray-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-cricket-gold" />
              My Fantasy Teams
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Center Pillar */}
        <div className="bg-pitch-card border border-pitch-border rounded-xl p-6 space-y-3 hover:border-cricket-green/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-cricket-live flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Live Match Dashboard</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Real-time ball-by-ball scorecards, overs, wickets, and fall-of-wicket timelines across T20, ODI, and Test fixtures.
          </p>
          <Link
            to="/matches"
            className="text-xs font-semibold text-cricket-green hover:underline inline-flex items-center gap-1 pt-1"
          >
            Browse Fixtures →
          </Link>
        </div>

        {/* Fantasy Engine Pillar */}
        <div className="bg-pitch-card border border-pitch-border rounded-xl p-6 space-y-3 hover:border-cricket-gold/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-cricket-gold flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Fantasy Team Management</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Draft 11-player squads adhering to role balance (WK, BAT, AR, BOWL). Enjoy deterministic backend scoring with Captain (2x) boosts.
          </p>
          <Link
            to="/my-teams"
            className="text-xs font-semibold text-cricket-gold hover:underline inline-flex items-center gap-1 pt-1"
          >
            Manage Teams →
          </Link>
        </div>

        {/* Grounded AI Explanations Pillar */}
        <div className="bg-pitch-card border border-pitch-border rounded-xl p-6 space-y-3 hover:border-cricket-green/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-cricket-green flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Grounded AI Explainer</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Natural-language match situation narratives derived strictly from verified match data. Zero hallucinated stats or betting advice.
          </p>
          <Link
            to="/matches"
            className="text-xs font-semibold text-cricket-green hover:underline inline-flex items-center gap-1 pt-1"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

