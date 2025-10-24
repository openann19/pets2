"use strict";
/**
 * Unified API Client
 * Production-grade API client with circuit breaker, retry logic, offline queue, and error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = exports.UnifiedAPIClient = void 0;
const logger_1 = require("../utils/logger");
const CircuitBreaker_1 = require("./CircuitBreaker");
const RequestRetryStrategy_1 = require("./RequestRetryStrategy");
const OfflineQueueManager_1 = require("./OfflineQueueManager");
const APIErrorClassifier_1 = require("./APIErrorClassifier");
const RecoveryStrategies_1 = require("./RecoveryStrategies");
class UnifiedAPIClient extends OfflineQueueManager_1.OfflineQueueManager {
    apiConfig;
    circuitBreaker;
    retryStrategy;
    errorClassifier;
    recoveryStrategies;
    token = null;
    tokenRefreshFn;
    cache = new Map();
    constructor(config) {
        super(config);
        this.apiConfig = config;
        this.circuitBreaker = new CircuitBreaker_1.CircuitBreaker(config.circuitBreakerConfig);
        this.retryStrategy = new RequestRetryStrategy_1.RequestRetryStrategy(config.retryConfig);
        this.errorClassifier = new APIErrorClassifier_1.APIErrorClassifier();
        this.recoveryStrategies = new RecoveryStrategies_1.RecoveryStrategies();
    }
    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Set token refresh function
     */
    setTokenRefreshFn(fn) {
        this.tokenRefreshFn = fn;
    }
    /**
     * Execute API request
     */
    async request(endpoint, config = {}) {
        const method = config.method || 'GET';
        const requireOnline = config.requireOnline ?? false;
        // Check if circuit breaker is open
        if (!this.circuitBreaker.isHealthy()) {
            const error = new Error('Circuit breaker is OPEN');
            return this.handleError(error, endpoint, config);
        }
        // Check if online is required
        if (requireOnline && !this.isOnline) {
            // Queue for offline processing
            await this.enqueue({
                endpoint,
                method,
                data: config.body,
                headers: config.headers,
                priority: config.priority || 'normal',
                maxRetries: this.apiConfig.retryConfig?.maxRetries || 3,
                conflictResolution: 'overwrite',
            });
            return {
                success: false,
                data: null,
                error: 'Request queued for offline processing',
            };
        }
        try {
            const result = await this.circuitBreaker.execute(async () => {
                return await this.retryStrategy.execute(async () => {
                    return await this.makeRequest(endpoint, config);
                });
            });
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            return this.handleError(error, endpoint, config);
        }
    }
    /**
     * GET request
     */
    async get(endpoint, config) {
        return this.request(endpoint, { ...config, method: 'GET' });
    }
    /**
     * POST request
     */
    async post(endpoint, data, config) {
        return this.request(endpoint, { ...config, method: 'POST', body: data });
    }
    /**
     * PUT request
     */
    async put(endpoint, data, config) {
        return this.request(endpoint, { ...config, method: 'PUT', body: data });
    }
    /**
     * PATCH request
     */
    async patch(endpoint, data, config) {
        return this.request(endpoint, { ...config, method: 'PATCH', body: data });
    }
    /**
     * DELETE request
     */
    async delete(endpoint, config) {
        return this.request(endpoint, { ...config, method: 'DELETE' });
    }
    /**
     * Make actual HTTP request
     */
    async makeRequest(endpoint, config) {
        const url = `${this.apiConfig.baseURL}${endpoint}`;
        const method = config.method || 'GET';
        const timeout = config.timeout || this.apiConfig.timeout || 30000;
        const headers = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const fetchConfig = {
            method,
            headers,
            signal: AbortSignal.timeout(timeout),
        };
        if (config.body && method !== 'GET') {
            fetchConfig.body = JSON.stringify(config.body);
        }
        const response = await fetch(url, fetchConfig);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const error = new APIError(errorData.message || 'Request failed', response.status);
            throw error;
        }
        const data = await response.json().catch(() => null);
        return data;
    }
    /**
     * Handle error with recovery strategies
     */
    async handleError(error, endpoint, config) {
        const classification = this.errorClassifier.classify(error, {
            endpoint,
            method: config.method,
        });
        logger_1.logger.error('API request failed', {
            endpoint,
            method: config.method,
            error: classification.type,
            retryable: classification.retryable,
        });
        // Try recovery strategies
        if (classification.retryable) {
            try {
                const recoveryResult = await this.recoveryStrategies.combinedRecovery(() => this.makeRequest(endpoint, config), {
                    retry: true,
                    refreshToken: this.tokenRefreshFn,
                    useCache: async () => Promise.resolve(this.getCache(endpoint)),
                    queue: async (data) => {
                        await this.enqueue({
                            endpoint,
                            method: config.method || 'GET',
                            data,
                            headers: config.headers,
                            priority: config.priority || 'normal',
                            maxRetries: this.apiConfig.retryConfig?.maxRetries || 3,
                            conflictResolution: 'overwrite',
                        });
                    },
                }, {
                    maxRetries: this.apiConfig.retryConfig?.maxRetries || 3,
                });
                if (recoveryResult.success) {
                    return {
                        success: true,
                        data: recoveryResult.data,
                    };
                }
            }
            catch (recoveryError) {
                logger_1.logger.error('Recovery failed', { error: recoveryError });
            }
        }
        return {
            success: false,
            data: null,
            error: this.errorClassifier.getUserMessage(error, { endpoint, method: config.method }),
            statusCode: classification.statusCode,
        };
    }
    /**
     * Process queue item
     */
    async processItem(item) {
        const result = await this.makeRequest(item.endpoint, {
            method: item.method,
            body: item.data,
            headers: item.headers,
        });
        // Cache successful responses
        if (item.method === 'GET') {
            this.setCache(item.endpoint, result);
        }
    }
    /**
     * Get cached data
     */
    getCache(endpoint) {
        const cached = this.cache.get(endpoint);
        if (!cached) {
            return null;
        }
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(endpoint);
            return null;
        }
        return cached.data;
    }
    /**
     * Set cache
     */
    setCache(endpoint, data, ttl = 300000) {
        this.cache.set(endpoint, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    /**
     * Get circuit breaker metrics
     */
    getCircuitBreakerMetrics() {
        return this.circuitBreaker.getMetrics();
    }
    /**
     * Get queue statistics
     */
    getQueueStats() {
        return this.getStats();
    }
    /**
     * Cleanup resources
     */
    destroy() {
        super.destroy();
        this.circuitBreaker.destroy();
        this.cache.clear();
    }
}
exports.UnifiedAPIClient = UnifiedAPIClient;
class APIError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError';
    }
}
exports.APIError = APIError;
