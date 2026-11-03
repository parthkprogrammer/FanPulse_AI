/**
 * FanPulse AI — Deterministic Fantasy Scoring Domain Module
 *
 * Configurable, deterministic fantasy scoring engine conforming strictly
 * to REQUIREMENTS.md (§4.2 BR-SCORE-*), DATABASE_DESIGN.md (§3.11, §3.14, §7.2),
 * and SYSTEM_ARCHITECTURE.md (§8).
 *
 * Server-Side Ruleset:
 * - Batting: Runs (+1), Fours (+1), Sixes (+2), 50s (+10), 100s (+25), Duck (-5, bowler exempt in ODI/TEST)
 * - Bowling: Wickets (+25), Maidens (+10), 3-Wkts (+10), 5-Wkts (+25), Econ <=4.0 (+10, min 2 ov), Econ >=10.0 (-10, min 2 ov)
 * - Fielding: Catches (+10), Direct Run-Out (+15), Indirect Run-Out (+10), Stumpings (+15)
 * - Multipliers: Captain (2.0x), Vice-Captain (1.5x)
 */

export interface ScoringRulesConfig {
  version: string;
  // Batting
  RUN: number;
  BOUNDARY_FOUR: number;
  BOUNDARY_SIX: number;
  HALF_CENTURY_BONUS: number;
  CENTURY_BONUS: number;
  DUCK_PENALTY: number;

  // Bowling
  WICKET: number;
  MAIDEN_OVER: number;
  THREE_WICKET_HAUL: number;
  THREE_WICKET_BONUS: number;
  FIVE_WICKET_HAUL: number;
  FIVE_WICKET_BONUS: number;
  ECONOMY_RATE_BONUS: number;
  ECONOMY_RATE_PENALTY: number;

  // Fielding
  CATCH: number;
  RUN_OUT_DIRECT: number;
  RUN_OUT_INDIRECT: number;
  STUMPING: number;

  // Multipliers
  CAPTAIN_MULTIPLIER: number;
  VICE_CAPTAIN_MULTIPLIER: number;
}

export const DEFAULT_SCORING_RULES: ScoringRulesConfig = {
  version: 'v1.0',
  // Batting (BR-SCORE-BAT-01 through 06)
  RUN: 1.0,
  BOUNDARY_FOUR: 1.0,
  BOUNDARY_SIX: 2.0,
  HALF_CENTURY_BONUS: 10.0,
  CENTURY_BONUS: 25.0,
  DUCK_PENALTY: -5.0,

  // Bowling (BR-SCORE-BOWL-01 through 06)
  WICKET: 25.0,
  MAIDEN_OVER: 10.0,
  THREE_WICKET_HAUL: 10.0,
  THREE_WICKET_BONUS: 10.0,
  FIVE_WICKET_HAUL: 25.0,
  FIVE_WICKET_BONUS: 25.0,
  ECONOMY_RATE_BONUS: 10.0,
  ECONOMY_RATE_PENALTY: -10.0,

  // Fielding (BR-SCORE-FIELD-01 through 04)
  CATCH: 10.0,
  RUN_OUT_DIRECT: 15.0,
  RUN_OUT_INDIRECT: 10.0,
  STUMPING: 15.0,

  // Multipliers (BR-SCORE-MULT-01 and 02)
  CAPTAIN_MULTIPLIER: 2.0,
  VICE_CAPTAIN_MULTIPLIER: 1.5,
} as const;

export const SCORING_RULES = DEFAULT_SCORING_RULES;

export interface PlayerPerformanceInput {
  playerId: string;
  playerName?: string;
  role?: string;
  runsScored?: number;
  runs_scored?: number;
  ballsFaced?: number;
  balls_faced?: number;
  fours?: number;
  sixes?: number;
  isOut?: boolean;
  is_out?: boolean;
  dismissalType?: string;
  dismissal_type?: string;
  oversBowled?: number;
  overs_bowled?: number;
  maidens?: number;
  runsConceded?: number;
  runs_conceded?: number;
  wicketsTaken?: number;
  wickets_taken?: number;
  economyRate?: number;
  economy_rate?: number;
  catches?: number;
  stumpings?: number;
  runOutsDirect?: number;
  run_outs_direct?: number;
  runOutsIndirect?: number;
  run_outs_indirect?: number;
  runOuts?: number;
  run_outs?: number;
}

