/**
 * Enhanced API Client for Mobile App
 *
 * Production-grade HTTP client with circuit breaker, retry logic,
 * offline queue, and comprehensive error handling.
 */

import * as SecureStore from "expo-secure-store";
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
import {
  securityAuditor,
  validateEndpoint,
  rateLimiter,
  validateRequestBody,
  getSecurityHeaders,
  sanitizeErrorMessage,
} from "./SecurityUtils";
import { authService } from "./AuthService";

const envApiBaseUrl = process.env["EXPO_PUBLIC_API_URL"];
const API_BASE_URL =
  typeof envApiBaseUrl === "string" && envApiBaseUrl.trim().length > 0
    ? envApiBaseUrl
    : "http://localhost:3001/api";

// API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ApiClientResponse<T> = ApiResponse<T>;

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
   * Get token from SecureStore (used after refresh)
   */
  private async getTokenFromStorage(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync("auth_access_token");
      return token;
    } catch (error: unknown) {
      logger.error("api-client.get-token-from-storage.failed", { error });
      return null;
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
   * Setup axios interceptors with enhanced security
   */
  private setupInterceptors(): void {
    // Track if we're currently refreshing to prevent infinite loops
    let isRefreshing = false;
    let failedQueue: Array<() => void> = [];

    // Request interceptor - add auth token and security headers
    this.instance.interceptors.request.use(
      async (config) => {
        // Skip token validation for auth endpoints
        const isAuthEndpoint = config.url?.includes("/auth/login") || 
                               config.url?.includes("/auth/register") ||
                               config.url?.includes("/auth/refresh");
        
        // Ensure valid token before making authenticated requests
        if (!isAuthEndpoint && this.token !== null) {
          try {
            await authService.ensureValidToken();
            
            // Reload token after potential refresh
            this.token = await this.getTokenFromStorage();
          } catch (error) {
            logger.warn("Failed to ensure valid token before request", { error, url: config.url });
          }
        }

        // Validate endpoint
        if (!validateEndpoint(config.url || "")) {
          securityAuditor.log("request", {
            error: "Invalid endpoint",
            url: config.url,
          });
          throw new Error("Invalid API endpoint");
        }

        // Rate limiting
        const clientId = "mobile-app";
        if (!rateLimiter.isAllowed(clientId)) {
          securityAuditor.log("request", {
            error: "Rate limit exceeded",
            url: config.url,
          });
          throw new Error("API rate limit exceeded");
        }

        // Add auth token
        if (this.token !== null) {
          const token = this.token;
          const headers = new AxiosHeaders(config.headers);
          headers.set("Authorization", `Bearer ${token}`);
          config.headers = headers;
        }

        // Add security headers
        const securityHeaders = getSecurityHeaders();
        const headers = new AxiosHeaders(config.headers);
        Object.entries(securityHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        config.headers = headers;

        // Validate request body
        if (config.data && !validateRequestBody(config.data)) {
          securityAuditor.log("request", {
            error: "Invalid request body",
            url: config.url,
          });
          throw new Error("Invalid request body");
        }

        // Log request for security audit
        securityAuditor.log(
          "request",
          {
            method: config.method?.toUpperCase(),
            url: config.url,
            hasAuth: !!this.token,
          },
          config.url,
          config.method?.toUpperCase(),
        );

        return config;
      },
      (error: unknown) => {
        const reason =
          error instanceof Error
            ? error
            : new Error("Request interceptor rejected");
        securityAuditor.log("error", { error: reason.message });
        return Promise.reject(reason);
      },
    );

    // Response interceptor - handle errors with automatic token refresh
    this.instance.interceptors.response.use(
      (response) => {
        // Log successful response for security audit
        securityAuditor.log(
          "response",
          {
            status: response.status,
            url: response.config.url,
          },
          response.config.url,
          response.config.method?.toUpperCase(),
        );

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        const sanitizedError = sanitizeErrorMessage(
          error instanceof Error ? error : new Error("Unknown error"),
          "API response interceptor",
        );

        if (error.response !== undefined) {
          const { status, data } = error.response;

          // Log security audit event
          securityAuditor.log(
            "error",
            {
              status,
              url: error.config?.url,
              method: error.config?.method,
              sanitizedError,
            },
            error.config?.url,
            error.config?.method,
          );

          // Handle 401 Unauthorized with automatic token refresh
          if (status === 401 && originalRequest !== undefined) {
            // Avoid infinite refresh loops
            if (isRefreshing) {
              return new Promise((resolve) => {
                failedQueue.push(() => {
                  resolve(this.instance(originalRequest));
                });
              });
            }

            isRefreshing = true;

            try {
              // Attempt to refresh token using SecureStore
              const refreshToken = await SecureStore.getItemAsync(
                "auth_refresh_token",
              );

              if (!refreshToken) {
                logger.warn("api-client.no-refresh-token", { status });
                await this.clearToken();
                throw new Error("No refresh token available");
              }

              const newTokens = await authService.refreshToken();

              if (newTokens !== null && originalRequest !== undefined) {
                // Update token
                await this.setToken(newTokens.accessToken);

                // Retry original request with new token
                const headers = new AxiosHeaders(originalRequest.headers);
                headers.set("Authorization", `Bearer ${newTokens.accessToken}`);
                originalRequest.headers = headers;

                // Process failed queue
                failedQueue.forEach((prom) => prom());
                failedQueue = [];

                isRefreshing = false;

                return this.instance(originalRequest);
              }

              throw new Error("Token refresh failed");
            } catch (refreshError) {
              // Refresh failed, clear tokens and reject
              logger.error("api-client.token-refresh-failed", {
                error: refreshError,
              });
              await this.clearToken();
              failedQueue.forEach((prom) => prom());
              failedQueue = [];
              isRefreshing = false;

              const reason =
                error instanceof Error ? error : new Error("API request failed");
              return Promise.reject(reason);
            }
          } else if (status === 403) {
            logger.error("api-client.forbidden", { status, data });
          } else if (status === 500) {
            logger.error("api-client.server-error", { status, data });
          } else {
            logger.error("api-client.http-error", { status, data });
          }
        } else if (error.request !== undefined) {
          logger.error("api-client.network-error", { message: sanitizedError });
          securityAuditor.log("error", {
            type: "network",
            message: sanitizedError,
            url: error.config?.url,
          });
        } else {
          logger.error("api-client.request-setup-error", {
            message: sanitizedError,
          });
          securityAuditor.log("error", {
            type: "setup",
            message: sanitizedError,
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
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(
      url,
      config,
    );
    return this.handleResponse(response);
  }

  /**
   * POST request
   */
  public async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(
      url,
      data,
      config,
    );
    return this.handleResponse(response);
  }

  /**
   * PUT request
   */
  public async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(
      url,
      data,
      config,
    );
    return this.handleResponse(response);
  }

  /**
   * PATCH request
   */
  public async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(
      url,
      data,
      config,
    );
    return this.handleResponse(response);
  }

  /**
   * DELETE request
   */
  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(
      url,
      config,
    );
    return this.handleResponse(response);
  }

  /**
   * Handle API response and ensure it matches expected format
   */
  private handleResponse<T>(
    response: AxiosResponse<ApiResponse<T>>,
  ): ApiSuccessResponse<T> {
    if (response.data.success === false) {
      throw new Error(response.data.error || "API request failed");
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
