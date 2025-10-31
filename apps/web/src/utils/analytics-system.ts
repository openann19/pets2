/**
 * 📊 ADVANCED ANALYTICS SYSTEM
 * Comprehensive user behavior tracking and performance monitoring
 */
'use client';
import React from 'react';
import { logger } from '../services/logger';

// NetworkInformation interface for navigator.connection
interface NetworkInformation {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
}

interface SwipeBehavior {
  direction: 'like' | 'pass' | 'superlike';
  petId: string;
  timestamp: number;
}

interface MessageBehavior {
  matchId: string;
  timestamp: number;
}

interface PageViewBehavior {
  page: string;
  duration: number;
  timestamp: number;
}

interface InteractionBehavior {
  element: string;
  action: string;
  timestamp: number;
}

interface ApiCall {
  endpoint: string;
  duration: number;
  status: number;
  timestamp: number;
}

interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: number;
}

interface UserBehavior {
  swipes: SwipeBehavior[];
  messages: MessageBehavior[];
  pageViews: PageViewBehavior[];
  interactions: InteractionBehavior[];
}

interface PerformanceMetrics {
  pageLoad: number[];
  apiCalls: ApiCall[];
  errors: ErrorMetric[];
  memoryUsage: number[];
}

interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

type AnalyticsHook = {
  trackSwipe: (direction: 'like' | 'pass' | 'superlike', petId: string) => void;
  trackMessage: (matchId: string, messageLength: number) => void;
  trackInteraction: (element: string, action: string, metadata?: Record<string, unknown>) => void;
  trackAIUsage: (feature: string, success: boolean, duration: number, metadata?: Record<string, unknown>) => void;
  trackPremiumFeatureAttempt: (feature: string, hasAccess: boolean) => void;
  trackMatchSuccess: (matchId: string, compatibilityScore: number) => void;
  trackApiCall: (endpoint: string, duration: number, status: number) => void;
  generateReport: () => { behavior: unknown; performance: unknown };
  setUserId: (userId: string | null) => void;
};

