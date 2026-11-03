/**
 * FanPulse AI — Grounded Sample Cricket Data Provider
 *
 * Implements CricketDataProvider using verified baseline cricket telemetry.
 * Serves as the authoritative default and resilient fallback provider.
 */

import {
  type CricketDataProvider,
  type NormalizedMatch,
  type NormalizedScorecard,
  type ProviderMetadata,
} from './types.ts';

export const SAMPLE_MATCHES_CATALOG: NormalizedMatch[] = [
  {
    id: 'm-ind-aus-t20',
    title: 'India vs Australia — 3rd T20I',
    format: 'T20',
    status: 'LIVE',
    venue: 'Melbourne Cricket Ground, Melbourne',
    matchDate: '2026-11-03T13:30:00Z',
    team1: {
      name: 'India',
      code: 'IND',
      runs: 184,
      wickets: 4,
      overs: 18.2,
      runRate: 10.03,
      scoreDisplay: '184/4 (18.2 ov)',
      isBatting: true,
    },
    team2: {
      name: 'Australia',
      code: 'AUS',
      runs: 178,
      wickets: 8,
      overs: 20.0,
      runRate: 8.90,
      scoreDisplay: '178/8 (20.0 ov)',
      isBatting: false,
    },
    resultSummary: null,
    currentInnings: 2,
    isLive: true,
    dataSource: 'Grounded Sample Provider (Offline Telemetry)',
    isDemoData: true,
  },
  {
    id: 'm-eng-sa-odi',
    title: 'England vs South Africa — 1st ODI',
    format: 'ODI',
    status: 'COMPLETED',
    venue: "Lord's, London",
    matchDate: '2026-11-02T10:00:00Z',
    team1: {
      name: 'England',
      code: 'ENG',
      runs: 312,
      wickets: 7,
      overs: 50.0,
      runRate: 6.24,
      scoreDisplay: '312/7 (50.0 ov)',
      isBatting: false,
    },
    team2: {
      name: 'South Africa',
      code: 'SA',
      runs: 288,
      wickets: 10,
      overs: 47.4,
      runRate: 6.04,
      scoreDisplay: '288/10 (47.4 ov)',
      isBatting: false,
    },
    resultSummary: 'England won by 24 runs',
    currentInnings: 2,
    isLive: false,
    dataSource: 'Grounded Sample Provider (Offline Telemetry)',
    isDemoData: true,
  },
  {
    id: 'm-nz-pak-t20',
    title: 'New Zealand vs Pakistan — 2nd T20I',
    format: 'T20',
    status: 'UPCOMING',
    venue: 'Eden Park, Auckland',
    matchDate: '2026-11-04T06:00:00Z',
    team1: {
      name: 'New Zealand',
      code: 'NZ',
      scoreDisplay: 'Scheduled',
      isBatting: false,
    },
    team2: {
      name: 'Pakistan',
      code: 'PAK',
      scoreDisplay: 'Scheduled',
      isBatting: false,
    },
    resultSummary: 'Starts at 06:00 UTC',
    currentInnings: 1,
    isLive: false,
    dataSource: 'Grounded Sample Provider (Offline Telemetry)',
    isDemoData: true,
  },
];

