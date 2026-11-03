import React from 'react';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, ChevronRight, User } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const TopPerformersWidget = ({ performers = [], isDemoData = true }) => {
  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-card">Top Match Performers</h3>
            {isDemoData && <Badge variant="gold" size="xs">DEMO DATA</Badge>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Deterministic fantasy points calculated from match telemetry
          </p>
        </div>
        <Award className="w-5 h-5 text-cricket-gold" />
      </div>

      <div className="space-y-3">
        {performers.map((player) => (
          <Link
            key={player.id}
            to={`/players/${player.id}`}
            className="flex items-center justify-between p-3.5 rounded-xl bg-pitch-elevated/60 hover:bg-pitch-elevated border border-pitch-border hover:border-cricket-green/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-center text-cricket-green group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white group-hover:text-cricket-green transition-colors">
                    {player.name}
                  </span>
                  <Badge variant="neutral" size="xs">
                    {player.team} &bull; {player.role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{player.performance}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-extrabold text-cricket-gold block tabular-nums">
                +{player.points} pts
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {player.award}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default TopPerformersWidget;
