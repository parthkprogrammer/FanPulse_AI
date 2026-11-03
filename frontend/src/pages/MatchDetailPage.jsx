import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ArrowLeft, MapPin, Calendar, Clock, Activity, Users, Shield } from 'lucide-react';
import { Card, Badge, Button, StatCard } from '../components/ui';

export const MatchDetailPage = () => {
  const { matchId } = useParams();

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/matches">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2">
            Back to Match Center
          </Button>
        </Link>
      </div>

      {/* Match Header Hero Card */}
      <Card variant="default" padding="lg" className="border-cricket-green/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-pitch-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="live" size="xs" dot>Demo Live</Badge>
              <Badge variant="neutral" size="xs">T20 International</Badge>
              <span className="text-xs text-gray-500">ID: {matchId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              India <span className="text-gray-400 font-normal">vs</span> Australia
            </h1>
            <p className="text-xs sm:text-sm text-cricket-green font-semibold mt-1">
              IND 184/4 (18.2 ov) &bull; AUS 178/8 (20.0 ov) &bull; IND need 5 runs in 10 balls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/assistant">
              <Button variant="gold" size="sm" leftIcon={Activity}>
                Ask AI Insights
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>Melbourne Cricket Ground (MCG)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Today, 19:00 Local</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-gray-500" />
            <span>3rd T20I of 5-Match Series</span>
          </div>
        </div>
      </Card>

      {/* Match Stats & Scorecard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Scorecard Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card variant="default" padding="md">
            <Card.Header>
              <Card.Title>Live Batting & Bowling Telemetry (Demo)</Card.Title>
              <Card.Description>Verified ball-by-ball match feed</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-pitch-elevated text-gray-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Batter</th>
                      <th className="py-2.5 px-2 text-right">R</th>
                      <th className="py-2.5 px-2 text-right">B</th>
                      <th className="py-2.5 px-2 text-right">4s</th>
                      <th className="py-2.5 px-2 text-right">6s</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pitch-border text-gray-300">
                    <tr className="hover:bg-pitch-elevated/40">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <Link to="/players/p-virat-k" className="hover:text-cricket-green">
                          V. Kohli *
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-cricket-green">74</td>
                      <td className="py-2.5 px-2 text-right">48</td>
                      <td className="py-2.5 px-2 text-right">6</td>
                      <td className="py-2.5 px-2 text-right">2</td>
                      <td className="py-2.5 px-3 text-right">154.2</td>
                    </tr>
                    <tr className="hover:bg-pitch-elevated/40">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <Link to="/players/p-hardik-p" className="hover:text-cricket-green">
                          H. Pandya
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-cricket-green">38</td>
                      <td className="py-2.5 px-2 text-right">19</td>
                      <td className="py-2.5 px-2 text-right">3</td>
                      <td className="py-2.5 px-2 text-right">3</td>
                      <td className="py-2.5 px-3 text-right">200.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Fantasy Impact Sidebar */}
        <div className="space-y-4">
          <Card variant="default" padding="md">
            <Card.Header>
              <Card.Title>Fantasy Top Performers</Card.Title>
              <Card.Description>Match points calculated deterministically</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-elevated">
                <div>
                  <Link to="/players/p-virat-k" className="text-xs font-bold text-white hover:text-cricket-green">
                    V. Kohli (IND)
                  </Link>
                  <p className="text-[11px] text-gray-400">74 runs, 1 catch</p>
                </div>
                <Badge variant="gold" size="xs">112 pts</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-pitch-elevated">
                <div>
                  <Link to="/players/p-jasprit-b" className="text-xs font-bold text-white hover:text-cricket-green">
                    J. Bumrah (IND)
                  </Link>
                  <p className="text-[11px] text-gray-400">3/24 (4.0 ov)</p>
                </div>
                <Badge variant="gold" size="xs">98 pts</Badge>
              </div>
            </Card.Content>
            <Card.Footer>
              <Link to="/fantasy/create" className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Build Fantasy Squad
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
