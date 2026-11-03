import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw, Radio, Table, Activity } from 'lucide-react';
import { Card, Badge, Button, Alert, EmptyState, Skeleton, SkeletonTable } from '../components/ui';
import {
  MatchHeaderBanner,
  InningsTabs,
  ScorecardTable,
  BallTimeline,
  RecentEventsWidget,
} from '../components/matches';
import { matchService } from '../services/matchService';

export const MatchDetailPage = () => {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [ballEvents, setBallEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard', 'timeline', 'events'
  const [activeInningsNumber, setActiveInningsNumber] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const loadMatchData = useCallback(async ({ simulateError = false } = {}) => {
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const matchData = await matchService.getMatchById(matchId, { simulateError });
      if (!matchData) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      setMatch(matchData);

      // Default active innings to match's current innings or 1
      const defaultInnings = matchData.currentInnings || 1;
      setActiveInningsNumber(defaultInnings);

      // Load scorecard, ball events, and recent highlights in parallel
      const [scorecardData, ballEventsData, highlightsData] = await Promise.all([
        matchService.getMatchScorecard(matchId),
        matchService.getMatchBallEvents(matchId, defaultInnings),
        matchService.getRecentEvents(matchId),
      ]);

      setScorecard(scorecardData);
      setBallEvents(ballEventsData?.events || []);
      setRecentEvents(highlightsData?.events || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve match details and scorecard.');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatchData();
  }, [loadMatchData]);

  // Handle Invalid Match ID
  if (!isLoading && isNotFound) {
    return (
      <div className="space-y-6">
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2 text-xs">
            Back to Match Center
          </Button>
        </Link>
        <Card variant="default" padding="lg" className="border-pitch-border my-6">
          <EmptyState
            icon={AlertTriangle}
            title="Match Not Found"
            description={`The cricket fixture with identifier "${matchId}" could not be located in our database or live provider feeds.`}
            action={
              <Link to="/matches">
                <Button variant="secondary" size="sm">
                  Return to Match Center
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  // Handle API Error
  if (!isLoading && error) {
    return (
      <div className="space-y-6">
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2 text-xs">
            Back to Match Center
          </Button>
        </Link>
        <Alert variant="danger" title="Match Telemetry Unavailable" icon={AlertTriangle}>
          <div className="space-y-3">
            <p className="text-xs">{error}</p>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => loadMatchData()}
              leftIcon={RefreshCw}
            >
              Retry Loading Match
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Handle Shimmer Loading Skeleton
  if (isLoading || !match) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-48 rounded-2xl bg-pitch-card border border-pitch-border p-6 flex flex-col justify-between">
          <div className="h-6 w-48 bg-pitch-surface rounded" />
          <div className="space-y-2">
            <div className="h-8 w-80 bg-pitch-surface rounded" />
            <div className="h-4 w-60 bg-pitch-surface rounded" />
          </div>
          <div className="h-5 w-40 bg-pitch-surface rounded" />
        </div>

        {/* Tab switcher skeleton */}
        <div className="h-10 w-96 bg-pitch-surface rounded-xl" />

        {/* Table skeleton */}
        <SkeletonTable rows={6} columns={6} />
      </div>
    );
  }

  // Select active innings object for the scorecard
  const currentInningsData =
    scorecard?.innings?.find((inn) => inn.inningsNumber === activeInningsNumber) ||
    scorecard?.innings?.[0];

  return (
    <div className="space-y-6">
      {/* Match Header Banner */}
      <MatchHeaderBanner match={match} />

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pitch-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'scorecard'
                ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Full Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Ball-by-Ball Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
                : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Key Moments</span>
          </button>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => loadMatchData()}
          leftIcon={RefreshCw}
          className="text-xs text-gray-400 hover:text-white"
        >
          Refresh Live Feed
        </Button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {scorecard?.innings && scorecard.innings.length > 0 ? (
            <>
              {/* Innings Switcher Tabs */}
              <InningsTabs
                inningsList={scorecard.innings}
                activeInningsNumber={activeInningsNumber}
                onSelectInnings={(num) => setActiveInningsNumber(num)}
              />

              {/* Batting and Bowling Scorecard */}
              <ScorecardTable innings={currentInningsData} />
            </>
          ) : (
            <Card variant="default" padding="lg" className="text-center py-10">
              <p className="text-sm font-semibold text-white">Scorecard Not Available</p>
              <p className="text-xs text-gray-400 mt-1">
                This fixture is scheduled. Official team lineups and scorecard data will be updated upon coin toss.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BallTimeline events={ballEvents} />
          </div>
          <div className="space-y-6">
            <RecentEventsWidget events={recentEvents} />
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="max-w-3xl">
          <RecentEventsWidget events={recentEvents} />
        </div>
      )}
    </div>
  );
};

export default MatchDetailPage;
