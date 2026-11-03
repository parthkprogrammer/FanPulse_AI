import React from 'react';
import PropTypes from 'prop-types';
import { Crown, ShieldCheck, Flame, TrendingUp } from 'lucide-react';
import { Card, Badge } from '../ui';

export const CaptainContributionWidget = ({
  team1 = {},
  team2 = {},
  captainContributions = {},
}) => {
  const t1Contrib = captainContributions.team1 || { totalMultiplierPoints: 0, percentOfTeam: 0 };
  const t2Contrib = captainContributions.team2 || { totalMultiplierPoints: 0, percentOfTeam: 0 };
  const diff = captainContributions.difference || 0;

  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-cricket-gold" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Captain & Vice-Captain Impact
          </h3>
        </div>
        <Badge variant="gold" size="xs">
          MULTIPLIER ANALYSIS
        </Badge>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Team 1 Captaincy */}
        <div className="p-4 rounded-xl bg-pitch-surface/80 border border-pitch-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cricket-green uppercase tracking-wide">
              {team1.name} Leaders
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {t1Contrib.totalMultiplierPoints} pts ({t1Contrib.percentOfTeam}% of squad)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-pitch-card border border-pitch-border">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-cricket-gold" />
                <span>{team1.captain} (C, 2×)</span>
              </span>
              <span className="font-bold text-cricket-gold font-mono">
                {team1.captainPoints} pts
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-pitch-card border border-pitch-border">
              <span className="text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cricket-green" />
                <span>{team1.viceCaptain} (VC, 1.5×)</span>
              </span>
              <span className="font-bold text-cricket-green font-mono">
                {team1.viceCaptainPoints} pts
              </span>
            </div>
          </div>
        </div>

        {/* Team 2 Captaincy */}
        <div className="p-4 rounded-xl bg-pitch-surface/80 border border-pitch-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cricket-gold uppercase tracking-wide">
              {team2.name} Leaders
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {t2Contrib.totalMultiplierPoints} pts ({t2Contrib.percentOfTeam}% of squad)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-pitch-card border border-pitch-border">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-cricket-gold" />
                <span>{team2.captain} (C, 2×)</span>
              </span>
              <span className="font-bold text-cricket-gold font-mono">
                {team2.captainPoints} pts
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-pitch-card border border-pitch-border">
              <span className="text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cricket-green" />
                <span>{team2.viceCaptain} (VC, 1.5×)</span>
              </span>
              <span className="font-bold text-cricket-green font-mono">
                {team2.viceCaptainPoints} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

CaptainContributionWidget.propTypes = {
  team1: PropTypes.object,
  team2: PropTypes.object,
  captainContributions: PropTypes.object,
};

export default CaptainContributionWidget;
