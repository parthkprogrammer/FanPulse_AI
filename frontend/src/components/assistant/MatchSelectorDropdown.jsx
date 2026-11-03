import React from 'react';
import PropTypes from 'prop-types';
import { Trophy, ChevronDown, Check } from 'lucide-react';
import { Badge } from '../ui';

export const MatchSelectorDropdown = ({ matches = [], selectedMatchId, onSelectMatch }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-pitch-card border border-pitch-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cricket-gold/10 text-cricket-gold flex items-center justify-center border border-cricket-gold/20 flex-shrink-0">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Target Match Context
          </span>
          <span className="text-xs text-gray-300">
            Grounding AI analysis in verified scores
          </span>
        </div>
      </div>

      <div className="relative min-w-[260px] sm:min-w-[320px]">
        <select
          value={selectedMatchId}
          onChange={(e) => onSelectMatch(e.target.value)}
          aria-label="Select match for AI analysis"
          className="w-full appearance-none rounded-xl bg-pitch-elevated text-xs font-semibold text-white px-3.5 py-2.5 pr-9 border border-pitch-border hover:border-gray-500 focus:outline-none focus:border-cricket-gold transition-colors cursor-pointer"
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id} className="bg-pitch-dark text-white">
              {m.title} ({m.status})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

MatchSelectorDropdown.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedMatchId: PropTypes.string.isRequired,
  onSelectMatch: PropTypes.func.isRequired,
};

export default MatchSelectorDropdown;
