/**
 * Advanced Request Retry Strategy
 * Implements exponential backoff with jitter, retry budgets, and network awareness
 */
export type RetryStrategy = 'none' | 'exponential' | 'linear' | 'fixed';
export type NetworkCondition = 'excellent' | 'good' | 'fair' | 'poor';
export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    strategy: RetryStrategy;
    jitter: boolean;
    retryBudget?: number;
    retryableStatusCodes?: number[];
    retryableErrors?: string[];
}
export interface RetryContext {
    attempt: number;
    totalAttempts: number;
    delay: number;
    elapsedTime: number;
    reason?: string;
}
export declare class RequestRetryStrategy {
    private config;
    private networkCondition;
    constructor(config?: Partial<RetryConfig>);
    /**
     * Execute function with retry logic
     */
    execute<T>(fn: () => Promise<T>, errorHandler?: (error: unknown, context: RetryContext) => boolean): Promise<T>;
    /**
     * Check if error is retryable
     */
    private isRetryable;
    /**
     * Calculate delay based on strategy
     */
    private calculateDelay;
    /**
     * Adjust delay based on network condition
     */
    private adjustForNetworkCondition;
    /**
     * Update network condition
     */
    updateNetworkCondition(condition: NetworkCondition): void;
    /**
     * Generate idempotency key
     */
    generateIdempotencyKey(endpoint: string, data?: unknown): string;
    /**
     * Hash data for idempotency key
     */
    private hashData;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Check if error is network error
     */
    private isNetworkError;
    /**
     * Check if error is HTTP error
     */
    private isHttpError;
    /**
     * Get HTTP status code from error
     */
    private getHttpStatusCode;
    /**
     * Get reason for error
     */
    private getErrorReason;
}
