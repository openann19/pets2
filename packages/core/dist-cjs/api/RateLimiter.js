"use strict";
/**
 * Rate Limiter
 * Token bucket rate limiting implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    points;
    duration;
    tokens;
    lastRefill;
    constructor(config) {
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
    tryConsume(tokensToConsume = 1) {
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
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000; // Convert to seconds
        if (elapsed >= this.duration) {
            // Full refill
            this.tokens = this.points;
            this.lastRefill = now;
        }
        else {
            // Partial refill based on elapsed time
            const tokensToAdd = Math.floor((elapsed / this.duration) * this.points);
            this.tokens = Math.min(this.points, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }
    /**
     * Get remaining tokens
     */
    getRemainingTokens() {
        this.refill();
        return this.tokens;
    }
    /**
     * Get time until next refill
     */
    getTimeUntilRefill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        const remaining = this.duration - elapsed;
        return Math.max(0, remaining);
    }
    /**
     * Reset rate limiter
     */
    reset() {
        this.tokens = this.points;
        this.lastRefill = Date.now();
    }
}
exports.RateLimiter = RateLimiter;
