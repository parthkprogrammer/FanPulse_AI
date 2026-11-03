import React from 'react';
import { Activity, Trophy, Users, Bot, TrendingUp, Sparkles } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Sample verified match momentum data for Recharts demo
const matchTrendData = [
  { over: 'Ov 1-4', points: 34, projected: 30 },
  { over: 'Ov 5-8', points: 78, projected: 65 },
  { over: 'Ov 9-12', points: 120, projected: 110 },
  { over: 'Ov 13-16', points: 195, projected: 160 },
  { over: 'Ov 17-20', points: 268, projected: 220 },
];

export const DashboardPage = () => {
  const statCards = [
    { label: 'Active Matches', value: '3 Matches', change: 'Sample Fixtures (Demo)', icon: Trophy, color: 'text-cricket-gold' },
    { label: 'Fantasy Squad Points', value: '842 pts', change: 'Demo Calculation', icon: TrendingUp, color: 'text-cricket-green' },
    { label: 'Tracked Players', value: '22 Players', change: 'Demo Roster Preview', icon: Users, color: 'text-blue-400' },
    { label: 'AI Explanations', value: 'Ready', change: 'Gemini Assistant (Demo)', icon: Bot, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pitch-card via-pitch-elevated to-pitch-card border border-pitch-border p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cricket-green/10 text-cricket-green text-xs font-semibold mb-4 border border-cricket-green/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cricket Fantasy Intelligence &bull; JavaScript + Supabase Stack</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-cricket-green">FanPulse</span> AI
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
            Real-time cricket statistics, deterministic fantasy point scoring, and grounded
            AI match explanations backed by verified live telemetry.
          </p>
        </div>
      </div>

      {/* Quick Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-pitch-card border border-pitch-border rounded-xl p-5 hover:border-cricket-green/40 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">{card.label}</span>
                <div className={`p-2 rounded-lg bg-pitch-elevated ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <p className="text-xs text-gray-400 mt-1">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section using Recharts */}
      <div className="bg-pitch-card border border-pitch-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cricket-green" />
              <span>Match Fantasy Points Trajectory (Demo Preview)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sample fantasy points vs. baseline projection powered by Recharts (Demo Data)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cricket-green"></span>
              <span className="text-gray-300">Demo Squad Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-gray-400">Projected</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={matchTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="over" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB',
                  fontSize: '0.85rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPoints)"
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#6B7280"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

