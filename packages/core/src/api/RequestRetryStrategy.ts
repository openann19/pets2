/**
 * Advanced Request Retry Strategy
 * Implements exponential backoff with jitter, retry budgets, and network awareness
 */

import { logger } from '../utils/logger';

export type RetryStrategy = 'none' | 'exponential' | 'linear' | 'fixed';
export type NetworkCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  strategy: RetryStrategy;
  jitter: boolean;
  retryBudget?: number; // Maximum time budget for retries (ms)
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

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  strategy: 'exponential',
  jitter: true,
  retryBudget: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
};

export class RequestRetryStrategy {
  private config: RetryConfig;
  private networkCondition: NetworkCondition = 'excellent';

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: unknown, context: RetryContext) => boolean,
  ): Promise<T> {
    let lastError: unknown;
    const startTime = Date.now();

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await fn();

        if (attempt > 0) {
          logger.info('Request succeeded after retry', {
            attempt,
            attempts: attempt + 1,
          });
        }

        return result;
      } catch (error) {
        lastError = error;
        const elapsedTime = Date.now() - startTime;

        // Check if error is retryable
        if (!this.isRetryable(error, attempt)) {
          logger.debug('Error not retryable', { error, attempt });
          throw error;
        }

        // Check retry budget
        if (this.config.retryBudget && elapsedTime >= this.config.retryBudget) {
          logger.warn('Retry budget exceeded', { elapsedTime, budget: this.config.retryBudget });
          throw error;
        }

        // Check if we should retry based on custom handler
        if (errorHandler) {
          const retryContext: RetryContext = {
            attempt,
            totalAttempts: attempt + 1,
            delay: this.calculateDelay(attempt),
            elapsedTime,
            reason: this.getErrorReason(error),
          };

          if (!errorHandler(error, retryContext)) {
            throw error;
          }
        }

        // Don't delay on last attempt
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateDelay(attempt);
          logger.debug('Retrying request', {
            attempt: attempt + 1,
            maxRetries: this.config.maxRetries,
            delay,
          });

          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    logger.error('Request failed after all retries', {
      attempts: this.config.maxRetries + 1,
      lastError,
    });

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Check if error is in retryable errors list
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (this.config.retryableErrors?.some((code) => errorMessage.includes(code))) {
      return true;
    }

    // Check HTTP status codes
    if (this.isHttpError(error)) {
      const statusCode = this.getHttpStatusCode(error);
      return this.config.retryableStatusCodes?.includes(statusCode) ?? false;
    }

    // Default to retryable for network errors
    return this.isNetworkError(error);
  }

  /**
   * Calculate delay based on strategy
   */
  private calculateDelay(attempt: number): number {
    let delay: number;

    switch (this.config.strategy) {
      case 'exponential':
        delay = Math.min(this.config.baseDelay * Math.pow(2, attempt), this.config.maxDelay);
        break;
      case 'linear':
        delay = Math.min(this.config.baseDelay * (attempt + 1), this.config.maxDelay);
        break;
      case 'fixed':
        delay = this.config.baseDelay;
        break;
      case 'none':
      default:
        return 0;
    }

    // Apply jitter
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += Math.random() * jitterAmount * 2 - jitterAmount;
    }

    // Adjust based on network condition
    delay = this.adjustForNetworkCondition(delay);

    return Math.max(0, Math.floor(delay));
  }

  /**
   * Adjust delay based on network condition
   */
  private adjustForNetworkCondition(delay: number): number {
    const multipliers: Record<NetworkCondition, number> = {
      excellent: 1.0,
      good: 1.2,
      fair: 1.5,
      poor: 2.0,
    };

    return delay * multipliers[this.networkCondition];
  }

  /**
   * Update network condition
   */
  updateNetworkCondition(condition: NetworkCondition): void {
    this.networkCondition = condition;
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(endpoint: string, data?: unknown): string {
    const dataHash = data ? this.hashData(data) : '';
    return `${endpoint}_${Date.now()}_${dataHash}`;
  }

  /**
   * Hash data for idempotency key
   */
  private hashData(data: unknown): string {
    try {
      const json = JSON.stringify(data);
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < json.length; i++) {
        const char = json.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    } catch {
      return Math.random().toString(36).substring(2, 11);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is network error
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT')
      );
    }
    return false;
  }

  /**
   * Check if error is HTTP error
   */
  private isHttpError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  /**
   * Get HTTP status code from error
   */
  private getHttpStatusCode(error: unknown): number {
    if (this.isHttpError(error)) {
      return (error as { status: number }).status;
    }
    return 0;
  }

  /**
   * Get reason for error
   */
  private getErrorReason(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
