/**
 * Web API Client
 * Production-hardened API client with unified infrastructure
 * Features: Circuit breaker, rate limiting, offline queue, error handling, retry logic
 */

import { logger } from '@pawfectmatch/core';
import { UnifiedAPIClient, type APIClientConfig } from '@pawfectmatch/core/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

class WebApiClient extends UnifiedAPIClient {
  private defaultTimeout: number = 30000;
  private maxRetries: number = 3;
  private rateLimitDelay: number = 1000;
  private lastRequestTime: number = 0;

  // Rate limiting state
  private requestCount: number = 0;
  private requestWindowStart: number = Date.now();
  private readonly REQUEST_LIMIT = 100;
  private readonly WINDOW_SIZE = 60000;

  constructor(baseURL: string = '') {
    const apiBaseURL = baseURL !== '' ? baseURL : (typeof window !== 'undefined' ? window.location.origin : '');
    
    const config: APIClientConfig = {
      baseURL: apiBaseURL,
      timeout: 30000,
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
      },
      circuitBreakerConfig: {
        failureThreshold: 5,
        successThreshold: 2,
        resetTimeout: 60000,
      },
      queueConfig: {
        maxSize: 1000,
        persistence: 'localStorage',
      },
    };

    super(config);
    
    // Setup online/offline monitoring
    this.setupOnlineMonitoring();
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Reset window if needed
    if (now - this.requestWindowStart > this.WINDOW_SIZE) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }

    // Check if we're over the limit
    if (this.requestCount >= this.REQUEST_LIMIT) {
      logger.warn('API rate limit exceeded', { count: this.requestCount });
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Rate limiting delay
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Build request URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params !== undefined) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }

  /**
   * Build request headers with security
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      'X-Client-Type': 'web',
      ...customHeaders,
    };

    // Add CSRF token if available (from meta tag or cookie)
    if (typeof document !== 'undefined') {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken !== null && csrfToken !== '') {
        headers['X-CSRF-Token'] = csrfToken as string;
      }
    }

    return headers;
  }

  /**
   * Sanitize request body
   */
  private sanitizeBody(body: unknown): unknown {
    if (typeof body === 'string') {
      // Remove potentially dangerous characters
      return body.replace(/[<>"'`]/g, '').substring(0, 10000); // Limit size
    }
    return body;
  }

  /**
   * Handle API errors with proper typing
   */
  private handleApiError(error: unknown, endpoint: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown API error';

    logger.error('API request failed', {
      error: errorMessage,
      endpoint,
      timestamp: new Date().toISOString(),
    });

    // Re-throw with additional context
    throw new Error(`API request failed: ${errorMessage}`);
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    retries: number = this.maxRetries,
    timeout?: number
  ): Promise<ApiResponse<T>> {
    try {
      // Check rate limit
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      // Apply rate limiting delay
      await this.applyRateLimit();

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout ?? this.defaultTimeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${String(response.status)}: ${errorText}`);
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType !== null && contentType.includes('application/json')) {
        data = await response.json() as T;
      } else {
        data = (await response.text()) as T;
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };

    } catch (error) {
      // Retry logic
      if (retries > 0 && this.shouldRetry(error)) {
        logger.warn('Retrying API request', { url, retries, error: String(error) });
        await new Promise(resolve => setTimeout(resolve, 1000 * (this.maxRetries - retries + 1)));
        return this.executeRequest<T>(url, options, retries - 1);
      }

      return this.handleApiError(error, url);
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on network errors, timeouts, 5xx errors
      return error.message.includes('fetch') ||
             error.message.includes('timeout') ||
             error.message.includes('500') ||
             error.message.includes('502') ||
             error.message.includes('503') ||
             error.message.includes('504');
    }
    return false;
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(options.headers);

    return this.executeRequest<T>(url, {
      method: 'GET',
      headers,
    }, options.retries, options.timeout);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);
    const sanitizedBody = body !== undefined ? this.sanitizeBody(body) : undefined;

    return this.executeRequest<T>(url, {
      method: 'POST',
      headers,
      body: sanitizedBody !== undefined ? JSON.stringify(sanitizedBody) : null,
    }, options.retries, options.timeout);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);
    const sanitizedBody = body !== undefined ? this.sanitizeBody(body) : undefined;

    return this.executeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: sanitizedBody !== undefined ? JSON.stringify(sanitizedBody) : null,
    }, options.retries, options.timeout);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);
    const sanitizedBody = body !== undefined ? this.sanitizeBody(body) : undefined;

    return this.executeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: sanitizedBody !== undefined ? JSON.stringify(sanitizedBody) : null,
    }, options.retries, options.timeout);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);

    return this.executeRequest<T>(url, {
      method: 'DELETE',
      headers,
    }, options.retries, options.timeout);
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): { count: number; remaining: number; resetTime: number } {
    const resetTime = this.requestWindowStart + this.WINDOW_SIZE;

    return {
      count: this.requestCount,
      remaining: Math.max(0, this.REQUEST_LIMIT - this.requestCount),
      resetTime,
    };
  }

  /**
   * Reset rate limiting (for testing)
   */
  resetRateLimit(): void {
    this.requestCount = 0;
    this.requestWindowStart = Date.now();
  }
}

// Create singleton instance
export const webApiClient = new WebApiClient();

// Export types and utilities
export { WebApiClient };
export default webApiClient;
