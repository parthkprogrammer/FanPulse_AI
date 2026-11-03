import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRightLeft, Trophy, Crown, ShieldCheck, Flame } from 'lucide-react';
import { Card, Badge } from '../ui';

export const ComparisonHeader = ({ comparisonData }) => {
  if (!comparisonData) return null;

  const {
    matchSummary,
    team1,
    team2,
    pointsDifference,
    leadingTeamId,
    isDemoData,
  } = comparisonData;

  const isTeam1Leading = leadingTeamId === team1.id;
  const isTied = pointsDifference === 0;

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-pitch-card border border-pitch-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cricket-gold" />
          <span className="text-xs font-bold text-white">{matchSummary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="live" size="xs">
            HEAD-TO-HEAD
          </Badge>
          {isDemoData && (
            <Badge variant="warning" size="xs">
              DEMO DATA
            </Badge>
          )}
        </div>
      </div>

      {/* Side-by-Side Squad Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team 1 Card */}
        <Card
          variant="default"
          padding="md"
          className={`border transition-all ${
            isTeam1Leading
              ? 'border-cricket-green/50 bg-pitch-card shadow-lg shadow-cricket-green/5 ring-1 ring-cricket-green/30'
              : 'border-pitch-border bg-pitch-card/80'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-pitch-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cricket-green">TEAM 1</span>
              {isTeam1Leading && !isTied && (
                <Badge variant="success" size="xs">
                  LEADING (+{pointsDifference} pts)
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono">#{team1.id}</span>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">{team1.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Differential Lineup</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-cricket-green">
                {team1.totalPoints}
              </span>
              <span className="text-xs font-bold text-gray-400 ml-1">pts</span>
            </div>
          </div>

          {/* Captain & VC Chips */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-pitch-border text-xs">
            <div className="p-2 rounded-lg bg-pitch-surface border border-pitch-border">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                <Crown className="w-3 h-3 text-cricket-gold" /> Captain (2×)
              </span>
              <span className="font-bold text-white block mt-0.5 truncate">{team1.captain}</span>
              <span className="text-[11px] text-cricket-gold font-mono font-semibold">
                {team1.captainPoints} pts
              </span>
            </div>

            <div className="p-2 rounded-lg bg-pitch-surface border border-pitch-border">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                <ShieldCheck className="w-3 h-3 text-cricket-green" /> Vice-Captain (1.5×)
              </span>
              <span className="font-bold text-white block mt-0.5 truncate">{team1.viceCaptain}</span>
              <span className="text-[11px] text-cricket-green font-mono font-semibold">
                {team1.viceCaptainPoints} pts
              </span>
            </div>
          </div>
        </Card>

        {/* Team 2 Card */}
        <Card
          variant="default"
          padding="md"
          className={`border transition-all ${
            !isTeam1Leading && !isTied
              ? 'border-cricket-gold/50 bg-pitch-card shadow-lg shadow-cricket-gold/5 ring-1 ring-cricket-gold/30'
              : 'border-pitch-border bg-pitch-card/80'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-pitch-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cricket-gold">TEAM 2</span>
              {!isTeam1Leading && !isTied && (
                <Badge variant="gold" size="xs">
                  LEADING (+{pointsDifference} pts)
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono">#{team2.id}</span>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">{team2.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Benchmark Lineup</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-cricket-gold">
                {team2.totalPoints}
              </span>
              <span className="text-xs font-bold text-gray-400 ml-1">pts</span>
            </div>
          </div>

          {/* Captain & VC Chips */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-pitch-border text-xs">
            <div className="p-2 rounded-lg bg-pitch-surface border border-pitch-border">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                <Crown className="w-3 h-3 text-cricket-gold" /> Captain (2×)
              </span>
              <span className="font-bold text-white block mt-0.5 truncate">{team2.captain}</span>
              <span className="text-[11px] text-cricket-gold font-mono font-semibold">
                {team2.captainPoints} pts
              </span>
            </div>

            <div className="p-2 rounded-lg bg-pitch-surface border border-pitch-border">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                <ShieldCheck className="w-3 h-3 text-cricket-green" /> Vice-Captain (1.5×)
              </span>
              <span className="font-bold text-white block mt-0.5 truncate">{team2.viceCaptain}</span>
              <span className="text-[11px] text-cricket-green font-mono font-semibold">
                {team2.viceCaptainPoints} pts
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

ComparisonHeader.propTypes = {
  comparisonData: PropTypes.shape({
    matchSummary: PropTypes.string,
    pointsDifference: PropTypes.number,
    leadingTeamId: PropTypes.string,
    isDemoData: PropTypes.bool,
    team1: PropTypes.object,
    team2: PropTypes.object,
  }),
};

export default ComparisonHeader;
