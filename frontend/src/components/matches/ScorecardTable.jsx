import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../ui';

export const ScorecardTable = ({ innings }) => {
  if (!innings) {
    return (
      <Card variant="default" padding="lg" className="text-center py-10">
        <p className="text-sm text-gray-400">Innings scorecard not available yet.</p>
      </Card>
    );
  }

  const {
    batting = [],
    bowling = [],
    extras = 0,
    extrasDetails = '',
    totalRuns = 0,
    totalWickets = 0,
    oversCompleted = 0,
    runRate = 0,
    fallOfWickets = [],
    yetToBat = [],
  } = innings;

  return (
    <div className="space-y-6">
      {/* Batting Scorecard */}
      <Card variant="default" padding="none" className="overflow-hidden border-pitch-border">
        <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Batting — {innings.battingTeam} ({innings.battingTeamCode || ''})
            </h3>
          </div>
          <span className="text-xs font-mono text-cricket-gold font-bold">
            {totalRuns}/{totalWickets} ({oversCompleted} ov) &bull; RR: {runRate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-pitch-surface/60 text-gray-400 uppercase font-semibold text-[11px] border-b border-pitch-border">
              <tr>
                <th className="py-3 px-4 min-w-[160px]">Batter</th>
                <th className="py-3 px-3 min-w-[140px]">Dismissal</th>
                <th className="py-3 px-2 text-right font-bold">R</th>
                <th className="py-3 px-2 text-right">B</th>
                <th className="py-3 px-2 text-right">4s</th>
                <th className="py-3 px-2 text-right">6s</th>
                <th className="py-3 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border text-gray-300">
              {batting.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    No batting records available for this innings.
                  </td>
                </tr>
              ) : (
                batting.map((b) => (
                  <tr key={b.playerId || b.name} className="hover:bg-pitch-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <Link
                        to={`/players/${b.playerId}`}
                        className="hover:text-cricket-green flex items-center gap-1.5"
                      >
                        <span>{b.name}</span>
                        {!b.isOut && (
                          <span className="text-cricket-green font-bold text-xs" title="Not Out">
                            *
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-normal truncate max-w-[160px]">
                      {b.dismissal}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-white text-sm">
                      {b.runs}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">{b.balls}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{b.fours}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{b.sixes}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {b.strikeRate}
                    </td>
                  </tr>
                ))
              )}

              {/* Extras Row */}
              <tr className="bg-pitch-surface/30 font-medium text-gray-400">
                <td className="py-2.5 px-4 font-semibold text-gray-300">Extras</td>
                <td className="py-2.5 px-3 text-[11px] text-gray-500 font-mono">
                  {extrasDetails}
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-gray-200" colSpan="5">
                  {extras}
                </td>
              </tr>

              {/* Total Row */}
              <tr className="bg-pitch-surface/70 font-bold text-white border-t-2 border-pitch-border">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-3 text-xs text-gray-400 font-normal">
                  ({totalWickets} wickets, {oversCompleted} overs, RR {runRate})
                </td>
                <td className="py-3 px-2 text-right text-base text-cricket-gold" colSpan="5">
                  {totalRuns}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Yet to Bat section */}
        {yetToBat && yetToBat.length > 0 && (
          <div className="p-3.5 bg-pitch-surface/40 border-t border-pitch-border text-xs text-gray-400 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-gray-300">Yet to bat:</span>
            {yetToBat.map((p, idx) => (
              <span key={p.playerId || p.name}>
                <Link to={`/players/${p.playerId}`} className="hover:text-cricket-green text-gray-300">
                  {p.name}
                </Link>
                {idx < yetToBat.length - 1 && <span className="text-gray-600">,</span>}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Bowling Scorecard */}
      <Card variant="default" padding="none" className="overflow-hidden border-pitch-border">
        <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Bowling — {innings.bowlingTeam} ({innings.bowlingTeamCode || ''})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-pitch-surface/60 text-gray-400 uppercase font-semibold text-[11px] border-b border-pitch-border">
              <tr>
                <th className="py-3 px-4 min-w-[160px]">Bowler</th>
                <th className="py-3 px-2 text-right">O</th>
                <th className="py-3 px-2 text-right">M</th>
                <th className="py-3 px-2 text-right">R</th>
                <th className="py-3 px-2 text-right font-bold text-cricket-gold">W</th>
                <th className="py-3 px-2 text-right">Econ</th>
                <th className="py-3 px-4 text-right">Dots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border text-gray-300">
              {bowling.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    No bowling records available for this innings.
                  </td>
                </tr>
              ) : (
                bowling.map((b) => (
                  <tr key={b.playerId || b.name} className="hover:bg-pitch-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <Link to={`/players/${b.playerId}`} className="hover:text-cricket-green">
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300">{b.overs}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{b.maidens}</td>
                    <td className="py-3 px-2 text-right text-gray-300">{b.runsConceded}</td>
                    <td className="py-3 px-2 text-right font-bold text-cricket-gold text-sm">
                      {b.wickets}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300">{b.economy}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{b.dots || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fall of Wickets */}
      {fallOfWickets && fallOfWickets.length > 0 && (
        <Card variant="default" padding="md" className="border-pitch-border">
          <Card.Header className="pb-3 border-b border-pitch-border">
            <Card.Title className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Fall of Wickets
            </Card.Title>
          </Card.Header>
          <Card.Content className="pt-3">
            <div className="flex flex-wrap gap-2">
              {fallOfWickets.map((fow, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-pitch-elevated border border-pitch-border flex items-center gap-1.5 text-xs"
                >
                  <span className="font-bold text-cricket-gold">{fow.score}</span>
                  <span className="text-gray-300">({fow.player},</span>
                  <span className="text-gray-500 font-mono">{fow.over} ov)</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

ScorecardTable.propTypes = {
  innings: PropTypes.shape({
    battingTeam: PropTypes.string,
    battingTeamCode: PropTypes.string,
    bowlingTeam: PropTypes.string,
    bowlingTeamCode: PropTypes.string,
    totalRuns: PropTypes.number,
    totalWickets: PropTypes.number,
    oversCompleted: PropTypes.number,
    extras: PropTypes.number,
    extrasDetails: PropTypes.string,
    runRate: PropTypes.number,
    batting: PropTypes.arrayOf(PropTypes.object),
    bowling: PropTypes.arrayOf(PropTypes.object),
    fallOfWickets: PropTypes.arrayOf(PropTypes.object),
    yetToBat: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default ScorecardTable;
