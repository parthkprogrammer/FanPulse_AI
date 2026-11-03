import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trophy, Award, ChevronRight, Plus } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const UserFantasySummaryWidget = ({ summary, isDemoData = true }) => {
  if (!summary) return null;

  return (
    <Card variant="default" padding="md" className="space-y-4 border-cricket-green/30">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-card">My Fantasy Squad</h3>
            {isDemoData && <Badge variant="gold" size="xs">DEMO DATA</Badge>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{summary.activeLeague}</p>
        </div>
        <Shield className="w-5 h-5 text-cricket-green" />
      </div>

      <div className="p-4 rounded-xl bg-pitch-elevated border border-pitch-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">{summary.teamName}</span>
          <Badge variant="success" size="xs">
            {summary.rankPercentile}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-pitch-border/60">
          <div>
            <span className="caption-label block">Total Score</span>
            <span className="text-2xl font-black text-cricket-green tabular-nums">
              {summary.totalPoints} pts
            </span>
          </div>
          <div>
            <span className="caption-label block">Credits Left</span>
            <span className="text-2xl font-black text-cricket-gold tabular-nums">
              {summary.remainingCredits}
            </span>
          </div>
        </div>

        <div className="pt-2 text-xs text-gray-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Captain (2x):</span>
            <span className="font-semibold text-white">{summary.captain}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Vice-Captain (1.5x):</span>
            <span className="font-semibold text-white">{summary.viceCaptain}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link to="/fantasy/teams" className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Manage Squads
          </Button>
        </Link>
        <Link to="/fantasy/create" className="flex-1">
          <Button variant="primary" size="sm" leftIcon={Plus} className="w-full">
            Create Squad
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default UserFantasySummaryWidget;
