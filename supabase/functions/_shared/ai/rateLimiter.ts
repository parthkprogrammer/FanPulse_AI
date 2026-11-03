/**
 * FanPulse AI — In-Memory Token Bucket Rate Limiter
 * Conforms to AI_MODULE_DESIGN.md §12.1.
 *
 * Rules:
 * - Max 10 requests per minute per user/IP (Burst Limit).
 * - Max 50 requests per calendar day per user/IP (Daily Limit).
 */

interface RateBucket {
  minuteRequests: number[];
  dayRequests: number[];
}

export class AiRateLimiter {
  private buckets = new Map<string, RateBucket>();
  private readonly maxPerMinute: number;
  private readonly maxPerDay: number;

  constructor(maxPerMinute = 10, maxPerDay = 50) {
    this.maxPerMinute = maxPerMinute;
    this.maxPerDay = maxPerDay;
  }

  /**
   * Checks whether the given user/IP identifier is allowed to make an AI query.
   */
  public checkLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let bucket = this.buckets.get(identifier);
    if (!bucket) {
      bucket = { minuteRequests: [], dayRequests: [] };
      this.buckets.set(identifier, bucket);
    }

    // Prune timestamps older than window
    bucket.minuteRequests = bucket.minuteRequests.filter((ts) => ts > oneMinuteAgo);
    bucket.dayRequests = bucket.dayRequests.filter((ts) => ts > oneDayAgo);

    // 1. Check Burst Limit (Per Minute)
    if (bucket.minuteRequests.length >= this.maxPerMinute) {
      const oldestInMinute = bucket.minuteRequests[0];
      const retryAfter = Math.max(1, Math.ceil((oldestInMinute + 60 * 1000 - now) / 1000));
      return {
        allowed: false,
        retryAfterSeconds: retryAfter,
        reason: `Burst rate limit exceeded (${this.maxPerMinute} queries/min). Please wait ${retryAfter}s.`,
      };
    }

    // 2. Check Daily Limit
    if (bucket.dayRequests.length >= this.maxPerDay) {
      const oldestInDay = bucket.dayRequests[0];
      const retryAfter = Math.max(1, Math.ceil((oldestInDay + 24 * 60 * 60 * 1000 - now) / 1000));
      return {
        allowed: false,
        retryAfterSeconds: retryAfter,
        reason: `Daily AI explanation quota reached (${this.maxPerDay} queries/day). Quota resets periodically.`,
      };
    }

    // Record this request
    bucket.minuteRequests.push(now);
    bucket.dayRequests.push(now);

    return { allowed: true };
  }

  /**
   * Resets limits for testing purposes
   */
  public reset(identifier?: string): void {
    if (identifier) {
      this.buckets.delete(identifier);
    } else {
      this.buckets.clear();
    }
  }
}

export const aiRateLimiter = new AiRateLimiter(10, 50);
