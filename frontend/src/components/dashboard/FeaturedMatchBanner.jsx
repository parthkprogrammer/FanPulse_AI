import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Activity, Shield, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const FeaturedMatchBanner = ({ match, isDemoData = true }) => {
  if (!match) return null;

  return (
    <Card
      variant="default"
      padding="lg"
      className="relative overflow-hidden border-cricket-green/40 shadow-glow-green"
    >
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cricket-green/10 via-transparent to-transparent pointer-events-none" />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="live" size="xs" dot>
            {match.status}
          </Badge>
          <Badge variant="neutral" size="xs">
            {match.format}
          </Badge>
          {isDemoData && (
            <Badge variant="gold" size="xs">
              DEMO DATA
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span>{match.venue}</span>
        </div>
      </div>

      {/* Match Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-elevated/70 border border-pitch-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {match.team1.shortName}
              </div>
              <div>
                <span className="text-base font-bold text-white block">{match.team1.name}</span>
                <span className="text-xs text-gray-400">Chasing</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-cricket-green block tabular-nums">
                {match.team1.score}
              </span>
              <span className="text-xs text-gray-400">({match.team1.overs} ov)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-elevated/40 border border-pitch-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {match.team2.shortName}
              </div>
              <div>
                <span className="text-base font-semibold text-gray-200 block">{match.team2.name}</span>
                <span className="text-xs text-gray-400">1st Innings</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-200 block tabular-nums">
                {match.team2.score}
              </span>
              <span className="text-xs text-gray-400">({match.team2.overs} ov)</span>
            </div>
          </div>
        </div>

        {/* Situation & Action Buttons */}
        <div className="space-y-4 md:border-l md:border-pitch-border md:pl-6">
          <div>
            <span className="caption-label block mb-1">Match Situation (Verified Demo)</span>
            <p className="text-sm font-semibold text-cricket-gold leading-relaxed">
              {match.situation}
            </p>
            <p className="text-xs text-gray-400 mt-1">{match.toss}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={`/matches/${match.id}`}>
              <Button variant="primary" size="sm" rightIcon={ChevronRight}>
                View Live Scorecard
              </Button>
            </Link>

            <Link to={`/fantasy/create?matchId=${match.id}`}>
              <Button variant="secondary" size="sm" leftIcon={Shield}>
                Draft Squad
              </Button>
            </Link>

            <Link to="/assistant">
              <Button variant="outline" size="sm" leftIcon={Sparkles}>
                AI Insights
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeaturedMatchBanner;
