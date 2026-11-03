/**
 * FanPulse AI — Backend Configuration Module
 *
 * Provides typed, centralized access to environment variables,
 * secret management, runtime detection, and application constants.
 */

// Supported deployment environments
export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface AppConfig {
  environment: Environment;
  serviceName: string;
  version: string;
  supabase: {
    url: string;
    anonKey: string;
    hasServiceRoleKey: boolean;
  };
  ai: {
    model: string;
    temperature: number;
    maxOutputTokens: number;
    timeoutMs: number;
    hasApiKey: boolean;
  };
  telemetry: {
    timeoutMs: number;
  };
}

/**
 * Reads an environment variable across Deno and Node/browser runtimes safely.
 */
export function getEnv(key: string, defaultValue = ''): string {
  // Deno runtime
  if (typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function') {
    return Deno.env.get(key) ?? defaultValue;
  }
  // Node / Vite / process.env fallback
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }
  return defaultValue;
}

/**
 * Returns current environment ('development', 'staging', 'production', 'test')
 */
export function getEnvironment(): Environment {
  const env = (getEnv('ENVIRONMENT') || getEnv('NODE_ENV') || 'development').toLowerCase();
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'staging' || env === 'stage') return 'staging';
  if (env === 'test' || env === 'testing') return 'test';
  return 'development';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Returns the centralized application configuration
 */
export function getConfig(): AppConfig {
  const env = getEnvironment();
  const supabaseUrl = getEnv('SUPABASE_URL', 'https://placeholder-project.supabase.co');
  const anonKey = getEnv('SUPABASE_ANON_KEY', '');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  const geminiApiKey = getEnv('GEMINI_API_KEY', '');

  return {
    environment: env,
    serviceName: 'fanpulse-ai-edge-functions',
    version: '0.1.0',
    supabase: {
      url: supabaseUrl,
      anonKey,
      hasServiceRoleKey: Boolean(serviceRoleKey && !serviceRoleKey.includes('placeholder')),
    },
    ai: {
      model: getEnv('AI_MODEL', 'gemini-1.5-flash'),
      temperature: 0.2,
      maxOutputTokens: 600,
      timeoutMs: 12000,
      hasApiKey: Boolean(geminiApiKey && !geminiApiKey.includes('placeholder')),
    },
    telemetry: {
      timeoutMs: 10000,
    },
  };
}

/**
 * Validates critical environment configuration
 */
export function validateConfig(): { isValid: boolean; missingKeys: string[] } {
  const missing: string[] = [];
  const env = getEnvironment();

  if (!getEnv('SUPABASE_URL')) missing.push('SUPABASE_URL');
  if (!getEnv('SUPABASE_ANON_KEY')) missing.push('SUPABASE_ANON_KEY');

  // Service role key is required for administrative backend tasks in production
  if (env === 'production' && !getEnv('SUPABASE_SERVICE_ROLE_KEY')) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    isValid: missing.length === 0,
    missingKeys: missing,
  };
}

