import React from 'react';
import { Trophy, MapPin } from 'lucide-react';
import { Card, Badge } from '../components/ui';

export const MatchCenterPage = () => {
  // Sample fixture mock data for UI preview
  const matches = [
    {
      id: 'm1',
      title: 'IND vs AUS — 3rd T20I (Demo)',
      status: 'DEMO LIVE',
      score: 'IND 184/4 (18.2 ov) vs AUS 178/8 (20.0 ov)',
      venue: 'Melbourne Cricket Ground',
      badge: 'Chasing 179',
    },
    {
      id: 'm2',
      title: 'ENG vs SA — 1st ODI (Demo)',
      status: 'UPCOMING',
      score: 'Starts at 18:30 UTC',
      venue: 'Lord’s, London',
      badge: 'Toss in 45m',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-cricket-gold" />
            <span>Cricket Match Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Sample Fixture Data (Demo Preview) &bull; Supabase Live telemetry integration in Milestone 6
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id} variant="interactive" padding="sm" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="neutral" size="xs">
                {match.badge}
              </Badge>
              <Badge
                variant={match.status === 'DEMO LIVE' ? 'warning' : 'neutral'}
                size="xs"
                dot={match.status === 'DEMO LIVE'}
              >
                {match.status}
              </Badge>
            </div>

            <h3 className="text-base font-bold text-white">{match.title}</h3>
            <p className="text-sm font-semibold text-cricket-green mt-1">{match.score}</p>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4 pt-3 border-t border-pitch-border">
              <MapPin className="w-3.5 h-3.5" />
              <span>{match.venue}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MatchCenterPage;
