"use strict";
/**
 * Recovery Strategies
 * Provides different recovery strategies for API errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryStrategies = void 0;
const logger_1 = require("../utils/logger");
class RecoveryStrategies {
    /**
     * Auto-retry with exponential backoff
     */
    async autoRetry(fn, options = {}) {
        const maxRetries = options.maxRetries ?? 3;
        const retryDelay = options.retryDelay ?? 1000;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0 && options.onRetry) {
                    options.onRetry(attempt);
                }
                const result = await fn();
                return {
                    success: true,
                    data: result,
                    retriesPerformed: attempt,
                };
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    const delay = retryDelay * Math.pow(2, attempt);
                    logger_1.logger.debug('Retrying after delay', { attempt, delay });
                    await this.sleep(delay);
                }
            }
        }
        if (options.onFailure) {
            options.onFailure(lastError);
        }
        return {
            success: false,
            error: lastError,
            retriesPerformed: maxRetries,
        };
    }
    /**
     * Retry with token refresh
     */
    async retryWithTokenRefresh(fn, refreshTokenFn, options = {}) {
        try {
            const result = await fn();
            return { success: true, data: result };
        }
        catch (error) {
            // Check if error is authentication error
            if (this.isAuthenticationError(error)) {
                logger_1.logger.info('Authentication error, refreshing token');
                try {
                    await refreshTokenFn();
                    logger_1.logger.info('Token refreshed, retrying request');
                    // Retry original request
                    const retryResult = await this.autoRetry(fn, options);
                    return retryResult;
                }
                catch (refreshError) {
                    logger_1.logger.error('Token refresh failed', { error: refreshError });
                    return {
                        success: false,
                        error: refreshError,
                    };
                }
            }
            return {
                success: false,
                error,
            };
        }
    }
    /**
     * Fallback to cached data
     */
    async fallbackToCache(fn, getCacheFn, options = {}) {
        try {
            const result = await fn();
            return { success: true, data: result };
        }
        catch (error) {
            logger_1.logger.warn('Request failed, attempting cache fallback', { error });
            try {
                const cachedData = await getCacheFn();
                if (cachedData !== null) {
                    logger_1.logger.info('Using cached data as fallback');
                    return {
                        success: true,
                        data: cachedData,
                    };
                }
            }
            catch (cacheError) {
                logger_1.logger.error('Cache retrieval failed', { error: cacheError });
            }
            return {
                success: false,
                error,
            };
        }
    }
    /**
     * Queue for offline processing
     */
    async queueForOffline(fn, queueFn, options = {}) {
        try {
            const result = await fn();
            return { success: true, data: result };
        }
        catch (error) {
            // Check if error is network error
            if (this.isNetworkError(error)) {
                logger_1.logger.info('Network error, queueing for offline processing', { error });
                try {
                    await queueFn(options.fallbackData);
                    return {
                        success: true,
                        data: options.fallbackData,
                    };
                }
                catch (queueError) {
                    logger_1.logger.error('Failed to queue request', { error: queueError });
                }
            }
            return {
                success: false,
                error,
            };
        }
    }
    /**
     * Prompt user for intervention
     */
    async promptUserIntervention(fn, promptFn, options = {}) {
        try {
            const result = await fn();
            return { success: true, data: result };
        }
        catch (error) {
            const userWantsRetry = await promptFn(error);
            if (userWantsRetry) {
                logger_1.logger.info('User requested retry');
                return await this.autoRetry(fn, options);
            }
            return {
                success: false,
                error,
            };
        }
    }
    /**
     * Combined recovery strategy
     */
    async combinedRecovery(fn, strategies, options = {}) {
        try {
            const result = await fn();
            return { success: true, data: result };
        }
        catch (error) {
            // Try token refresh first
            if (strategies.refreshToken && this.isAuthenticationError(error)) {
                logger_1.logger.info('Attempting token refresh recovery');
                const result = await this.retryWithTokenRefresh(fn, strategies.refreshToken, options);
                if (result.success) {
                    return result;
                }
            }
            // Try cache fallback
            if (strategies.useCache) {
                logger_1.logger.info('Attempting cache fallback');
                const result = await this.fallbackToCache(fn, strategies.useCache, options);
                if (result.success) {
                    return result;
                }
            }
            // Try offline queue
            if (strategies.queue && this.isNetworkError(error)) {
                logger_1.logger.info('Attempting offline queue');
                const result = await this.queueForOffline(fn, strategies.queue, options);
                if (result.success) {
                    return result;
                }
            }
            // Try auto-retry
            if (strategies.retry) {
                logger_1.logger.info('Attempting auto-retry');
                const result = await this.autoRetry(fn, options);
                if (result.success) {
                    return result;
                }
            }
            // Finally, prompt user
            if (strategies.promptUser) {
                logger_1.logger.info('Prompting user for intervention');
                return await this.promptUserIntervention(fn, strategies.promptUser, options);
            }
            return {
                success: false,
                error,
            };
        }
    }
    /**
     * Check if error is authentication error
     */
    isAuthenticationError(error) {
        if (error && typeof error === 'object') {
            if ('status' in error && error.status === 401) {
                return true;
            }
            if ('statusCode' in error && error.statusCode === 401) {
                return true;
            }
        }
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('unauthorized') ||
                message.includes('authentication') ||
                message.includes('token');
        }
        return false;
    }
    /**
     * Check if error is network error
     */
    isNetworkError(error) {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('network') ||
                message.includes('connection') ||
                message.includes('timeout') ||
                message.includes('econnrefused');
        }
        return false;
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RecoveryStrategies = RecoveryStrategies;
