/**
 * FanPulse AI — Reusable Request Validation Module
 *
 * Provides request parsing, type checking, field validation,
 * and security sanitization for Supabase Edge Functions.
 */

import { ValidationError } from '../utils/errors.ts';

/**
 * Safely parses JSON body from Request.
 * Throws ValidationError if malformed.
 */
export async function parseJsonBody<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') {
      throw new ValidationError('Request body cannot be empty.');
    }
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ValidationError('Malformed JSON in request body.');
  }
}

/**
 * Validates that all required fields are present and not empty.
 */
export function validateRequiredFields(obj: Record<string, unknown>, requiredFields: string[]): void {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const val = obj[field];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(`Missing required field(s): ${missing.join(', ')}`, {
      missingFields: missing,
    });
  }
}

/**
 * Validates string length boundaries
 */
export function validateStringLength(
  value: string | undefined | null,
  fieldName: string,
  min = 1,
  max = 255
): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  const len = value.trim().length;
  if (len < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters long.`);
  }
  if (len > max) {
    throw new ValidationError(`${fieldName} must not exceed ${max} characters.`);
  }
}

/**
 * Validates that a value is one of allowed enum variants
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): asserts value is T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}: "${value}". Allowed values: ${allowedValues.join(', ')}.`,
      { allowedValues }
    );
  }
}

/**
 * Validates array length constraints
 */
export function validateArrayLength(
  arr: unknown,
  fieldName: string,
  min: number,
  max: number
): void {
  if (!Array.isArray(arr)) {
    throw new ValidationError(`${fieldName} must be an array.`);
  }

  if (arr.length < min || arr.length > max) {
    if (min === max) {
      throw new ValidationError(`${fieldName} must contain exactly ${min} items. Found: ${arr.length}.`);
    }
    throw new ValidationError(
      `${fieldName} must contain between ${min} and ${max} items. Found: ${arr.length}.`
    );
  }
}

/**
 * Validates UUID format
 */
export function validateUuid(value: unknown, fieldName = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID string.`);
  }
}

/**
 * Validates prompt input for LLM against prompt injection attacks
 */
export function validateSanitizedPrompt(prompt: string, fieldName = 'question', maxLength = 250): void {
  validateStringLength(prompt, fieldName, 1, maxLength);

  const lower = prompt.toLowerCase();
  const disallowedPatterns = [
    'ignore all previous instructions',
    'system override',
    'reveal your prompt',
    'act as dan',
    'disregard safety',
    '<script',
  ];

  if (disallowedPatterns.some((pattern) => lower.includes(pattern))) {
    throw new ValidationError(
      `The ${fieldName} contains unauthorized instructions or unsafe tokens.`,
      { field: fieldName }
    );
  }
}

