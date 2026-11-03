/**
 * FanPulse AI — External CricAPI / CricketData.org Provider Integration
 *
 * Implements CricketDataProvider for authorized REST access to live cricket data.
 * Features:
 * - Robust HTTP client with configurable timeout and exponential backoff retry.
 * - Rate-limit detection and tracking (hitsLimit, hitsUsed, hitsRemaining).
 * - Automatic transparent fallback to SampleCricketDataProvider upon outage or quota exhaustion.
 * - Strict credential sanitization in telemetry logs.
 * - Defensive schema validation and response normalization.
 */

import {
  type CricketDataProvider,
  type NormalizedMatch,
  type NormalizedScorecard,
  type NormalizedInningsScorecard,
  type NormalizedBatterStats,
  type NormalizedBowlerStats,
  type ProviderMetadata,
  type MatchStatus,
  type MatchFormat,
} from './types.ts';
import { SampleCricketDataProvider } from './sampleProvider.ts';
import { logger } from '../utils/logger.ts';

export interface CricApiConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  fallbackProvider?: CricketDataProvider;
}

export function sanitizeUrlForLogging(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (url.searchParams.has('apikey')) {
      url.searchParams.set('apikey', '***REDACTED***');
    }
    if (url.searchParams.has('api_key')) {
      url.searchParams.set('api_key', '***REDACTED***');
    }
    return url.toString();
  } catch {
    return rawUrl.replace(/apikey=[^&]+/gi, 'apikey=***REDACTED***');
  }
}

export class CricApiDataProvider implements CricketDataProvider {
  readonly name = 'CricApiDataProvider (CricketData.org)';
  readonly isLive = true;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fallbackProvider: CricketDataProvider;

  private hitsLimit: number | undefined;
  private hitsUsed: number | undefined;
  private lastSyncTimestamp: string | undefined;
  private isRateLimited = false;

