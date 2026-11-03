import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Plus, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, Badge, Button, Alert } from '../components/ui';

export const FantasyCreatePage = () => {
  const [selectedCount, setSelectedCount] = useState(4);
  const [remainingCredits, setRemainingCredits] = useState(64.5);

  const samplePlayers = [
    { id: 'p1', name: 'V. Kohli', role: 'BAT', team: 'IND', credits: 9.5, points: 112, selected: true },
    { id: 'p2', name: 'R. Sharma', role: 'BAT', team: 'IND', credits: 9.0, points: 68, selected: true },
    { id: 'p3', name: 'J. Bumrah', role: 'BOWL', team: 'IND', credits: 9.0, points: 98, selected: true },
    { id: 'p4', name: 'G. Maxwell', role: 'ALL', team: 'AUS', credits: 8.0, points: 84, selected: true },
    { id: 'p5', name: 'P. Cummins', role: 'BOWL', team: 'AUS', credits: 8.5, points: 76, selected: false },
    { id: 'p6', name: 'T. Head', role: 'BAT', team: 'AUS', credits: 9.0, points: 88, selected: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
            <Shield className="w-6 h-6 text-cricket-green" />
            <span>Create Fantasy Squad</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            IND vs AUS &bull; Select 11 players adhering to role limits and 100 total credits
          </p>
        </div>

        {/* Squad Status Header Chips */}
        <div className="flex items-center gap-3">
          <Card variant="elevated" padding="sm" className="px-4 py-2 flex items-center gap-3">
            <div>
              <span className="text-[11px] text-gray-400 block uppercase">Players Selected</span>
              <span className="text-base font-bold text-white">{selectedCount} / 11</span>
            </div>
            <div className="h-8 w-px bg-pitch-border" />
            <div>
              <span className="text-[11px] text-gray-400 block uppercase">Credits Remaining</span>
              <span className="text-base font-bold text-cricket-gold">{remainingCredits}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Rules Notice */}
      <Alert variant="info" title="Squad Building Rules">
        Select 1-4 Wicketkeepers, 3-6 Batters, 1-4 All-Rounders, and 3-6 Bowlers. Assign 1 Captain (2x multiplier) and 1 Vice-Captain (1.5x multiplier) before final lock.
      </Alert>

      {/* Player Selection Table */}
      <Card variant="default" padding="md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-pitch-elevated text-gray-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Player</th>
                <th className="py-2.5 px-2">Role</th>
                <th className="py-2.5 px-2">Team</th>
                <th className="py-2.5 px-2 text-right">Credits</th>
                <th className="py-2.5 px-2 text-right">Avg Points</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border text-gray-300">
              {samplePlayers.map((player) => (
                <tr key={player.id} className="hover:bg-pitch-elevated/40">
                  <td className="py-3 px-3 font-semibold text-white">
                    <Link to={`/players/${player.id}`} className="hover:text-cricket-green">
                      {player.name}
                    </Link>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="neutral" size="xs">{player.role}</Badge>
                  </td>
                  <td className="py-3 px-2 text-gray-400">{player.team}</td>
                  <td className="py-3 px-2 text-right font-semibold text-cricket-gold">{player.credits}</td>
                  <td className="py-3 px-2 text-right">{player.points}</td>
                  <td className="py-3 px-3 text-right">
                    {player.selected ? (
                      <Button variant="secondary" size="sm" leftIcon={Check} className="text-cricket-green border-cricket-green/30">
                        Selected
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" leftIcon={Plus}>
                        Add
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FantasyCreatePage;
