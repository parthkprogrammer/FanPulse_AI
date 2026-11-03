import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ChevronRight, Clock } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const MatchFilterList = ({ matches = [], isDemoData = true }) => {
  const [filter, setFilter] = useState('ALL');

  const filteredMatches = matches.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'LIVE') return m.status.includes('LIVE');
    if (filter === 'UPCOMING') return m.status === 'UPCOMING';
    if (filter === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  const filterTabs = [
    { id: 'ALL', label: 'All Matches' },
    { id: 'LIVE', label: 'Live' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pitch-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-card">Cricket Fixtures & Scores</h3>
            {isDemoData && <Badge variant="gold" size="xs">DEMO DATA</Badge>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time cricket telemetry & recent match outcomes
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-pitch-elevated border border-pitch-border text-xs">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === tab.id
                  ? 'bg-cricket-green text-pitch-dark font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            No matches found for the selected filter.
          </div>
        ) : (
          filteredMatches.map((m) => (
            <Link
              key={m.id}
              to={`/matches/${m.id}`}
              className="block p-4 rounded-xl bg-pitch-elevated/50 hover:bg-pitch-elevated border border-pitch-border hover:border-cricket-green/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      m.status.includes('LIVE')
                        ? 'live'
                        : m.status === 'COMPLETED'
                        ? 'completed'
                        : 'upcoming'
                    }
                    size="xs"
                    dot={m.status.includes('LIVE')}
                  >
                    {m.status}
                  </Badge>
                  <span className="text-xs text-gray-400">{m.format}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span>{m.venue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <p className="text-xs font-semibold text-cricket-green mt-0.5">
                    {m.result || m.situation || `${m.team1.shortName} ${m.team1.score} vs ${m.team2.shortName} ${m.team2.score}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="pt-2 text-right">
        <Link to="/matches">
          <Button variant="ghost" size="sm" rightIcon={ChevronRight}>
            View All Matches in Match Center
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default MatchFilterList;
