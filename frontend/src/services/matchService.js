import { isSupabaseConfigured } from './authService';
import { supabase } from './supabaseClient';
import apiClient from './apiClient';

/**
 * Sample matches dataset modeled directly from DATABASE_DESIGN.md and API_DESIGN.md.
 * Clearly marked as DEMO DATA until live provider integration in Milestone 6.
 */
export const DEMO_MATCHES = [
  {
    id: 'm-ind-aus-t20',
    title: 'India vs Australia — 3rd T20I',
    format: 'T20',
    status: 'LIVE',
    venue: 'Melbourne Cricket Ground, Melbourne',
    matchDate: '2026-11-03T13:30:00Z',
    isLive: true,
    isDemoData: true,
    dataLabel: 'DEMO DATA',
    toss: {
      winnerTeam: 'Australia',
      decision: 'BOWL',
      summary: 'Australia won the toss and elected to field first',
    },
    team1: {
      id: 10,
      name: 'India',
      code: 'IND',
      score: '184/4',
      wickets: 4,
      overs: 18.2,
      runRate: 10.03,
      isBatting: true,
    },
    team2: {
      id: 20,
      name: 'Australia',
      code: 'AUS',
      score: '178/8',
      wickets: 8,
      overs: 20.0,
      runRate: 8.9,
      isBatting: false,
    },
    requiredScore: {
      target: 179,
      runsNeeded: 5,
      ballsRemaining: 10,
      requiredRunRate: 3.0,
      summary: 'India need 5 runs in 10 balls with 6 wickets in hand',
    },
    resultSummary: null,
    currentInnings: 2,
    activeBatters: [
      { id: 'p-virat-k', name: 'Virat Kohli', runs: 74, balls: 48, fours: 6, sixes: 2, strikeRate: 154.2, isOnStrike: false },
      { id: 'p-hardik-p', name: 'Hardik Pandya', runs: 38, balls: 19, fours: 3, sixes: 3, strikeRate: 200.0, isOnStrike: true },
    ],
    activeBowler: {
      id: 'p-pat-c',
      name: 'Pat Cummins',
      overs: 3.2,
      maidens: 0,
      runsConceded: 44,
      wickets: 0,
      economy: 13.2,
    },
    recentBalls: ['0', '6', '1', '4', '4', '6'],
  },
  {
    id: 'm-eng-sa-odi',
    title: 'England vs South Africa — 1st ODI',
    format: 'ODI',
    status: 'COMPLETED',
    venue: "Lord's, London",
    matchDate: '2026-11-02T10:00:00Z',
    isLive: false,
    isDemoData: true,
    dataLabel: 'DEMO DATA',
    toss: {
      winnerTeam: 'England',
      decision: 'BAT',
      summary: 'England won the toss and elected to bat first',
    },
    team1: {
      id: 30,
      name: 'England',
      code: 'ENG',
      score: '312/7',
      wickets: 7,
      overs: 50.0,
      runRate: 6.24,
      isBatting: false,
    },
    team2: {
      id: 40,
      name: 'South Africa',
      code: 'SA',
      score: '288/10',
      wickets: 10,
      overs: 47.4,
      runRate: 6.04,
      isBatting: false,
    },
    resultSummary: 'England won by 24 runs',
    currentInnings: 2,
    activeBatters: [],
    activeBowler: null,
    recentBalls: [],
  },
  {
    id: 'm-nz-pak-t20',
    title: 'New Zealand vs Pakistan — 2nd T20I',
    format: 'T20',
    status: 'UPCOMING',
    venue: 'Eden Park, Auckland',
    matchDate: '2026-11-04T06:00:00Z',
    isLive: false,
    isDemoData: true,
    dataLabel: 'DEMO DATA',
    toss: {
      winnerTeam: null,
      decision: null,
      summary: 'Toss scheduled at 05:30 UTC',
    },
    team1: {
      id: 50,
      name: 'New Zealand',
      code: 'NZ',
      score: 'Scheduled',
      wickets: 0,
      overs: 0,
      runRate: 0,
      isBatting: false,
    },
    team2: {
      id: 60,
      name: 'Pakistan',
      code: 'PAK',
      score: 'Scheduled',
      wickets: 0,
      overs: 0,
      runRate: 0,
      isBatting: false,
    },
    resultSummary: 'Starts tomorrow at 06:00 UTC (Eden Park)',
    currentInnings: 1,
    activeBatters: [],
    activeBowler: null,
    recentBalls: [],
  },
  {
    id: 'm-wi-sl-t20',
    title: 'West Indies vs Sri Lanka — 1st T20I',
    format: 'T20',
    status: 'UPCOMING',
    venue: 'Kensington Oval, Barbados',
    matchDate: '2026-11-05T19:00:00Z',
    isLive: false,
    isDemoData: true,
    dataLabel: 'DEMO DATA',
    toss: {
      winnerTeam: null,
      decision: null,
      summary: 'Toss scheduled at 18:30 UTC',
    },
    team1: {
      id: 70,
      name: 'West Indies',
      code: 'WI',
      score: 'Scheduled',
      wickets: 0,
      overs: 0,
      runRate: 0,
      isBatting: false,
    },
    team2: {
      id: 80,
      name: 'Sri Lanka',
      code: 'SL',
      score: 'Scheduled',
      wickets: 0,
      overs: 0,
      runRate: 0,
      isBatting: false,
    },
    resultSummary: 'Match scheduled for 5 Nov 2026 (Kensington Oval)',
    currentInnings: 1,
    activeBatters: [],
    activeBowler: null,
    recentBalls: [],
  },
  {
    id: 'm-ind-eng-test',
    title: 'India vs England — 4th Test',
    format: 'TEST',
    status: 'COMPLETED',
    venue: 'The Oval, London',
    matchDate: '2026-10-25T10:00:00Z',
    isLive: false,
    isDemoData: true,
    dataLabel: 'DEMO DATA',
    toss: {
      winnerTeam: 'India',
      decision: 'BAT',
      summary: 'India won the toss and elected to bat first',
    },
    team1: {
      id: 10,
      name: 'India',
      code: 'IND',
      score: '345 & 270',
      wickets: 20,
      overs: 176.4,
      runRate: 3.48,
      isBatting: false,
    },
    team2: {
      id: 30,
      name: 'England',
      code: 'ENG',
      score: '290 & 210',
      wickets: 20,
      overs: 147.5,
      runRate: 3.38,
      isBatting: false,
    },
    resultSummary: 'India won by 115 runs',
    currentInnings: 4,
    activeBatters: [],
    activeBowler: null,
    recentBalls: [],
  },
];

