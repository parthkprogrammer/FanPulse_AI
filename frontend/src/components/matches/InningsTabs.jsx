import React from 'react';
import PropTypes from 'prop-types';

export const InningsTabs = ({
  inningsList = [],
  activeInningsNumber = 1,
  onSelectInnings,
}) => {
  if (!inningsList || inningsList.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-pitch-border">
      {inningsList.map((inn) => {
        const isActive = activeInningsNumber === inn.inningsNumber;
        return (
          <button
            key={inn.inningsNumber}
            onClick={() => onSelectInnings(inn.inningsNumber)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 whitespace-nowrap ${
              isActive
                ? 'border-cricket-gold text-white bg-pitch-elevated/70'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-pitch-surface/40'
            }`}
          >
            <span>
              {inn.inningsNumber === 1 ? '1st Innings' : `${inn.inningsNumber}nd Innings`} ({inn.battingTeamCode || inn.battingTeam})
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isActive ? 'bg-cricket-gold/20 text-cricket-gold' : 'bg-pitch-surface text-gray-400'
              }`}
            >
              {inn.totalRuns}/{inn.totalWickets} ({inn.oversCompleted} ov)
            </span>
          </button>
        );
      })}
    </div>
  );
};

InningsTabs.propTypes = {
  inningsList: PropTypes.arrayOf(
    PropTypes.shape({
      inningsNumber: PropTypes.number.isRequired,
      battingTeam: PropTypes.string.isRequired,
      battingTeamCode: PropTypes.string,
      totalRuns: PropTypes.number.isRequired,
      totalWickets: PropTypes.number.isRequired,
      oversCompleted: PropTypes.number.isRequired,
    })
  ).isRequired,
  activeInningsNumber: PropTypes.number.isRequired,
  onSelectInnings: PropTypes.func.isRequired,
};

export default InningsTabs;