export const SAMPLE_SCORECARD_IND_AUS: NormalizedScorecard = {
  matchId: 'm-ind-aus-t20',
  title: 'India vs Australia — 3rd T20I',
  format: 'T20',
  status: 'LIVE',
  dataSource: 'Grounded Sample Provider (Offline Telemetry)',
  isDemoData: true,
  lastUpdated: new Date().toISOString(),
  innings: [
    {
      inningsNumber: 1,
      battingTeamName: 'Australia',
      battingTeamCode: 'AUS',
      bowlingTeamName: 'India',
      bowlingTeamCode: 'IND',
      totalRuns: 178,
      totalWickets: 8,
      oversCompleted: 20.0,
      extras: 12,
      batting: [
        { playerName: 'Travis Head', runs: 65, ballsFaced: 38, fours: 7, sixes: 3, strikeRate: 171.05, isOut: true, dismissalText: 'c Kohli b Bumrah' },
        { playerName: 'Glenn Maxwell', runs: 54, ballsFaced: 28, fours: 5, sixes: 3, strikeRate: 192.86, isOut: true, dismissalText: 'c Jadeja b Pandya' },
        { playerName: 'Pat Cummins', runs: 12, ballsFaced: 8, fours: 1, sixes: 0, strikeRate: 150.00, isOut: true, dismissalText: 'run out (Pant)' },
      ],
      bowling: [
        { playerName: 'Jasprit Bumrah', overs: 4.0, maidens: 1, runsConceded: 24, wickets: 3, economy: 6.00 },
        { playerName: 'Hardik Pandya', overs: 3.0, maidens: 0, runsConceded: 24, wickets: 1, economy: 8.00 },
        { playerName: 'Kuldeep Yadav', overs: 4.0, maidens: 0, runsConceded: 32, wickets: 2, economy: 8.00 },
      ],
    },
    {
      inningsNumber: 2,
      battingTeamName: 'India',
      battingTeamCode: 'IND',
      bowlingTeamName: 'Australia',
      bowlingTeamCode: 'AUS',
      totalRuns: 184,
      totalWickets: 4,
      oversCompleted: 18.2,
      extras: 8,
      batting: [
        { playerName: 'Virat Kohli', runs: 74, ballsFaced: 48, fours: 6, sixes: 2, strikeRate: 154.17, isOut: false, dismissalText: 'not out' },
        { playerName: 'Rohit Sharma', runs: 38, ballsFaced: 24, fours: 4, sixes: 2, strikeRate: 158.33, isOut: true, dismissalText: 'c Starc b Zampa' },
        { playerName: 'Hardik Pandya', runs: 38, ballsFaced: 19, fours: 3, sixes: 3, strikeRate: 200.00, isOut: false, dismissalText: 'not out' },
      ],
      bowling: [
        { playerName: 'Josh Hazlewood', overs: 4.0, maidens: 0, runsConceded: 34, wickets: 1, economy: 8.50 },
        { playerName: 'Adam Zampa', overs: 4.0, maidens: 0, runsConceded: 30, wickets: 2, economy: 7.50 },
        { playerName: 'Pat Cummins', overs: 3.2, maidens: 0, runsConceded: 44, wickets: 0, economy: 13.20 },
      ],
    },
  ],
};

export class SampleCricketDataProvider implements CricketDataProvider {
  readonly name = 'SampleCricketDataProvider';
  readonly isLive = false;

  async getMatches(options: { status?: string; format?: string; limit?: number; offset?: number } = {}): Promise<NormalizedMatch[]> {
    let result = [...SAMPLE_MATCHES_CATALOG];

    if (options.status && options.status !== 'ALL') {
      result = result.filter((m) => m.status.toUpperCase() === options.status?.toUpperCase());
    }

    if (options.format && options.format !== 'ALL') {
      result = result.filter((m) => m.format.toUpperCase() === options.format?.toUpperCase());
    }

    const offset = options.offset || 0;
    const limit = options.limit || 20;
    return result.slice(offset, offset + limit);
  }

  async getMatchDetail(matchId: string): Promise<NormalizedMatch | null> {
    const match = SAMPLE_MATCHES_CATALOG.find((m) => m.id === matchId);
    return match || null;
  }

  async getMatchScorecard(matchId: string): Promise<NormalizedScorecard | null> {
    if (matchId === 'm-ind-aus-t20') {
      return SAMPLE_SCORECARD_IND_AUS;
    }

    const match = await this.getMatchDetail(matchId);
    if (!match) return null;

    return {
      matchId: match.id,
      title: match.title,
      format: match.format,
      status: match.status,
      dataSource: this.name,
      isDemoData: true,
      lastUpdated: new Date().toISOString(),
      innings: [],
    };
  }

  getMetadata(): ProviderMetadata {
    return {
      providerName: this.name,
      isLive: false,
      notice: 'Operating in Sample Data Mode. External cricket provider API key not configured.',
      lastSyncTimestamp: new Date().toISOString(),
    };
  }
}
