import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Shield, ArrowRightLeft, Trophy, Calendar, CheckCircle2, Info } from 'lucide-react';
import { Card, Button, EmptyState, Modal, Badge, SkeletonCard } from '../components/ui';
import { useModal } from '../hooks';
import { fantasyService } from '../services/fantasyService';

export const MyTeamsPage = () => {
  const rulesModal = useModal(false);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fantasyService.getUserFantasyTeams();
      setTeams(response.teams || []);
    } catch {
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-cricket-green" />
              <span>Fantasy Teams</span>
            </h1>
            <Badge variant="gold" size="xs">
              DEMO DATA
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Build and manage your 11-player squads with deterministic points calculation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Info}
            onClick={rulesModal.openModal}
            className="text-gray-400 hover:text-white"
          >
            Composition Rules
          </Button>
          <Link to="/fantasy/compare">
            <Button variant="secondary" size="sm" leftIcon={ArrowRightLeft}>
              Compare Teams
            </Button>
          </Link>
          <Link to="/fantasy/create">
            <Button variant="primary" size="sm" leftIcon={Plus}>
              Create New Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} hasAvatar lines={3} />
          ))}
        </div>
      )}

      {/* Teams Grid */}
      {!isLoading && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => (
            <Card
              key={team.id}
              variant="interactive"
              padding="md"
              className="border-pitch-border flex flex-col justify-between hover:border-cricket-gold/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="gold" size="xs">
                    {team.matchId || team.match_id || 'IND vs AUS'}
                  </Badge>
                  <span className="text-[11px] font-mono text-gray-500">#{team.id}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {team.teamName || team.team_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <Trophy className="w-3.5 h-3.5 text-cricket-gold" />
                    <span className="font-semibold text-cricket-green">
                      {team.totalPoints || team.total_points || 0} pts
                    </span>
                  </div>
                </div>

                {/* Key Roles */}
                <div className="p-3 rounded-xl bg-pitch-elevated/70 border border-pitch-border/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Captain (2×):</span>
                    <span className="font-semibold text-cricket-gold">
                      {team.captainPlayerId || team.captain_player_id || 'Designated'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Vice-Captain (1.5×):</span>
                    <span className="font-semibold text-emerald-400">
                      {team.viceCaptainPlayerId || team.vice_captain_player_id || 'Designated'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-3 border-t border-pitch-border/60 flex items-center gap-2">
                <Link
                  to={`/fantasy/compare?matchId=${team.matchId || team.match_id || 'm-ind-aus-t20'}&team1Id=${team.id}`}
                  className="flex-1"
                >
                  <Button variant="secondary" size="xs" leftIcon={ArrowRightLeft} className="w-full justify-center">
                    Compare
                  </Button>
                </Link>
                <Link to="/fantasy/create" className="flex-1">
                  <Button variant="ghost" size="xs" leftIcon={Plus} className="w-full justify-center text-gray-300">
                    New Squad
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State Component */}
      {!isLoading && teams.length === 0 && (
        <Card variant="default" padding="lg" className="border-pitch-border my-6">
          <EmptyState
            icon={Shield}
            title="No Fantasy Teams Created Yet"
            description="Select an upcoming match to draft your dream XI, assign Captain (2×) and Vice-Captain (1.5×), and compete."
            action={
              <Link to="/fantasy/create">
                <Button variant="primary" size="md" leftIcon={Plus}>
                  Draft First Squad
                </Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Team Creation Preview Modal */}
      <Modal
        isOpen={rulesModal.isOpen}
        onClose={rulesModal.closeModal}
        title="Fantasy Squad Builder Rules"
        description="Official squad composition constraints and scoring rules."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-pitch-elevated border border-pitch-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">Composition Rules</span>
              <Badge variant="gold" size="xs">11 Players</Badge>
            </div>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>Exactly 11 players per drafted fantasy squad (BR-TEAM-01)</li>
              <li>Players from both competing cricket teams must be represented (BR-TEAM-02)</li>
              <li>At least 1 Batter, 1 Bowler, 1 All-Rounder, and 1 Wicket-Keeper (BR-TEAM-03)</li>
              <li>1 Captain (2× points multiplier) & 1 Vice-Captain (1.5× points multiplier) (BR-TEAM-04)</li>
              <li>No duplicate player selections (BR-TEAM-06)</li>
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            Fantasy scores are deterministically computed server-side via Supabase Edge Functions following verified match telemetry.
          </p>
        </div>

        <Modal.Footer>
          <Button variant="outline" size="sm" onClick={rulesModal.closeModal}>
            Close
          </Button>
          <Link to="/fantasy/create">
            <Button variant="primary" size="sm" leftIcon={Plus} onClick={rulesModal.closeModal}>
              Draft Now
            </Button>
          </Link>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyTeamsPage;
