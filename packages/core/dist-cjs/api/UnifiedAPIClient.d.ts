/**
 * Unified API Client
 * Production-grade API client with circuit breaker, retry logic, offline queue, and error handling
 */
import { OfflineQueueManager, type QueueItem, type QueuePriority } from './OfflineQueueManager';
export interface APIClientConfig {
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
    queueConfig?: {
        maxSize: number;
        persistence: 'memory' | 'localStorage' | 'indexedDB' | 'asyncStorage';
    };
}
export interface UnifiedRequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    retry?: boolean;
    priority?: QueuePriority;
    requireOnline?: boolean;
}
export interface UnifiedResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    retries?: number;
}
export declare class UnifiedAPIClient extends OfflineQueueManager {
    private readonly clientConfig;
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
    request<T>(endpoint: string, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
    /**
     * GET request
     */
    get<T>(endpoint: string, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
    /**
     * POST request
     */
    post<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
    /**
     * DELETE request
     */
    delete<T>(endpoint: string, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>>;
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
