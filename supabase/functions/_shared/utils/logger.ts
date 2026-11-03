/**
 * FanPulse AI — Structured JSON Logging Utility
 *
 * Implements structured JSON log formatting for Supabase Edge Functions.
 * Derived from AI_MODULE_DESIGN.md §13 and BACKEND_DESIGN.md.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  requestId?: string;
  userId?: string;
  matchId?: string | number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...(meta || {}),
    };
  }

  debug(module: string, message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatLog('DEBUG', module, message, meta);
    console.debug(JSON.stringify(entry));
  }

  info(module: string, message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatLog('INFO', module, message, meta);
    console.info(JSON.stringify(entry));
  }

  warn(module: string, message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatLog('WARN', module, message, meta);
    console.warn(JSON.stringify(entry));
  }

  error(module: string, message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
        ? { name: 'UnknownError', message: String(error) }
        : undefined;

    const entry = this.formatLog('ERROR', module, message, {
      ...meta,
      error: errorDetails,
    });
    console.error(JSON.stringify(entry));
  }
}

export const logger = new Logger();
export default logger;

