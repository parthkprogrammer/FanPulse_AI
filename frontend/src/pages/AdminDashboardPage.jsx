import React from 'react';
import { ShieldCheck, Database, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { Card, Badge, Button, StatCard, Alert } from '../components/ui';

export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="xs">Admin Console</Badge>
            <Badge variant="success" size="xs">ADMIN</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cricket-green" />
            <span>Platform Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Telemetry ingestion monitoring, fantasy points calculation triggers, and Edge Function status
          </p>
        </div>

        <Button variant="secondary" size="sm" leftIcon={RefreshCw}>
          Refresh Systems
        </Button>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Edge Functions"
          value="Healthy"
          change="Deno Runtime v1.45"
          icon={Server}
          color="text-cricket-green"
        />
        <StatCard
          title="PostgreSQL"
          value="v16.3"
          change="Direct & Pooler OK"
          icon={Database}
          color="text-blue-400"
        />
        <StatCard
          title="Ingested Balls"
          value="482"
          change="Last 24 Hours"
          icon={RefreshCw}
          color="text-cricket-gold"
        />
        <StatCard
          title="Pending Calculations"
          value="0"
          change="Deterministic Engine"
          icon={ShieldCheck}
          color="text-emerald-400"
        />
      </div>

      {/* System Actions Card */}
      <Card variant="default" padding="md">
        <Card.Header>
          <Card.Title>Administrative Operations (Demo Preview)</Card.Title>
          <Card.Description>Triggers privileged Supabase Edge Functions with Service Role Key</Card.Description>
        </Card.Header>
        <Card.Content className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-pitch-elevated border border-pitch-border space-y-2">
              <h4 className="text-sm font-bold text-white">Trigger Fantasy Recalculation</h4>
              <p className="text-xs text-gray-400">
                Runs the deterministic scoring engine over ball-by-ball events for active matches.
              </p>
              <Button variant="primary" size="sm" className="mt-2">
                Run Scoring Engine
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-pitch-elevated border border-pitch-border space-y-2">
              <h4 className="text-sm font-bold text-white">Sync Cricket Telemetry</h4>
              <p className="text-xs text-gray-400">
                Polls authorized external cricket feed and synchronizes player rosters.
              </p>
              <Button variant="secondary" size="sm" className="mt-2">
                Sync Fixtures Feed
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