/**
 * Detailed Scorecard mock data for m-ind-aus-t20
 */
export const DEMO_SCORECARD_IND_AUS = {
  matchId: 'm-ind-aus-t20',
  isDemoData: true,
  dataLabel: 'DEMO DATA',
  innings: [
    {
      inningsNumber: 1,
      battingTeam: 'Australia',
      battingTeamCode: 'AUS',
      bowlingTeam: 'India',
      bowlingTeamCode: 'IND',
      totalRuns: 178,
      totalWickets: 8,
      oversCompleted: 20.0,
      extras: 8,
      extrasDetails: 'wd 5, nb 1, lb 2, b 0',
      runRate: 8.9,
      batting: [
        { playerId: 'p-travis-h', name: 'Travis Head', dismissal: 'c Gill b Bumrah', runs: 65, balls: 38, fours: 7, sixes: 3, strikeRate: 171.05, isOut: true },
        { playerId: 'p-david-w', name: 'David Warner', dismissal: 'b Siraj', runs: 18, balls: 12, fours: 3, sixes: 0, strikeRate: 150.0, isOut: true },
        { playerId: 'p-mitch-m', name: 'Mitchell Marsh', dismissal: 'c Pant b Kuldeep', runs: 22, balls: 16, fours: 2, sixes: 1, strikeRate: 137.5, isOut: true },
        { playerId: 'p-glenn-m', name: 'Glenn Maxwell', dismissal: 'c Rohit b Bumrah', runs: 54, balls: 28, fours: 4, sixes: 4, strikeRate: 192.85, isOut: true },
        { playerId: 'p-marcus-s', name: 'Marcus Stoinis', dismissal: 'run out (Kohli)', runs: 8, balls: 7, fours: 1, sixes: 0, strikeRate: 114.28, isOut: true },
        { playerId: 'p-tim-d', name: 'Tim David', dismissal: 'b Arshdeep', runs: 5, balls: 6, fours: 0, sixes: 0, strikeRate: 83.33, isOut: true },
        { playerId: 'p-matthew-w', name: 'Matthew Wade', dismissal: 'not out', runs: 4, balls: 3, fours: 0, sixes: 0, strikeRate: 133.33, isOut: false },
        { playerId: 'p-pat-c', name: 'Pat Cummins (c)', dismissal: 'c sub (Axar) b Arshdeep', runs: 2, balls: 4, fours: 0, sixes: 0, strikeRate: 50.0, isOut: true },
        { playerId: 'p-mitch-s', name: 'Mitchell Starc', dismissal: 'c & b Bumrah', runs: 0, balls: 1, fours: 0, sixes: 0, strikeRate: 0.0, isOut: true },
        { playerId: 'p-adam-z', name: 'Adam Zampa', dismissal: 'not out', runs: 0, balls: 1, fours: 0, sixes: 0, strikeRate: 0.0, isOut: false },
      ],
      bowling: [
        { playerId: 'p-jasprit-b', name: 'Jasprit Bumrah', overs: 4.0, maidens: 1, runsConceded: 24, wickets: 3, economy: 6.0, dots: 14 },
        { playerId: 'p-arshdeep-s', name: 'Arshdeep Singh', overs: 4.0, maidens: 0, runsConceded: 38, wickets: 2, economy: 9.5, dots: 9 },
        { playerId: 'p-mohd-s', name: 'Mohammed Siraj', overs: 4.0, maidens: 0, runsConceded: 42, wickets: 1, economy: 10.5, dots: 7 },
        { playerId: 'p-kuldeep-y', name: 'Kuldeep Yadav', overs: 4.0, maidens: 0, runsConceded: 36, wickets: 1, economy: 9.0, dots: 8 },
        { playerId: 'p-hardik-p', name: 'Hardik Pandya', overs: 4.0, maidens: 0, runsConceded: 38, wickets: 0, economy: 9.5, dots: 6 },
      ],
      fallOfWickets: [
        { score: '32/1', player: 'David Warner', over: '3.2' },
        { score: '78/2', player: 'Mitchell Marsh', over: '8.4' },
        { score: '115/3', player: 'Travis Head', over: '12.1' },
        { score: '135/4', player: 'Marcus Stoinis', over: '14.3' },
        { score: '162/5', player: 'Glenn Maxwell', over: '17.2' },
        { score: '170/6', player: 'Tim David', over: '18.3' },
        { score: '176/7', player: 'Pat Cummins', over: '19.2' },
        { score: '176/8', player: 'Mitchell Starc', over: '19.3' },
      ],
    },
    {
      inningsNumber: 2,
      battingTeam: 'India',
      battingTeamCode: 'IND',
      bowlingTeam: 'Australia',
      bowlingTeamCode: 'AUS',
      totalRuns: 184,
      totalWickets: 4,
      oversCompleted: 18.2,
      extras: 4,
      extrasDetails: 'wd 3, nb 0, lb 1, b 0',
      runRate: 10.03,
      batting: [
        { playerId: 'p-rohit-s', name: 'Rohit Sharma (c)', dismissal: 'c Maxwell b Hazlewood', runs: 24, balls: 14, fours: 3, sixes: 1, strikeRate: 171.42, isOut: true },
        { playerId: 'p-shubman-g', name: 'Shubman Gill', dismissal: 'c Wade b Starc', runs: 16, balls: 11, fours: 2, sixes: 0, strikeRate: 145.45, isOut: true },
        { playerId: 'p-virat-k', name: 'Virat Kohli', dismissal: 'not out', runs: 74, balls: 48, fours: 6, sixes: 2, strikeRate: 154.17, isOut: false },
        { playerId: 'p-surya-y', name: 'Suryakumar Yadav', dismissal: 'c Starc b Hazlewood', runs: 28, balls: 15, fours: 3, sixes: 1, strikeRate: 186.67, isOut: true },
        { playerId: 'p-rishabh-p', name: 'Rishabh Pant (wk)', dismissal: 'lbw b Zampa', runs: 4, balls: 5, fours: 0, sixes: 0, strikeRate: 80.0, isOut: true },
        { playerId: 'p-hardik-p', name: 'Hardik Pandya', dismissal: 'not out', runs: 38, balls: 19, fours: 3, sixes: 3, strikeRate: 200.0, isOut: false },
      ],
      bowling: [
        { playerId: 'p-mitch-s', name: 'Mitchell Starc', overs: 3.2, maidens: 0, runsConceded: 38, wickets: 1, economy: 11.4, dots: 6 },
        { playerId: 'p-josh-h', name: 'Josh Hazlewood', overs: 4.0, maidens: 0, runsConceded: 32, wickets: 2, economy: 8.0, dots: 10 },
        { playerId: 'p-pat-c', name: 'Pat Cummins', overs: 4.0, maidens: 0, runsConceded: 44, wickets: 0, economy: 11.0, dots: 7 },
        { playerId: 'p-adam-z', name: 'Adam Zampa', overs: 4.0, maidens: 0, runsConceded: 34, wickets: 1, economy: 8.5, dots: 9 },
        { playerId: 'p-glenn-m', name: 'Glenn Maxwell', overs: 3.0, maidens: 0, runsConceded: 28, wickets: 0, economy: 9.33, dots: 4 },
      ],
      fallOfWickets: [
        { score: '28/1', player: 'Shubman Gill', over: '2.4' },
        { score: '52/2', player: 'Rohit Sharma', over: '4.5' },
        { score: '108/3', player: 'Suryakumar Yadav', over: '11.2' },
        { score: '124/4', player: 'Rishabh Pant', over: '13.1' },
      ],
      yetToBat: [
        { playerId: 'p-ravindra-j', name: 'Ravindra Jadeja' },
        { playerId: 'p-arshdeep-s', name: 'Arshdeep Singh' },
        { playerId: 'p-kuldeep-y', name: 'Kuldeep Yadav' },
        { playerId: 'p-jasprit-b', name: 'Jasprit Bumrah' },
        { playerId: 'p-mohd-s', name: 'Mohammed Siraj' },
      ],
    },
  ],
};

