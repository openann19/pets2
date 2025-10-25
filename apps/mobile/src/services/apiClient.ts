/**
 * Enhanced API Client for Mobile App
 *
 * Production-grade HTTP client with circuit breaker, retry logic,
 * offline queue, and comprehensive error handling.
 */

import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import axios, { AxiosHeaders } from "axios";
import NetInfo from "@react-native-community/netinfo";
import {
  UnifiedAPIClient,
  type APIClientConfig,
} from "@pawfectmatch/core/api/UnifiedAPIClient";

const envApiBaseUrl = process.env["EXPO_PUBLIC_API_URL"];
const API_BASE_URL =
  typeof envApiBaseUrl === "string" && envApiBaseUrl.trim().length > 0
    ? envApiBaseUrl
    : "http://localhost:3001/api";

// API Response Types
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

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
        "Content-Type": "application/json",
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
        persistence: "memory",
      },
    };

    this.unifiedClient = new UnifiedAPIClient(unifiedConfig);
    this.setupNetworkMonitoring();
    this.setupInterceptors();
    void this.loadToken();
  }

  /**
   * Load JWT token from AsyncStorage
   */
  private async loadToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token !== null) {
        this.token = token;
      }
    } catch (error: unknown) {
      logger.error("api-client.load-token.failed", { error });
    }
  }

  /**
   * Set JWT token for authenticated requests
   */
  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error: unknown) {
      logger.error("api-client.save-token.failed", { error });
    }
  }

  /**
   * Clear JWT token (logout)
   */
  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error: unknown) {
      logger.error("api-client.clear-token.failed", { error });
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
        logger.info("Network connected, processing queue");
      } else {
        logger.info("Network disconnected, queueing requests");
      }
    });

    // Initial network state check
    NetInfo.fetch().then((state) => {
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
          headers.set("Authorization", `Bearer ${token}`);
          config.headers = headers;
        }
        return config;
      },
      (error: unknown) => {
        const reason =
          error instanceof Error
            ? error
            : new Error("Request interceptor rejected");
        return Promise.reject(reason);
      },
    );

    // Response interceptor - handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response !== undefined) {
          const { status, data } = error.response;

          if (status === 401) {
            await this.clearToken();
            logger.warn("api-client.unauthorized", { status });
          } else if (status === 403) {
            logger.error("api-client.forbidden", { status, data });
          } else if (status === 500) {
            logger.error("api-client.server-error", { status, data });
          } else {
            logger.error("api-client.http-error", { status, data });
          }
        } else if (error.request !== undefined) {
          logger.error("api-client.network-error", { message: error.message });
        } else {
          logger.error("api-client.request-setup-error", {
            message: error.message,
          });
        }

        const reason =
          error instanceof Error ? error : new Error("API request failed");
        return Promise.reject(reason);
      },
    );
  }

  /**
   * GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, config);
    return this.handleResponse(response);
  }

  /**
   * POST request
   */
  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * PUT request
   */
  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * PATCH request
   */
  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(url, config);
    return this.handleResponse(response);
  }

  /**
   * Handle API response and ensure it matches expected format
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiSuccessResponse<T> {
    if (response.data.success === false) {
      throw new Error(response.data.error || 'API request failed');
    }
    return response.data as ApiSuccessResponse<T>;
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
