import React from 'react';
import { User, Mail, Shield, LogOut, Award, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button, StatCard } from '../components/ui';

export const ProfilePage = () => {
  const { user, logout, toggleDemoAuth } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cricket-green to-emerald-400 flex items-center justify-center text-pitch-dark">
              <User className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="xs">Active Member</Badge>
                <Badge variant="gold" size="xs">{user?.role || 'ROLE_USER'}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {user?.displayName || 'Cricket Enthusiast'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'fan@fanpulse.ai'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" leftIcon={LogOut} onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Fantasy Teams"
          value="4 Squads"
          change="Across 2 Contests"
          icon={Shield}
          color="text-cricket-green"
        />
        <StatCard
          title="Best Rank"
          value="#14"
          change="Top 2% Globally"
          icon={Trophy}
          color="text-cricket-gold"
        />
        <StatCard
          title="AI Questions Asked"
          value="24"
          change="100% Grounded"
          icon={Award}
          color="text-purple-400"
        />
      </div>

      {/* Account Settings / Session Card */}
      <Card variant="default" padding="md">
        <Card.Header>
          <Card.Title>Session & Credentials</Card.Title>
          <Card.Description>Managed securely by Supabase Auth</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3 pt-2 text-xs text-gray-300">
          <div className="flex justify-between py-2 border-b border-pitch-border">
            <span className="text-gray-400">Authentication Provider</span>
            <span className="font-semibold text-white">Supabase Auth (GoTrue JWT)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-pitch-border">
            <span className="text-gray-400">User ID</span>
            <span className="font-mono text-gray-400">{user?.id || 'usr_demo_01'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Account Created</span>
            <span>Verified 2026</span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ProfilePage;
