/**
 * Recovery Strategies
 * Provides different recovery strategies for API errors
 */
export interface RecoveryOptions {
    maxRetries?: number;
    retryDelay?: number;
    fallbackData?: unknown;
    onRetry?: (attempt: number) => void;
    onFailure?: (error: unknown) => void;
}
export interface RecoveryResult {
    success: boolean;
    data?: unknown;
    error?: unknown;
    retriesPerformed?: number;
}
export declare class RecoveryStrategies {
    /**
     * Auto-retry with exponential backoff
     */
    autoRetry<T>(fn: () => Promise<T>, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Retry with token refresh
     */
    retryWithTokenRefresh<T>(fn: () => Promise<T>, refreshTokenFn: () => Promise<void>, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Fallback to cached data
     */
    fallbackToCache<T>(fn: () => Promise<T>, getCacheFn: () => Promise<T | null>, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Queue for offline processing
     */
    queueForOffline<T>(fn: () => Promise<T>, queueFn: (data: unknown) => Promise<void>, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Prompt user for intervention
     */
    promptUserIntervention<T>(fn: () => Promise<T>, promptFn: (error: unknown) => Promise<boolean>, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Combined recovery strategy
     */
    combinedRecovery<T>(fn: () => Promise<T>, strategies: {
        retry?: boolean;
        refreshToken?: () => Promise<void>;
        useCache?: () => Promise<T | null>;
        queue?: (data: unknown) => Promise<void>;
        promptUser?: (error: unknown) => Promise<boolean>;
    }, options?: RecoveryOptions): Promise<RecoveryResult>;
    /**
     * Check if error is authentication error
     */
    private isAuthenticationError;
    /**
     * Check if error is network error
     */
    private isNetworkError;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
}
