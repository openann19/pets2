/**
 * Rate Limiter
 * Token bucket rate limiting implementation
 */
export interface RateLimiterConfig {
    points: number;
    duration: number;
}
export declare class RateLimiter {
    private points;
    private duration;
    private tokens;
    private lastRefill;
    constructor(config: RateLimiterConfig);
    /**
     * Try to consume tokens
     * @param tokensToConsume Number of tokens to consume (default: 1)
     * @returns true if tokens were consumed, false if rate limit exceeded
     */
    tryConsume(tokensToConsume?: number): boolean;
    /**
     * Refill tokens based on elapsed time
     */
    private refill;
    /**
     * Get remaining tokens
     */
    getRemainingTokens(): number;
    /**
     * Get time until next refill
     */
    getTimeUntilRefill(): number;
    /**
     * Reset rate limiter
     */
    reset(): void;
}
