import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { Card, Badge } from '../ui';

export const FantasyComparisonChart = ({ data = [], isDemoData = true }) => {
  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pitch-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-card flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cricket-green" />
              <span>Fantasy Points Trajectory & Differential</span>
            </h3>
            {isDemoData && <Badge variant="gold" size="xs">DEMO DATA</Badge>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Phase-by-phase accumulation: My Squad vs. League Benchmark
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cricket-green" />
            <span className="text-gray-200 font-medium">My Squad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cricket-gold" />
            <span className="text-gray-300">League Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-gray-400">Projected</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="userSquadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="leagueAvgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
            <XAxis
              dataKey="phase"
              stroke="#9CA3AF"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.75rem',
                color: '#F9FAFB',
                fontSize: '0.8rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              }}
            />
            <Area
              type="monotone"
              dataKey="userSquad"
              name="My Squad"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#userSquadGrad)"
            />
            <Area
              type="monotone"
              dataKey="leagueAverage"
              name="League Avg"
              stroke="#F59E0B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#leagueAvgGrad)"
            />
            <Area
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default FantasyComparisonChart;
