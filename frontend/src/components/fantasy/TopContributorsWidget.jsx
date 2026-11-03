import React from 'react';
import PropTypes from 'prop-types';
import { Award, Flame } from 'lucide-react';
import { Card, Badge } from '../ui';

export const TopContributorsWidget = ({
  topContributors = { team1: [], team2: [] },
  team1Name = 'Team 1',
  team2Name = 'Team 2',
}) => {
  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cricket-gold" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Top Scoring Contributors
          </h3>
        </div>
        <Badge variant="neutral" size="xs">
          TOP 3 PERFORMERS
        </Badge>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Team 1 Top Contributors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-cricket-green uppercase tracking-wide">
            {team1Name} Key MVPs
          </h4>
          <div className="space-y-2">
            {(topContributors.team1 || []).map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-pitch-surface border border-pitch-border text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pitch-elevated border border-pitch-border flex items-center justify-center font-bold text-[10px] text-cricket-gold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] text-gray-400 block">{p.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cricket-green font-mono">
                    {p.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Top Contributors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-cricket-gold uppercase tracking-wide">
            {team2Name} Key MVPs
          </h4>
          <div className="space-y-2">
            {(topContributors.team2 || []).map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-pitch-surface border border-pitch-border text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pitch-elevated border border-pitch-border flex items-center justify-center font-bold text-[10px] text-cricket-gold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] text-gray-400 block">{p.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cricket-gold font-mono">
                    {p.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

TopContributorsWidget.propTypes = {
  topContributors: PropTypes.shape({
    team1: PropTypes.array,
    team2: PropTypes.array,
  }),
  team1Name: PropTypes.string,
  team2Name: PropTypes.string,
};

export default TopContributorsWidget;