class AdvancedAnalytics {
  sessionId: string;
  userId: string | null = null;
  pageStartTime: number = Date.now();
  userBehavior: UserBehavior = {
    swipes: [],
    messages: [],
    pageViews: [],
    interactions: [],
  };
  performanceMetrics: PerformanceMetrics = {
    pageLoad: [],
    apiCalls: [],
    errors: [],
    memoryUsage: [],
  };
  queue: AnalyticsEvent[] = [];
  isOnline: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
    this.startPerformanceMonitoring();
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeTracking(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageView(window.location.pathname, Date.now() - this.pageStartTime);
      }
      else {
        this.pageStartTime = Date.now();
      }
    });

    // Track network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track unhandled errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.trackError(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.trackError(new Error(String(event.reason)));
    });
  }

  startPerformanceMonitoring(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Monitor memory usage
    setInterval(() => {
      // Check if performance.memory is available (Chrome-specific API)
      if ('memory' in performance && performance.memory) {
        const memory = performance.memory;
        this.performanceMetrics.memoryUsage.push(memory.usedJSHeapSize);
        // Keep only last 20 measurements
        if (this.performanceMetrics.memoryUsage.length > 20) {
          this.performanceMetrics.memoryUsage.shift();
        }
      }
    }, 10000); // Every 10 seconds
  }

  // ====== PUBLIC METHODS ======
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  // Track user interactions
  trackSwipe(direction: 'like' | 'pass' | 'superlike', petId: string): void {
    this.userBehavior.swipes.push({
      direction,
      petId,
      timestamp: Date.now(),
    });
    this.track('pet_swipe', {
      direction,
      petId,
      sessionSwipes: this.userBehavior.swipes.length,
    });
  }

  trackMessage(matchId: string, messageLength: number): void {
    this.userBehavior.messages.push({
      matchId,
      timestamp: Date.now(),
    });
    this.track('message_sent', {
      matchId,
      messageLength,
      sessionMessages: this.userBehavior.messages.length,
    });
  }

  trackPageView(page: string, duration?: number): void {
    const finalDuration = duration || (Date.now() - this.pageStartTime);
    this.userBehavior.pageViews.push({
      page,
      duration: finalDuration,
      timestamp: Date.now(),
    });
    this.track('page_view', {
      page,
      duration: finalDuration,
      sessionPageViews: this.userBehavior.pageViews.length,
    });
  }

  trackInteraction(element: string, action: string, metadata?: Record<string, unknown>): void {
    this.userBehavior.interactions.push({
      element,
      action,
      timestamp: Date.now(),
    });
    this.track('user_interaction', {
      element,
      action,
      ...metadata,
      sessionInteractions: this.userBehavior.interactions.length,
    });
  }

  trackAIUsage(feature: string, success: boolean, duration: number, metadata?: Record<string, unknown>): void {
    this.track('ai_feature_used', {
      feature,
      success,
      duration,
      ...metadata,
    });
  }

  trackPremiumFeatureAttempt(feature: string, hasAccess: boolean): void {
    this.track('premium_feature_attempt', {
      feature,
      hasAccess,
      conversionOpportunity: !hasAccess,
    });
  }

  trackMatchSuccess(matchId: string, compatibilityScore: number): void {
    this.track('match_created', {
      matchId,
      compatibilityScore,
      sessionMatches: this.userBehavior.swipes.filter(s => s.direction === 'like').length,
    });
  }

  // Track performance metrics
  trackApiCall(endpoint: string, duration: number, status: number): void {
    this.performanceMetrics.apiCalls.push({
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
    });
    // Keep only last 50 API calls
    if (this.performanceMetrics.apiCalls.length > 50) {
      this.performanceMetrics.apiCalls.shift();
    }
    // Track slow API calls
    if (duration > 2000) {
      this.track('slow_api_call', {
        endpoint,
        duration,
        status,
      });
    }
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.performanceMetrics.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    });
    this.track('error_occurred', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Limit stack trace length
      context,
      sessionErrors: this.performanceMetrics.errors.length,
    });
  }

  // ====== CORE TRACKING METHOD ======
  track(eventName: string, properties: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        screenResolution: typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : undefined,
        connectionType: this.getConnectionType(),
      },
      timestamp: Date.now(),
      userId: this.userId ?? undefined,
      sessionId: this.sessionId,
    };

    if (this.isOnline) {
      this.sendEvent(event);
    }
    else {
      this.queue.push(event);
    }
  }

  async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    }
    catch (error: unknown) {
      logger.warn('Failed to send analytics event', { error });
      this.queue.push(event);
    }
  }

  flushQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  getConnectionType(): string {
    // Check if navigator.connection is available (experimental API)
    if (typeof navigator !== 'undefined' && 'connection' in navigator && navigator.connection) {
      const connection = navigator.connection as NetworkInformation;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // ====== REPORTING METHODS ======
  generateUserBehaviorReport(): Record<string, unknown> {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const recentSwipes = this.userBehavior.swipes.filter(s => s.timestamp > last24h);
    const recentMessages = this.userBehavior.messages.filter(m => m.timestamp > last24h);
    const recentPageViews = this.userBehavior.pageViews.filter(p => p.timestamp > last24h);
    return {
      session: {
        id: this.sessionId,
        duration: now - this.pageStartTime,
        userId: this.userId,
      },
      last24Hours: {
        swipes: {
          total: recentSwipes.length,
          likes: recentSwipes.filter(s => s.direction === 'like').length,
          passes: recentSwipes.filter(s => s.direction === 'pass').length,
          superLikes: recentSwipes.filter(s => s.direction === 'superlike').length,
        },
        messages: recentMessages.length,
        pageViews: recentPageViews.length,
        averageSessionTime: recentPageViews.reduce((sum, pv) => sum + pv.duration, 0) / recentPageViews.length || 0,
      },
      engagement: {
        swipeRate: recentSwipes.length / Math.max(recentPageViews.length, 1),
        messageRate: recentMessages.length / Math.max(recentPageViews.length, 1),
        retentionScore: this.calculateRetentionScore(),
      },
    };
  }

  generatePerformanceReport(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics: {
        averageApiResponseTime: this.calculateAverageApiTime(),
        errorRate: this.calculateErrorRate(),
        memoryTrend: this.calculateMemoryTrend(),
        slowRequests: this.performanceMetrics.apiCalls.filter(call => call.duration > 2000).length,
      },
      recommendations: this.generatePerformanceRecommendations(),
    };
  }

  calculateRetentionScore(): number {
    const totalInteractions = this.userBehavior.interactions.length;
    const sessionDuration = Date.now() - this.pageStartTime;
    const engagementRate = totalInteractions / (sessionDuration / 60000); // Interactions per minute
    return Math.min(100, engagementRate * 10);
  }

  calculateAverageApiTime(): number {
    const calls = this.performanceMetrics.apiCalls;
    if (calls.length === 0) {
      return 0;
    }
    return calls.reduce((sum, call) => sum + call.duration, 0) / calls.length;
  }

  calculateErrorRate(): number {
    const totalApiCalls = this.performanceMetrics.apiCalls.length;
    const errorCalls = this.performanceMetrics.apiCalls.filter(call => call.status >= 400).length;
    if (totalApiCalls === 0) {
      return 0;
    }
    return (errorCalls / totalApiCalls) * 100;
  }

  calculateMemoryTrend(): string {
    const recent = this.performanceMetrics.memoryUsage.slice(-5);
    if (recent.length < 3) {
      return 'stable';
    }
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    if (first === undefined || last === undefined) {
      return 'stable';
    }
    
    const trend = last - first;
    if (trend > first * 0.1) {
      return 'increasing';
    }
    if (trend < -first * 0.1) {
      return 'decreasing';
    }
    return 'stable';
  }

  generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    if (this.calculateAverageApiTime() > 1000) {
      recommendations.push('API response times are slow - consider caching optimization');
    }
    if (this.calculateErrorRate() > 5) {
      recommendations.push('High error rate detected - review error handling');
    }
    if (this.calculateMemoryTrend() === 'increasing') {
      recommendations.push('Memory usage is increasing - check for memory leaks');
    }
    return recommendations;
  }
}

