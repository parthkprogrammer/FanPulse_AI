import React from 'react';
import PropTypes from 'prop-types';
import { Crown, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui';

export const CaptainViceCaptainModal = ({
  players = [],
  captainPlayerId,
  viceCaptainPlayerId,
  onSelectCaptain,
  onSelectViceCaptain,
}) => {
  const handleCaptainClick = (playerId) => {
    // If selecting current VC as C, automatically clear VC
    if (playerId === viceCaptainPlayerId) {
      onSelectViceCaptain('');
    }
    onSelectCaptain(playerId);
  };

  const handleViceCaptainClick = (playerId) => {
    // If selecting current C as VC, automatically clear C
    if (playerId === captainPlayerId) {
      onSelectCaptain('');
    }
    onSelectViceCaptain(playerId);
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-pitch-card border border-pitch-border">
      <div className="border-b border-pitch-border pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Crown className="w-4 h-4 text-cricket-gold" />
          <span>Assign Captain & Vice-Captain</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Captain scores <strong className="text-cricket-gold">2.0×</strong> fantasy points. Vice-Captain scores <strong className="text-cricket-green">1.5×</strong> points. Both must be unique players.
        </p>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {players.map((player) => {
          const isCaptain = player.id === captainPlayerId;
          const isViceCaptain = player.id === viceCaptainPlayerId;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                isCaptain
                  ? 'bg-amber-950/20 border-cricket-gold/60 ring-1 ring-cricket-gold/40'
                  : isViceCaptain
                  ? 'bg-emerald-950/20 border-cricket-green/60 ring-1 ring-cricket-green/40'
                  : 'bg-pitch-surface/60 border-pitch-border'
              }`}
            >
              {/* Player Detail */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-mono font-bold text-gray-400">
                  {player.teamCode}
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {player.name}
                </span>
                <Badge variant="neutral" size="xs">
                  {player.role === 'WICKET_KEEPER' ? 'WK' : player.role.slice(0, 4)}
                </Badge>
              </div>

              {/* Multiplier Pills */}
              <div className="flex items-center gap-2">
                {/* Captain (2x) Pill */}
                <button
                  type="button"
                  onClick={() => handleCaptainClick(player.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCaptain
                      ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/20'
                      : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
                  }`}
                >
                  (C) 2×
                </button>

                {/* Vice-Captain (1.5x) Pill */}
                <button
                  type="button"
                  onClick={() => handleViceCaptainClick(player.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isViceCaptain
                      ? 'bg-cricket-green text-pitch-background shadow-md shadow-cricket-green/20'
                      : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
                  }`}
                >
                  (VC) 1.5×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Feedback Badge */}
      <div className="p-3 rounded-xl bg-pitch-surface border border-pitch-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Captain:</span>
          {captainPlayerId ? (
            <span className="font-bold text-cricket-gold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              {players.find((p) => p.id === captainPlayerId)?.name} (2×)
            </span>
          ) : (
            <span className="text-amber-400 font-medium">None selected</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Vice-Captain:</span>
          {viceCaptainPlayerId ? (
            <span className="font-bold text-cricket-green flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {players.find((p) => p.id === viceCaptainPlayerId)?.name} (1.5×)
            </span>
          ) : (
            <span className="text-amber-400 font-medium">None selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

CaptainViceCaptainModal.propTypes = {
  players: PropTypes.array.isRequired,
  captainPlayerId: PropTypes.string,
  viceCaptainPlayerId: PropTypes.string,
  onSelectCaptain: PropTypes.func.isRequired,
  onSelectViceCaptain: PropTypes.func.isRequired,
};

export default CaptainViceCaptainModal;
