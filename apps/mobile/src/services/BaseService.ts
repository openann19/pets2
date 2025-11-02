/**
 * Base Service Class for Mobile
 * Provides common functionality for all service classes
 */

import { logger } from "@pawfectmatch/core";

export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class BaseService {
  protected config: ServiceConfig;
  protected defaultHeaders: Record<string, string>;

  constructor(config: ServiceConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout,
      );

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...(options.headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as APIResponse<T>;

      if (!data.success) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error: unknown) {
      logger.error("Service request failed", {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        retryCount,
      });

      // Retry logic
      if (retryCount < this.config.retryAttempts!) {
        await this.delay(this.config.retryDelay! * Math.pow(2, retryCount));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Service error in ${context}`, { error: errorMessage });
    throw new Error(`${context}: ${errorMessage}`);
  }

  protected validateRequired<T>(
    value: T | null | undefined,
    fieldName: string,
  ): T {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  }

  protected sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }

  protected formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString();
  }

  protected parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }
    return date;
  }
}

/**
 * Enhanced API Client for Mobile
 * Provides advanced API functionality with caching, offline support, and analytics
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
}

export interface OfflineConfig {
  enabled: boolean;
  queueSize: number;
  syncInterval: number; // Sync interval in milliseconds
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackRequests: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
}

export class EnhancedAPIClient extends BaseService {
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private offlineQueue: Array<{
    id: string;
    request: RequestInit;
    endpoint: string;
    timestamp: number;
  }> = [];
  private analytics: Array<{ type: string; data: unknown; timestamp: number }> =
    [];

  constructor(
    config: ServiceConfig,
    private cacheConfig: CacheConfig = {
      enabled: true,
      ttl: 300000,
      maxSize: 100,
    },
    private offlineConfig: OfflineConfig = {
      enabled: true,
      queueSize: 50,
      syncInterval: 30000,
    },
    private analyticsConfig: AnalyticsConfig = {
      enabled: true,
      trackRequests: true,
      trackErrors: true,
      trackPerformance: true,
    },
  ) {
    super(config);
    this.initializeOfflineSupport();
  }

  private async initializeOfflineSupport(): Promise<void> {
    if (this.offlineConfig.enabled) {
      try {
        // Load offline queue from storage
        const storedQueue = await AsyncStorage.getItem("offline_queue");
        if (storedQueue) {
          this.offlineQueue = JSON.parse(storedQueue);
        }

        // Start sync interval
        setInterval(() => {
          this.syncOfflineQueue();
        }, this.offlineConfig.syncInterval);
      } catch (error) {
        logger.error("Failed to initialize offline support", { error });
      }
    }
  }

  async enhancedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = true,
    cacheKey?: string,
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const requestId = `${endpoint}_${Date.now()}`;

    try {
      // Track request start
      if (this.analyticsConfig.enabled && this.analyticsConfig.trackRequests) {
        this.trackAnalytics("request_start", { requestId, endpoint, options });
      }

      // Check cache first
      if (useCache && this.cacheConfig.enabled) {
        const cached = this.getFromCache<T>(cacheKey || endpoint);
        if (cached) {
          this.trackAnalytics("cache_hit", { requestId, endpoint });
          return cached;
        }
      }

      // Make request
      const response = await this.request<T>(endpoint, options);

      // Cache successful response
      if (useCache && this.cacheConfig.enabled && response.success) {
        this.setCache(cacheKey || endpoint, response);
      }

      // Track performance
      if (
        this.analyticsConfig.enabled &&
        this.analyticsConfig.trackPerformance
      ) {
        const duration = Date.now() - startTime;
        this.trackAnalytics("request_complete", {
          requestId,
          endpoint,
          duration,
        });
      }

      return response;
    } catch (error: unknown) {
      // Track errors
      if (this.analyticsConfig.enabled && this.analyticsConfig.trackErrors) {
        this.trackAnalytics("request_error", { requestId, endpoint, error });
      }

      // Queue for offline sync if offline
      if (this.offlineConfig.enabled && !navigator.onLine) {
        this.queueOfflineRequest(endpoint, options);
      }

      throw error;
    }
  }

  private getFromCache<T>(key: string): APIResponse<T> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as APIResponse<T>;
  }

  private setCache(key: string, data: unknown): void {
    // Clean up old cache entries if we're at max size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.cacheConfig.ttl,
    });
  }

  private queueOfflineRequest(endpoint: string, options: RequestInit): void {
    if (this.offlineQueue.length >= this.offlineConfig.queueSize) {
      this.offlineQueue.shift(); // Remove oldest request
    }

    this.offlineQueue.push({
      id: `offline_${Date.now()}`,
      request: options,
      endpoint,
      timestamp: Date.now(),
    });

    // Persist to storage
    AsyncStorage.setItem("offline_queue", JSON.stringify(this.offlineQueue));
  }

  private async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !navigator.onLine) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        await this.request(item.endpoint, item.request);
        logger.info("Offline request synced", {
          id: item.id,
          endpoint: item.endpoint,
        });
      } catch (error) {
        // Re-queue failed requests
        this.offlineQueue.push(item);
        logger.error("Failed to sync offline request", { id: item.id, error });
      }
    }

    // Update storage
    await AsyncStorage.setItem(
      "offline_queue",
      JSON.stringify(this.offlineQueue),
    );
  }

  private trackAnalytics(type: string, data: unknown): void {
    this.analytics.push({
      type,
      data,
      timestamp: Date.now(),
    });

    // Keep only last 1000 analytics entries
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }
  }

  getAnalytics(): Array<{ type: string; data: unknown; timestamp: number }> {
    return [...this.analytics];
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    };
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }
}

export default EnhancedAPIClient;
