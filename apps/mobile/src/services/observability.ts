/**
 * Enterprise Observability Service
 * Advanced monitoring, logging, and analytics following Rule 13 (Observability)
 */

import { logger } from "./logger";
import { performanceMonitor } from "../utils/PerformanceMonitor";
import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

interface ObservabilityConfig {
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableAnalytics: boolean;
  enableSecurityMonitoring: boolean;
  sampleRate: number;
  environment: string;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  interactionTime: number;
  timestamp: number;
  screen: string;
  component: string;
}

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  screen: string;
  component: string;
  action: string;
  metadata: Record<string, unknown>;
}

interface SecurityEvent {
  type:
    | "auth_attempt"
    | "rate_limit"
    | "suspicious_activity"
    | "data_breach_attempt";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ip?: string;
  details: Record<string, unknown>;
}

interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

class ObservabilityService {
  private static instance: ObservabilityService;
  private config: ObservabilityConfig;
  private performanceMonitor = performanceMonitor;
  private isInitialized = false;
  private networkUnsubscribe?: () => void;

  private constructor() {
    this.config = {
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableAnalytics: true,
      enableSecurityMonitoring: true,
      sampleRate: 1.0, // Sample 100% in development
      environment: __DEV__ ? "development" : "production",
    };
  }

