import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Minus, Crown, ShieldCheck } from 'lucide-react';
import { Card, Badge } from '../ui';

export const PlayerComparisonTable = ({
  playerComparison = [],
  team1Name = 'Team 1',
  team2Name = 'Team 2',
  filter = 'ALL',
}) => {
  const filteredPlayers = playerComparison.filter((p) => {
    if (filter === 'DIFFERENTIALS') {
      return p.status === 'TEAM_1_EXCLUSIVE' || p.status === 'TEAM_2_EXCLUSIVE';
    }
    if (filter === 'COMMON') {
      return p.status === 'COMMON';
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMMON':
        return (
          <Badge variant="neutral" size="xs">
            COMMON PICK
          </Badge>
        );
      case 'TEAM_1_EXCLUSIVE':
        return (
          <Badge variant="success" size="xs">
            TEAM 1 ONLY
          </Badge>
        );
      case 'TEAM_2_EXCLUSIVE':
        return (
          <Badge variant="gold" size="xs">
            TEAM 2 ONLY
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Player-by-Player Head-to-Head Breakdown
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Side-by-side points comparison with differential highlights
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 font-bold">
          {filteredPlayers.length} {filteredPlayers.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-pitch-surface/60 text-gray-400 uppercase font-semibold text-[11px] border-b border-pitch-border">
            <tr>
              <th className="py-3 px-4 min-w-[160px]">Player</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-3 text-right">{team1Name}</th>
              <th className="py-3 px-3 text-right">{team2Name}</th>
              <th className="py-3 px-4 text-right">Differential</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-border text-gray-300">
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No players match the selected filter.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((p) => {
                const diff = p.difference;
                const isTeam1Higher = diff > 0;
                const isTeam2Higher = diff < 0;
                const isTied = diff === 0;

                return (
                  <tr
                    key={p.playerId}
                    className={`hover:bg-pitch-elevated/40 transition-colors ${
                      p.status === 'TEAM_1_EXCLUSIVE'
                        ? 'bg-cricket-green/5'
                        : p.status === 'TEAM_2_EXCLUSIVE'
                        ? 'bg-cricket-gold/5'
                        : ''
                    }`}
                  >
                    {/* Player Name and Role */}
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-pitch-surface px-1.5 py-0.5 rounded border border-pitch-border">
                          {p.teamCode}
                        </span>
                        <div>
                          <Link
                            to={`/players/${p.playerId}`}
                            className="hover:text-cricket-green transition-colors font-bold block"
                          >
                            {p.playerName}
                          </Link>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {p.role === 'WICKET_KEEPER' ? 'Wicket-Keeper' : p.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-2">{getStatusBadge(p.status)}</td>

                    {/* Team 1 Score & Role */}
                    <td className="py-3 px-3 text-right">
                      {p.team1Points !== null ? (
                        <div>
                          <span className="font-bold text-white text-sm">
                            {p.team1Points.toFixed(1)}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-mono">
                            {p.team1Designation}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Team 2 Score & Role */}
                    <td className="py-3 px-3 text-right">
                      {p.team2Points !== null ? (
                        <div>
                          <span className="font-bold text-white text-sm">
                            {p.team2Points.toFixed(1)}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-mono">
                            {p.team2Designation}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Differential Column */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-xs">
                        {isTeam1Higher && (
                          <span className="text-cricket-green flex items-center">
                            <ArrowUp className="w-3 h-3" /> +{diff.toFixed(1)}
                          </span>
                        )}
                        {isTeam2Higher && (
                          <span className="text-cricket-gold flex items-center">
                            <ArrowDown className="w-3 h-3" /> {diff.toFixed(1)}
                          </span>
                        )}
                        {isTied && (
                          <span className="text-gray-400 flex items-center">
                            <Minus className="w-3 h-3" /> 0.0
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

PlayerComparisonTable.propTypes = {
  playerComparison: PropTypes.array.isRequired,
  team1Name: PropTypes.string,
  team2Name: PropTypes.string,
  filter: PropTypes.string,
};

export default PlayerComparisonTable;