// ====== SINGLETON INSTANCE ======
let analyticsInstance: AdvancedAnalytics | null = null;

export const getAnalytics = (): AdvancedAnalytics => {
  if (!analyticsInstance) {
    analyticsInstance = new AdvancedAnalytics();
  }
  return analyticsInstance;
};

// ====== REACT HOOK ======
export const useAnalytics = (): AnalyticsHook => {
  const analytics = getAnalytics();

  const trackSwipe = (direction: 'like' | 'pass' | 'superlike', petId: string): void => {
    analytics.trackSwipe(direction, petId);
  };

  const trackMessage = (matchId: string, messageLength: number): void => {
    analytics.trackMessage(matchId, messageLength);
  };

  const trackInteraction = (element: string, action: string, metadata?: Record<string, unknown>): void => {
    analytics.trackInteraction(element, action, metadata);
  };

  const trackAIUsage = (feature: string, success: boolean, duration: number, metadata?: Record<string, unknown>): void => {
    analytics.trackAIUsage(feature, success, duration, metadata);
  };

  const trackPremiumFeatureAttempt = (feature: string, hasAccess: boolean): void => {
    analytics.trackPremiumFeatureAttempt(feature, hasAccess);
  };

  const trackMatchSuccess = (matchId: string, compatibilityScore: number): void => {
    analytics.trackMatchSuccess(matchId, compatibilityScore);
  };

  const trackApiCall = (endpoint: string, duration: number, status: number): void => {
    analytics.trackApiCall(endpoint, duration, status);
  };

  const generateReport = (): { behavior: unknown; performance: unknown } => {
    return {
      behavior: analytics.generateUserBehaviorReport(),
      performance: analytics.generatePerformanceReport(),
    };
  };

  return {
    trackSwipe,
    trackMessage,
    trackInteraction,
    trackAIUsage,
    trackPremiumFeatureAttempt,
    trackMatchSuccess,
    trackApiCall,
    generateReport,
    setUserId: (userId: string | null) => { analytics.setUserId(userId); },
  };
};

// ====== HOC FOR AUTOMATIC TRACKING ======
// ✅ REFACTORED: Moved to separate .tsx file to fix Next.js compilation issues
// Import from: @/components/Analytics/withAnalytics
// 
// Usage:
//   import { withAnalytics } from '@/components/Analytics/withAnalytics';
//   const TrackedComponent = withAnalytics(MyComponent, 'MyComponent');
//
// See: apps/web/src/components/Analytics/withAnalytics.tsx

// ====== PERFORMANCE TRACKING UTILITIES ======
export const trackAPIPerformance = (originalFetch: typeof fetch) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const start = Date.now();
    const endpoint = typeof input === 'string' ? input : input.toString();
    const analytics = getAnalytics();
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - start;
      analytics.trackApiCall(endpoint, duration, response.status);
      return response;
    }
    catch (error: unknown) {
      const duration = Date.now() - start;
      analytics.trackApiCall(endpoint, duration, 0); // 0 indicates network error
      analytics.trackError(error as Error, { endpoint, duration });
      throw error;
    }
  };
};

// ====== EXPORTS ======
export { AdvancedAnalytics };
export default getAnalytics;