export interface ScoreBreakdownItem {
  category: 'BATTING' | 'BOWLING' | 'FIELDING' | 'BONUS' | 'PENALTY';
  rule: string;
  eventKey: string;
  count: number;
  points: number;
}

export interface PlayerScoreBreakdown {
  playerId: string;
  playerName: string;
  role: string;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  breakdown: ScoreBreakdownItem[];
  rulesetVersion: string;
}

export interface TeamScoreResult {
  fantasyTeamId: string;
  teamName: string;
  matchId: string;
  totalPoints: number;
  playerPoints: PlayerScoreBreakdown[];
  rulesetVersion: string;
  calculatedAt: string;
}

/**
 * Accurately parses cricket overs notation (e.g. 3.4 = 3 overs + 4 balls) into total balls.
 */
export function convertOversToBalls(overs: number): number {
  if (!overs || isNaN(overs) || overs <= 0) return 0;
  const fullOvers = Math.floor(overs);
  const extraBalls = Math.round((overs - fullOvers) * 10);
  return fullOvers * 6 + Math.min(extraBalls, 6);
}

/**
 * Calculates economy rate (runs per 6 legal balls) safely.
 */
export function calculateEconomyRate(runsConceded: number, oversBowled: number): number | null {
  const totalBalls = convertOversToBalls(oversBowled);
  if (totalBalls === 0) return null;
  const legalOvers = totalBalls / 6;
  return Number((runsConceded / legalOvers).toFixed(2));
}

/**
 * Applies Captain or Vice-Captain multiplier to base points with standard 2 decimal places rounding.
 */
export function applyMultiplier(
  basePoints: number,
  isCaptain: boolean,
  isViceCaptain: boolean,
  rules: Partial<ScoringRulesConfig> = DEFAULT_SCORING_RULES
): number {
  const capMult = rules.CAPTAIN_MULTIPLIER ?? DEFAULT_SCORING_RULES.CAPTAIN_MULTIPLIER;
  const vcMult = rules.VICE_CAPTAIN_MULTIPLIER ?? DEFAULT_SCORING_RULES.VICE_CAPTAIN_MULTIPLIER;

  if (isCaptain) {
    return Number((basePoints * capMult).toFixed(2));
  }
  if (isViceCaptain) {
    return Number((basePoints * vcMult).toFixed(2));
  }
  return Number(basePoints.toFixed(2));
}

/**
 * Deterministic, server-side function to calculate fantasy points for a single player's match performance.
 * Adheres strictly to BR-SCORE-BAT-*, BR-SCORE-BOWL-*, BR-SCORE-FIELD-*, BR-SCORE-MULT-*.
 */
