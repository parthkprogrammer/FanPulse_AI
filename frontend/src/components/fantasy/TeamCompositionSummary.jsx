import React from 'react';
import PropTypes from 'prop-types';
import { X, Crown, ShieldCheck, Shield } from 'lucide-react';
import { Card, Badge } from '../ui';

export const TeamCompositionSummary = ({
  players = [],
  captainPlayerId,
  viceCaptainPlayerId,
  onRemovePlayer,
}) => {
  if (players.length === 0) {
    return (
      <Card variant="default" padding="md" className="border-pitch-border text-center py-6">
        <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
        <p className="text-xs text-gray-400">Your fantasy lineup is currently empty.</p>
        <p className="text-[11px] text-gray-500 mt-1">Pick players from the roster to begin assembling your squad.</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-3.5 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Drafted Lineup ({players.length}/11)
        </h4>
        <span className="text-[11px] text-gray-400 font-mono">
          IND: {players.filter((p) => p.teamCode === 'IND').length} | AUS: {players.filter((p) => p.teamCode === 'AUS').length}
        </span>
      </div>

      <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
        {players.map((p) => {
          const isCaptain = p.id === captainPlayerId;
          const isViceCaptain = p.id === viceCaptainPlayerId;

          return (
            <div
              key={p.id}
              className="p-2.5 rounded-lg bg-pitch-surface border border-pitch-border flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold text-gray-400 bg-pitch-card px-1.5 py-0.5 rounded border border-pitch-border">
                  {p.teamCode}
                </span>
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
                <span className="text-[10px] text-gray-400">
                  ({p.role === 'WICKET_KEEPER' ? 'WK' : p.role.slice(0, 4)})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isCaptain && (
                  <Badge variant="gold" size="xs" className="flex items-center gap-0.5">
                    <Crown className="w-3 h-3" /> C (2×)
                  </Badge>
                )}
                {isViceCaptain && (
                  <Badge variant="success" size="xs" className="flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> VC (1.5×)
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => onRemovePlayer(p)}
                  className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

TeamCompositionSummary.propTypes = {
  players: PropTypes.array.isRequired,
  captainPlayerId: PropTypes.string,
  viceCaptainPlayerId: PropTypes.string,
  onRemovePlayer: PropTypes.func.isRequired,
};

export default TeamCompositionSummary;
