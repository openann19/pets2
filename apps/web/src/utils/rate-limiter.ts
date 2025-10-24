/**
 * Simple in-memory rate limiter for Next.js middleware
 * This is suitable for development and small-scale applications
 * For production, consider using Redis for distributed rate limiting
 */
class RateLimiter {
    requests = new Map();
    /**
     * Check if a request is allowed based on rate limiting rules
     * @param identifier Unique identifier for the client (IP address or user ID)
     * @param limit Maximum number of requests allowed
     * @param windowMs Time window in milliseconds
     * @returns boolean indicating if the request is allowed
     */
    isAllowed(identifier, limit, windowMs) {
        const now = Date.now();
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, { count: 1, firstRequest: now });
            return true;
        }
        const data = this.requests.get(identifier);
        // Reset count if window has expired
        if (now - data.firstRequest > windowMs) {
            data.count = 1;
            data.firstRequest = now;
            this.requests.set(identifier, data);
            return true;
        }
        // Increment count and check limit
        data.count += 1;
        this.requests.set(identifier, data);
        return data.count <= limit;
    }
    /**
     * Get the current request count for an identifier
     */
    getRequestCount(identifier) {
        return this.requests.get(identifier)?.count || 0;
    }
    /**
     * Clear expired entries periodically to prevent memory leaks
     */
    cleanup(windowMs) {
        const now = Date.now();
        for (const [key, data] of Array.from(this.requests.entries())) {
            if (now - data.firstRequest > windowMs) {
                this.requests.delete(key);
            }
        }
    }
}
// Export singleton instance
export const rateLimiter = new RateLimiter();
//# sourceMappingURL=rate-limiter.js.map