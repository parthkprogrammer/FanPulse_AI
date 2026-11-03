/**
 * FanPulse AI — Comparison Domain Module
 *
 * Side-by-side squad comparison rules and privacy policies
 * conforming to FR-COMPARE-01 through FR-COMPARE-04 and NFR-SEC-03.
 */

export interface TeamComparisonSummary {
  id: string;
  name: string;
  totalPoints: number;
  captainId: string;
  viceCaptainId: string;
}

export interface ComparisonResult {
  matchId: string;
  team1: TeamComparisonSummary;
  team2: TeamComparisonSummary;
  pointsDifference: number;
  leadingTeamId: string;
  isDraw: boolean;
}

/**
 * Validates privacy policy for team comparison:
 * Users can only compare fantasy teams that belong to their account or approved leagues.
 */
export function validateComparisonPrivacy(
  team1UserId: string,
  team2UserId: string,
  callerUserId?: string
): { isAllowed: boolean; reason?: string } {
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
 * Validates match fixture equality for comparison
 */
export function validateSameMatchFixture(matchId1: string, matchId2: string): boolean {
  return matchId1 === matchId2;
}

