/**
 * FanPulse AI — Comparison Domain Module
 *
 * Side-by-side fantasy squad comparison, differential identification,
 * positional point aggregations, and privacy policy enforcement.
 * Conforms strictly to REQUIREMENTS.md (§2.6 FR-COMPARE-01 through 04, NFR-SEC-03)
 * and API_DESIGN.md (§7.1).
 */

export interface PlayerComparisonItem {
  playerId: string;
  playerName: string;
  role: string;
  teamCode?: string;
  team1Designation: string; // 'CAPTAIN (2×)', 'VICE_CAPTAIN (1.5×)', 'PLAYER (1×)', or 'NOT_IN_SQUAD'
  team2Designation: string;
  team1Points: number | null;
  team2Points: number | null;
  difference: number;
  status: 'COMMON' | 'TEAM_1_EXCLUSIVE' | 'TEAM_2_EXCLUSIVE';
  isCaptainTeam1: boolean;
  isViceCaptainTeam1: boolean;
  isCaptainTeam2: boolean;
  isViceCaptainTeam2: boolean;
}

export interface RoleBreakdownItem {
  role: string;
  team1Points: number;
  team2Points: number;
}

export interface TopContributorItem {
  name: string;
  role: string;
  points: number;
  badge?: string;
}

export interface TeamComparisonSummary {
  id: string;
  name: string;
  totalPoints: number;
  captain: string;
  captainRole?: string;
  captainPoints?: number;
  viceCaptain: string;
  viceCaptainRole?: string;
  viceCaptainPoints?: number;
}

export interface ComparisonResult {
  matchId: string;
  matchSummary: string;
  team1: TeamComparisonSummary;
  team2: TeamComparisonSummary;
  pointsDifference: number;
  leadingTeamId: string | null;
  isDraw: boolean;
  sharedPlayersCount: number;
  differentialPlayersCount: number;
  topContributors: {
    team1: TopContributorItem[];
    team2: TopContributorItem[];
  };
  captainContributions: {
    team1: { totalMultiplierPoints: number; percentOfTeam: number };
    team2: { totalMultiplierPoints: number; percentOfTeam: number };
    difference: number;
  };
  roleBreakdown: RoleBreakdownItem[];
  playerComparison: PlayerComparisonItem[];
}

/**
 * Validates that two team IDs are distinct (FR-COMPARE-01).
 * Reject comparing a squad with itself.
 */
export function validateDistinctTeams(
  team1Id: string,
  team2Id: string
): { isValid: boolean; error?: string } {
  if (!team1Id || !team2Id) {
    return {
      isValid: false,
      error: 'Both team1Id and team2Id are required for fantasy team comparison (FR-COMPARE-01).',
    };
  }

  if (team1Id === team2Id) {
    return {
      isValid: false,
      error: 'Cannot compare a fantasy team with itself. Select two distinct squads.',
    };
  }

  return { isValid: true };
}

/**
 * Validates privacy policy for team comparison (NFR-SEC-03):
 * Users can only compare fantasy teams that belong to their own account,
 * unless caller possesses elevated ADMIN role.
 */
export function validateComparisonPrivacy(
  team1UserId: string,
  team2UserId: string,
  callerUserId?: string,
  callerRole?: string
): { isAllowed: boolean; reason?: string } {
  // ADMIN role has elevated access to review comparison telemetry across squads
  if (callerRole === 'ADMIN') {
    return { isAllowed: true };
  }

  if (callerUserId) {
    if (team1UserId !== callerUserId || team2UserId !== callerUserId) {
      return {
        isAllowed: false,
        reason: 'Privacy Policy Violation: You can only compare fantasy teams that belong to your account (NFR-SEC-03).',
      };
    }
  }

  return { isAllowed: true };
}

/**
 * Validates match fixture equality for comparison (FR-COMPARE-04):
 * Both squads must belong to the exact same match.
 */
export function validateSameMatchFixture(matchId1: string, matchId2: string): boolean {
  if (!matchId1 || !matchId2) return false;
  return String(matchId1).trim() === String(matchId2).trim();
}

/**
 * Normalizes role display strings (e.g. 'BATTER' -> 'Batters')
 */
export function normalizeRoleCategory(role: string): string {
  const r = (role || '').toUpperCase();
  if (r.includes('BAT')) return 'Batters';
  if (r.includes('BOWL')) return 'Bowlers';
  if (r.includes('ALL') || r.includes('AR')) return 'All-Rounders';
  if (r.includes('KEEP') || r.includes('WK')) return 'Wicket-Keepers';
  return 'Batters';
}

