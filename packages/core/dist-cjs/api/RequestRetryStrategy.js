"use strict";
/**
 * Advanced Request Retry Strategy
 * Implements exponential backoff with jitter, retry budgets, and network awareness
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRetryStrategy = void 0;
const logger_1 = require("../utils/logger");
const DEFAULT_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    strategy: 'exponential',
    jitter: true,
    retryBudget: 10000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
};
class RequestRetryStrategy {
    config;
    networkCondition = 'excellent';
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Execute function with retry logic
     */
    async execute(fn, errorHandler) {
        let lastError;
        const startTime = Date.now();
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                const result = await fn();
                if (attempt > 0) {
                    logger_1.logger.info('Request succeeded after retry', {
                        attempt,
                        attempts: attempt + 1,
                    });
                }
                return result;
            }
            catch (error) {
                lastError = error;
                const elapsedTime = Date.now() - startTime;
                // Check if error is retryable
                if (!this.isRetryable(error, attempt)) {
                    logger_1.logger.debug('Error not retryable', { error, attempt });
                    throw error;
                }
                // Check retry budget
                if (this.config.retryBudget && elapsedTime >= this.config.retryBudget) {
                    logger_1.logger.warn('Retry budget exceeded', { elapsedTime, budget: this.config.retryBudget });
                    throw error;
                }
                // Check if we should retry based on custom handler
                if (errorHandler) {
                    const retryContext = {
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
                    logger_1.logger.debug('Retrying request', {
                        attempt: attempt + 1,
                        maxRetries: this.config.maxRetries,
                        delay,
                    });
                    await this.sleep(delay);
                }
            }
        }
        // All retries failed
        logger_1.logger.error('Request failed after all retries', {
            attempts: this.config.maxRetries + 1,
            lastError,
        });
        throw lastError;
    }
    /**
     * Check if error is retryable
     */
    isRetryable(error, attempt) {
        if (attempt >= this.config.maxRetries) {
            return false;
        }
        // Check if error is in retryable errors list
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (this.config.retryableErrors?.some(code => errorMessage.includes(code))) {
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
    calculateDelay(attempt) {
        let delay;
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
    adjustForNetworkCondition(delay) {
        const multipliers = {
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
    updateNetworkCondition(condition) {
        this.networkCondition = condition;
    }
    /**
     * Generate idempotency key
     */
    generateIdempotencyKey(endpoint, data) {
        const dataHash = data ? this.hashData(data) : '';
        return `${endpoint}_${Date.now()}_${dataHash}`;
    }
    /**
     * Hash data for idempotency key
     */
    hashData(data) {
        try {
            const json = JSON.stringify(data);
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < json.length; i++) {
                const char = json.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        }
        catch {
            return Math.random().toString(36).substring(2, 11);
        }
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Check if error is network error
     */
    isNetworkError(error) {
        if (error instanceof Error) {
            return error.message.includes('network') ||
                error.message.includes('timeout') ||
                error.message.includes('ECONNREFUSED') ||
                error.message.includes('ETIMEDOUT');
        }
        return false;
    }
    /**
     * Check if error is HTTP error
     */
    isHttpError(error) {
        return typeof error === 'object' && error !== null && 'status' in error;
    }
    /**
     * Get HTTP status code from error
     */
    getHttpStatusCode(error) {
        if (this.isHttpError(error)) {
            return error.status;
        }
        return 0;
    }
    /**
     * Get reason for error
     */
    getErrorReason(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
exports.RequestRetryStrategy = RequestRetryStrategy;
