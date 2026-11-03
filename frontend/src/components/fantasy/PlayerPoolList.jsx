import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Check, UserMinus } from 'lucide-react';
import { Badge, Button } from '../ui';

export const PlayerPoolList = ({
  players = [],
  selectedPlayers = [],
  onTogglePlayer,
}) => {
  const selectedIds = new Set(selectedPlayers.map((p) => p.id));
  const isSquadFull = selectedPlayers.length >= 11;

  if (players.length === 0) {
    return (
      <div className="p-8 text-center bg-pitch-card rounded-2xl border border-pitch-border">
        <p className="text-xs text-gray-400">No players found in this category.</p>
      </div>
    );
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'WICKET_KEEPER':
        return 'warning';
      case 'BATTER':
        return 'gold';
      case 'ALL_ROUNDER':
        return 'success';
      case 'BOWLER':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {players.map((player) => {
        const isSelected = selectedIds.has(player.id);
        const canAdd = !isSelected && !isSquadFull;

        return (
          <div
            key={player.id}
            className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
              isSelected
                ? 'bg-pitch-elevated/80 border-cricket-green/50 ring-1 ring-cricket-green/30'
                : 'bg-pitch-card border-pitch-border hover:border-pitch-border/80'
            }`}
          >
            {/* Player Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                  player.teamCode === 'IND'
                    ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                }`}
              >
                {player.teamCode}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {player.name}
                  </h4>
                  <Badge variant={getRoleBadgeVariant(player.role)} size="xs">
                    {player.role === 'WICKET_KEEPER' ? 'WK' : player.role.slice(0, 4)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                  <span>Form: {player.recentForm || 'N/A'}</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-gray-300">{player.credits} Cr</span>
                </div>
              </div>
            </div>

            {/* Selection Action Button */}
            <div>
              {isSelected ? (
                <Button
                  variant="success"
                  size="xs"
                  onClick={() => onTogglePlayer(player)}
                  leftIcon={Check}
                  className="text-xs"
                  aria-label={`Remove ${player.name}`}
                >
                  Selected
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => onTogglePlayer(player)}
                  disabled={!canAdd}
                  leftIcon={Plus}
                  className="text-xs"
                  aria-label={isSquadFull ? `Squad full for ${player.name}` : `Pick ${player.name}`}
                >
                  {isSquadFull ? 'Squad Full' : 'Pick'}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

PlayerPoolList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      teamCode: PropTypes.string.isRequired,
      credits: PropTypes.number,
      recentForm: PropTypes.string,
    })
  ).isRequired,
  selectedPlayers: PropTypes.array.isRequired,
  onTogglePlayer: PropTypes.func.isRequired,
};

export default PlayerPoolList;
