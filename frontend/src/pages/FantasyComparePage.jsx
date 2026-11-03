import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, ArrowRightLeft, Shield, Trophy } from 'lucide-react';
import { Card, Badge, Button, StatCard } from '../components/ui';

export const FantasyComparePage = () => {
  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/fantasy/teams">
              <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2">
                My Teams
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-cricket-gold" />
            <span>Fantasy Team Comparison</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Head-to-head squad differential breakdown and captain impact analysis
          </p>
        </div>
      </div>

      {/* Comparison Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Squad A Card */}
        <Card variant="default" padding="md" className="border-cricket-green/30">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Badge variant="success" size="xs">My Team #1</Badge>
              <span className="text-xs text-gray-400">Total Credits: 98.5 / 100</span>
            </div>
            <Card.Title>Men in Blue Titans</Card.Title>
            <Card.Description>Captain: V. Kohli (2x) &bull; Vice-Captain: J. Bumrah (1.5x)</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-2 pt-2">
            <div className="flex justify-between py-2 border-b border-pitch-border text-xs">
              <span className="text-gray-400">Projected Score</span>
              <span className="font-bold text-cricket-green">842 pts</span>
            </div>
            <div className="flex justify-between py-2 border-b border-pitch-border text-xs">
              <span className="text-gray-400">Composition</span>
              <span className="text-gray-300">1 WK &bull; 4 BAT &bull; 2 ALL &bull; 4 BOWL</span>
            </div>
            <div className="flex justify-between py-2 text-xs">
              <span className="text-gray-400">Differential Picks</span>
              <span className="text-gray-300">H. Pandya, K. Yadav</span>
            </div>
          </Card.Content>
        </Card>

        {/* Squad B Card */}
        <Card variant="default" padding="md" className="border-cricket-gold/30">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Badge variant="gold" size="xs">Rival Team</Badge>
              <span className="text-xs text-gray-400">Total Credits: 99.0 / 100</span>
            </div>
            <Card.Title>Aussie Thunder XI</Card.Title>
            <Card.Description>Captain: G. Maxwell (2x) &bull; Vice-Captain: M. Starc (1.5x)</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-2 pt-2">
            <div className="flex justify-between py-2 border-b border-pitch-border text-xs">
              <span className="text-gray-400">Projected Score</span>
              <span className="font-bold text-cricket-gold">795 pts</span>
            </div>
            <div className="flex justify-between py-2 border-b border-pitch-border text-xs">
              <span className="text-gray-400">Composition</span>
              <span className="text-gray-300">1 WK &bull; 3 BAT &bull; 3 ALL &bull; 4 BOWL</span>
            </div>
            <div className="flex justify-between py-2 text-xs">
              <span className="text-gray-400">Differential Picks</span>
              <span className="text-gray-300">T. Head, M. Stoinis</span>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default FantasyComparePage;
