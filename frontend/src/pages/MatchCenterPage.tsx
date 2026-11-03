import React from 'react';
import { Calendar, Filter, Activity } from 'lucide-react';

export const MatchCenterPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-cricket-live animate-pulse" />
            Match Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse international and domestic cricket fixtures across all formats.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-pitch-card border border-pitch-border rounded-xl p-1 text-xs">
          <button className="px-3 py-1.5 rounded-lg bg-cricket-green text-white font-medium">
            All Matches
          </button>
          <button className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-pitch-elevated">
            Live
          </button>
          <button className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-pitch-elevated">
            Upcoming
          </button>
          <button className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-pitch-elevated">
            Completed
          </button>
        </div>
      </div>

      {/* Placeholder Match Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-pitch-card border border-pitch-border rounded-xl p-5 space-y-4 hover:border-cricket-green/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold uppercase">
              T20 • Match 1
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Scheduled
            </span>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base">India</span>
              <span className="text-xs text-gray-400">Yet to bat</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base">Australia</span>
              <span className="text-xs text-gray-400">Yet to bat</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 border-t border-pitch-border pt-3 flex items-center justify-between">
            <span>Wankhede Stadium, Mumbai</span>
            <span className="text-cricket-green font-semibold">Ready for Draft</span>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-pitch-elevated/50 border border-pitch-border rounded-xl p-4 text-xs text-gray-400 text-center">
        <Filter className="w-4 h-4 mx-auto mb-1 text-gray-400" />
        Backend match endpoints will connect to live database feeds in Milestone 6.
      </div>
    </div>
  );
};

export default MatchCenterPage;

