import { isSupabaseConfigured } from './authService';
import { supabase } from './supabaseClient';

export const DEMO_DASHBOARD_DATA = {
  isDemoData: true,
  dataLabel: 'DEMO DATA',
  notice: 'Displaying verified sample cricket telemetry and deterministic fantasy points for UI preview. Real-time live feeds connect in Milestone 6.',
  featuredMatch: {
    id: 'm-ind-aus-t20',
    title: 'India vs Australia — 3rd T20I',
    status: 'DEMO LIVE',
    format: 'T20 International',
    venue: 'Melbourne Cricket Ground, Melbourne',
    team1: { name: 'India', shortName: 'IND', score: '184/4', overs: '18.2' },
    team2: { name: 'Australia', shortName: 'AUS', score: '178/8', overs: '20.0' },
    situation: 'India need 5 runs in 10 balls with 6 wickets in hand (Req. RR: 3.00)',
    toss: 'Australia won the toss and elected to bat first',
  },
  recentMatches: [
    {
      id: 'm-eng-sa-odi',
      title: 'England vs South Africa — 1st ODI',
      status: 'COMPLETED',
      format: 'One Day International',
      venue: 'Lord’s, London',
      team1: { name: 'England', shortName: 'ENG', score: '312/7', overs: '50.0' },
      team2: { name: 'South Africa', shortName: 'SA', score: '288/10', overs: '47.4' },
      result: 'England won by 24 runs (Demo Result)',
    },
    {
      id: 'm-nz-pak-t20',
      title: 'New Zealand vs Pakistan — 2nd T20I',
      status: 'UPCOMING',
      format: 'T20 International',
      venue: 'Eden Park, Auckland',
      team1: { name: 'New Zealand', shortName: 'NZ', score: 'Scheduled', overs: '-' },
      team2: { name: 'Pakistan', shortName: 'PAK', score: 'Scheduled', overs: '-' },
      situation: 'Starts at 18:30 UTC &bull; Toss in 45 mins',
    },
    {
      id: 'm-wi-sl-t20',
      title: 'West Indies vs Sri Lanka — 1st T20I',
      status: 'UPCOMING',
      format: 'T20 International',
      venue: 'Kensington Oval, Barbados',
      team1: { name: 'West Indies', shortName: 'WI', score: 'Scheduled', overs: '-' },
      team2: { name: 'Sri Lanka', shortName: 'SL', score: 'Scheduled', overs: '-' },
      situation: 'Match scheduled for tomorrow &bull; 14:00 Local',
    },
  ],
  topPerformers: [
    {
      id: 'p-virat-k',
      name: 'Virat Kohli',
      team: 'IND',
      role: 'Batter',
      performance: '74 runs (48b, 6x4, 2x6)',
      points: 112,
      strikeRate: 154.2,
      award: 'Top Batter',
    },
    {
      id: 'p-jasprit-b',
      name: 'Jasprit Bumrah',
      team: 'IND',
      role: 'Bowler',
      performance: '3/24 (4.0 ov, 14 dots)',
      points: 98,
      economy: 6.0,
      award: 'Top Bowler',
    },
    {
      id: 'p-glenn-m',
      name: 'Glenn Maxwell',
      team: 'AUS',
      role: 'All-Rounder',
      performance: '54 runs (28b) & 1/28 (3 ov)',
      points: 92,
      strikeRate: 192.8,
      award: 'Key Impact',
    },
  ],
  userFantasySummary: {
    teamName: 'Men in Blue Titans',
    totalSquads: 3,
    activeLeague: 'Global T20 Championship',
    totalPoints: 842,
    rankPercentile: 'Top 5%',
    captain: 'Virat Kohli (2x Multiplier)',
    viceCaptain: 'Jasprit Bumrah (1.5x Multiplier)',
    remainingCredits: 1.5,
  },
  fantasyComparisonData: [
    { phase: 'Ov 1-4 (Powerplay)', userSquad: 42, leagueAverage: 35, projected: 38 },
    { phase: 'Ov 5-8 (Middle 1)', userSquad: 96, leagueAverage: 78, projected: 82 },
    { phase: 'Ov 9-12 (Middle 2)', userSquad: 148, leagueAverage: 122, projected: 130 },
    { phase: 'Ov 13-16 (Death Setup)', userSquad: 215, leagueAverage: 174, projected: 185 },
    { phase: 'Ov 17-20 (Death Overs)', userSquad: 298, leagueAverage: 242, projected: 260 },
  ],
  aiInsightsPreview: {
    headline: 'Death Overs Acceleration & Bowling Discipline (Grounded Synthesis)',
    summary:
      'India restricted Australia to 34 runs in overs 16-20 while conceding zero sixes. In reply, the 18th over yielded 16 runs without risky lofted strokes, swinging victory probability from 58% to 92%.',
    keyStat: 'Boundary strike rate in death overs: 228.5 (Verified Telemetry)',
    suggestedPrompt: 'Explain why Jasprit Bumrah earned 98 fantasy points in death overs',
  },
};

export const dashboardService = {
  async getDashboardData({ simulateError = false } = {}) {
    // Artificial 350ms latency to test loading skeletons
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (simulateError) {
      throw new Error('Failed to retrieve dashboard feeds from telemetry network. Please retry.');
    }

    // If Supabase is connected and tables exist in Phase 6, we would query:
    // const { data, error } = await supabase.from('matches').select('...');
    // For now, return verified sample demo data with clear labeling
    return DEMO_DASHBOARD_DATA;
  },
};

export default dashboardService;
