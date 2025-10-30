/**
 * Rate Limiter
 * Token bucket rate limiting implementation
 */

export interface RateLimiterConfig {
  points: number; // Maximum number of points
  duration: number; // Duration in seconds
}

export class RateLimiter {
  private points: number;
  private duration: number;
  private tokens: number;
  private lastRefill: number;

  constructor(config: RateLimiterConfig) {
    this.points = config.points;
    this.duration = config.duration;
    this.tokens = config.points;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens
   * @param tokensToConsume Number of tokens to consume (default: 1)
   * @returns true if tokens were consumed, false if rate limit exceeded
   */
  tryConsume(tokensToConsume: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokensToConsume) {
      this.tokens -= tokensToConsume;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // Convert to seconds

    if (elapsed >= this.duration) {
      // Full refill
      this.tokens = this.points;
      this.lastRefill = now;
    } else {
      // Partial refill based on elapsed time
      const tokensToAdd = Math.floor((elapsed / this.duration) * this.points);
      this.tokens = Math.min(this.points, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Get remaining tokens
   */
  getRemainingTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Get time until next refill
   */
  getTimeUntilRefill(): number {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const remaining = this.duration - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.tokens = this.points;
    this.lastRefill = Date.now();
  }
}
