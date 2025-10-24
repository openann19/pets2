'use client';
import { useRef, useCallback } from 'react';
import { logger } from '../services/logger';
const DEFAULT_CONFIG = {
    maxRequests: 10,
    windowMs: 1000,
    debounceMs: 300,
};
/**
 * Hook for rate-limiting and debouncing swipe actions
 * Prevents spam and reduces backend load
 */
export function useSwipeRateLimit(config = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const requestTimestamps = useRef([]);
    const debounceTimeoutRef = useRef(null);
    const isRateLimited = useCallback(() => {
        const now = Date.now();
        const windowStart = now - fullConfig.windowMs;
        // Remove old timestamps outside the window
        requestTimestamps.current = requestTimestamps.current.filter((timestamp) => timestamp > windowStart);
        // Check if we've exceeded the limit
        if (requestTimestamps.current.length >= fullConfig.maxRequests) {
            logger.warn('Swipe rate limit exceeded', {
                requests: requestTimestamps.current.length,
                limit: fullConfig.maxRequests,
                window: fullConfig.windowMs,
            });
            return true;
        }
        return false;
    }, [fullConfig.maxRequests, fullConfig.windowMs]);
    const recordRequest = useCallback(() => {
        requestTimestamps.current.push(Date.now());
    }, []);
    const debouncedExecute = useCallback((fn, ...args) => {
        // Clear any pending timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            if (!isRateLimited()) {
                recordRequest();
                fn(...args);
                debounceTimeoutRef.current = null;
            }
            else {
                logger.warn('Swipe action blocked - rate limited');
                // Dispatch event to show user feedback
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('swipe-rate-limited', {
                        detail: { message: 'Please slow down! Too many swipes.' },
                    }));
                }
            }
        }, fullConfig.debounceMs);
    }, [isRateLimited, recordRequest, fullConfig.debounceMs]);
    const executeWithRateLimit = useCallback(async (fn, ...args) => {
        if (isRateLimited()) {
            logger.warn('Swipe action blocked - rate limited');
            // Dispatch event to show user feedback
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('swipe-rate-limited', {
                    detail: { message: 'Please slow down! Too many swipes.' },
                }));
            }
            return null;
        }
        recordRequest();
        return await fn(...args);
    }, [isRateLimited, recordRequest]);
    const cleanup = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    }, []);
    return {
        debouncedExecute,
        executeWithRateLimit,
        isRateLimited,
        cleanup,
    };
}
//# sourceMappingURL=useSwipeRateLimit.js.map