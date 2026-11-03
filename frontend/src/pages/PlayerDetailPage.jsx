import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ArrowLeft, TrendingUp, Award, Activity, Shield } from 'lucide-react';
import { Card, Badge, Button, StatCard } from '../components/ui';

export const PlayerDetailPage = () => {
  const { playerId } = useParams();

  const formattedPlayerName = playerId
    ? playerId.replace(/^p-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Player Profile';

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2">
            Back
          </Button>
        </Link>
      </div>

      {/* Player Header Card */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-pitch-elevated border border-pitch-border flex items-center justify-center text-cricket-green">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="xs">Verified Star</Badge>
                <Badge variant="gold" size="xs">9.5 Credits</Badge>
                <span className="text-xs text-gray-500">ID: {playerId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {formattedPlayerName}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Right-Hand Top-Order Batter &bull; India National Cricket Team
              </p>
            </div>
          </div>

          <Link to="/fantasy/create">
            <Button variant="primary" size="sm" leftIcon={Shield}>
              Add to Squad
            </Button>
          </Link>
        </div>
      </Card>

      {/* Player Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Fantasy Points"
          value="78.4"
          change="Last 5 Matches"
          icon={TrendingUp}
          color="text-cricket-green"
        />
        <StatCard
          title="Selection Rate"
          value="89.2%"
          change="Across Leagues"
          icon={Award}
          color="text-cricket-gold"
        />
        <StatCard
          title="Strike Rate"
          value="142.8"
          change="Career T20I"
          icon={Activity}
          color="text-blue-400"
        />
        <StatCard
          title="Form Rating"
          value="9.4 / 10"
          change="AI Calculated"
          icon={Shield}
          color="text-purple-400"
        />
      </div>
    </div>
  );
};

export default PlayerDetailPage;