  constructor(config: CricApiConfig) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error('CricApiDataProvider requires a valid non-empty apiKey.');
    }

    this.apiKey = config.apiKey.trim();
    this.baseUrl = (config.baseUrl || 'https://api.cricapi.com/v1').replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs || 8000;
    this.maxRetries = config.maxRetries !== undefined ? config.maxRetries : 2;
    this.fallbackProvider = config.fallbackProvider || new SampleCricketDataProvider();
  }

  /**
   * Resilient HTTP fetcher with timeout and exponential backoff retry.
   * Never retries 4xx client errors. Sanitizes secrets in all logs.
   */
  private async fetchWithRetry<T = unknown>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`);
    url.searchParams.set('apikey', this.apiKey);

    for (const [key, val] of Object.entries(queryParams)) {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, val);
      }
    }

    const sanitizedUrl = sanitizeUrlForLogging(url.toString());
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'FanPulseAI-TelemetryClient/1.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timer);

        // 1. Check HTTP Status
        if (response.status === 429) {
          this.isRateLimited = true;
          logger.warn('CricApiDataProvider', `Rate limit exceeded (HTTP 429) on ${sanitizedUrl}. Activating fallback.`);
          throw new Error('CricAPI rate limit reached (HTTP 429).');
        }

        if (response.status >= 400 && response.status < 500) {
          // Client error (401 invalid key, 404 not found, etc.) — do NOT retry
          const bodyText = await response.text().catch(() => '');
          throw new Error(`Upstream API returned HTTP ${response.status}: ${bodyText.slice(0, 150)}`);
        }

        if (!response.ok) {
          // 5xx Server Error — eligible for retry
          throw new Error(`Upstream server error HTTP ${response.status}`);
        }

        const data = await response.json();

        // 2. Parse CricAPI Rate Limit Info
        if (data?.info) {
          this.hitsLimit = Number(data.info.hitsLimit) || this.hitsLimit;
          this.hitsUsed = Number(data.info.hitsToday || data.info.hitsUsed) || this.hitsUsed;
        }

        // 3. Check CricAPI business logic errors in JSON payload
        if (data?.status === 'failure') {
          const reason = data.reason || 'Upstream provider returned failure status';
          if (reason.toLowerCase().includes('rate limit') || reason.toLowerCase().includes('hit limit')) {
            this.isRateLimited = true;
          }
          throw new Error(`CricAPI failure: ${reason}`);
        }

        this.lastSyncTimestamp = new Date().toISOString();
        return data as T;
      } catch (err: unknown) {
        clearTimeout(timer);
        lastError = err instanceof Error ? err : new Error(String(err));

        const isAbort = lastError.name === 'AbortError' || lastError.message.includes('abort');
        const isClientError = lastError.message.includes('HTTP 4') && !lastError.message.includes('HTTP 429');

        if (isClientError || this.isRateLimited || attempt === this.maxRetries) {
          break;
        }

        // Exponential backoff with jitter: delay = 300 * 2^attempt + random(0, 150)ms
        attempt++;
        const backoffDelay = 300 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 150);
        logger.warn('CricApiDataProvider', `Transient fetch error on ${sanitizedUrl} (attempt ${attempt}/${this.maxRetries}). Retrying in ${backoffDelay}ms...`, {
          error: lastError.message,
          isTimeout: isAbort,
        });

        await new Promise((res) => setTimeout(res, backoffDelay));
      }
    }

    throw lastError || new Error(`Failed to fetch from ${sanitizedUrl} after ${this.maxRetries} retries.`);
  }

  /**
   * Normalizes match status string from CricAPI
   */
  private normalizeStatus(rawStatus?: string, started?: boolean, ended?: boolean): MatchStatus {
    if (ended) return 'COMPLETED';
    if (started) return 'LIVE';
    if (!rawStatus) return 'UPCOMING';

    const s = rawStatus.toUpperCase();
    if (s.includes('WON') || s.includes('TIED') || s.includes('COMPLETED') || s.includes('RESULT')) return 'COMPLETED';
    if (s.includes('INNING') || s.includes('LIVE') || s.includes('PROGRESS') || s.includes('TRAIL') || s.includes('LEAD')) return 'LIVE';
    if (s.includes('ABANDON') || s.includes('RAIN') || s.includes('CANCEL')) return 'ABANDONED';
    return 'UPCOMING';
  }

  /**
   * Normalizes cricket format
   */
  private normalizeFormat(rawType?: string): MatchFormat {
    if (!rawType) return 'T20';
    const t = rawType.toUpperCase();
    if (t.includes('ODI') || t.includes('LIST A') || t.includes('50')) return 'ODI';
    if (t.includes('TEST') || t.includes('FIRST CLASS')) return 'TEST';
    return 'T20';
  }

  /**
   * Retrieves active, scheduled, and recent cricket matches
   */
  async getMatches(options: { status?: string; format?: string; limit?: number; offset?: number } = {}): Promise<NormalizedMatch[]> {
    try {
      const response = await this.fetchWithRetry<{
        status: string;
        data?: Array<Record<string, any>>;
      }>('currentMatches', {
        offset: String(options.offset || 0),
      });

      const matches = response.data || [];
      if (!Array.isArray(matches) || matches.length === 0) {
        logger.info('CricApiDataProvider', 'No live matches returned from external API. Delegating to sample fallback.');
        return this.fallbackProvider.getMatches(options);
      }

      const normalized: NormalizedMatch[] = matches.map((m: any) => {
        const teamNames = m.teams || ['Team 1', 'Team 2'];
        const team1Name = teamNames[0] || 'Team 1';
        const team2Name = teamNames[1] || 'Team 2';

        const teamInfos = m.teamInfo || [];
        const t1Info = teamInfos.find((ti: any) => ti.name === team1Name);
        const t2Info = teamInfos.find((ti: any) => ti.name === team2Name);

        const scores = m.score || [];
        const s1 = scores[0];
        const s2 = scores[1];

        const matchStatus = this.normalizeStatus(m.status, m.matchStarted, m.matchEnded);
        const matchFormat = this.normalizeFormat(m.matchType);

        return {
          id: `ext-${m.id}`,
          externalId: String(m.id),
          title: m.name || `${team1Name} vs ${team2Name}`,
          format: matchFormat,
          status: matchStatus,
          venue: m.venue || 'International Cricket Venue',
          matchDate: m.dateTimeGMT ? `${m.dateTimeGMT}Z` : (m.date || new Date().toISOString()),
          team1: {
            name: team1Name,
            code: t1Info?.shortname || team1Name.substring(0, 3).toUpperCase(),
            runs: s1?.r !== undefined ? Number(s1.r) : undefined,
            wickets: s1?.w !== undefined ? Number(s1.w) : undefined,
            overs: s1?.o !== undefined ? Number(s1.o) : undefined,
            scoreDisplay: s1 ? `${s1.r}/${s1.w} (${s1.o} ov)` : undefined,
            isBatting: matchStatus === 'LIVE' && (!s2 || s1?.inning?.includes('Inning 2')),
          },
          team2: {
            name: team2Name,
            code: t2Info?.shortname || team2Name.substring(0, 3).toUpperCase(),
            runs: s2?.r !== undefined ? Number(s2.r) : undefined,
            wickets: s2?.w !== undefined ? Number(s2.w) : undefined,
            overs: s2?.o !== undefined ? Number(s2.o) : undefined,
            scoreDisplay: s2 ? `${s2.r}/${s2.w} (${s2.o} ov)` : undefined,
            isBatting: matchStatus === 'LIVE' && s2 && s2?.inning?.includes('Inning 2'),
          },
          resultSummary: m.status || null,
          currentInnings: scores.length || 1,
          isLive: matchStatus === 'LIVE',
          dataSource: this.name,
          isDemoData: false,
        };
      });

      let filtered = normalized;
      if (options.status && options.status !== 'ALL') {
        filtered = filtered.filter((m) => m.status.toUpperCase() === options.status?.toUpperCase());
      }
      if (options.format && options.format !== 'ALL') {
        filtered = filtered.filter((m) => m.format.toUpperCase() === options.format?.toUpperCase());
      }

      return filtered.slice(0, options.limit || 20);
    } catch (err: unknown) {
      logger.warn('CricApiDataProvider', 'Failed to retrieve live matches from CricAPI. Falling back safely to sample dataset.', {
        error: err instanceof Error ? err.message : String(err),
      });
      return this.fallbackProvider.getMatches(options);
    }
  }

  /**
   * Retrieves single match details by ID
   */
  async getMatchDetail(matchId: string): Promise<NormalizedMatch | null> {
    const rawExternalId = matchId.replace(/^ext-/, '');

    try {
      const response = await this.fetchWithRetry<{
        status: string;
        data?: Record<string, any>;
      }>('match_info', { id: rawExternalId });

      const m = response.data;
      if (!m) return this.fallbackProvider.getMatchDetail(matchId);

      const teamNames = m.teams || ['Team 1', 'Team 2'];
      const status = this.normalizeStatus(m.status, m.matchStarted, m.matchEnded);

      return {
        id: `ext-${m.id}`,
        externalId: String(m.id),
        title: m.name || `${teamNames[0]} vs ${teamNames[1]}`,
        format: this.normalizeFormat(m.matchType),
        status,
        venue: m.venue || 'International Cricket Venue',
        matchDate: m.dateTimeGMT ? `${m.dateTimeGMT}Z` : (m.date || new Date().toISOString()),
        team1: { name: teamNames[0], code: teamNames[0].substring(0, 3).toUpperCase() },
        team2: { name: teamNames[1], code: teamNames[1].substring(0, 3).toUpperCase() },
        resultSummary: m.status || null,
        isLive: status === 'LIVE',
        dataSource: this.name,
        isDemoData: false,
      };
    } catch (err: unknown) {
      logger.warn('CricApiDataProvider', `Match detail fetch failed for ${matchId}. Using fallback.`, {
        error: err instanceof Error ? err.message : String(err),
      });
      return this.fallbackProvider.getMatchDetail(matchId);
    }
  }

  /**
   * Retrieves match scorecard
   */
  async getMatchScorecard(matchId: string): Promise<NormalizedScorecard | null> {
    const rawExternalId = matchId.replace(/^ext-/, '');

    try {
      const response = await this.fetchWithRetry<{
        status: string;
        data?: Record<string, any>;
      }>('match_scorecard', { id: rawExternalId });

      const data = response.data;
      if (!data || !data.scorecard) {
        return this.fallbackProvider.getMatchScorecard(matchId);
      }

      const innings: NormalizedInningsScorecard[] = (data.scorecard || []).map((sc: any, index: number) => {
        const battingList: NormalizedBatterStats[] = (sc.batting || []).map((b: any) => ({
          playerId: b.batsman?.id ? `p-${b.batsman.id}` : undefined,
          playerName: b.batsman?.name || 'Batter',
          runs: Number(b.r) || 0,
          ballsFaced: Number(b.b) || 0,
          fours: Number(b['4s']) || 0,
          sixes: Number(b['6s']) || 0,
          strikeRate: Number(b.sr) || 0,
          isOut: !(b['dismissal-text'] || '').toLowerCase().includes('not out'),
          dismissalText: b['dismissal-text'] || '',
        }));

        const bowlingList: NormalizedBowlerStats[] = (sc.bowling || []).map((bw: any) => ({
          playerId: bw.bowler?.id ? `p-${bw.bowler.id}` : undefined,
          playerName: bw.bowler?.name || 'Bowler',
          overs: Number(bw.o) || 0,
          maidens: Number(bw.m) || 0,
          runsConceded: Number(bw.r) || 0,
          wickets: Number(bw.w) || 0,
          economy: Number(bw.eco) || 0,
        }));

        return {
          inningsNumber: index + 1,
          battingTeamName: sc.inning || `Innings ${index + 1}`,
          battingTeamCode: (sc.inning || 'BAT').substring(0, 3).toUpperCase(),
          bowlingTeamName: 'Opponent',
          bowlingTeamCode: 'OPP',
          totalRuns: battingList.reduce((acc, b) => acc + b.runs, 0),
          totalWickets: battingList.filter((b) => b.isOut).length,
          oversCompleted: bowlingList.reduce((max, b) => Math.max(max, b.overs), 0),
          extras: 0,
          batting: battingList,
          bowling: bowlingList,
        };
      });

      return {
        matchId: `ext-${data.id}`,
        title: data.name || 'Cricket Match Scorecard',
        format: this.normalizeFormat(data.matchType),
        status: this.normalizeStatus(data.status),
        innings,
        dataSource: this.name,
        isDemoData: false,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err: unknown) {
      logger.warn('CricApiDataProvider', `Scorecard fetch failed for ${matchId}. Using fallback.`, {
        error: err instanceof Error ? err.message : String(err),
      });
      return this.fallbackProvider.getMatchScorecard(matchId);
    }
  }

  getMetadata(): ProviderMetadata {
    const hitsRemaining =
      this.hitsLimit !== undefined && this.hitsUsed !== undefined
        ? Math.max(0, this.hitsLimit - this.hitsUsed)
        : undefined;

    return {
      providerName: this.name,
      isLive: true,
      rateLimitHitsLimit: this.hitsLimit,
      rateLimitHitsUsed: this.hitsUsed,
      rateLimitHitsRemaining: hitsRemaining,
      lastSyncTimestamp: this.lastSyncTimestamp,
      notice: this.isRateLimited
        ? 'Live API rate limit reached. Fallback sample telemetry is active.'
        : 'Live CricketData.org API connected.',
    };
  }
}
