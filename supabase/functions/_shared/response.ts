/**
 * Standardized API response utilities for Supabase Edge Functions.
 */

import { corsHeaders } from './cors.ts';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Returns a standardized JSON success response.
 */
export function jsonResponse<T>(data: T, statusCode = 200, extraHeaders: HeadersInit = {}): Response {
  const payload: ApiResponse<T> = {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

/**
 * Returns a standardized JSON error response.
 */
export function errorResponse(
  message: string,
  statusCode = 400,
  errorName = 'BadRequest',
  details?: unknown,
  extraHeaders: HeadersInit = {}
): Response {
  const payload: ApiResponse = {
    status: 'error',
    error: errorName,
    message,
    details: details ?? null,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}
