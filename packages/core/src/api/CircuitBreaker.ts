/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests when service is down
 */

import { logger } from '../utils/logger';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation, requests pass through
  OPEN = 'OPEN', // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close circuit
  timeout: number; // Time before attempting half-open state (ms)
  resetTimeout: number; // Time in OPEN state before transition to HALF_OPEN (ms)
  monitoringPeriod: number; // Time window for failure tracking (ms)
  healthCheckInterval?: number; // Interval for health checks (ms)
  healthCheckEndpoint?: string; // Endpoint to check service health
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

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  resetTimeout: 60000,
  monitoringPeriod: 60000,
};

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private stateChangedAt: number = Date.now();
  private totalRequests: number = 0;
  private healthCheckTimer?: ReturnType<typeof setTimeout>;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startHealthCheck();
  }

  /**
   * Execute a request through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.stateChangedAt >= this.config.resetTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Record success
      this.onSuccess();
      return result;
    } catch (error) {
      // Record failure
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if circuit is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
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
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.stateChangedAt = Date.now();
    logger.info('Circuit breaker manually reset');
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;

      if (this.successes >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count after monitoring period
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > this.config.monitoringPeriod
      ) {
        this.failures = 0;
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Single failure in half-open state opens circuit
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      this.failures++;

      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    logger.info('Circuit breaker state transition', {
      from: oldState,
      to: newState,
      failures: this.failures,
      successes: this.successes,
    });

    // Reset counters on state change
    if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.successes = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successes = 0;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
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
  private async performHealthCheck(): Promise<void> {
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
    } catch (error) {
      logger.debug('Health check failed', { error });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}
