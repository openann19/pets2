/**
 * Enhanced Analytics & Usage Tracking Service for PawfectMatch Mobile App
 * Comprehensive user behavior tracking, performance monitoring, and crash reporting
 */

import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

type AnalyticsMetadata = Record<string, unknown>;

interface AnalyticsInsights {
  dailyActiveUsers: number;
  sessionDuration: number;
  popularScreens: string[];
  conversionRate: number;
  crashRate: number;
}

type ExportedUserData = Record<string, unknown>;

const isDevelopment = (globalThis as { __DEV__?: boolean }).__DEV__ === true;

interface UsageStats {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  profileViews: number;
  messagesSent: number;
  matchRate: number;
}

interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  timestamp: number;
  sessionId: string;
  metadata: AnalyticsMetadata;
  platform: 'ios' | 'android';
  appVersion: string;
  deviceInfo: {
    model: string;
    osVersion: string;
    screenSize: string;
  };
}

interface PerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryLevel: number;
}

interface CrashReport {
  error: string;
  stackTrace: string;
  userId: string | undefined;
  timestamp: number;
  deviceInfo: AnalyticsMetadata;
  appState: AnalyticsMetadata;
}

class AnalyticsService {
  private static instance: AnalyticsService | undefined;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = true;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.initializeDeviceInfo();
  }

  static getInstance(): AnalyticsService {
    if (AnalyticsService.instance === undefined) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track user behavior event
   */
  async trackEvent(
    eventType: string,
    metadata: AnalyticsMetadata = {},
    userId?: string
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        eventType,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata,
        platform: this.getPlatform(),
        appVersion: Constants.expoConfig?.version || '1.0.0',
        deviceInfo: this.getDeviceInfo(),
        ...(userId !== undefined ? { userId } : {}),
      };

      this.eventQueue.push(event);

      // Flush if queue is full
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }

      if (isDevelopment) {
        logger.debug('Analytics event tracked', { eventType, metadata });
      }
    } catch (error: unknown) {
      logger.error('Failed to track analytics event', { error, eventType });
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, userId?: string): Promise<void> {
    await this.trackEvent('screen_view', { screenName }, userId);
  }

  /**
   * Track user interaction
   */
  async trackInteraction(
    element: string,
    action: string,
    metadata: AnalyticsMetadata = {},
    userId?: string
  ): Promise<void> {
    await this.trackEvent('user_interaction', {
      element,
      action,
      ...metadata,
    }, userId);
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Partial<PerformanceMetrics>, userId?: string): Promise<void> {
    await this.trackEvent('performance_metric', metrics, userId);
  }

  /**
   * Track crash/error
   */
  async trackCrash(error: Error, context: AnalyticsMetadata = {}, userId?: string): Promise<void> {
    const crashReport: CrashReport = {
      error: error.message,
      stackTrace: error.stack ?? '',
      userId: userId ?? undefined,
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      appState: context,
    };

    const crashMetadata: AnalyticsMetadata = {
      error: crashReport.error,
      stackTrace: crashReport.stackTrace,
      userId: crashReport.userId,
      timestamp: crashReport.timestamp,
      deviceInfo: crashReport.deviceInfo,
      appState: crashReport.appState,
    };

    await this.trackEvent('app_crash', crashMetadata, userId);
    logger.error('App crash tracked', crashReport);
  }

  /**
   * Track swipe action (enhanced version)
   */
  static async trackSwipe(
    userId: string,
    petId: string,
    action: 'like' | 'pass' | 'superlike',
    metadata: AnalyticsMetadata = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the swipe event
      await analytics.trackEvent('swipe_action', {
        petId,
        action,
        ...metadata,
      }, userId);

      // Also track via API for server-side analytics
      const result = await api.request<{ success: boolean }>(`/usage/swipe`, {
        method: 'POST',
        body: { userId, petId, action },
      });

      return result.success;
    } catch (error: unknown) {
      if (isDevelopment) {
        logger.error('Failed to track swipe', { error });
      }
      return false;
    }
  }

  /**
   * Track super like action (enhanced version)
   */
  static async trackSuperLike(
    userId: string,
    petId: string,
    metadata: AnalyticsMetadata = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the super like event
      await analytics.trackEvent('super_like', {
        petId,
        ...metadata,
      }, userId);

      // Also track via API
      const result = await api.request<{ success: boolean }>(`/usage/superlike`, {
        method: 'POST',
        body: { userId, petId },
      });

      return result.success;
    } catch (error: unknown) {
      if (isDevelopment) {
        logger.error('Failed to track super like', { error });
      }
      return false;
    }
  }

  /**
   * Track boost action (enhanced version)
   */
  static async trackBoost(
    userId: string,
    metadata: AnalyticsMetadata = {}
  ): Promise<boolean> {
    try {
      const analytics = AnalyticsService.getInstance();

      // Track the boost event
      await analytics.trackEvent('profile_boost', metadata, userId);

      // Also track via API
      const result = await api.request<{ success: boolean }>(`/usage/boost`, {
        method: 'POST',
        body: { userId },
      });

      return result.success;
    } catch (error: unknown) {
      if (isDevelopment) {
        logger.error('Failed to track boost', { error });
      }
      return false;
    }
  }

  /**
   * Get usage stats for user (enhanced)
   */
  static async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const stats = await api.request<UsageStats | null>('/usage/stats', {
        params: { userId },
      });

      return stats ?? null;
    } catch (error: unknown) {
      if (isDevelopment) {
        logger.error('Failed to get usage stats', { error });
      }
      return null;
    }
  }

  /**
   * Get analytics insights
   */
  async getAnalyticsInsights(userId: string): Promise<AnalyticsInsights | null> {
    try {
      const insights = await api.request<AnalyticsInsights | null>('/analytics/insights', {
        params: { userId },
      });

      return insights ?? null;
    } catch (error: unknown) {
      logger.error('Failed to get analytics insights', { error });
      return null;
    }
  }

  /**
   * Export user data for GDPR compliance
   */
  async exportUserData(userId: string): Promise<ExportedUserData | null> {
    try {
      const userData = await api.request<ExportedUserData | null>('/analytics/export', {
        params: { userId },
      });

      return userData ?? null;
    } catch (error: unknown) {
      logger.error('Failed to export user data', { error });
      return null;
    }
  }

  // Private methods

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    let eventsToFlush: AnalyticsEvent[] = [];

    try {
      eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // Store locally first (for offline support)
      await this.storeEventsLocally(eventsToFlush);

      // Send to server if online
      if (this.isOnline) {
        await this.sendEventsToServer(eventsToFlush);
      }
    } catch (error: unknown) {
      logger.error('Failed to flush analytics events', { error });
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  private async storeEventsLocally(events: AnalyticsEvent[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@analytics_queue');
      const existingEvents: AnalyticsEvent[] = stored !== null ? (JSON.parse(stored) as AnalyticsEvent[]) : [];
      const combinedEvents = [...existingEvents, ...events];
      await AsyncStorage.setItem('@analytics_queue', JSON.stringify(combinedEvents));
    } catch (error: unknown) {
      logger.error('Failed to store events locally', { error });
    }
  }

  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<void> {
    try {
      await api.request('/analytics/events', {
        method: 'POST',
        body: { events },
      });
    } catch (error: unknown) {
      logger.error('Failed to send events to server', { error });
      throw error;
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      void this.flushEvents();
    }, this.flushInterval);
  }

  private generateSessionId(): string {
    const randomSegment = Math.random().toString(36).slice(2, 11);
    return `${Date.now().toString()}_${randomSegment}`;
  }

  private getPlatform(): 'ios' | 'android' {
    return Platform.OS === 'ios' ? 'ios' : 'android';
  }

  private getDeviceInfo(): AnalyticsEvent['deviceInfo'] {
    // This would use react-native-device-info or similar
    const windowDimensions = Dimensions.get('window');
    const widthLabel = Math.round(windowDimensions.width).toString();
    const heightLabel = Math.round(windowDimensions.height).toString();
    const platformVersion = Platform.Version;
    const osVersion = typeof platformVersion === 'string'
      ? platformVersion
      : String(platformVersion);

    return {
      model: 'Unknown Device',
      osVersion,
      screenSize: `${widthLabel}x${heightLabel}`,
    };
  }

  private initializeDeviceInfo(): void {
    // Additional device info initialization if needed
  }
}

// Export enhanced service
export const analyticsService = AnalyticsService.getInstance();
// Back-compat named export alias if needed
export { AnalyticsService as UsageTrackingService };
export default analyticsService;
