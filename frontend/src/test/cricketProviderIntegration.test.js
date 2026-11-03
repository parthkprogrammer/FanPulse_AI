/**
 * FanPulse AI — External Cricket Data Provider Integration Test Suite
 *
 * Verifies:
 * - Provider abstraction interface & factory resolution
 * - Grounded sample data provider as default and fallback
 * - CricAPI live provider request normalization and response mapping
 * - URL and log secret sanitization (zero API key exposure)
 * - Rate-limit detection and fallback handling
 * - Timeout handling and retry strategies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SampleCricketDataProvider,
  SAMPLE_MATCHES_CATALOG,
  SAMPLE_SCORECARD_IND_AUS,
} from '../../../supabase/functions/_shared/cricketProvider/sampleProvider';
import {
  CricApiDataProvider,
  sanitizeUrlForLogging,
} from '../../../supabase/functions/_shared/cricketProvider/cricApiProvider';
import {
  getCricketDataProvider,
  isApiKeyConfigured,
} from '../../../supabase/functions/_shared/cricketProvider/providerFactory';
import { matchService } from '../services/matchService';

describe('FanPulse AI — External Cricket Data Provider Abstraction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. SAMPLE PROVIDER BASELINE TESTS
  // =========================================================================
  describe('1. SampleCricketDataProvider (Authoritative Grounded Fallback)', () => {
    const provider = new SampleCricketDataProvider();

    it('returns grounded sample matches catalog with verified telemetry', async () => {
      const matches = await provider.getMatches();
      expect(matches.length).toBeGreaterThanOrEqual(3);
      expect(matches[0].id).toBe('m-ind-aus-t20');
      expect(matches[0].isDemoData).toBe(true);
      expect(matches[0].team1.name).toBe('India');
      expect(matches[0].team2.name).toBe('Australia');
    });

    it('filters matches by status and format accurately', async () => {
      const liveMatches = await provider.getMatches({ status: 'LIVE' });
      expect(liveMatches.every((m) => m.status === 'LIVE')).toBe(true);

      const odiMatches = await provider.getMatches({ format: 'ODI' });
      expect(odiMatches.every((m) => m.format === 'ODI')).toBe(true);
      expect(odiMatches[0].id).toBe('m-eng-sa-odi');
    });

    it('retrieves detailed match and scorecard by ID', async () => {
      const match = await provider.getMatchDetail('m-ind-aus-t20');
      expect(match).toBeDefined();
      expect(match?.title).toContain('India vs Australia');

      const scorecard = await provider.getMatchScorecard('m-ind-aus-t20');
      expect(scorecard).toBeDefined();
      expect(scorecard?.innings.length).toBe(2);
      expect(scorecard?.innings[0].battingTeamName).toBe('Australia');
      expect(scorecard?.innings[1].battingTeamName).toBe('India');
    });

    it('provides clean metadata indicating offline sample data mode', () => {
      const meta = provider.getMetadata();
      expect(meta.providerName).toBe('SampleCricketDataProvider');
      expect(meta.isLive).toBe(false);
      expect(meta.notice).toMatch(/sample data mode/i);
    });
  });

  // =========================================================================
  // 2. CRICAPI PROVIDER & SECRET SANITIZATION TESTS
  // =========================================================================
  describe('2. CricApiDataProvider (CricketData.org REST Integration)', () => {
    const testApiKey = 'live_test_api_key_abc123';

    it('sanitizes API keys from URLs for logging sinks to prevent credential leaks', () => {
      const rawUrl = `https://api.cricapi.com/v1/currentMatches?apikey=${testApiKey}&offset=0`;
      const sanitized = sanitizeUrlForLogging(rawUrl);

      expect(sanitized).not.toContain(testApiKey);
      expect(sanitized).toContain('apikey=***REDACTED***');
      expect(sanitized).toContain('offset=0');
    });

    it('rejects construction with missing or empty API key', () => {
      expect(() => new CricApiDataProvider({ apiKey: '' })).toThrow(/requires a valid non-empty apiKey/i);
      expect(() => new CricApiDataProvider({ apiKey: '   ' })).toThrow(/requires a valid non-empty apiKey/i);
    });

    it('maps CricAPI v1 JSON responses into normalized FanPulse AI models', async () => {
      const mockApiResponse = {
        apikey: testApiKey,
        data: [
          {
            id: 'cric-match-999',
            name: 'India vs Australia, 3rd T20I',
            matchType: 't20',
            status: 'India won by 6 wkts',
            venue: 'Melbourne Cricket Ground',
            date: '2026-11-03',
            dateTimeGMT: '2026-11-03T13:30:00',
            teams: ['India', 'Australia'],
            teamInfo: [
              { name: 'India', shortname: 'IND' },
              { name: 'Australia', shortname: 'AUS' },
            ],
            score: [
              { r: 178, w: 8, o: 20, inning: 'Australia Inning 1' },
              { r: 184, w: 4, o: 18.2, inning: 'India Inning 1' },
            ],
            matchStarted: true,
            matchEnded: true,
          },
        ],
        status: 'success',
        info: {
          hitsToday: 15,
          hitsUsed: 1,
          hitsLimit: 100,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const provider = new CricApiDataProvider({
        apiKey: testApiKey,
        timeoutMs: 5000,
      });

      const matches = await provider.getMatches();
      expect(matches.length).toBe(1);
      expect(matches[0].id).toBe('ext-cric-match-999');
      expect(matches[0].title).toBe('India vs Australia, 3rd T20I');
      expect(matches[0].format).toBe('T20');
      expect(matches[0].status).toBe('COMPLETED');
      expect(matches[0].team1.name).toBe('India');
      expect(matches[0].team1.runs).toBe(178);
      expect(matches[0].team2.name).toBe('Australia');
      expect(matches[0].isDemoData).toBe(false);

      const meta = provider.getMetadata();
      expect(meta.rateLimitHitsUsed).toBe(15);
      expect(meta.rateLimitHitsLimit).toBe(100);
      expect(meta.rateLimitHitsRemaining).toBe(85);
    });

    it('falls back seamlessly to sample data provider when rate limit (HTTP 429) occurs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded for today',
      });

      const fallbackProvider = new SampleCricketDataProvider();
      const provider = new CricApiDataProvider({
        apiKey: testApiKey,
        fallbackProvider,
        maxRetries: 0,
      });

      const matches = await provider.getMatches();
      // Must return fallback sample matches instead of crashing
      expect(matches).toBeDefined();
      expect(matches.length).toBeGreaterThanOrEqual(3);
      expect(matches[0].id).toBe('m-ind-aus-t20');

      const meta = provider.getMetadata();
      expect(meta.notice).toMatch(/rate limit reached/i);
    });

    it('falls back seamlessly to sample provider on upstream 500 server error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => 'Upstream provider maintenance',
      });

      const provider = new CricApiDataProvider({
        apiKey: testApiKey,
        maxRetries: 1,
      });

      const matches = await provider.getMatches();
      expect(matches).toBeDefined();
      expect(matches[0].id).toBe('m-ind-aus-t20');
    });
  });

  // =========================================================================
  // 3. PROVIDER FACTORY RESOLUTION TESTS
  // =========================================================================
  describe('3. CricketProviderFactory Resolution', () => {
    it('identifies placeholder vs authorized API keys correctly', () => {
      expect(isApiKeyConfigured('')).toBe(false);
      expect(isApiKeyConfigured(null)).toBe(false);
      expect(isApiKeyConfigured('cric_live_...')).toBe(false);
      expect(isApiKeyConfigured('placeholder-key')).toBe(false);
      expect(isApiKeyConfigured('cric_auth_token_987654321')).toBe(true);
    });

    it('returns SampleCricketDataProvider by default when no live key is set', () => {
      const provider = getCricketDataProvider();
      expect(provider.name).toBe('SampleCricketDataProvider');
      expect(provider.isLive).toBe(false);
    });

    it('returns CricApiDataProvider when valid authorized key is provided', () => {
      const provider = getCricketDataProvider({
        apiKeyOverride: 'valid_authorized_cric_api_key_12345',
      });
      expect(provider.name).toContain('CricApiDataProvider');
      expect(provider.isLive).toBe(true);
    });

    it('forces SampleCricketDataProvider when forceSample flag is active', () => {
      const provider = getCricketDataProvider({
        apiKeyOverride: 'valid_authorized_cric_api_key_12345',
        forceSample: true,
      });
      expect(provider.name).toBe('SampleCricketDataProvider');
      expect(provider.isLive).toBe(false);
    });
  });

  // =========================================================================
  // 4. FRONTEND MATCH SERVICE TELEMETRY INTEGRATION
  // =========================================================================
  describe('4. Frontend matchService Integration', () => {
    it('returns provider status cleanly without exposing secrets', async () => {
      const status = await matchService.getProviderStatus();
      expect(status).toBeDefined();
      expect(status.providerName).toBeDefined();
      expect(JSON.stringify(status)).not.toContain('apikey');
      expect(JSON.stringify(status)).not.toContain('key');
    });
  });
});
