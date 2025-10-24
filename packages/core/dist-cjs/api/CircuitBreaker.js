"use strict";
/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests when service is down
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerOpenError = exports.CircuitBreaker = exports.CircuitState = void 0;
const logger_1 = require("../utils/logger");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN"; // Testing if service recovered
})(CircuitState || (exports.CircuitState = CircuitState = {}));
const DEFAULT_CONFIG = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    resetTimeout: 60000,
    monitoringPeriod: 60000,
};
class CircuitBreaker {
    config;
    state = CircuitState.CLOSED;
    failures = 0;
    successes = 0;
    lastFailureTime;
    lastSuccessTime;
    stateChangedAt = Date.now();
    totalRequests = 0;
    healthCheckTimer;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startHealthCheck();
    }
    /**
     * Execute a request through the circuit breaker
     */
    async execute(fn) {
        this.totalRequests++;
        // Check if circuit is open
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.stateChangedAt >= this.config.resetTimeout) {
                this.transitionTo(CircuitState.HALF_OPEN);
            }
            else {
                throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await fn();
            // Record success
            this.onSuccess();
            return result;
        }
        catch (error) {
            // Record failure
            this.onFailure();
            throw error;
        }
    }
    /**
     * Check if circuit is healthy
     */
    isHealthy() {
        return this.state === CircuitState.CLOSED;
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            failures: this.failures,
            successes: this.successes,
            totalRequests: this.totalRequests,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime,
            state: this.state,
            stateChangedAt: this.stateChangedAt,
        };
    }
    /**
     * Manually reset circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.stateChangedAt = Date.now();
        logger_1.logger.info('Circuit breaker manually reset');
    }
    /**
     * Handle successful request
     */
    onSuccess() {
        this.lastSuccessTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            this.successes++;
            if (this.successes >= this.config.successThreshold) {
                this.transitionTo(CircuitState.CLOSED);
            }
        }
        else if (this.state === CircuitState.CLOSED) {
            // Reset failure count after monitoring period
            if (this.lastFailureTime &&
                Date.now() - this.lastFailureTime > this.config.monitoringPeriod) {
                this.failures = 0;
            }
        }
    }
    /**
     * Handle failed request
     */
    onFailure() {
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            // Single failure in half-open state opens circuit
            this.transitionTo(CircuitState.OPEN);
        }
        else if (this.state === CircuitState.CLOSED) {
            this.failures++;
            if (this.failures >= this.config.failureThreshold) {
                this.transitionTo(CircuitState.OPEN);
            }
        }
    }
    /**
     * Transition to a new state
     */
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        this.stateChangedAt = Date.now();
        logger_1.logger.info('Circuit breaker state transition', {
            from: oldState,
            to: newState,
            failures: this.failures,
            successes: this.successes,
        });
        // Reset counters on state change
        if (newState === CircuitState.CLOSED) {
            this.failures = 0;
            this.successes = 0;
        }
        else if (newState === CircuitState.HALF_OPEN) {
            this.successes = 0;
        }
    }
    /**
     * Start periodic health checks
     */
    startHealthCheck() {
        if (!this.config.healthCheckInterval || !this.config.healthCheckEndpoint) {
            return;
        }
        this.healthCheckTimer = setInterval(() => {
            if (this.state === CircuitState.OPEN) {
                this.performHealthCheck();
            }
        }, this.config.healthCheckInterval);
    }
    /**
     * Perform health check
     */
    async performHealthCheck() {
        if (!this.config.healthCheckEndpoint) {
            return;
        }
        try {
            const response = await fetch(this.config.healthCheckEndpoint, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
                // Service is healthy, transition to half-open
                this.transitionTo(CircuitState.HALF_OPEN);
            }
        }
        catch (error) {
            logger_1.logger.debug('Health check failed', { error });
        }
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;
class CircuitBreakerOpenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CircuitBreakerOpenError';
    }
}
exports.CircuitBreakerOpenError = CircuitBreakerOpenError;
