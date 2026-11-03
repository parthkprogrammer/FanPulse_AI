import React from 'react';
import { Users, Plus, Shield, Award } from 'lucide-react';

export const MyTeamsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cricket-green" />
            <span>Fantasy Teams</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Build and manage your 11-player squad with deterministic points calculation
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark text-sm font-semibold transition-all shadow-md shadow-cricket-green/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
      </div>

      <div className="bg-pitch-card border border-pitch-border rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-pitch-elevated flex items-center justify-center mx-auto mb-4 text-cricket-green">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Fantasy Teams Created Yet</h3>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm mx-auto">
          Select an upcoming match to draft your dream XI, assign Captain (2x) and Vice-Captain (1.5x), and compete.
        </p>
      </div>
    </div>
  );
};

export default MyTeamsPage;

