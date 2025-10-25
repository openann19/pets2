/**
 * Unified API Client
 * Production-grade API client with circuit breaker, retry logic, offline queue, and error handling
 */

import { logger } from '../utils/logger';
import { CircuitBreaker, CircuitState } from './CircuitBreaker';
import { RequestRetryStrategy } from './RequestRetryStrategy';
import { OfflineQueueManager, type QueueItem, type QueuePriority } from './OfflineQueueManager';
import { APIErrorClassifier, ErrorType } from './APIErrorClassifier';
import { RecoveryStrategies } from './RecoveryStrategies';

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
    persistence: 'memory' | 'localStorage' | 'indexedDB';
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

export class UnifiedAPIClient extends OfflineQueueManager {
  private readonly clientConfig: APIClientConfig;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RequestRetryStrategy;
  private errorClassifier: APIErrorClassifier;
  private recoveryStrategies: RecoveryStrategies;
  private token: string | null = null;
  private tokenRefreshFn?: () => Promise<void>;
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  constructor(config: APIClientConfig) {
    super(config.queueConfig);
    
    this.clientConfig = config;
    this.circuitBreaker = new CircuitBreaker(config.circuitBreakerConfig);
    this.retryStrategy = new RequestRetryStrategy(config.retryConfig);
    this.errorClassifier = new APIErrorClassifier();
    this.recoveryStrategies = new RecoveryStrategies();

  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Set token refresh function
   */
  setTokenRefreshFn(fn: () => Promise<void>): void {
    this.tokenRefreshFn = fn;
  }

  /**
   * Execute API request
   */
  async request<T>(
    endpoint: string,
    config: UnifiedRequestConfig = {}
  ): Promise<UnifiedResponse<T>> {
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
        maxRetries: this.clientConfig.retryConfig?.maxRetries || 3,
        conflictResolution: 'overwrite',
      });

      return {
        success: false,
        error: 'Request queued for offline processing',
      };
    }

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.retryStrategy.execute(async () => {
          return await this.makeRequest<T>(endpoint, config);
        });
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this.handleError<T>(error, endpoint, config);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: UnifiedRequestConfig): Promise<UnifiedResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Make actual HTTP request
   */
  private async makeRequest<T>(endpoint: string, config: UnifiedRequestConfig): Promise<T> {
    const url = `${this.clientConfig.baseURL}${endpoint}`;
    const method = config.method || 'GET';
    const timeout = config.timeout || this.clientConfig.timeout || 30000;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fetchConfig: RequestInit = {
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
    return data as T;
  }

  /**
   * Handle error with recovery strategies
   */
  private async handleError<T>(
    error: unknown,
    endpoint: string,
    config: UnifiedRequestConfig,
  ): Promise<UnifiedResponse<T>> {
    const classification = this.errorClassifier.classify(error, {
      endpoint,
      method: config.method,
    });

    logger.error('API request failed', {
      endpoint,
      method: config.method,
      error: classification.type,
      retryable: classification.retryable,
    });

    // Try recovery strategies
    if (classification.retryable) {
      try {
        const recoveryResult = await this.recoveryStrategies.combinedRecovery(
          () => this.makeRequest<T>(endpoint, config),
          {
            retry: true,
            refreshToken: this.tokenRefreshFn,
            useCache: () => this.getCache(endpoint),
            queue: async (data) => {
              await this.enqueue({
                endpoint,
                method: config.method || 'GET',
                data,
                headers: config.headers,
                priority: config.priority || 'normal',
                maxRetries: this.clientConfig.retryConfig?.maxRetries || 3,
                conflictResolution: 'overwrite',
              });
            },
          },
          {
            maxRetries: this.clientConfig.retryConfig?.maxRetries || 3,
          }
        );

        if (recoveryResult.success) {
          return {
            success: true,
            data: recoveryResult.data as T,
          };
        }
      } catch (recoveryError) {
        logger.error('Recovery failed', { error: recoveryError });
      }
    }

    return {
      success: false,
      error: this.errorClassifier.getUserMessage(error, { endpoint, method: config.method }),
      statusCode: classification.statusCode,
    };
  }

  /**
   * Process queue item
   */
  protected override async processItem(item: QueueItem): Promise<void> {
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
  private async getCache(endpoint: string): Promise<unknown | null> {
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
  private setCache(endpoint: string, data: unknown, ttl: number = 300000): void {
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
  override destroy(): void {
    super.destroy();
    this.circuitBreaker.destroy();
    this.cache.clear();
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