  static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  /**
   * Initialize observability services
   */
  initialize(): void {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry for error tracking
      if (this.config.enableErrorTracking) {
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: this.config.environment,
          sampleRate: this.config.sampleRate,
          beforeSend: (event) => {
            // Sanitize sensitive data before sending
            return this.sanitizeSentryEvent(event);
          },
        });
        logger.info("Sentry error tracking initialized");
      }

      // Initialize performance monitoring (constructor already starts it in dev)
      if (this.config.enablePerformanceTracking) {
        logger.info("Performance monitoring enabled");
      }

      // Initialize network monitoring
      this.initializeNetworkMonitoring();

      this.isInitialized = true;
      logger.info("Observability service initialized successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to initialize observability service", {
        error: err,
      });
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    operation: string,
    duration: number,
    metadata: Record<string, unknown> = {},
  ): void {
    if (!this.config.enablePerformanceTracking) return;

    const metrics: PerformanceMetrics = {
      fps: this.performanceMonitor.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      interactionTime: duration,
      timestamp: Date.now(),
      screen: (metadata.screen as string) || "unknown",
      component: (metadata.component as string) || "unknown",
    };

    logger.performance(`Performance: ${operation}`, duration, {
      ...metadata,
      ...metrics,
      timestamp: new Date(metrics.timestamp).toISOString(),
    });

    // Send to analytics if enabled
    if (this.config.enableAnalytics) {
      this.trackAnalytics("performance_metric", {
        operation,
        duration,
        fps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
        ...metadata,
      });
    }
  }

  /**
   * Track user interactions
   */
  trackInteraction(
    screen: string,
    component: string,
    action: string,
    metadata: Record<string, unknown> = {},
  ): void {
    logger.info(`User interaction: ${screen}.${component}.${action}`, {
      screen,
      component,
      action,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track errors with context
   */
  trackError(error: Error, context: ErrorContext): void {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    };

    logger.error(`Error in ${context.screen}.${context.component}`, {
      error: errorDetails,
      ...context.metadata,
    });

    // Send to Sentry if enabled
    if (this.config.enableErrorTracking) {
      Sentry.captureException(error, {
        tags: {
          screen: context.screen,
          component: context.component,
          action: context.action,
        },
        user: {
          id: context.userId,
        },
        extra: context.metadata,
      });
    }
  }

  /**
   * Track security events
   */
  trackSecurity(event: SecurityEvent): void {
    if (!this.config.enableSecurityMonitoring) return;

    const severity = event.severity.toUpperCase();
    logger.security(`Security event: ${event.type} [${severity}]`, {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ip: event.ip,
      ...event.details,
      timestamp: new Date().toISOString(),
    });

    // Send critical security events to Sentry
    if (event.severity === "critical") {
      Sentry.captureMessage(`Critical security event: ${event.type}`, "fatal");
    }
  }

  /**
   * Track analytics events
   */
  trackAnalytics(event: string, properties: Record<string, unknown>): void {
    if (!this.config.enableAnalytics) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    logger.info(`Analytics: ${event}`, {
      analytics: true,
      ...analyticsEvent,
      timestamp: new Date(analyticsEvent.timestamp).toISOString(),
    });

    // In a real implementation, this would send to analytics service
    // (e.g., Firebase, Mixpanel, Amplitude)
  }

  /**
   * Track user journey
   */
  trackJourney(
    userId: string,
    journey: string[],
    currentStep: string,
    metadata: Record<string, unknown> = {},
  ): void {
    logger.info(`User journey: ${journey.join(" → ")}`, {
      userId,
      journey,
      currentStep,
      stepIndex: journey.indexOf(currentStep),
      totalSteps: journey.length,
      ...metadata,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(
    feature: string,
    userId: string,
    metadata: Record<string, unknown> = {},
  ): void {
    logger.info(`Feature usage: ${feature}`, {
      feature,
      userId,
      ...metadata,
      timestamp: new Date().toISOString(),
    });

    this.trackAnalytics("feature_used", {
      feature,
      ...metadata,
    });
  }

  /**
   * Create performance trace
   */
  startTrace(operation: string): {
    end: (metadata?: Record<string, unknown>) => void;
  } {
    const startTime = Date.now();

    return {
      end: (metadata: Record<string, unknown> = {}) => {
        const duration = Date.now() - startTime;
        this.trackPerformance(operation, duration, metadata);
      },
    };
  }

  /**
   * Set user context for all future logging
   */
  setUserContext(
    userId: string,
    properties: Record<string, unknown> = {},
  ): void {
    Sentry.setUser({
      id: userId,
      ...properties,
    });

    logger.setUserContext(userId, properties);
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    Sentry.setUser(null);
    logger.clearUserContext();
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    metadata: Record<string, unknown> = {},
  ): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level: "info",
      ...metadata,
    });

    logger.debug(`Breadcrumb: ${message}`, {
      category,
      ...metadata,
    });
  }

  private handlePerformanceMetrics(metrics: PerformanceMetrics): void {
    // Store metrics for analysis
    // In a real implementation, this might send to a monitoring service
    if (metrics.fps < 30) {
      logger.warn("Low FPS detected", {
        ...metrics,
        timestamp: new Date(metrics.timestamp).toISOString(),
      });
    }
  }

  private getMemoryUsage(): number {
    // In React Native, memory usage is harder to track
    // This is a placeholder for actual memory monitoring
    return 0;
  }

  private sanitizeSentryEvent<T extends Sentry.ErrorEvent>(event: T): T {
    // Remove sensitive data from Sentry events
    const sentryEvent = event as Record<string, unknown>;
    if (sentryEvent.request && typeof sentryEvent.request === 'object' && 'data' in sentryEvent.request) {
      const request = sentryEvent.request as { data?: Record<string, unknown> };
      if (request.data) {
        // Remove passwords, tokens, etc.
        const sanitized = { ...request.data };
        if ('password' in sanitized) sanitized.password = "[REDACTED]";
        if ('token' in sanitized) sanitized.token = "[REDACTED]";
        request.data = sanitized;
      }
    }

    return event;
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      const unsubscribe = NetInfo.addEventListener((state) => {
        logger.info("Network status changed", {
          isConnected: state.isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        });
      });

      // Store unsubscribe function for cleanup
      this.networkUnsubscribe = unsubscribe;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to initialize network monitoring", { error: err });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // No explicit stop API; rely on GC and app lifecycle

    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }
}

// Export singleton instance
export const observability = ObservabilityService.getInstance();

// Export types
export type {
  ObservabilityConfig,
  PerformanceMetrics,
  ErrorContext,
  SecurityEvent,
  AnalyticsEvent,
};
