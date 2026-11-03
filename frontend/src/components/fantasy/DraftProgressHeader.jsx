import React from 'react';
import PropTypes from 'prop-types';
import { Users, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Badge, Button } from '../ui';

export const DraftProgressHeader = ({
  selectedPlayers = [],
  teamCodes = [],
  onResetSquad,
}) => {
  const selectedCount = selectedPlayers.length;
  const isFull = selectedCount === 11;

  // Role breakdowns
  const wkCount = selectedPlayers.filter((p) => p.role === 'WICKET_KEEPER').length;
  const batCount = selectedPlayers.filter((p) => p.role === 'BATTER').length;
  const arCount = selectedPlayers.filter((p) => p.role === 'ALL_ROUNDER').length;
  const bowlCount = selectedPlayers.filter((p) => p.role === 'BOWLER').length;

  // Team breakdowns
  const team1Code = teamCodes[0] || 'Team 1';
  const team2Code = teamCodes[1] || 'Team 2';
  const team1Count = selectedPlayers.filter((p) => p.teamCode === team1Code).length;
  const team2Count = selectedPlayers.filter((p) => p.teamCode === team2Code).length;
  const bothTeamsRepresented = team1Count > 0 && team2Count > 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-pitch-card border border-pitch-border space-y-4 shadow-lg shadow-black/20">
      {/* Top Row: Counter & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pitch-elevated border border-pitch-border flex items-center justify-center text-cricket-gold font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">
                {selectedCount} <span className="text-gray-400 font-normal text-sm">/ 11 Players</span>
              </span>
              {isFull ? (
                <Badge variant="success" size="xs">
                  SQUAD FULL
                </Badge>
              ) : (
                <Badge variant="neutral" size="xs">
                  {11 - selectedCount} NEEDED
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Draft exactly 11 players across both teams following role constraints
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onResetSquad}
            leftIcon={RotateCcw}
            className="text-xs text-gray-400 hover:text-white self-start sm:self-auto"
          >
            Clear Lineup
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-pitch-surface overflow-hidden border border-pitch-border">
        <div
          className={`h-full transition-all duration-300 ${
            isFull ? 'bg-cricket-green' : 'bg-cricket-gold'
          }`}
          style={{ width: `${Math.min((selectedCount / 11) * 100, 100)}%` }}
        />
      </div>

      {/* Requirements Checklist Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-pitch-border/60">
        {/* Wicket-Keeper (Min 1) */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
          wkCount >= 1 ? 'bg-pitch-surface border-cricket-green/30 text-white' : 'bg-pitch-surface/40 border-pitch-border text-gray-400'
        }`}>
          <span className="font-semibold">WK (Min 1):</span>
          <span className="flex items-center gap-1 font-mono font-bold">
            {wkCount}
            {wkCount >= 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cricket-green" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
        </div>

        {/* Batter (Min 1) */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
          batCount >= 1 ? 'bg-pitch-surface border-cricket-green/30 text-white' : 'bg-pitch-surface/40 border-pitch-border text-gray-400'
        }`}>
          <span className="font-semibold">BAT (Min 1):</span>
          <span className="flex items-center gap-1 font-mono font-bold">
            {batCount}
            {batCount >= 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cricket-green" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
        </div>

        {/* All-Rounder (Min 1) */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
          arCount >= 1 ? 'bg-pitch-surface border-cricket-green/30 text-white' : 'bg-pitch-surface/40 border-pitch-border text-gray-400'
        }`}>
          <span className="font-semibold">AR (Min 1):</span>
          <span className="flex items-center gap-1 font-mono font-bold">
            {arCount}
            {arCount >= 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cricket-green" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
        </div>

        {/* Bowler (Min 1) */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
          bowlCount >= 1 ? 'bg-pitch-surface border-cricket-green/30 text-white' : 'bg-pitch-surface/40 border-pitch-border text-gray-400'
        }`}>
          <span className="font-semibold">BOWL (Min 1):</span>
          <span className="flex items-center gap-1 font-mono font-bold">
            {bowlCount}
            {bowlCount >= 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cricket-green" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
        </div>

        {/* Both Teams Check */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between col-span-2 sm:col-span-1 ${
          bothTeamsRepresented ? 'bg-pitch-surface border-cricket-green/30 text-white' : 'bg-pitch-surface/40 border-pitch-border text-gray-400'
        }`}>
          <span className="font-semibold truncate">Teams ({team1Code}/{team2Code}):</span>
          <span className="flex items-center gap-1 font-mono font-bold">
            {team1Count}:{team2Count}
            {bothTeamsRepresented ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cricket-green" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

DraftProgressHeader.propTypes = {
  selectedPlayers: PropTypes.array.isRequired,
  teamCodes: PropTypes.arrayOf(PropTypes.string),
  onResetSquad: PropTypes.func.isRequired,
};

export default DraftProgressHeader;
