import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Trophy, Activity, Shield, Info } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const MatchHeaderBanner = ({ match }) => {
  const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
  const isUpcoming = match.status === 'UPCOMING';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <Card
      variant="default"
      padding="lg"
      className={`relative overflow-hidden border-pitch-border ${
        isLive ? 'border-cricket-green/40 shadow-lg shadow-cricket-green/5' : ''
      }`}
    >
      {/* Background stadium pattern glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-cricket-green/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Back Link & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pitch-border">
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2 text-xs">
            Back to Match Center
          </Button>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {isLive && (
            <Badge variant="live" size="sm" dot>
              LIVE TELEMETRY
            </Badge>
          )}
          {isUpcoming && (
            <Badge variant="neutral" size="sm">
              UPCOMING FIXTURE
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="success" size="sm">
              FINAL RESULT
            </Badge>
          )}
          <Badge variant="neutral" size="sm">
            {match.format}
          </Badge>
          {match.isDemoData && (
            <Badge variant="warning" size="sm">
              DEMO DATA
            </Badge>
          )}
        </div>
      </div>

      {/* Main Score & Teams Headline */}
      <div className="py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-gray-400">Match ID: {match.id}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {match.team1.name} <span className="text-gray-400 font-normal">vs</span> {match.team2.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">{match.title}</p>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/assistant">
              <Button variant="gold" size="sm" leftIcon={Activity}>
                Ask AI Insights
              </Button>
            </Link>
            <Link to={`/fantasy/create?matchId=${match.id}`}>
              <Button variant="secondary" size="sm" leftIcon={Shield}>
                Build Fantasy Squad
              </Button>
            </Link>
          </div>
        </div>

        {/* Detailed Live Scores Card */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-pitch-elevated/70 border border-pitch-border">
          {/* Team 1 Score Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-surface/80 border border-pitch-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pitch-card flex items-center justify-center font-extrabold text-sm text-cricket-gold border border-pitch-border">
                {match.team1.code}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {match.team1.name}
                  {match.team1.isBatting && (
                    <span className="inline-block w-2 h-2 rounded-full bg-cricket-green animate-pulse" title="Batting" />
                  )}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {match.team1.overs > 0 ? `Run Rate: ${match.team1.runRate}` : 'Innings pending'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-white">{match.team1.score}</span>
              {match.team1.overs > 0 && (
                <p className="text-xs text-gray-400 font-mono">({match.team1.overs} ov)</p>
              )}
            </div>
          </div>

          {/* Team 2 Score Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-surface/80 border border-pitch-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pitch-card flex items-center justify-center font-extrabold text-sm text-cricket-green border border-pitch-border">
                {match.team2.code}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {match.team2.name}
                  {match.team2.isBatting && (
                    <span className="inline-block w-2 h-2 rounded-full bg-cricket-green animate-pulse" title="Batting" />
                  )}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {match.team2.overs > 0 ? `Run Rate: ${match.team2.runRate}` : 'Innings pending'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-white">{match.team2.score}</span>
              {match.team2.overs > 0 && (
                <p className="text-xs text-gray-400 font-mono">({match.team2.overs} ov)</p>
              )}
            </div>
          </div>
        </div>

        {/* Live Match Situation / Result Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-pitch-surface/90 border border-pitch-border flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cricket-gold mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            {isLive && match.requiredScore && (
              <p className="font-semibold text-cricket-green">
                {match.requiredScore.summary} &bull; Required Run Rate: {match.requiredScore.requiredRunRate}
              </p>
            )}
            {isCompleted && match.resultSummary && (
              <p className="font-semibold text-cricket-gold">
                {match.resultSummary}
              </p>
            )}
            {isUpcoming && (
              <p className="font-medium text-gray-300">
                {match.toss?.summary || 'Fixture scheduled to start shortly.'}
              </p>
            )}
            {match.toss && match.toss.summary && !isUpcoming && (
              <p className="text-gray-400 mt-0.5">{match.toss.summary}</p>
            )}
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="pt-4 border-t border-pitch-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span className="truncate">{match.venue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span>{new Date(match.matchDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-gray-500" />
          <span>{match.title}</span>
        </div>
      </div>
    </Card>
  );
};

MatchHeaderBanner.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    matchDate: PropTypes.string.isRequired,
    isDemoData: PropTypes.bool,
    team1: PropTypes.object.isRequired,
    team2: PropTypes.object.isRequired,
    requiredScore: PropTypes.object,
    resultSummary: PropTypes.string,
    toss: PropTypes.object,
  }).isRequired,
};

export default MatchHeaderBanner;