/**
 * Builds the player-by-player side-by-side comparison array (FR-COMPARE-01, FR-COMPARE-03).
 * Identifies shared players (COMMON) and unique players (TEAM_1_EXCLUSIVE, TEAM_2_EXCLUSIVE).
 */
export function buildPlayerComparisonList(
  team1Players: Array<{
    id?: string;
    playerId?: string;
    player_id?: string;
    name?: string;
    playerName?: string;
    player_name?: string;
    role?: string;
    player_role?: string;
    teamCode?: string;
    team_code?: string;
  }>,
  team2Players: Array<{
    id?: string;
    playerId?: string;
    player_id?: string;
    name?: string;
    playerName?: string;
    player_name?: string;
    role?: string;
    player_role?: string;
    teamCode?: string;
    team_code?: string;
  }>,
  pointsMap1: Record<string, number> = {},
  pointsMap2: Record<string, number> = {},
  captain1Id?: string,
  viceCaptain1Id?: string,
  captain2Id?: string,
  viceCaptain2Id?: string
): PlayerComparisonItem[] {
  const map1 = new Map<string, any>();
  for (const p of team1Players) {
    const id = p.playerId || p.player_id || p.id || '';
    if (id) map1.set(id, p);
  }

  const map2 = new Map<string, any>();
  for (const p of team2Players) {
    const id = p.playerId || p.player_id || p.id || '';
    if (id) map2.set(id, p);
  }

  // All unique player IDs across both rosters
  const allPlayerIds = new Set<string>([...map1.keys(), ...map2.keys()]);
  const comparisonItems: PlayerComparisonItem[] = [];

  for (const pId of allPlayerIds) {
    const inTeam1 = map1.has(pId);
    const inTeam2 = map2.has(pId);

    const ref = map1.get(pId) || map2.get(pId);
    const playerName = ref.playerName || ref.player_name || ref.name || 'Player';
    const role = (ref.player_role || ref.role || 'BATTER').toUpperCase();
    const teamCode = ref.teamCode || ref.team_code || '';

    const isCap1 = inTeam1 && pId === captain1Id;
    const isVc1 = inTeam1 && pId === viceCaptain1Id;
    const isCap2 = inTeam2 && pId === captain2Id;
    const isVc2 = inTeam2 && pId === viceCaptain2Id;

    let team1Designation = 'NOT_IN_SQUAD';
    if (inTeam1) {
      if (isCap1) team1Designation = 'CAPTAIN (2×)';
      else if (isVc1) team1Designation = 'VICE_CAPTAIN (1.5×)';
      else team1Designation = 'PLAYER (1×)';
    }

    let team2Designation = 'NOT_IN_SQUAD';
    if (inTeam2) {
      if (isCap2) team2Designation = 'CAPTAIN (2×)';
      else if (isVc2) team2Designation = 'VICE_CAPTAIN (1.5×)';
      else team2Designation = 'PLAYER (1×)';
    }

    const team1Points = inTeam1 ? Number(pointsMap1[pId] ?? 0) : null;
    const team2Points = inTeam2 ? Number(pointsMap2[pId] ?? 0) : null;

    let difference = 0;
    if (team1Points !== null && team2Points !== null) {
      difference = Number((team1Points - team2Points).toFixed(2));
    } else if (team1Points !== null) {
      difference = team1Points;
    } else if (team2Points !== null) {
      difference = Number((-team2Points).toFixed(2));
    }

    let status: 'COMMON' | 'TEAM_1_EXCLUSIVE' | 'TEAM_2_EXCLUSIVE' = 'COMMON';
    if (inTeam1 && !inTeam2) status = 'TEAM_1_EXCLUSIVE';
    else if (!inTeam1 && inTeam2) status = 'TEAM_2_EXCLUSIVE';

    comparisonItems.push({
      playerId: pId,
      playerName,
      role,
      teamCode,
      team1Designation,
      team2Designation,
      team1Points,
      team2Points,
      difference,
      status,
      isCaptainTeam1: isCap1,
      isViceCaptainTeam1: isVc1,
      isCaptainTeam2: isCap2,
      isViceCaptainTeam2: isVc2,
    });
  }

  // Sort: Common players first, then Team 1 differentials, then Team 2 differentials
  return comparisonItems.sort((a, b) => {
    if (a.status === 'COMMON' && b.status !== 'COMMON') return -1;
    if (a.status !== 'COMMON' && b.status === 'COMMON') return 1;
    return Math.abs(b.difference) - Math.abs(a.difference);
  });
}

