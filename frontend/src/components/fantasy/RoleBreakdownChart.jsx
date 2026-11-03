import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, Badge } from '../ui';

const CustomTooltip = ({ active, payload, label, team1Name, team2Name }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-pitch-dark/95 border border-pitch-border p-3 rounded-xl shadow-xl text-xs backdrop-blur-md">
        <p className="font-bold text-white mb-2">{label}</p>
        <div className="space-y-1 font-mono">
          <p className="text-cricket-green">
            {team1Name}: <span className="font-bold">{payload[0]?.value} pts</span>
          </p>
          <p className="text-cricket-gold">
            {team2Name}: <span className="font-bold">{payload[1]?.value} pts</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const RoleBreakdownChart = ({
  roleBreakdown = [],
  team1Name = 'Team 1',
  team2Name = 'Team 2',
}) => {
  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Positional Fantasy Points Breakdown
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Aggregated point distribution across primary player roles
          </p>
        </div>
        <Badge variant="neutral" size="xs">
          ROLE METRICS
        </Badge>
      </div>

      <div className="p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roleBreakdown}
              margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#253248" vertical={false} />
              <XAxis
                dataKey="role"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#253248' }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#253248' }}
                unit=" pts"
              />
              <Tooltip
                content={
                  <CustomTooltip team1Name={team1Name} team2Name={team2Name} />
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
                iconType="circle"
              />
              <Bar
                name={team1Name}
                dataKey="team1Points"
                fill="#00E676"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name={team2Name}
                dataKey="team2Points"
                fill="#FFB800"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

RoleBreakdownChart.propTypes = {
  roleBreakdown: PropTypes.array.isRequired,
  team1Name: PropTypes.string,
  team2Name: PropTypes.string,
};

export default RoleBreakdownChart;
