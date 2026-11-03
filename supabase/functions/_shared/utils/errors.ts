/**
 * FanPulse AI — Centralized Error Handling & Domain Errors
 *
 * Defines standard application error classes and centralized
 * error response mapping conforming to API_DESIGN.md §1.4.
 */

import { errorResponse } from '../shared/response.ts';
import { logger } from './logger.ts';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorName: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, errorName = 'InternalServerError', details: unknown = null) {
    super(message);
    this.name = errorName;
    this.statusCode = statusCode;
    this.errorName = errorName;
    this.details = details;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(message, 400, 'ValidationError', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Bearer token missing or expired.') {
    super(message, 401, 'Unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden. You do not possess the required permissions.') {
    super(message, 403, 'Forbidden');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super(message, 404, 'NotFound');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(message, 409, 'Conflict', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Rate limit exceeded.') {
    super(message, 429, 'RateLimitExceeded');
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'External service returned an invalid or unsuccessful response.', details: unknown = null) {
    super(message, 502, 'BadGateway', details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service is temporarily unavailable. Please try again later.') {
    super(message, 503, 'ServiceUnavailable');
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = 'Upstream service request timed out.') {
    super(message, 504, 'GatewayTimeout');
  }
}

/**
 * Centralized error handler for Supabase Edge Functions.
 * Catches any thrown error, logs structured telemetry, and formats a standardized HTTP response.
 */
export function handleError(err: unknown, moduleName = 'EdgeFunction'): Response {
  if (err instanceof AppError) {
    logger.warn(moduleName, `Operational Error: ${err.message}`, {
      statusCode: err.statusCode,
      errorName: err.errorName,
      details: err.details,
    });

    return errorResponse(err.message, err.statusCode, err.errorName, err.details);
  }

  // Handle Deno/DOM AbortError (Timeout)
  if (err instanceof DOMException && err.name === 'AbortError') {
    logger.error(moduleName, 'Request timed out waiting for upstream dependency', err);
    return errorResponse('Upstream service request timed out.', 504, 'GatewayTimeout');
  }

  // Unhandled / system errors
  const errorMsg = err instanceof Error ? err.message : 'An unexpected internal error occurred';
  logger.error(moduleName, `Unhandled Error: ${errorMsg}`, err);

  return errorResponse(
    'An unexpected error occurred while processing your request.',
    500,
    'InternalServerError'
  );
}

