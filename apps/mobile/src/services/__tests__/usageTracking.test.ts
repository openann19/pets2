/**
 * Comprehensive tests for UsageTracking/AnalyticsService
 *
 * Coverage:
 * - Event tracking and queuing system
 * - Performance metrics tracking
 * - Crash reporting and error handling
 * - User behavior analytics (swipes, super likes, boosts)
 * - Usage statistics and limits
 * - Offline event storage and batch processing
 * - GDPR data export functionality
 * - Session management and device info
 * - Flush intervals and background processing
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';
import { analyticsService, AnalyticsService } from '../usageTracking';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    Version: '14.5',
  },
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.2.3',
  },
}));

// Mock API service
jest.mock('../api', () => ({
  api: {
    request: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;
const mockApi = require('../api').api as jest.Mocked<typeof require('../api').api>;

// Mock setInterval and clearInterval
jest.useFakeTimers();
const mockSetInterval = jest.spyOn(global, 'setInterval');
const mockClearInterval = jest.spyOn(global, 'clearInterval');

describe('UsageTracking/AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (AnalyticsService as any).instance = undefined;

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockApi.request.mockResolvedValue({ success: true });

    service = AnalyticsService.getInstance();
  });

  afterEach(() => {
    jest.clearAllTimers();
    mockSetInterval.mockClear();
    mockClearInterval.mockClear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnalyticsService.getInstance();
      const instance2 = AnalyticsService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(analyticsService);
    });

    it('should initialize with session ID and flush interval', () => {
      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        30000 // flushInterval
      );
      expect((service as any).sessionId).toMatch(/^[\d_]+$/);
    });
  });

  describe('Event Tracking', () => {
    it('should track basic event successfully', async () => {
      const eventType = 'button_click';
      const metadata = { buttonName: 'like', screen: 'profile' };
      const userId = 'user123';

      await service.trackEvent(eventType, metadata, userId);

      expect((service as any).eventQueue).toHaveLength(1);

      const queuedEvent = (service as any).eventQueue[0];
      expect(queuedEvent).toEqual({
        eventType,
        userId,
        timestamp: expect.any(Number),
        sessionId: expect.any(String),
        metadata,
        platform: 'ios',
        appVersion: '1.2.3',
        deviceInfo: expect.objectContaining({
          model: 'Unknown Device',
          osVersion: '14.5',
          screenSize: '375x812',
        }),
      });
    });

    it('should track event without user ID', async () => {
      await service.trackEvent('app_launch', { source: 'organic' });

      const queuedEvent = (service as any).eventQueue[0];
      expect(queuedEvent.userId).toBeUndefined();
    });

    it('should auto-flush when queue reaches batch size', async () => {
      const service = AnalyticsService.getInstance();
      (service as any).batchSize = 2;

      // Track 2 events (should trigger flush)
      await service.trackEvent('event1');
      await service.trackEvent('event2');

      expect(mockApi.request).toHaveBeenCalledWith('/analytics/events', {
        method: 'POST',
        body: { events: expect.any(Array) },
      });
    });

    it('should handle tracking errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(service.trackEvent('error_event')).resolves.not.toThrow();
    });
  });

  describe('Screen View Tracking', () => {
    it('should track screen view with metadata', async () => {
      await service.trackScreenView('HomeScreen', 'user123');

      expect((service as any).eventQueue).toHaveLength(1);

      const event = (service as any).eventQueue[0];
      expect(event.eventType).toBe('screen_view');
      expect(event.metadata).toEqual({ screenName: 'HomeScreen' });
      expect(event.userId).toBe('user123');
    });
  });

  describe('User Interaction Tracking', () => {
    it('should track user interaction with element and action', async () => {
      const metadata = { value: 42 };
      await service.trackInteraction('like_button', 'press', metadata, 'user123');

      const event = (service as any).eventQueue[0];
      expect(event.eventType).toBe('user_interaction');
      expect(event.metadata).toEqual({
        element: 'like_button',
        action: 'press',
        value: 42,
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metrics', async () => {
      const metrics = {
        appLaunchTime: 1250,
        screenLoadTime: 450,
        memoryUsage: 85.5,
      };

      await service.trackPerformance(metrics, 'user123');

      const event = (service as any).eventQueue[0];
      expect(event.eventType).toBe('performance_metric');
      expect(event.metadata).toBe(metrics);
    });
  });

  describe('Crash Tracking', () => {
    it('should track crash with full context', async () => {
      const error = new Error('Test crash');
      error.stack = 'Error: Test crash\n    at test.js:1:1';
      const context = { screen: 'Home', userAction: 'swipe' };

      await service.trackCrash(error, context, 'user123');

      const event = (service as any).eventQueue[0];
      expect(event.eventType).toBe('app_crash');
      expect(event.metadata).toEqual({
        error: 'Test crash',
        stackTrace: 'Error: Test crash\n    at test.js:1:1',
        userId: 'user123',
        timestamp: expect.any(Number),
        deviceInfo: expect.any(Object),
        appState: context,
      });
    });

    it('should handle crash without user ID', async () => {
      const error = new Error('Anonymous crash');

      await service.trackCrash(error);

      const event = (service as any).eventQueue[0];
      expect(event.metadata.userId).toBeUndefined();
    });
  });

  describe('Static Swipe Tracking', () => {
    it('should track swipe action successfully', async () => {
      mockApi.request.mockResolvedValue({ success: true });

      const result = await AnalyticsService.trackSwipe('user123', 'pet456', 'like', { source: 'home' });

      expect(result).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith('/usage/swipe', {
        method: 'POST',
        body: { userId: 'user123', petId: 'pet456', action: 'like' },
      });
    });

    it('should handle swipe tracking errors', async () => {
      mockApi.request.mockRejectedValue(new Error('API error'));

      const result = await AnalyticsService.trackSwipe('user123', 'pet456', 'pass');

      expect(result).toBe(false);
    });
  });

  describe('Static Super Like Tracking', () => {
    it('should track super like action', async () => {
      mockApi.request.mockResolvedValue({ success: true });

      const result = await AnalyticsService.trackSuperLike('user123', 'pet456', { premium: true });

      expect(result).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith('/usage/superlike', {
        method: 'POST',
        body: { userId: 'user123', petId: 'pet456' },
      });
    });
  });

  describe('Static Boost Tracking', () => {
    it('should track boost action', async () => {
      mockApi.request.mockResolvedValue({ success: true });

      const result = await AnalyticsService.trackBoost('user123', { duration: 30 });

      expect(result).toBe(true);
      expect(mockApi.request).toHaveBeenCalledWith('/usage/boost', {
        method: 'POST',
        body: { userId: 'user123' },
      });
    });
  });

  describe('Usage Statistics', () => {
    it('should retrieve usage stats successfully', async () => {
      const mockStats = {
        swipesUsed: 25,
        swipesLimit: 50,
        superLikesUsed: 3,
        superLikesLimit: 5,
        boostsUsed: 1,
        boostsLimit: 3,
        profileViews: 150,
        messagesSent: 45,
        matchRate: 0.3,
      };

      mockApi.request.mockResolvedValue(mockStats);

      const result = await AnalyticsService.getUsageStats('user123');

      expect(result).toEqual(mockStats);
      expect(mockApi.request).toHaveBeenCalledWith('/usage/stats', {
        params: { userId: 'user123' },
      });
    });

    it('should handle usage stats errors', async () => {
      mockApi.request.mockRejectedValue(new Error('Stats unavailable'));

      const result = await AnalyticsService.getUsageStats('user123');

      expect(result).toBeNull();
    });
  });

  describe('Analytics Insights', () => {
    it('should retrieve analytics insights', async () => {
      const mockInsights = {
        dailyActiveUsers: 1250,
        sessionDuration: 450,
        popularScreens: ['Home', 'Matches', 'Profile'],
        conversionRate: 0.15,
        crashRate: 0.02,
      };

      mockApi.request.mockResolvedValue(mockInsights);

      const result = await service.getAnalyticsInsights('user123');

      expect(result).toEqual(mockInsights);
    });

    it('should handle insights errors', async () => {
      mockApi.request.mockRejectedValue(new Error('Insights unavailable'));

      const result = await service.getAnalyticsInsights('user123');

      expect(result).toBeNull();
    });
  });

  describe('Data Export (GDPR)', () => {
    it('should export user data successfully', async () => {
      const mockExportedData = {
        profile: { name: 'John Doe', email: 'john@example.com' },
        activity: { swipes: 150, matches: 25 },
        preferences: { notifications: true },
        createdAt: '2024-01-01',
      };

      mockApi.request.mockResolvedValue(mockExportedData);

      const result = await service.exportUserData('user123');

      expect(result).toEqual(mockExportedData);
    });

    it('should handle export errors', async () => {
      mockApi.request.mockRejectedValue(new Error('Export failed'));

      const result = await service.exportUserData('user123');

      expect(result).toBeNull();
    });
  });

  describe('Event Queue Management', () => {
    it('should flush events when queue is full', async () => {
      const service = AnalyticsService.getInstance();
      (service as any).batchSize = 3;

      // Add 3 events to trigger flush
      await service.trackEvent('event1');
      await service.trackEvent('event2');
      await service.trackEvent('event3');

      expect(mockApi.request).toHaveBeenCalledWith('/analytics/events', {
        method: 'POST',
        body: { events: expect.any(Array) },
      });

      expect((service as any).eventQueue).toHaveLength(0);
    });

    it('should store events locally when offline', async () => {
      (service as any).isOnline = false;

      await service.trackEvent('offline_event');
      await (service as any).flushEvents();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@analytics_queue',
        expect.any(String)
      );
      expect(mockApi.request).not.toHaveBeenCalled();
    });

    it('should handle flush errors by re-queuing events', async () => {
      mockApi.request.mockRejectedValue(new Error('Network error'));

      await service.trackEvent('test_event');
      await (service as any).flushEvents();

      // Event should be re-queued
      expect((service as any).eventQueue).toHaveLength(1);
    });

    it('should periodically flush events', () => {
      // Advance timers to trigger periodic flush
      jest.advanceTimersByTime(30000);

      expect(mockApi.request).toHaveBeenCalled();
    });
  });

  describe('Local Storage', () => {
    it('should merge new events with existing stored events', async () => {
      const existingEvents = [
        {
          eventType: 'existing_event',
          timestamp: Date.now() - 1000,
          sessionId: 'old_session',
          metadata: {},
          platform: 'ios' as const,
          appVersion: '1.0.0',
          deviceInfo: { model: 'iPhone', osVersion: '14.0', screenSize: '375x812' },
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingEvents));

      await service.trackEvent('new_event');
      await (service as any).flushEvents();

      const storedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(storedData).toHaveLength(2);
      expect(storedData[0].eventType).toBe('existing_event');
      expect(storedData[1].eventType).toBe('new_event');
    });

    it('should handle corrupted local storage data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      await service.trackEvent('test');
      await (service as any).flushEvents();

      // Should still store events
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Device and Session Info', () => {
    it('should generate unique session ID', () => {
      const sessionId = (service as any).generateSessionId();

      expect(sessionId).toMatch(/^\d+_[a-z0-9]+$/);
    });

    it('should detect correct platform', () => {
      expect((service as any).getPlatform()).toBe('ios');

      Platform.OS = 'android';
      expect((service as any).getPlatform()).toBe('android');

      Platform.OS = 'ios'; // Reset
    });

    it('should get device info correctly', () => {
      const deviceInfo = (service as any).getDeviceInfo();

      expect(deviceInfo).toEqual({
        model: 'Unknown Device',
        osVersion: '14.5',
        screenSize: '375x812',
      });
    });

    it('should handle different screen sizes', () => {
      mockDimensions.get.mockReturnValue({ width: 414, height: 896 });

      const deviceInfo = (service as any).getDeviceInfo();

      expect(deviceInfo.screenSize).toBe('414x896');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API failures gracefully', async () => {
      mockApi.request.mockRejectedValue(new Error('Server error'));

      // Should not throw for tracking methods
      await expect(service.trackEvent('error_event')).resolves.not.toThrow();
      await expect(service.trackScreenView('ErrorScreen')).resolves.not.toThrow();
      await expect(service.trackPerformance({})).resolves.not.toThrow();
    });

    it('should handle AsyncStorage failures', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await expect(service.trackEvent('storage_error')).resolves.not.toThrow();
    });

    it('should handle empty event queue flush', async () => {
      (service as any).eventQueue = [];

      await expect((service as any).flushEvents()).resolves.not.toThrow();
    });

    it('should handle malformed event data', async () => {
      // Directly manipulate queue with invalid data
      (service as any).eventQueue = [{ invalid: 'data' }];

      await expect((service as any).flushEvents()).resolves.not.toThrow();
    });

    it('should handle concurrent event tracking', async () => {
      const promises = [
        service.trackEvent('event1'),
        service.trackEvent('event2'),
        service.trackEvent('event3'),
        service.trackScreenView('ConcurrentScreen'),
      ];

      await Promise.all(promises);

      expect((service as any).eventQueue).toHaveLength(4);
    });

    it('should handle very large metadata', async () => {
      const largeMetadata = {
        largeArray: Array.from({ length: 1000 }, (_, i) => `item${i}`),
        nestedObject: {
          level1: {
            level2: {
              level3: 'deep value',
            },
          },
        },
      };

      await expect(service.trackEvent('large_event', largeMetadata)).resolves.not.toThrow();
    });

    it('should handle special characters in metadata', async () => {
      const specialMetadata = {
        emoji: '🚀📱💻',
        unicode: 'café naïve résumé',
        symbols: '!@#$%^&*()',
      };

      await service.trackEvent('special_chars', specialMetadata);

      const event = (service as any).eventQueue[0];
      expect(event.metadata).toEqual(specialMetadata);
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should log debug info in development', async () => {
      (global as any).__DEV__ = true;

      await service.trackEvent('debug_event');

      const { logger } = require('@pawfectmatch/core');
      expect(logger.debug).toHaveBeenCalledWith(
        'Analytics event tracked',
        expect.objectContaining({
          eventType: 'debug_event',
        })
      );
    });

    it('should not log debug info in production', async () => {
      (global as any).__DEV__ = false;

      await service.trackEvent('prod_event');

      const { logger } = require('@pawfectmatch/core');
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should handle missing app version gracefully', () => {
      (Constants.expoConfig as any) = undefined;

      expect(() => service.trackEvent('version_test')).not.toThrow();
    });
  });
});