/**
 * Aggregates positional fantasy points across Batters, Bowlers, All-Rounders, Wicket-Keepers.
 */
export function calculateRoleBreakdown(
  playerComparison: PlayerComparisonItem[]
): RoleBreakdownItem[] {
  const roles = ['Batters', 'Bowlers', 'All-Rounders', 'Wicket-Keepers'];
  const breakdownMap: Record<string, { team1: number; team2: number }> = {
    Batters: { team1: 0, team2: 0 },
    Bowlers: { team1: 0, team2: 0 },
    'All-Rounders': { team1: 0, team2: 0 },
    'Wicket-Keepers': { team1: 0, team2: 0 },
  };

  for (const item of playerComparison) {
    const category = normalizeRoleCategory(item.role);
    if (breakdownMap[category]) {
      if (item.team1Points !== null) breakdownMap[category].team1 += item.team1Points;
      if (item.team2Points !== null) breakdownMap[category].team2 += item.team2Points;
    }
  }

  return roles.map((r) => ({
    role: r,
    team1Points: Number(breakdownMap[r].team1.toFixed(2)),
    team2Points: Number(breakdownMap[r].team2.toFixed(2)),
  }));
}

/**
 * Identifies the top 3 scoring contributors for each team.
 */
export function identifyTopContributors(
  playerComparison: PlayerComparisonItem[],
  limit = 3
): { team1: TopContributorItem[]; team2: TopContributorItem[] } {
  const team1Candidates = playerComparison
    .filter((p) => p.team1Points !== null)
    .sort((a, b) => (b.team1Points ?? 0) - (a.team1Points ?? 0))
    .slice(0, limit)
    .map((p) => {
      let badge = 'Base';
      if (p.isCaptainTeam1) badge = 'Captain 2×';
      else if (p.isViceCaptainTeam1) badge = 'Vice-Captain 1.5×';

      const label = p.isCaptainTeam1 ? `${p.playerName} (C)` : p.isViceCaptainTeam1 ? `${p.playerName} (VC)` : p.playerName;
      return {
        name: label,
        role: p.role,
        points: Number(p.team1Points ?? 0),
        badge,
      };
    });

  const team2Candidates = playerComparison
    .filter((p) => p.team2Points !== null)
    .sort((a, b) => (b.team2Points ?? 0) - (a.team2Points ?? 0))
    .slice(0, limit)
    .map((p) => {
      let badge = 'Base';
      if (p.isCaptainTeam2) badge = 'Captain 2×';
      else if (p.isViceCaptainTeam2) badge = 'Vice-Captain 1.5×';

      const label = p.isCaptainTeam2 ? `${p.playerName} (C)` : p.isViceCaptainTeam2 ? `${p.playerName} (VC)` : p.playerName;
      return {
        name: label,
        role: p.role,
        points: Number(p.team2Points ?? 0),
        badge,
      };
    });

  return { team1: team1Candidates, team2: team2Candidates };
}

/**
 * Assembles the authoritative comparison result object from two squads and points.
 */
