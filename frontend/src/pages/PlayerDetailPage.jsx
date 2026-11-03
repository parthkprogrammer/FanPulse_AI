import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Activity,
  Shield,
  Award,
  Zap,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button, StatCard, Spinner, Alert } from '../components/ui';
import playerService from '../services/playerService';

export const PlayerDetailPage = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayer() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await playerService.getPlayerById(playerId);
        if (isMounted) {
          setPlayer(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load player details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlayer();

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Spinner size="lg" color="green" label="Loading athlete profile..." />
        <p className="text-xs text-gray-400">Retrieving career statistics and match records</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <Card variant="default" padding="lg" className="border-red-500/30 text-center">
          <div className="p-3 rounded-full bg-red-500/10 text-red-400 w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Player Record Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-6">
            We could not find an official profile for player ID <span className="font-mono text-gray-300">"{playerId}"</span> in the database.
          </p>
          <Link to="/matches">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Match Center
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { battingStats, bowlingStats } = player;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2">
            Back to Match Center
          </Button>
        </Link>
      </div>

      {/* Player Header Card */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-pitch-elevated border border-pitch-border flex items-center justify-center text-cricket-green shadow-lg shadow-cricket-green/10">
              <User className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="gold" size="xs">
                  {player.primaryRole || player.role}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {player.country}
                </Badge>
                {player.credits && (
                  <Badge variant="success" size="xs">
                    {player.credits} Credits
                  </Badge>
                )}
                <span className="text-[11px] text-gray-500 font-mono">ID: {player.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {player.name}
              </h1>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                {player.battingStyle && <span>Batting: {player.battingStyle.replace(/_/g, ' ')}</span>}
                {player.battingStyle && player.bowlingStyle && <span>&bull;</span>}
                {player.bowlingStyle && <span>Bowling: {player.bowlingStyle.replace(/_/g, ' ')}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/fantasy/create">
              <Button variant="primary" size="sm" leftIcon={Shield}>
                Add to Squad
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Career Runs"
          value={battingStats?.runs?.toLocaleString() ?? '—'}
          change={`${battingStats?.matches ?? 0} Matches`}
          icon={Award}
          color="text-cricket-gold"
        />
        <StatCard
          title="Batting Strike Rate"
          value={battingStats?.strikeRate ? `${battingStats.strikeRate}` : '—'}
          change={`Avg: ${battingStats?.battingAverage ?? '—'}`}
          icon={Zap}
          color="text-cricket-green"
        />
        <StatCard
          title="Career Wickets"
          value={bowlingStats?.wickets ?? '—'}
          change={`Best: ${bowlingStats?.bestFigures ?? '—'}`}
          icon={Crosshair}
          color="text-blue-400"
        />
        <StatCard
          title="Economy Rate"
          value={bowlingStats?.economyRate ? `${bowlingStats.economyRate}` : '—'}
          change={`${bowlingStats?.oversBowled ?? 0} Overs`}
          icon={Activity}
          color="text-purple-400"
        />
      </div>

      {/* Comprehensive Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batting Career Breakdown */}
        <Card variant="default" padding="md">
          <Card.Header>
            <Card.Title>Career Batting Statistics</Card.Title>
            <Card.Description>Aggregated career performance with the bat</Card.Description>
          </Card.Header>
          <Card.Content className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Innings</span>
                <p className="text-lg font-bold text-white mt-1">{battingStats?.innings ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Highest</span>
                <p className="text-lg font-bold text-white mt-1">{battingStats?.highestScore ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Centuries (100s)</span>
                <p className="text-lg font-bold text-cricket-gold mt-1">{battingStats?.centuries ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Fifties (50s)</span>
                <p className="text-lg font-bold text-cricket-green mt-1">{battingStats?.halfCenturies ?? 0}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Bowling Career Breakdown */}
        <Card variant="default" padding="md">
          <Card.Header>
            <Card.Title>Career Bowling Statistics</Card.Title>
            <Card.Description>Aggregated career bowling and wicket telemetry</Card.Description>
          </Card.Header>
          <Card.Content className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Innings Bowled</span>
                <p className="text-lg font-bold text-white mt-1">{bowlingStats?.innings ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Overs</span>
                <p className="text-lg font-bold text-white mt-1">{bowlingStats?.oversBowled ?? 0.0}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Bowling Avg</span>
                <p className="text-lg font-bold text-blue-400 mt-1">{bowlingStats?.bowlingAverage ?? '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-pitch-elevated border border-pitch-border">
                <span className="text-[10px] uppercase font-bold text-gray-400">Best Spell</span>
                <p className="text-lg font-bold text-purple-400 mt-1">{bowlingStats?.bestFigures ?? '—'}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default PlayerDetailPage;
