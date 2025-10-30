/**
 * Enhanced API Client for Mobile App
 *
 * Production-grade HTTP client with circuit breaker, retry logic,
 * offline queue, and comprehensive error handling.
 */

import { logger } from '@pawfectmatch/core';
import * as SecureStore from 'expo-secure-store';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosHeaders } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { UnifiedAPIClient, type APIClientConfig } from '@pawfectmatch/core/api/UnifiedAPIClient';

const envApiBaseUrl = process.env['EXPO_PUBLIC_API_URL'];
const API_BASE_URL =
  typeof envApiBaseUrl === 'string' && envApiBaseUrl.trim().length > 0
    ? envApiBaseUrl
    : 'http://localhost:3001/api';

// Validate HTTPS in production (App Transport Security requirement)
if (!__DEV__ && API_BASE_URL.startsWith('http://')) {
  logger.error('API_BASE_URL must use HTTPS in production', { apiBaseUrl: API_BASE_URL });
  throw new Error(
    'Invalid API URL: Production builds must use HTTPS. Current URL: ' + API_BASE_URL,
  );
}

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

class ApiClient {
  private readonly instance: AxiosInstance;
  private token: string | null = null;
  private unifiedClient: UnifiedAPIClient;
  private networkUnsubscribe?: () => void;

  constructor(config: ApiClientConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize unified client
    const unifiedConfig: APIClientConfig = {
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
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
        persistence: 'memory',
      },
    };

    this.unifiedClient = new UnifiedAPIClient(unifiedConfig);
    this.setupNetworkMonitoring();
    this.setupInterceptors();
    void this.loadToken();
  }

  /**
   * Load JWT token from SecureStore
   * Fixes M-SEC-01: Uses expo-secure-store instead of AsyncStorage
   */
  private async loadToken(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token !== null) {
        this.token = token;
      }
    } catch (error: unknown) {
      logger.error('api-client.load-token.failed', { error });
    }
  }

  /**
   * Set JWT token for authenticated requests
   * Fixes M-SEC-01: Uses expo-secure-store instead of AsyncStorage
   */
  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await SecureStore.setItemAsync('authToken', token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
    } catch (error: unknown) {
      logger.error('api-client.save-token.failed', { error });
    }
  }

  /**
   * Clear JWT token (logout)
   * Fixes M-SEC-01: Uses expo-secure-store instead of AsyncStorage
   */
  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error: unknown) {
      logger.error('api-client.clear-token.failed', { error });
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    this.networkUnsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      this.unifiedClient.setOnlineStatus(isOnline);

      if (isOnline) {
        logger.info('Network connected, processing queue');
      } else {
        logger.info('Network disconnected, queueing requests');
      }
    });

    // Initial network state check
    void NetInfo.fetch().then((state) => {
      const isOnline = state.isConnected ?? false;
      this.unifiedClient.setOnlineStatus(isOnline);
    });
  }

  /**
   * Setup axios interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      (config) => {
        if (this.token !== null) {
          const token = this.token;
          const headers = new AxiosHeaders(config.headers);
          headers.set('Authorization', `Bearer ${token}`);
          config.headers = headers;
        }
        return config;
      },
      (error: unknown) => {
        const reason = error instanceof Error ? error : new Error('Request interceptor rejected');
        return Promise.reject(reason);
      },
    );

    // Response interceptor - handle errors with proper type safety
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response !== undefined) {
          const { status, data } = error.response;

          // Handle authentication errors
          if (status === 401) {
            await this.clearToken();
            logger.warn('api-client.unauthorized', { status });
          } else if (status === 403) {
            logger.error('api-client.forbidden', {
              status,
              data: data ?? undefined,
            });
          } else if (status >= 500) {
            // Server errors
            logger.error('api-client.server-error', {
              status,
              data: data ?? undefined,
            });
          } else if (status >= 400) {
            // Client errors
            logger.error('api-client.http-error', {
              status,
              data: data ?? undefined,
            });
          }
        } else if (error.request !== undefined) {
          // Network or timeout errors
          logger.error('api-client.network-error', {
            message: error.message ?? 'Network request failed',
          });
        } else {
          // Request setup errors
          logger.error('api-client.request-setup-error', {
            message: error.message ?? 'Request setup failed',
          });
        }

        const reason = error instanceof Error ? error : new Error('API request failed');
        return Promise.reject(reason);
      },
    );
  }

  /**
   * GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  /**
   * Get axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Get unified client for advanced features
   */
  public getUnifiedClient(): UnifiedAPIClient {
    return this.unifiedClient;
  }

  /**
   * Get circuit breaker metrics
   */
  public getCircuitBreakerMetrics() {
    return this.unifiedClient.getCircuitBreakerMetrics();
  }

  /**
   * Get queue statistics
   */
  public getQueueStats() {
    return this.unifiedClient.getQueueStats();
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    this.unifiedClient.destroy();
  }
}

// Create and export singleton instance
const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default apiClient;
export { ApiClient };
export type { ApiClientConfig };