/**
 * Ball-by-ball timeline stream for m-ind-aus-t20 Innings 2 (India chase)
 */
export const DEMO_BALL_EVENTS_IND_AUS = [
  {
    id: 109,
    overNumber: 18,
    ballNumber: 2,
    legalBallNumber: 2,
    bowlerName: 'Pat Cummins',
    batterName: 'Hardik Pandya',
    runsBatter: 6,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: true,
    commentaryText: 'SIX! Smashed high and handsome! Cummins digs it halfway down, and Pandya rocks back instantly to deposit it over deep mid-wicket. Superb timing!',
  },
  {
    id: 108,
    overNumber: 18,
    ballNumber: 1,
    legalBallNumber: 1,
    bowlerName: 'Pat Cummins',
    batterName: 'Hardik Pandya',
    runsBatter: 4,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: true,
    isBoundarySix: false,
    commentaryText: 'FOUR! Slashed away past backward point! Width offered outside off stump and Pandya flays it through the infield for four.',
  },
  {
    id: 107,
    overNumber: 17,
    ballNumber: 6,
    legalBallNumber: 6,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Virat Kohli',
    runsBatter: 1,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Single taken off the hips towards deep square leg. Kohli will retain the strike going into over 19.',
  },
  {
    id: 106,
    overNumber: 17,
    ballNumber: 5,
    legalBallNumber: 5,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Virat Kohli',
    runsBatter: 4,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: true,
    isBoundarySix: false,
    commentaryText: 'FOUR! Majestic cover drive! Full and outside off, Kohli leans into the stroke and creams it through the gap. Pure batting elegance.',
  },
  {
    id: 105,
    overNumber: 17,
    ballNumber: 4,
    legalBallNumber: 4,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Hardik Pandya',
    runsBatter: 1,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Pushed gently into the covers for a quick single.',
  },
  {
    id: 104,
    overNumber: 17,
    ballNumber: 3,
    legalBallNumber: 3,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Hardik Pandya',
    runsBatter: 6,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: true,
    commentaryText: 'SIX! What a strike! Stands tall and clears the long-on ropes with clean authority. Clean strike into the MCG gallery.',
  },
  {
    id: 103,
    overNumber: 17,
    ballNumber: 2,
    legalBallNumber: 2,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Hardik Pandya',
    runsBatter: 0,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Good length on off stump, Pandya defends firmly back to the bowler. Dot ball.',
  },
  {
    id: 102,
    overNumber: 17,
    ballNumber: 1,
    legalBallNumber: 1,
    bowlerName: 'Josh Hazlewood',
    batterName: 'Virat Kohli',
    runsBatter: 1,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Dabbed down to third man for a sensible single to start the 18th over.',
  },
  {
    id: 101,
    overNumber: 16,
    ballNumber: 6,
    legalBallNumber: 6,
    bowlerName: 'Adam Zampa',
    batterName: 'Hardik Pandya',
    runsBatter: 0,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Sharp leg-spinner beats the outside edge as Pandya pushes defensively forward.',
  },
  {
    id: 100,
    overNumber: 16,
    ballNumber: 5,
    legalBallNumber: 5,
    bowlerName: 'Adam Zampa',
    batterName: 'Virat Kohli',
    runsBatter: 1,
    runsExtras: 0,
    isWicket: false,
    isBoundaryFour: false,
    isBoundarySix: false,
    commentaryText: 'Tucked away into mid-wicket pocket for one run.',
  },
  {
    id: 99,
    overNumber: 16,
    ballNumber: 4,
    legalBallNumber: 4,
    bowlerName: 'Adam Zampa',
    batterName: 'Suryakumar Yadav',
    runsBatter: 0,
    runsExtras: 0,
    isWicket: true,
    dismissalType: 'CAUGHT',
    commentaryText: 'WICKET! In the air and caught! Slog sweep doesn’t get the elevation and Mitchell Starc takes a neat catch tumbling forward at deep square leg! SKY departs for 28 (15b).',
  },
];

