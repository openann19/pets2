/**
 * Unified API Client
 * Production-grade API client with circuit breaker, retry logic, offline queue, and error handling
 */
import { OfflineQueueManager, QueueItem, QueuePriority, QueueConfig } from './OfflineQueueManager';
export interface APIClientConfig extends QueueConfig {
    baseURL: string;
    timeout?: number;
    retryConfig?: {
        maxRetries: number;
        baseDelay: number;
        maxDelay: number;
    };
    circuitBreakerConfig?: {
        failureThreshold: number;
        successThreshold: number;
        resetTimeout: number;
    };
}
export interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    retry?: boolean;
    priority?: QueuePriority;
    requireOnline?: boolean;
}
export interface Response<T> {
    success: boolean;
    data: T | null;
    error?: string;
    statusCode?: number;
    retries?: number;
}
export declare class UnifiedAPIClient extends OfflineQueueManager {
    private apiConfig;
    private circuitBreaker;
    private retryStrategy;
    private errorClassifier;
    private recoveryStrategies;
    private token;
    private tokenRefreshFn?;
    private cache;
    constructor(config: APIClientConfig);
    /**
     * Set authentication token
     */
    setToken(token: string): void;
    /**
     * Set token refresh function
     */
    setTokenRefreshFn(fn: () => Promise<void>): void;
    /**
     * Execute API request
     */
    request<T>(endpoint: string, config?: RequestConfig): Promise<Response<T>>;
    /**
     * GET request
     */
    get<T>(endpoint: string, config?: RequestConfig): Promise<Response<T>>;
    /**
     * POST request
     */
    post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<Response<T>>;
    /**
     * DELETE request
     */
    delete<T>(endpoint: string, config?: RequestConfig): Promise<Response<T>>;
    /**
     * Make actual HTTP request
     */
    private makeRequest;
    /**
     * Handle error with recovery strategies
     */
    private handleError;
    /**
     * Process queue item
     */
    protected processItem(item: QueueItem): Promise<void>;
    /**
     * Get cached data
     */
    private getCache;
    /**
     * Set cache
     */
    private setCache;
    /**
     * Get circuit breaker metrics
     */
    getCircuitBreakerMetrics(): import("./CircuitBreaker").CircuitBreakerMetrics;
    /**
     * Get queue statistics
     */
    getQueueStats(): import("./OfflineQueueManager").QueueStats;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export declare class APIError extends Error {
    statusCode?: number | undefined;
    constructor(message: string, statusCode?: number | undefined);
}
