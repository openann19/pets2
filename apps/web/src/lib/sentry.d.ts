/**
 * Sentry initialization for error tracking and performance monitoring
 * Production-ready configuration with privacy-first approach
 */
/**
 * Initialize Sentry for client-side error tracking
 */
export declare function initSentry(): void;
/**
 * Set user context in Sentry
 */
export declare function setSentryUser(user: {
    id: string;
    email?: string;
    username?: string;
}): void;
/**
 * Clear user context in Sentry
 */
export declare function clearSentryUser(): void;
/**
 * Add context to Sentry
 */
export declare function setSentryContext(name: string, context: Record<string, unknown>): void;
/**
 * Capture exception manually
 */
export declare function captureException(error: Error, context?: Record<string, unknown>): void;
/**
 * Capture message manually
 */
export declare function captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
/**
 * Start a transaction for performance monitoring
 */
export declare function startTransaction(name: string, op: string): void;
//# sourceMappingURL=sentry.d.ts.map