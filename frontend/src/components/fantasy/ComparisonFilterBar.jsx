import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRightLeft, Filter, Lock } from 'lucide-react';

export const ComparisonFilterBar = ({
  availableTeams = [],
  team1Id,
  team2Id,
  onSelectTeam1,
  onSelectTeam2,
  activeFilter = 'ALL',
  onSelectFilter,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-4">
      {/* Upper Row: Team Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Team 1 Selector */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cricket-green" />
            <span>Select Team 1</span>
          </label>
          <select
            value={team1Id}
            onChange={(e) => onSelectTeam1(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-pitch-surface border border-pitch-border rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cricket-green font-medium"
          >
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id} disabled={t.id === team2Id}>
                {t.teamName || t.name} ({t.totalPoints || 0} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Center Swap / VS Badge */}
        <div className="flex items-center justify-center pt-2 md:pt-4">
          <div className="w-8 h-8 rounded-full bg-pitch-elevated border border-pitch-border flex items-center justify-center text-cricket-gold">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Team 2 Selector */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cricket-gold" />
            <span>Select Team 2</span>
          </label>
          <select
            value={team2Id}
            onChange={(e) => onSelectTeam2(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-pitch-surface border border-pitch-border rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cricket-gold font-medium"
          >
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id} disabled={t.id === team1Id}>
                {t.teamName || t.name} ({t.totalPoints || 0} pts)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lower Row: Table Filter Pills & Privacy Assurance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pitch-border/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Lineups:
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Players' },
              { id: 'DIFFERENTIALS', label: 'Differentials Only' },
              { id: 'COMMON', label: 'Common Picks' },
            ].map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelectFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cricket-gold text-pitch-background shadow-sm shadow-cricket-gold/10'
                      : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Lock className="w-3 h-3 text-cricket-gold" />
          <span>Privacy Enforced (Own Squads Only)</span>
        </div>
      </div>
    </div>
  );
};

ComparisonFilterBar.propTypes = {
  availableTeams: PropTypes.array.isRequired,
  team1Id: PropTypes.string.isRequired,
  team2Id: PropTypes.string.isRequired,
  onSelectTeam1: PropTypes.func.isRequired,
  onSelectTeam2: PropTypes.func.isRequired,
  activeFilter: PropTypes.string.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
};

export default ComparisonFilterBar;