/**
 * Recent pivotal events for the match details summary
 */
export const DEMO_RECENT_EVENTS_IND_AUS = [
  {
    id: 'ev-1',
    type: 'SIX',
    over: '18.2',
    headline: 'Hardik Pandya hits 6 runs off Cummins',
    detail: 'Clears deep mid-wicket by 15 meters to bring the target within single digits.',
    badge: 'Boundary 6',
    badgeVariant: 'warning',
  },
  {
    id: 'ev-2',
    type: 'FOUR',
    over: '18.1',
    headline: 'Hardik Pandya hits 4 runs off Cummins',
    detail: 'Slashed through backward point to relieve final over pressure.',
    badge: 'Boundary 4',
    badgeVariant: 'neutral',
  },
  {
    id: 'ev-3',
    type: 'MILESTONE',
    over: '17.5',
    headline: 'Virat Kohli reaches 74* runs',
    detail: 'Sensational cover drive brings up 70+ runs off just 48 deliveries.',
    badge: 'Milestone',
    badgeVariant: 'gold',
  },
  {
    id: 'ev-4',
    type: 'WICKET',
    over: '16.4',
    headline: 'WICKET: Suryakumar Yadav c Starc b Zampa (28 off 15b)',
    detail: 'Crucial breakthrough for Australia as SKY holes out in the deep.',
    badge: 'Wicket',
    badgeVariant: 'danger',
  },
  {
    id: 'ev-5',
    type: 'PARTNERSHIP',
    over: '15.0',
    headline: '50-run Partnership between Kohli & Suryakumar',
    detail: 'Came off only 26 balls to wrest momentum back in India’s favor.',
    badge: 'Partnership',
    badgeVariant: 'success',
  },
];

