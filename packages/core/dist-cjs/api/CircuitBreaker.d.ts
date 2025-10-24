/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests when service is down
 */
export declare enum CircuitState {
    CLOSED = "CLOSED",// Normal operation, requests pass through
    OPEN = "OPEN",// Circuit is open, requests fail fast
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    resetTimeout: number;
    monitoringPeriod: number;
    healthCheckInterval?: number;
    healthCheckEndpoint?: string;
}
export interface CircuitBreakerMetrics {
    failures: number;
    successes: number;
    totalRequests: number;
    lastFailureTime?: number;
    lastSuccessTime?: number;
    state: CircuitState;
    stateChangedAt: number;
}
export declare class CircuitBreaker {
    private config;
    private state;
    private failures;
    private successes;
    private lastFailureTime?;
    private lastSuccessTime?;
    private stateChangedAt;
    private totalRequests;
    private healthCheckTimer?;
    constructor(config?: Partial<CircuitBreakerConfig>);
    /**
     * Execute a request through the circuit breaker
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Check if circuit is healthy
     */
    isHealthy(): boolean;
    /**
     * Get current metrics
     */
    getMetrics(): CircuitBreakerMetrics;
    /**
     * Manually reset circuit breaker
     */
    reset(): void;
    /**
     * Handle successful request
     */
    private onSuccess;
    /**
     * Handle failed request
     */
    private onFailure;
    /**
     * Transition to a new state
     */
    private transitionTo;
    /**
     * Start periodic health checks
     */
    private startHealthCheck;
    /**
     * Perform health check
     */
    private performHealthCheck;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export declare class CircuitBreakerOpenError extends Error {
    constructor(message: string);
}
