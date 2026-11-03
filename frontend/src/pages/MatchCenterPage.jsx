import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCw, AlertTriangle, Info, Calendar } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Alert, SkeletonCard } from '../components/ui';
import { MatchCard, MatchFilterBar } from '../components/matches';
import { matchService } from '../services/matchService';

export const MatchCenterPage = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoData, setIsDemoData] = useState(true);
  const [dataNotice, setDataNotice] = useState('');

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadMatches = useCallback(async ({ simulateError = false } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await matchService.getMatches({
        status: statusFilter,
        format: formatFilter,
        search: searchTerm,
        simulateError,
      });

      setMatches(response.matches || []);
      setIsDemoData(Boolean(response.isDemoData));
      setDataNotice(response.notice || '');
    } catch (err) {
      setError(err.message || 'Unable to retrieve cricket matches from the service layer.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, formatFilter, searchTerm]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setFormatFilter('ALL');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-cricket-gold" />
              <span>Cricket Match Center</span>
            </h1>
            {isDemoData && (
              <Badge variant="warning" size="xs">
                DEMO DATA
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time cricket telemetry, live match status, innings scorecards, and ball-by-ball analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadMatches()}
            disabled={isLoading}
            leftIcon={RefreshCw}
            className={isLoading ? 'animate-pulse' : ''}
          >
            {isLoading ? 'Updating...' : 'Refresh Matches'}
          </Button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {isDemoData && (
        <div className="p-3.5 rounded-xl bg-pitch-surface/90 border border-amber-500/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="font-bold text-amber-300">Notice:</strong>{' '}
            {dataNotice || 'Displaying authorized sample match feeds and deterministic calculations. Live provider feeds integrate in Milestone 6.'}
          </div>
        </div>
      )}

      {/* Filter Bar Component */}
      <MatchFilterBar
        status={statusFilter}
        onStatusChange={setStatusFilter}
        format={formatFilter}
        onFormatChange={setFormatFilter}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={matches.length}
        onReset={handleResetFilters}
      />

      {/* Error State with Retry */}
      {error && (
        <Alert
          variant="danger"
          title="Telemetry Feed Error"
          icon={AlertTriangle}
          className="my-4"
        >
          <div className="space-y-3">
            <p className="text-xs">{error}</p>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => loadMatches()}
              className="text-xs"
            >
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} hasAvatar hasBadge lines={4} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && matches.length === 0 && (
        <Card variant="default" padding="lg" className="border-pitch-border my-6">
          <EmptyState
            icon={Calendar}
            title="No Matches Found"
            description={
              searchTerm || statusFilter !== 'ALL' || formatFilter !== 'ALL'
                ? 'No fixtures match the specified status, format, or search keywords.'
                : 'No cricket fixtures currently scheduled in the calendar.'
            }
            action={
              (searchTerm || statusFilter !== 'ALL' || formatFilter !== 'ALL') && (
                <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              )
            }
          />
        </Card>
      )}

      {/* Matches Grid */}
      {!isLoading && !error && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchCenterPage;
