import React from 'react';
import PropTypes from 'prop-types';

const ROLES = [
  { id: 'ALL', label: 'All Players', shortLabel: 'ALL' },
  { id: 'WICKET_KEEPER', label: 'Wicket-Keepers', shortLabel: 'WK' },
  { id: 'BATTER', label: 'Batters', shortLabel: 'BAT' },
  { id: 'ALL_ROUNDER', label: 'All-Rounders', shortLabel: 'AR' },
  { id: 'BOWLER', label: 'Bowlers', shortLabel: 'BOWL' },
];

export const RoleFilterTabs = ({
  activeRole = 'ALL',
  onSelectRole,
  playerPool = [],
  selectedPlayers = [],
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {ROLES.map((r) => {
        const isActive = activeRole === r.id;
        const totalCount =
          r.id === 'ALL'
            ? playerPool.length
            : playerPool.filter((p) => p.role === r.id).length;
        const selectedCount =
          r.id === 'ALL'
            ? selectedPlayers.length
            : selectedPlayers.filter((p) => p.role === r.id).length;

        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
              isActive
                ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
                : 'bg-pitch-surface text-gray-400 hover:text-white hover:bg-pitch-elevated border border-pitch-border'
            }`}
          >
            <span>{r.shortLabel}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive
                  ? 'bg-pitch-background/20 text-pitch-background'
                  : 'bg-pitch-card text-gray-500'
              }`}
            >
              {selectedCount}/{totalCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

RoleFilterTabs.propTypes = {
  activeRole: PropTypes.string.isRequired,
  onSelectRole: PropTypes.func.isRequired,
  playerPool: PropTypes.array,
  selectedPlayers: PropTypes.array,
};

export default RoleFilterTabs;
