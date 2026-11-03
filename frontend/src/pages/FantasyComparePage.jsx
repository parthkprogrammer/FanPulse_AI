import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, AlertTriangle, RefreshCw, PlusCircle, Shield, Info } from 'lucide-react';
import { Card, Badge, Button, Alert, EmptyState, SkeletonCard } from '../components/ui';
import {
  ComparisonHeader,
  ComparisonFilterBar,
  PlayerComparisonTable,
  CaptainContributionWidget,
  TopContributorsWidget,
  RoleBreakdownChart,
} from '../components/fantasy';
import { fantasyService } from '../services/fantasyService';

export const FantasyComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMatchId = searchParams.get('matchId') || 'm-ind-aus-t20';
  const initialTeam1Id = searchParams.get('team1Id') || 'ft-ind-titans';
  const initialTeam2Id = searchParams.get('team2Id') || 'ft-royal-strikers';

  const [availableTeams, setAvailableTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState(initialTeam1Id);
  const [team2Id, setTeam2Id] = useState(initialTeam2Id);
  const [matchId, setMatchId] = useState(initialMatchId);

  const [comparisonData, setComparisonData] = useState(null);
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL', 'DIFFERENTIALS', 'COMMON'

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available teams for this match
  useEffect(() => {
    let isMounted = true;
    const fetchTeams = async () => {
      try {
        const { teams } = await fantasyService.getComparableTeams(matchId);
        if (isMounted) {
          setAvailableTeams(teams || []);
          if (teams && teams.length >= 2) {
            // Keep current IDs if valid, or pick first two
            const ids = teams.map((t) => t.id);
            if (!ids.includes(team1Id)) setTeam1Id(ids[0]);
            if (!ids.includes(team2Id)) setTeam2Id(ids[1]);
          }
        }
      } catch {
        // Fallback
      }
    };
    fetchTeams();
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  // Load comparison data
  const loadComparison = useCallback(async ({ simulateError = false } = {}) => {
    if (!team1Id || !team2Id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fantasyService.compareFantasyTeams({
        team1Id,
        team2Id,
        simulateError,
      });
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve fantasy team comparison.');
    } finally {
      setIsLoading(false);
    }
  }, [team1Id, team2Id]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  const handleSelectTeam1 = (id) => {
    setTeam1Id(id);
    setSearchParams((prev) => {
      prev.set('team1Id', id);
      return prev;
    });
  };

  const handleSelectTeam2 = (id) => {
    setTeam2Id(id);
    setSearchParams((prev) => {
      prev.set('team2Id', id);
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/fantasy/teams">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2 text-xs">
              Back to My Teams
            </Button>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-cricket-gold" />
              <span>Fantasy Team Comparison</span>
            </h1>
            <Badge variant="warning" size="xs">
              DEMO DATA
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Side-by-side squad differentials, captain multipliers, and positional point breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/fantasy/create">
            <Button variant="secondary" size="sm" leftIcon={PlusCircle}>
              Draft Another Team
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadComparison()}
            leftIcon={RefreshCw}
            className="text-gray-400 hover:text-white"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Team Selectors & Table Filter Bar */}
      {availableTeams.length > 0 && (
        <ComparisonFilterBar
          availableTeams={availableTeams}
          team1Id={team1Id}
          team2Id={team2Id}
          onSelectTeam1={handleSelectTeam1}
          onSelectTeam2={handleSelectTeam2}
          activeFilter={tableFilter}
          onSelectFilter={setTableFilter}
        />
      )}

      {/* Error State with Retry */}
      {error && (
        <Alert variant="danger" title="Comparison Service Unavailable" icon={AlertTriangle}>
          <div className="space-y-3">
            <p className="text-xs">{error}</p>
            <Button variant="secondary" size="xs" onClick={() => loadComparison()}>
              Retry Comparison
            </Button>
          </div>
        </Alert>
      )}

      {/* Shimmer Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 rounded-2xl bg-pitch-card border border-pitch-border p-5" />
            <div className="h-44 rounded-2xl bg-pitch-card border border-pitch-border p-5" />
          </div>
          <div className="h-64 rounded-2xl bg-pitch-card border border-pitch-border p-5" />
          <div className="h-80 rounded-2xl bg-pitch-card border border-pitch-border p-5" />
        </div>
      )}

      {/* Empty State when fewer than 2 teams exist */}
      {!isLoading && !error && availableTeams.length < 2 && (
        <Card variant="default" padding="lg" className="border-pitch-border my-6">
          <EmptyState
            icon={Shield}
            title="Two Fantasy Squads Required"
            description="To compare fantasy teams, you need at least two lineups registered for the same match fixture."
            action={
              <Link to="/fantasy/create">
                <Button variant="gold" size="sm" leftIcon={PlusCircle}>
                  Draft Second Lineup
                </Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Main Comparison Views */}
      {!isLoading && !error && comparisonData && (
        <div className="space-y-6">
          {/* Head-to-Head Cards */}
          <ComparisonHeader comparisonData={comparisonData} />

          {/* Captaincy Multiplier Analysis */}
          <CaptainContributionWidget
            team1={comparisonData.team1}
            team2={comparisonData.team2}
            captainContributions={comparisonData.captainContributions}
          />

          {/* Recharts Positional Fantasy Points Breakdown */}
          <RoleBreakdownChart
            roleBreakdown={comparisonData.roleBreakdown}
            team1Name={comparisonData.team1.name}
            team2Name={comparisonData.team2.name}
          />

          {/* Top Scoring Contributors */}
          <TopContributorsWidget
            topContributors={comparisonData.topContributors}
            team1Name={comparisonData.team1.name}
            team2Name={comparisonData.team2.name}
          />

          {/* Player-by-Player Differential Scorecard Table */}
          <PlayerComparisonTable
            playerComparison={comparisonData.playerComparison}
            team1Name={comparisonData.team1.name}
            team2Name={comparisonData.team2.name}
            filter={tableFilter}
          />

          {/* Authoritative Server Scoring Notice */}
          <div className="p-4 rounded-xl bg-pitch-surface/80 border border-pitch-border flex items-start gap-3 text-xs text-gray-400">
            <Info className="w-4 h-4 text-cricket-gold mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-gray-200">Authoritative Server Scoring:</strong>{' '}
              {comparisonData.notice ||
                'Fantasy points are derived from verified match statistics and calculated deterministically server-side. No client-side modifications are permitted.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FantasyComparePage;
