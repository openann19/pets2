/**
 * Enhanced Analytics Service for Mobile
 * Comprehensive analytics tracking with performance monitoring and user behavior analysis
 */

import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseService, type ServiceConfig } from "./BaseService";

export interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  platform: "mobile";
  version: string;
}

export interface PerformanceMetric {
  id: string;
  type: "navigation" | "api" | "render" | "user_interaction";
  name: string;
  duration: number;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  performance: PerformanceMetric[];
  screenViews: Array<{
    screen: string;
    timestamp: number;
    duration?: number;
  }>;
  userProperties: Record<string, unknown>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  debugMode: boolean;
  trackPerformance: boolean;
  trackUserBehavior: boolean;
  trackErrors: boolean;
  trackCrashes: boolean;
}

export class AnalyticsService extends BaseService {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private currentSessionId: string;
  private screenStartTime: number = 0;
  private analyticsConfig: AnalyticsConfig;

  constructor(
    serviceConfig: ServiceConfig,
    analyticsConfig: AnalyticsConfig = {
      enabled: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      debugMode: false,
      trackPerformance: true,
      trackUserBehavior: true,
      trackErrors: true,
      trackCrashes: true,
    },
  ) {
    super(serviceConfig);
    this.analyticsConfig = analyticsConfig;
    this.currentSessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    if (!this.analyticsConfig.enabled) return;

    // Set up automatic flushing
    setInterval(() => {
      this.flushEvents();
    }, this.analyticsConfig.flushInterval);

    // Track app lifecycle events
    this.trackAppLifecycle();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackAppLifecycle(): void {
    // Track app start
    this.trackEvent("app", "lifecycle", "app_start", {
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
    });

    // Track app background/foreground
    // Note: In a real implementation, you'd use AppState from React Native
    // AppState.addEventListener('change', this.handleAppStateChange);
  }

  trackEvent(
    category: string,
    action: string,
    label?: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.analyticsConfig.enabled) return;

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "event",
      category,
      action,
      properties: {
        ...properties,
        label,
      },
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      platform: "mobile",
      version: "1.0.0", // Get from app config
    };

    this.events.push(event);

    if (this.analyticsConfig.debugMode) {
      logger.info("Analytics event tracked", event);
    }