export function calculatePlayerScore(
  performance: Partial<PlayerPerformanceInput> = {},
  rulesConfig: Partial<ScoringRulesConfig> = DEFAULT_SCORING_RULES,
  options: {
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    format?: string;
    role?: string;
    playerName?: string;
  } = {}
): PlayerScoreBreakdown {
  const rules = { ...DEFAULT_SCORING_RULES, ...rulesConfig };
  const breakdown: ScoreBreakdownItem[] = [];

  const playerId = performance.playerId || 'unknown-player';
  const playerName = performance.playerName || options.playerName || 'Player';
  const role = (performance.role || options.role || 'BATTER').toUpperCase();
  const format = (options.format || 'ALL').toUpperCase();

  // Normalize inputs (supporting camelCase and snake_case safely with defaults)
  const runsScored = Math.max(0, performance.runsScored ?? performance.runs_scored ?? 0);
  const ballsFaced = Math.max(0, performance.ballsFaced ?? performance.balls_faced ?? 0);
  const fours = Math.max(0, performance.fours ?? 0);
  const sixes = Math.max(0, performance.sixes ?? 0);

  const rawIsOut = performance.isOut ?? performance.is_out;
  const rawDismissal = performance.dismissalType ?? performance.dismissal_type;
  const isOut = rawIsOut === true || (Boolean(rawDismissal) && rawDismissal !== 'NOT_OUT');

  const oversBowled = Math.max(0, performance.oversBowled ?? performance.overs_bowled ?? 0);
  const maidens = Math.max(0, performance.maidens ?? 0);
  const runsConceded = Math.max(0, performance.runsConceded ?? performance.runs_conceded ?? 0);
  const wicketsTaken = Math.max(0, performance.wicketsTaken ?? performance.wickets_taken ?? 0);

  const catches = Math.max(0, performance.catches ?? 0);
  const stumpings = Math.max(0, performance.stumpings ?? 0);
  const runOutsDirect = Math.max(0, performance.runOutsDirect ?? performance.run_outs_direct ?? 0);
  const runOutsIndirect = Math.max(0, performance.runOutsIndirect ?? performance.run_outs_indirect ?? 0);
  const genericRunOuts = Math.max(0, performance.runOuts ?? performance.run_outs ?? 0);

  // --------------------------------------------------------------------------
  // 1. Batting Points (BR-SCORE-BAT-01 through 06)
  // --------------------------------------------------------------------------
  if (runsScored > 0) {
    breakdown.push({
      category: 'BATTING',
      rule: `Runs Scored (${runsScored})`,
      eventKey: 'RUN_SCORED',
      count: runsScored,
      points: Number((runsScored * rules.RUN).toFixed(2)),
    });
  }

  if (fours > 0) {
    breakdown.push({
      category: 'BATTING',
      rule: `Boundary Bonus - 4s (${fours})`,
      eventKey: 'BOUNDARY_FOUR',
      count: fours,
      points: Number((fours * rules.BOUNDARY_FOUR).toFixed(2)),
    });
  }

  if (sixes > 0) {
    breakdown.push({
      category: 'BATTING',
      rule: `Boundary Bonus - 6s (${sixes})`,
      eventKey: 'BOUNDARY_SIX',
      count: sixes,
      points: Number((sixes * rules.BOUNDARY_SIX).toFixed(2)),
    });
  }

  // Milestones: 100 runs (Century) takes precedence over 50 runs (Half-Century)
  if (runsScored >= 100) {
    breakdown.push({
      category: 'BONUS',
      rule: 'Century Bonus (100+)',
      eventKey: 'CENTURY_BONUS',
      count: 1,
      points: rules.CENTURY_BONUS,
    });
  } else if (runsScored >= 50) {
    breakdown.push({
      category: 'BONUS',
      rule: 'Half-Century Bonus (50-99)',
      eventKey: 'HALF_CENTURY_BONUS',
      count: 1,
      points: rules.HALF_CENTURY_BONUS,
    });
  }

  // Duck Penalty (BR-SCORE-BAT-06): 0 runs, dismissed, excluding bowlers in Test/ODI
  const isBowlerInTestOrOdi = (format === 'TEST' || format === 'ODI') && role === 'BOWLER';
  const actuallyBattedAndDismissedForZero = runsScored === 0 && isOut && (ballsFaced > 0 || rawIsOut === true);

  if (actuallyBattedAndDismissedForZero && !isBowlerInTestOrOdi) {
    breakdown.push({
      category: 'PENALTY',
      rule: 'Duck Dismissal Penalty',
      eventKey: 'DUCK_PENALTY',
      count: 1,
      points: rules.DUCK_PENALTY,
    });
  }

  // --------------------------------------------------------------------------
  // 2. Bowling Points (BR-SCORE-BOWL-01 through 06)
  // --------------------------------------------------------------------------
  if (wicketsTaken > 0) {
    breakdown.push({
      category: 'BOWLING',
      rule: `Wickets Taken (${wicketsTaken})`,
      eventKey: 'WICKET_TAKEN',
      count: wicketsTaken,
      points: Number((wicketsTaken * rules.WICKET).toFixed(2)),
    });
  }

  if (maidens > 0) {
    breakdown.push({
      category: 'BOWLING',
      rule: `Maiden Overs (${maidens})`,
      eventKey: 'MAIDEN_OVER',
      count: maidens,
      points: Number((maidens * rules.MAIDEN_OVER).toFixed(2)),
    });
  }

  // Wicket Haul Milestones: 5-wicket haul takes precedence over 3-wicket haul
  if (wicketsTaken >= 5) {
    const pts = rules.FIVE_WICKET_HAUL ?? rules.FIVE_WICKET_BONUS ?? 25.0;
    breakdown.push({
      category: 'BONUS',
      rule: '5-Wicket Haul Bonus',
      eventKey: 'FIVE_WICKET_HAUL',
      count: 1,
      points: pts,
    });
  } else if (wicketsTaken >= 3) {
    const pts = rules.THREE_WICKET_HAUL ?? rules.THREE_WICKET_BONUS ?? 10.0;
    breakdown.push({
      category: 'BONUS',
      rule: '3-Wicket Haul Bonus',
      eventKey: 'THREE_WICKET_HAUL',
      count: 1,
      points: pts,
    });
  }

  // Economy Rate Bonus & Penalty (Minimum 2.0 overs bowled required)
  const totalBallsBowled = convertOversToBalls(oversBowled);
  if (totalBallsBowled >= 12) {
    const calculatedEcon = calculateEconomyRate(runsConceded, oversBowled);
    const economy = performance.economyRate ?? performance.economy_rate ?? calculatedEcon;

    if (economy !== null && !isNaN(economy)) {
      if (economy <= 4.0) {
        breakdown.push({
          category: 'BONUS',
          rule: `Economy Rate Bonus (Econ ${economy} <= 4.0)`,
          eventKey: 'ECONOMY_RATE_BONUS',
          count: 1,
          points: rules.ECONOMY_RATE_BONUS,
        });
      } else if (economy >= 10.0) {
        breakdown.push({
          category: 'PENALTY',
          rule: `Economy Rate Penalty (Econ ${economy} >= 10.0)`,
          eventKey: 'ECONOMY_RATE_PENALTY',
          count: 1,
          points: rules.ECONOMY_RATE_PENALTY,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. Fielding Points (BR-SCORE-FIELD-01 through 04)
  // --------------------------------------------------------------------------
  if (catches > 0) {
    breakdown.push({
      category: 'FIELDING',
      rule: `Catches Taken (${catches})`,
      eventKey: 'CATCH_TAKEN',
      count: catches,
      points: Number((catches * rules.CATCH).toFixed(2)),
    });
  }

  if (stumpings > 0) {
    breakdown.push({
      category: 'FIELDING',
      rule: `Stumpings (${stumpings})`,
      eventKey: 'STUMPING',
      count: stumpings,
      points: Number((stumpings * rules.STUMPING).toFixed(2)),
    });
  }

  if (runOutsDirect > 0) {
    breakdown.push({
      category: 'FIELDING',
      rule: `Direct Run-Outs (${runOutsDirect})`,
      eventKey: 'RUN_OUT_DIRECT',
      count: runOutsDirect,
      points: Number((runOutsDirect * rules.RUN_OUT_DIRECT).toFixed(2)),
    });
  }

  if (runOutsIndirect > 0) {
    breakdown.push({
      category: 'FIELDING',
      rule: `Indirect Run-Outs (${runOutsIndirect})`,
      eventKey: 'RUN_OUT_INDIRECT',
      count: runOutsIndirect,
      points: Number((runOutsIndirect * rules.RUN_OUT_INDIRECT).toFixed(2)),
    });
  }

  // Fallback for general run-out counter if direct/indirect is not distinguished
  if (genericRunOuts > 0 && runOutsDirect === 0 && runOutsIndirect === 0) {
    breakdown.push({
      category: 'FIELDING',
      rule: `Run-Outs (${genericRunOuts})`,
      eventKey: 'RUN_OUT_INDIRECT',
      count: genericRunOuts,
      points: Number((genericRunOuts * rules.RUN_OUT_INDIRECT).toFixed(2)),
    });
  }

  // --------------------------------------------------------------------------
  // 4. Base Points Sum & Multiplier Application (BR-SCORE-MULT-01 and 02)
  // --------------------------------------------------------------------------
  const basePoints = Number(
    breakdown.reduce((sum, item) => sum + item.points, 0).toFixed(2)
  );

  const isCaptain = Boolean(options.isCaptain);
  const isViceCaptain = Boolean(options.isViceCaptain) && !isCaptain;

  let multiplier = 1.0;
  if (isCaptain) multiplier = rules.CAPTAIN_MULTIPLIER;
  else if (isViceCaptain) multiplier = rules.VICE_CAPTAIN_MULTIPLIER;

  const finalPoints = Number((basePoints * multiplier).toFixed(2));

  return {
    playerId,
    playerName,
    role,
    basePoints,
    multiplier,
    finalPoints,
    isCaptain,
    isViceCaptain,
    breakdown,
    rulesetVersion: rules.version || 'v1.0',
  };
}

/**
 * Deterministic function to evaluate total fantasy team score from individual player performances.
 * Sums all 11 player points and handles absent/incomplete stats without crashing.
 */
export function calculateTeamScore(
  team: {
    id?: string;
    teamId?: string;
    team_name?: string;
    teamName?: string;
    match_id?: string;
    matchId?: string;
    captain_player_id?: string;
    captainPlayerId?: string;
    vice_captain_player_id?: string;
    viceCaptainPlayerId?: string;
    players?: Array<{
      id?: string;
      playerId?: string;
      player_id?: string;
      name?: string;
      playerName?: string;
      player_name?: string;
      role?: string;
      player_role?: string;
    }>;
  },
  performancesMap: Record<string, Partial<PlayerPerformanceInput>> | Map<string, Partial<PlayerPerformanceInput>> = {},
  rulesConfig: Partial<ScoringRulesConfig> = DEFAULT_SCORING_RULES,
  options: { format?: string } = {}
): TeamScoreResult {
  const fantasyTeamId = team.id || team.teamId || 'unknown-team';
  const teamName = team.teamName || team.team_name || 'Fantasy Squad';
  const matchId = team.matchId || team.match_id || '';
  const captainId = team.captainPlayerId || team.captain_player_id;
  const viceCaptainId = team.viceCaptainPlayerId || team.vice_captain_player_id;

  const playersList = team.players || [];
  const playerPoints: PlayerScoreBreakdown[] = [];

  for (const p of playersList) {
    const pId = p.playerId || p.player_id || p.id || '';
    const pName = p.playerName || p.player_name || p.name || 'Player';
    const pRole = p.player_role || p.role || 'BATTER';

    // Lookup performance safely
    let perf: Partial<PlayerPerformanceInput> = {};
    if (performancesMap instanceof Map) {
      perf = performancesMap.get(pId) || {};
    } else if (typeof performancesMap === 'object' && performancesMap !== null) {
      perf = performancesMap[pId] || {};
    }

    const isCap = pId === captainId;
    const isVc = pId === viceCaptainId && !isCap;

    const playerResult = calculatePlayerScore(
      { ...perf, playerId: pId, playerName: pName, role: pRole },
      rulesConfig,
      {
        isCaptain: isCap,
        isViceCaptain: isVc,
        format: options.format,
        role: pRole,
        playerName: pName,
      }
    );

    playerPoints.push(playerResult);
  }

  // Sum total points
  const totalPoints = Number(
    playerPoints.reduce((sum, item) => sum + item.finalPoints, 0).toFixed(2)
  );

  return {
    fantasyTeamId,
    teamName,
    matchId,
    totalPoints,
    playerPoints,
    rulesetVersion: rulesConfig.version || DEFAULT_SCORING_RULES.version,
    calculatedAt: new Date().toISOString(),
  };
}
