interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    debounceMs?: number;
}
/**
 * Hook for rate-limiting and debouncing swipe actions
 * Prevents spam and reduces backend load
 */
export declare function useSwipeRateLimit(config?: Partial<RateLimitConfig>): {
    debouncedExecute: <T extends unknown[]>(fn: (...args: T) => Promise<void> | void, ...args: T) => void;
    executeWithRateLimit: <T extends unknown[], R>(fn: (...args: T) => Promise<R>, ...args: T) => Promise<R | null>;
    isRateLimited: () => boolean;
    cleanup: () => void;
};
export {};
//# sourceMappingURL=useSwipeRateLimit.d.ts.map