    // Auto-flush if batch size reached
    if (this.events.length >= this.analyticsConfig.batchSize) {
      this.flushEvents();
    }
  }

  trackScreenView(
    screenName: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.analyticsConfig.enabled) return;

    // Track screen end if there was a previous screen
    if (this.screenStartTime > 0) {
      const duration = Date.now() - this.screenStartTime;
      this.trackEvent("navigation", "screen_view", screenName, {
        ...properties,
        duration,
        previousScreen: this.getCurrentScreen(),
      });
    }

    this.screenStartTime = Date.now();
    this.setCurrentScreen(screenName);

    this.trackEvent("navigation", "screen_view", screenName, {
      ...properties,
      timestamp: Date.now(),
    });
  }

  trackPerformance(
    type: PerformanceMetric["type"],
    name: string,
    duration: number,
    metadata: Record<string, unknown> = {},
  ): void {
    if (
      !this.analyticsConfig.enabled ||
      !this.analyticsConfig.trackPerformance
    ) {
      return;
    }

    const metric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);

    if (this.analyticsConfig.debugMode) {
      logger.info("Performance metric tracked", metric);
    }
  }

  trackError(
    error: Error,
    context: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (
      !this.analyticsConfig.enabled ||
      !this.analyticsConfig.trackErrors
    ) {
      return;
    }

    this.trackEvent("error", "error_occurred", context, {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...properties,
    });
  }

  trackCrash(error: Error, properties: Record<string, unknown> = {}): void {
    if (
      !this.analyticsConfig.enabled ||
      !this.analyticsConfig.trackCrashes
    ) {
      return;
    }

    this.trackEvent("crash", "app_crash", "fatal_error", {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...properties,
    });

    // Immediately flush crash events
    this.flushEvents(true);
  }

  trackUserAction(
    action: string,
    element: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (
      !this.analyticsConfig.enabled ||
      !this.analyticsConfig.trackUserBehavior
    ) {
      return;
    }

    this.trackEvent("user_interaction", action, element, {
      ...properties,
      timestamp: Date.now(),
    });
  }

  trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    properties: Record<string, unknown> = {},
  ): void {
    this.trackPerformance("api", `${method} ${endpoint}`, duration, {
      endpoint,
      method,
      statusCode,
      ...properties,
    });

    this.trackEvent("api", "api_call", endpoint, {
      method,
      duration,
      statusCode,
      ...properties,
    });
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.analyticsConfig.enabled) return;

    this.trackEvent(
      "user",
      "properties_updated",
      "user_properties",
      properties,
    );
  }

  setUserId(userId: string): void {
    if (!this.analyticsConfig.enabled) return;

    this.trackEvent("user", "user_identified", "user_id", { userId });
  }

  private async flushEvents(isUrgent = false): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      await this.sendEvents(eventsToFlush);

      if (this.analyticsConfig.debugMode) {
        logger.info(`Flushed ${eventsToFlush.length} analytics events`);
      }
    } catch (error) {
      // Re-add events to queue if sending failed
      this.events.unshift(...eventsToFlush);

      if (this.analyticsConfig.debugMode) {
        logger.error("Failed to flush analytics events", { error });
      }
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    const payload = {
      events,
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
    };

    await this.request("/analytics/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  private getCurrentScreen(): string {
    // In a real implementation, you'd get this from navigation state
    return "unknown";
  }

  private setCurrentScreen(screenName: string): void {
    // In a real implementation, you'd store this in navigation state
  }

  async getAnalyticsData(
    startDate: Date,
    endDate: Date,
    filters: Record<string, unknown> = {},
  ): Promise<{
    events: AnalyticsEvent[];
    performance: PerformanceMetric[];
    summary: {
      totalEvents: number;
      uniqueUsers: number;
      averageSessionDuration: number;
      topEvents: Array<{ event: string; count: number }>;
      topScreens: Array<{ screen: string; views: number }>;
    };
  }> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters,
    };

    const response = await this.request<{
      events: AnalyticsEvent[];
      performance: PerformanceMetric[];
      summary: {
        totalEvents: number;
        uniqueUsers: number;
        averageSessionDuration: number;
        topEvents: Array<{ event: string; count: number }>;
        topScreens: Array<{ screen: string; views: number }>;
      };
    }>("/analytics/data", {
      method: "GET",
    });

    return response.data;
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    eventsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    const response = await this.request<{
      activeUsers: number;
      eventsPerMinute: number;
      averageResponseTime: number;
      errorRate: number;
    }>("/analytics/realtime", {
      method: "GET",
    });

    return response.data;
  }

  async exportAnalytics(
    format: "json" | "csv" = "json",
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    const params = {
      format,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const response = await this.request<{ downloadUrl: string }>(
      "/analytics/export",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );

    return response.data.downloadUrl;
  }

  // Performance monitoring helpers
  startPerformanceTimer(name: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.trackPerformance("user_interaction", name, duration);
    };
  }

  measureAsync<T>(name: string, asyncFunction: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    return asyncFunction().then(
      (result) => {
        const duration = Date.now() - startTime;
        this.trackPerformance("api", name, duration, { success: true });
        return result;
      },
      (error) => {
        const duration = Date.now() - startTime;
        this.trackPerformance("api", name, duration, {
          success: false,
          error: error.message,
        });
        throw error;
      },
    );
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.flushEvents();

    // Save any remaining events to storage
    if (this.events.length > 0) {
      await AsyncStorage.setItem(
        "pending_analytics",
        JSON.stringify(this.events),
      );
    }
  }
}

export default AnalyticsService;