export function computeTeamComparison(
  team1: {
    id: string;
    team_name?: string;
    teamName?: string;
    match_id?: string;
    matchId?: string;
    total_points?: number;
    totalPoints?: number;
    captain_player_id?: string;
    captainPlayerId?: string;
    vice_captain_player_id?: string;
    viceCaptainPlayerId?: string;
    players?: any[];
  },
  team2: {
    id: string;
    team_name?: string;
    teamName?: string;
    match_id?: string;
    matchId?: string;
    total_points?: number;
    totalPoints?: number;
    captain_player_id?: string;
    captainPlayerId?: string;
    vice_captain_player_id?: string;
    viceCaptainPlayerId?: string;
    players?: any[];
  },
  pointsMap1: Record<string, number> = {},
  pointsMap2: Record<string, number> = {},
  matchSummary = 'Cricket Fixture'
): ComparisonResult {
  const t1Id = team1.id;
  const t2Id = team2.id;
  const matchId = team1.matchId || team1.match_id || '';

  const cap1Id = team1.captainPlayerId || team1.captain_player_id;
  const vc1Id = team1.viceCaptainPlayerId || team1.vice_captain_player_id;
  const cap2Id = team2.captainPlayerId || team2.captain_player_id;
  const vc2Id = team2.viceCaptainPlayerId || team2.vice_captain_player_id;

  const t1Players = team1.players || [];
  const t2Players = team2.players || [];

  const playerComparison = buildPlayerComparisonList(
    t1Players,
    t2Players,
    pointsMap1,
    pointsMap2,
    cap1Id,
    vc1Id,
    cap2Id,
    vc2Id
  );

  // Compute total points authoritatively from player points
  const computedTotal1 = Number(
    playerComparison
      .filter((p) => p.team1Points !== null)
      .reduce((sum, p) => sum + (p.team1Points || 0), 0)
      .toFixed(2)
  );

  const computedTotal2 = Number(
    playerComparison
      .filter((p) => p.team2Points !== null)
      .reduce((sum, p) => sum + (p.team2Points || 0), 0)
      .toFixed(2)
  );

  const totalPoints1 = team1.totalPoints ?? team1.total_points ?? computedTotal1;
  const totalPoints2 = team2.totalPoints ?? team2.total_points ?? computedTotal2;

  const pointsDifference = Number(Math.abs(totalPoints1 - totalPoints2).toFixed(2));
  const isDraw = totalPoints1 === totalPoints2;
  const leadingTeamId = isDraw ? null : totalPoints1 > totalPoints2 ? t1Id : t2Id;

  // Captaincy points
  const cap1Item = playerComparison.find((p) => p.isCaptainTeam1);
  const vc1Item = playerComparison.find((p) => p.isViceCaptainTeam1);
  const cap2Item = playerComparison.find((p) => p.isCaptainTeam2);
  const vc2Item = playerComparison.find((p) => p.isViceCaptainTeam2);

  const cap1Points = cap1Item?.team1Points ?? 0;
  const vc1Points = vc1Item?.team1Points ?? 0;
  const cap2Points = cap2Item?.team2Points ?? 0;
  const vc2Points = vc2Item?.team2Points ?? 0;

  const totalMultPoints1 = Number((cap1Points + vc1Points).toFixed(2));
  const totalMultPoints2 = Number((cap2Points + vc2Points).toFixed(2));

  const pct1 = totalPoints1 > 0 ? Number(((totalMultPoints1 / totalPoints1) * 100).toFixed(1)) : 0;
  const pct2 = totalPoints2 > 0 ? Number(((totalMultPoints2 / totalPoints2) * 100).toFixed(1)) : 0;

  const sharedPlayersCount = playerComparison.filter((p) => p.status === 'COMMON').length;
  const differentialPlayersCount = playerComparison.filter((p) => p.status !== 'COMMON').length;

  const topContributors = identifyTopContributors(playerComparison);
  const roleBreakdown = calculateRoleBreakdown(playerComparison);

  return {
    matchId,
    matchSummary,
    team1: {
      id: t1Id,
      name: team1.teamName || team1.team_name || 'Team 1',
      totalPoints: totalPoints1,
      captain: cap1Item?.playerName || 'Captain',
      captainRole: cap1Item?.role || 'BATTER',
      captainPoints: cap1Points,
      viceCaptain: vc1Item?.playerName || 'Vice-Captain',
      viceCaptainRole: vc1Item?.role || 'BOWLER',
      viceCaptainPoints: vc1Points,
    },
    team2: {
      id: t2Id,
      name: team2.teamName || team2.team_name || 'Team 2',
      totalPoints: totalPoints2,
      captain: cap2Item?.playerName || 'Captain',
      captainRole: cap2Item?.role || 'BATTER',
      captainPoints: cap2Points,
      viceCaptain: vc2Item?.playerName || 'Vice-Captain',
      viceCaptainRole: vc2Item?.role || 'BOWLER',
      viceCaptainPoints: vc2Points,
    },
    pointsDifference,
    leadingTeamId,
    isDraw,
    sharedPlayersCount,
    differentialPlayersCount,
    topContributors,
    captainContributions: {
      team1: { totalMultiplierPoints: totalMultPoints1, percentOfTeam: pct1 },
      team2: { totalMultiplierPoints: totalMultPoints2, percentOfTeam: pct2 },
      difference: Number(Math.abs(totalMultPoints1 - totalMultPoints2).toFixed(2)),
    },
    roleBreakdown,
    playerComparison,
  };
}
