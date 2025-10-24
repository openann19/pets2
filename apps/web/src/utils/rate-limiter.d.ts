/**
 * Simple in-memory rate limiter for Next.js middleware
 * This is suitable for development and small-scale applications
 * For production, consider using Redis for distributed rate limiting
 */
declare class RateLimiter {
    private requests;
    /**
     * Check if a request is allowed based on rate limiting rules
     * @param identifier Unique identifier for the client (IP address or user ID)
     * @param limit Maximum number of requests allowed
     * @param windowMs Time window in milliseconds
     * @returns boolean indicating if the request is allowed
     */
    isAllowed(identifier: string, limit: number, windowMs: number): boolean;
    /**
     * Get the current request count for an identifier
     */
    getRequestCount(identifier: string): number;
    /**
     * Clear expired entries periodically to prevent memory leaks
     */
    cleanup(windowMs: number): void;
}
export declare const rateLimiter: RateLimiter;
export {};
//# sourceMappingURL=rate-limiter.d.ts.map