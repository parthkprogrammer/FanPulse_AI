/**
 * FanPulse AI — Cricket Data Provider Factory
 *
 * Implements Dependency Inversion & Factory pattern for external provider resolution.
 * Automatically resolves CricApiDataProvider if authorized credentials exist,
 * or gracefully defaults to SampleCricketDataProvider.
 */

import { type CricketDataProvider } from './types.ts';
import { SampleCricketDataProvider } from './sampleProvider.ts';
import { CricApiDataProvider } from './cricApiProvider.ts';
import { logger } from '../utils/logger.ts';

export interface ProviderFactoryOptions {
  forceSample?: boolean;
  apiKeyOverride?: string;
  baseUrlOverride?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export function isApiKeyConfigured(key?: string | null): boolean {
  if (!key) return false;
  const clean = key.trim().toLowerCase();
  return (
    clean.length > 5 &&
    !clean.includes('placeholder') &&
    !clean.includes('your-api-key') &&
    !clean.includes('cric_live_...')
  );
}

export function getCricketDataProvider(options: ProviderFactoryOptions = {}): CricketDataProvider {
  if (options.forceSample) {
    logger.info('CricketProviderFactory', 'SampleCricketDataProvider selected via forceSample flag.');
    return new SampleCricketDataProvider();
  }

  // 1. Resolve API key from options override or Deno environment
  let apiKey: string | undefined = options.apiKeyOverride;
  if (!apiKey && typeof Deno !== 'undefined') {
    apiKey = Deno.env.get('CRICKET_DATA_API_KEY');
  }

  // 2. Resolve Base URL
  let baseUrl: string | undefined = options.baseUrlOverride;
  if (!baseUrl && typeof Deno !== 'undefined') {
    baseUrl = Deno.env.get('CRICKET_DATA_API_BASE_URL');
  }

  // 3. If valid authorized key exists, instantiate live client
  if (isApiKeyConfigured(apiKey)) {
    logger.info('CricketProviderFactory', 'Authorized external provider detected. Initializing CricApiDataProvider.');
    return new CricApiDataProvider({
      apiKey: apiKey!.trim(),
      baseUrl,
      timeoutMs: options.timeoutMs,
      maxRetries: options.maxRetries,
      fallbackProvider: new SampleCricketDataProvider(),
    });
  }

  // 4. Default to sample provider
  logger.info('CricketProviderFactory', 'No external provider key configured. Initializing default SampleCricketDataProvider.');
  return new SampleCricketDataProvider();
}
