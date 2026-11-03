import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Radio, Filter } from 'lucide-react';
import { Card, Badge } from '../ui';

export const BallTimeline = ({ events = [] }) => {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'BOUNDARIES', 'WICKETS'

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'BOUNDARIES') return ev.isBoundaryFour || ev.isBoundarySix;
    if (filterType === 'WICKETS') return ev.isWicket;
    return true;
  });

  const getBallBadge = (ev) => {
    if (ev.isWicket) {
      return (
        <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs font-mono">
          W
        </span>
      );
    }
    if (ev.isBoundarySix) {
      return (
        <span className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs font-mono shadow-sm shadow-purple-500/10">
          6
        </span>
      );
    }
    if (ev.isBoundaryFour) {
      return (
        <span className="w-7 h-7 rounded-full bg-cricket-green/20 text-cricket-green border border-cricket-green/40 flex items-center justify-center font-bold text-xs font-mono">
          4
        </span>
      );
    }
    if (ev.runsBatter === 0 && ev.runsExtras === 0) {
      return (
        <span className="w-7 h-7 rounded-full bg-pitch-elevated text-gray-400 border border-pitch-border flex items-center justify-center font-bold text-xs font-mono">
          &bull;
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-pitch-surface text-gray-200 border border-pitch-border flex items-center justify-center font-semibold text-xs font-mono">
        {ev.runsBatter + ev.runsExtras}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-pitch-card rounded-2xl border border-pitch-border">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cricket-gold animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Ball-by-Ball Live Timeline
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-cricket-gold text-pitch-background'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            All Balls
          </button>
          <button
            onClick={() => setFilterType('BOUNDARIES')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterType === 'BOUNDARIES'
                ? 'bg-cricket-green text-pitch-background'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            Boundaries Only
          </button>
          <button
            onClick={() => setFilterType('WICKETS')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterType === 'WICKETS'
                ? 'bg-red-500 text-white'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            Wickets
          </button>
        </div>
      </div>

      {/* Deliveries Stream */}
      {filteredEvents.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-10">
          <p className="text-xs text-gray-400">No deliveries match the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-xl border transition-all ${
                ev.isWicket
                  ? 'bg-red-950/20 border-red-500/40'
                  : ev.isBoundarySix
                  ? 'bg-purple-950/20 border-purple-500/40'
                  : ev.isBoundaryFour
                  ? 'bg-cricket-green/10 border-cricket-green/30'
                  : 'bg-pitch-card border-pitch-border hover:border-pitch-border/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Visual Ball Pill */}
                <div className="flex-shrink-0 pt-0.5">{getBallBadge(ev)}</div>

                {/* Commentary Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cricket-gold">
                        Over {ev.overNumber}.{ev.legalBallNumber}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {ev.bowlerName} to {ev.batterName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ev.isBoundarySix && (
                        <Badge variant="warning" size="xs">
                          MAXIMUM 6
                        </Badge>
                      )}
                      {ev.isBoundaryFour && (
                        <Badge variant="success" size="xs">
                          FOUR 4
                        </Badge>
                      )}
                      {ev.isWicket && (
                        <Badge variant="danger" size="xs">
                          WICKET
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed pt-0.5">
                    {ev.commentaryText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

BallTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      overNumber: PropTypes.number.isRequired,
      ballNumber: PropTypes.number.isRequired,
      legalBallNumber: PropTypes.number.isRequired,
      bowlerName: PropTypes.string.isRequired,
      batterName: PropTypes.string.isRequired,
      runsBatter: PropTypes.number.isRequired,
      runsExtras: PropTypes.number.isRequired,
      isWicket: PropTypes.bool,
      isBoundaryFour: PropTypes.bool,
      isBoundarySix: PropTypes.bool,
      commentaryText: PropTypes.string.isRequired,
    })
  ),
};

export default BallTimeline;
