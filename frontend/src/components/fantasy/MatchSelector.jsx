import React from 'react';
import PropTypes from 'prop-types';
import { Trophy, Calendar } from 'lucide-react';
import { Badge } from '../ui';

export const MatchSelector = ({ matches = [], selectedMatchId, onSelectMatch }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
        <Trophy className="w-3.5 h-3.5 text-cricket-gold" />
        <span>Select Match Fixture</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {matches.map((m) => {
          const isSelected = m.id === selectedMatchId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMatch(m.id)}
              className={`p-3.5 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-pitch-elevated border-cricket-gold shadow-md shadow-cricket-gold/10'
                  : 'bg-pitch-surface/70 border-pitch-border hover:border-pitch-border/80 hover:bg-pitch-surface'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <Badge variant={m.status === 'LIVE' ? 'live' : 'neutral'} size="xs" dot={m.status === 'LIVE'}>
                    {m.status}
                  </Badge>
                  <span className="text-[10px] font-semibold text-gray-400">{m.format}</span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{m.title}</h4>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{m.venue}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-pitch-border flex items-center justify-between text-[11px]">
                <span className="text-cricket-gold font-bold">{m.team1.code} vs {m.team2.code}</span>
                <span className="text-gray-500 font-mono">#{m.id}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

MatchSelector.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      format: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      venue: PropTypes.string.isRequired,
      team1: PropTypes.object.isRequired,
      team2: PropTypes.object.isRequired,
    })
  ).isRequired,
  selectedMatchId: PropTypes.string,
  onSelectMatch: PropTypes.func.isRequired,
};

export default MatchSelector;
