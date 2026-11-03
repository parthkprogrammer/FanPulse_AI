/**
 * FanPulse AI — AI Response Validator & Hallucination Sanitizer
 * Conforms to AI_MODULE_DESIGN.md §10.
 */

export const FORBIDDEN_ENTITIES = [
  'betting',
  'casino',
  'odds',
  'wager',
  'wagering',
  'bookmaker',
  'bookie',
  'gambling',
  'crypto',
  'payout',
];

export interface OutputValidationResult {
  isValid: boolean;
  sanitizedText: string;
  containsForbiddenKeywords: boolean;
  warnings: string[];
}

/**
 * Validates and sanitizes raw model output before delivering to clients.
 */
export function validateAiOutput(
  rawText: string,
  fallbackSummary?: string
): OutputValidationResult {
  const warnings: string[] = [];

  if (!rawText || rawText.trim().length === 0) {
    return {
      isValid: false,
      sanitizedText:
        fallbackSummary ||
        'Telemetry data for this match is currently being processed. No explanation could be synthesized at this moment.',
      containsForbiddenKeywords: false,
      warnings: ['Empty response received from LLM.'],
    };
  }

  const lower = rawText.toLowerCase();
  const matchedForbidden: string[] = [];
  for (const word of FORBIDDEN_ENTITIES) {
    // Word boundary check
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      matchedForbidden.push(word);
    }
  }

  if (matchedForbidden.length > 0) {
    warnings.push(
      `Forbidden entities detected and blocked: ${matchedForbidden.join(', ')}`
    );
    // Replace with safe, grounded sports summary
    return {
      isValid: false,
      sanitizedText:
        fallbackSummary ||
        'FanPulse AI provides sports analysis and fantasy context exclusively. Betting lines, monetary wagers, and odds speculation are not supported.',
      containsForbiddenKeywords: true,
      warnings,
    };
  }

  // Word count check (< 1500 words to prevent runaway responses)
  const wordCount = rawText.split(/\s+/).length;
  if (wordCount > 1500) {
    warnings.push('Response exceeded maximum word limit; truncating.');
    const truncated = rawText.split(/\s+/).slice(0, 1000).join(' ') + '...';
    return {
      isValid: true,
      sanitizedText: truncated,
      containsForbiddenKeywords: false,
      warnings,
    };
  }

  return {
    isValid: true,
    sanitizedText: rawText.trim(),
    containsForbiddenKeywords: false,
    warnings,
  };
}
