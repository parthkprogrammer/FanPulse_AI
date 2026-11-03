import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Bot,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import {
  FeaturedMatchBanner,
  MatchFilterList,
  TopPerformersWidget,
  UserFantasySummaryWidget,
  FantasyComparisonChart,
  AiInsightsPreviewWidget,
  DashboardSkeleton,
} from '../components/dashboard';
import { StatCard, Button, Alert, EmptyState, Badge } from '../components/ui';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDashboardData();
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to retrieve sports telemetry feeds.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          icon={AlertTriangle}
          title="Telemetry Feed Error"
          description={error}
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={RefreshCw}
              onClick={loadDashboard}
            >
              Retry Loading Feed
            </Button>
          }
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          icon={Trophy}
          title="No Cricket Fixtures Available"
          description="There are currently no active or scheduled matches in the database. Please check back soon."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Prominent Demo Data Disclosure Banner */}
      {data.isDemoData && (
        <Alert variant="warning" title="Verified Demo Telemetry Active">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{data.notice}</span>
            <Badge variant="gold" size="xs">
              DEMO DATA
            </Badge>
          </div>
        </Alert>
      )}

      {/* 1. Featured Match Hero Banner */}
      <FeaturedMatchBanner match={data.featuredMatch} isDemoData={data.isDemoData} />

      {/* 2. Quick Stat Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Live Fixtures"
          value="1 Active"
          change="IND vs AUS (3rd T20I)"
          icon={Trophy}
          color="text-cricket-gold"
        />
        <StatCard
          title="Fantasy Squad Score"
          value={`${data.userFantasySummary.totalPoints} pts`}
          change={data.userFantasySummary.rankPercentile}
          icon={TrendingUp}
          color="text-cricket-green"
        />
        <StatCard
          title="Match Performers"
          value="3 Stars"
          change="All Points Verified"
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          title="AI Synthesis"
          value="Gemini Ready"
          change="100% Grounded Context"
          icon={Bot}
          color="text-purple-400"
        />
      </div>

      {/* 3. Main Dashboard 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on Desktop): Recharts Comparison & Filterable Match List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recharts Visualization */}
          <FantasyComparisonChart
            data={data.fantasyComparisonData}
            isDemoData={data.isDemoData}
          />

          {/* Matches & Scores Filter List */}
          <MatchFilterList
            matches={data.recentMatches}
            isDemoData={data.isDemoData}
          />
        </div>

        {/* Right Column (1 Col on Desktop): Fantasy Squad Summary, AI Insights & Top Performers */}
        <div className="space-y-6">
          {/* User Fantasy Squad Summary */}
          <UserFantasySummaryWidget
            summary={data.userFantasySummary}
            isDemoData={data.isDemoData}
          />

          {/* AI Insights Teaser Preview */}
          <AiInsightsPreviewWidget
            insights={data.aiInsightsPreview}
            isDemoData={data.isDemoData}
          />

          {/* Top Player Performances */}
          <TopPerformersWidget
            performers={data.topPerformers}
            isDemoData={data.isDemoData}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
