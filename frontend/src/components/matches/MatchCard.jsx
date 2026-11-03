import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPin, Trophy, Calendar, ArrowRight, Shield, Activity } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const MatchCard = ({ match }) => {
  const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
  const isUpcoming = match.status === 'UPCOMING';
  const isCompleted = match.status === 'COMPLETED';

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge variant="live" size="xs" dot>
          LIVE
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge variant="neutral" size="xs">
          UPCOMING
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="xs">
        COMPLETED
      </Badge>
    );
  };

  return (
    <Card
      variant="interactive"
      padding="none"
      className={`flex flex-col justify-between overflow-hidden transition-all duration-200 border-pitch-border hover:border-cricket-gold/40 ${
        isLive ? 'ring-1 ring-cricket-green/30' : ''
      }`}
    >
      <div className="p-5">
        {/* Header Badges & Format */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            <Badge variant="neutral" size="xs">
              {match.format}
            </Badge>
            {match.isDemoData && (
              <Badge variant="warning" size="xs">
                DEMO DATA
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-mono text-gray-500">#{match.id}</span>
        </div>

        {/* Match Title & Venue */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-1">
          {match.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>

        {/* Team Scores Row */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-pitch-elevated/70 border border-pitch-border/60">
          {/* Team 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pitch-surface flex items-center justify-center font-bold text-xs text-cricket-gold border border-pitch-border">
                {match.team1.code}
              </div>
              <span className="text-sm font-semibold text-white">{match.team1.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white">{match.team1.score}</span>
              {match.team1.overs > 0 && (
                <span className="text-xs text-gray-400 ml-1.5 font-mono">({match.team1.overs} ov)</span>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pitch-surface flex items-center justify-center font-bold text-xs text-cricket-green border border-pitch-border">
                {match.team2.code}
              </div>
              <span className="text-sm font-semibold text-white">{match.team2.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white">{match.team2.score}</span>
              {match.team2.overs > 0 && (
                <span className="text-xs text-gray-400 ml-1.5 font-mono">({match.team2.overs} ov)</span>
              )}
            </div>
          </div>
        </div>

        {/* Situation / Result Text */}
        <div className="mt-3">
          {isLive && match.requiredScore && (
            <p className="text-xs font-semibold text-cricket-green line-clamp-2">
              {match.requiredScore.summary}
            </p>
          )}
          {isCompleted && match.resultSummary && (
            <p className="text-xs font-semibold text-cricket-gold line-clamp-2">
              {match.resultSummary}
            </p>
          )}
          {isUpcoming && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{match.toss?.summary || 'Lineups announced before toss'}</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-pitch-card/90 border-t border-pitch-border flex items-center justify-between gap-3">
        <Link to={`/matches/${match.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full justify-center text-xs" rightIcon={ArrowRight}>
            Match Center
          </Button>
        </Link>
        <Link to="/fantasy/create">
          <Button variant="ghost" size="sm" className="text-xs" leftIcon={Shield}>
            Draft Squad
          </Button>
        </Link>
      </div>
    </Card>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    isDemoData: PropTypes.bool,
    team1: PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      overs: PropTypes.number,
    }).isRequired,
    team2: PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      overs: PropTypes.number,
    }).isRequired,
    requiredScore: PropTypes.shape({
      summary: PropTypes.string,
    }),
    resultSummary: PropTypes.string,
    toss: PropTypes.shape({
      summary: PropTypes.string,
    }),
  }).isRequired,
};

export default MatchCard;