export const matchService = {
  /**
   * Retrieves matches list with optional status, format, and search filtering
   */
  async getMatches({ status = 'ALL', format = 'ALL', search = '', page = 1, pageSize = 20, simulateError = false } = {}) {
    // Artificial 250ms latency to test loading skeletons
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (simulateError) {
      throw new Error('Failed to retrieve match feeds from telemetry network. Please retry.');
    }

    // Check if live Supabase database is connected with match rows
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('matches').select(`
          id, format, status, venue, match_date, result_summary,
          team1:teams!team1_id(id, name, code, short_name, logo_url),
          team2:teams!team2_id(id, name, code, short_name, logo_url),
          innings:match_innings(id, innings_number, total_runs, total_wickets, overs_completed)
        `);

        if (status !== 'ALL') {
          query = query.eq('status', status);
        }
        if (format !== 'ALL') {
          query = query.eq('format', format);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return {
            matches: data,
            isDemoData: false,
            dataLabel: 'LIVE TELEMETRY',
          };
        }
      } catch {
        // Fall back gracefully to demo provider data
      }
    }

    // Filter DEMO_MATCHES
    let filtered = [...DEMO_MATCHES];

    if (status !== 'ALL') {
      filtered = filtered.filter((m) => m.status.toUpperCase() === status.toUpperCase());
    }

    if (format !== 'ALL') {
      filtered = filtered.filter((m) => m.format.toUpperCase() === format.toUpperCase());
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.team1.name.toLowerCase().includes(term) ||
          m.team2.name.toLowerCase().includes(term) ||
          m.team1.code.toLowerCase().includes(term) ||
          m.team2.code.toLowerCase().includes(term) ||
          m.venue.toLowerCase().includes(term)
      );
    }

    return {
      matches: filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      isDemoData: true,
      dataLabel: 'DEMO DATA',
      notice: 'Displaying verified sample cricket match telemetry. Provider integration connects in Milestone 6.',
    };
  },

  /**
   * Retrieves single match detail by ID
   */
  async getMatchById(matchId, { simulateError = false } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (simulateError) {
      throw new Error(`Failed to load match detail for ${matchId}. Network timeout.`);
    }

    if (!matchId) {
      return null;
    }

    const match = DEMO_MATCHES.find((m) => m.id === matchId);
    if (!match) {
      return null;
    }

    return {
      ...match,
      isDemoData: true,
      dataLabel: 'DEMO DATA',
      dataSource: 'Authorized Sample Cricket Feed (Demo)',
    };
  },

  /**
   * Retrieves full 2-innings scorecard for a match
   */
  async getMatchScorecard(matchId, { simulateError = false } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (simulateError) {
      throw new Error(`Failed to retrieve scorecard for match ${matchId}.`);
    }

    if (matchId === 'm-ind-aus-t20') {
      return DEMO_SCORECARD_IND_AUS;
    }

    // Generate basic scorecard for other demo matches if requested
    const match = DEMO_MATCHES.find((m) => m.id === matchId);
    if (!match) {
      return null;
    }

    return {
      matchId,
      isDemoData: true,
      dataLabel: 'DEMO DATA',
      innings: [
        {
          inningsNumber: 1,
          battingTeam: match.team1.name,
          battingTeamCode: match.team1.code,
          bowlingTeam: match.team2.name,
          bowlingTeamCode: match.team2.code,
          totalRuns: typeof match.team1.score === 'string' && match.team1.score.includes('/') ? parseInt(match.team1.score.split('/')[0]) : 0,
          totalWickets: match.team1.wickets || 0,
          oversCompleted: match.team1.overs || 0,
          extras: 0,
          extrasDetails: 'None',
          runRate: match.team1.runRate || 0,
          batting: [],
          bowling: [],
          fallOfWickets: [],
        },
      ],
    };
  },

  /**
   * Retrieves ball-by-ball deliveries
   */
  async getMatchBallEvents(matchId, inningsNumber = 2, { simulateError = false } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (simulateError) {
      throw new Error(`Failed to retrieve delivery stream for match ${matchId}.`);
    }

    if (matchId === 'm-ind-aus-t20') {
      return {
        matchId,
        inningsNumber,
        isDemoData: true,
        dataLabel: 'DEMO DATA',
        events: DEMO_BALL_EVENTS_IND_AUS,
      };
    }

    return {
      matchId,
      inningsNumber,
      isDemoData: true,
      dataLabel: 'DEMO DATA',
      events: [],
    };
  },

  /**
   * Retrieves recent events and pivotal turning points
   */
  async getRecentEvents(matchId) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (matchId === 'm-ind-aus-t20') {
      return {
        matchId,
        isDemoData: true,
        dataLabel: 'DEMO DATA',
        events: DEMO_RECENT_EVENTS_IND_AUS,
      };
    }

    return {
      matchId,
      isDemoData: true,
      dataLabel: 'DEMO DATA',
      events: [],
    };
  },

  /**
   * Creates a new match fixture (Requires ADMIN role)
   */
  async createMatch(matchData) {
    if (!matchData?.title || !matchData?.team1Id || !matchData?.team2Id || !matchData?.format || !matchData?.venue) {
      throw new Error('Missing required match creation fields (title, team1Id, team2Id, format, venue).');
    }

    if (matchData.team1Id === matchData.team2Id) {
      throw new Error('Competing teams must be distinct.');
    }

    try {
      const response = await apiClient.post('/manage-matches', {
        action: 'create',
        ...matchData,
      });

      if (response.data?.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      if (!isSupabaseConfigured()) {
        const newDemoMatch = {
          id: matchData.id || `m-${Date.now()}`,
          title: matchData.title,
          format: matchData.format,
          status: matchData.status || 'UPCOMING',
          venue: matchData.venue,
          matchDate: matchData.matchDate || new Date().toISOString(),
          isLive: matchData.status === 'LIVE' || matchData.status === 'IN_PROGRESS',
          isDemoData: true,
          dataLabel: 'DEMO DATA',
          team1: { name: matchData.team1Id, code: String(matchData.team1Id).toUpperCase().slice(0, 3), score: 'Scheduled', wickets: 0, overs: 0 },
          team2: { name: matchData.team2Id, code: String(matchData.team2Id).toUpperCase().slice(0, 3), score: 'Scheduled', wickets: 0, overs: 0 },
          resultSummary: 'Fixture created by administrator.',
        };
        DEMO_MATCHES.unshift(newDemoMatch);
        return {
          match: newDemoMatch,
          message: 'Match fixture created in development mock mode.',
        };
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to create match fixture.');
    }
  },

  /**
   * Updates an existing match fixture (Requires ADMIN role)
   */
  async updateMatch(matchId, updates) {
    if (!matchId) {
      throw new Error('matchId is required.');
    }

    try {
      const response = await apiClient.post('/manage-matches', {
        action: 'update',
        matchId,
        ...updates,
      });

      if (response.data?.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      if (!isSupabaseConfigured()) {
        const match = DEMO_MATCHES.find((m) => m.id === matchId);
        if (match) {
          Object.assign(match, updates);
          return { match, message: 'Match updated in development mock mode.' };
        }
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to update match fixture.');
    }
  },

  /**
   * Updates match status and optional result (Requires ADMIN role)
   */
  async updateMatchStatus(matchId, { status, resultSummary, winningTeamId }) {
    if (!matchId || !status) {
      throw new Error('matchId and status are required.');
    }

    try {
      const response = await apiClient.post('/manage-matches', {
        action: 'update-status',
        matchId,
        status,
        resultSummary,
        winningTeamId,
      });

      if (response.data?.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      if (!isSupabaseConfigured()) {
        const match = DEMO_MATCHES.find((m) => m.id === matchId);
        if (match) {
          match.status = status;
          if (resultSummary) match.resultSummary = resultSummary;
          match.isLive = status === 'LIVE' || status === 'IN_PROGRESS';
          return { match, message: `Match status updated to ${status}.` };
        }
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to update match status.');
    }
  },
};

export default matchService;
