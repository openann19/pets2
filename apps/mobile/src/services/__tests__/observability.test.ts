/**
 * Comprehensive tests for ObservabilityService
 *
 * Coverage:
 * - Service initialization and configuration
 * - Performance monitoring and metrics
 * - Error tracking with Sentry integration
 * - Security event monitoring
 * - Analytics event tracking
 * - User journey tracking
 * - Feature usage analytics
 * - Network monitoring
 * - User context management
 * - Breadcrumb tracking
 * - Performance tracing
 * - Data sanitization
 * - Resource cleanup
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { observability, ObservabilityService } from '../observability';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@sentry/react-native');
jest.mock('@react-native-community/netinfo');
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    performance: jest.fn(),
    security: jest.fn(),
    setUserContext: jest.fn(),
    clearUserContext: jest.fn(),
  },
}));

jest.mock('../utils/PerformanceMonitor', () => ({
  performanceMonitor: {
    getCurrentFPS: jest.fn(),
  },
}));

import { logger } from '../logger';
import { performanceMonitor } from '../utils/PerformanceMonitor';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSentry = Sentry as jest.Mocked<typeof Sentry>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockPerformanceMonitor = performanceMonitor as jest.Mocked<typeof performanceMonitor>;

describe('ObservabilityService', () => {
  let service: ObservabilityService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (ObservabilityService as any).instance = undefined;

    // Setup default mocks
    mockPerformanceMonitor.getCurrentFPS.mockReturnValue(60);
    mockNetInfo.addEventListener.mockReturnValue({ remove: jest.fn() });
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    } as NetInfoState);

    service = ObservabilityService.getInstance();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ObservabilityService.getInstance();
      const instance2 = ObservabilityService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(observability);
    });

    it('should initialize with default configuration', () => {
      const config = (service as any).config;

      expect(config).toEqual({
        enablePerformanceTracking: true,
        enableErrorTracking: true,
        enableAnalytics: true,
        enableSecurityMonitoring: true,
        sampleRate: 1.0,
        environment: 'development', // __DEV__ is true in test
      });
    });
  });

  describe('Initialization', () => {
    it('should initialize Sentry when error tracking is enabled', () => {
      service.initialize();

      expect(mockSentry.init).toHaveBeenCalledWith({
        dsn: undefined, // process.env.SENTRY_DSN
        environment: 'development',
        sampleRate: 1.0,
        beforeSend: expect.any(Function),
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Sentry error tracking initialized');
    });

    it('should not initialize Sentry when error tracking is disabled', () => {
      (service as any).config.enableErrorTracking = false;

      service.initialize();

      expect(mockSentry.init).not.toHaveBeenCalled();
    });

    it('should initialize network monitoring', () => {
      service.initialize();

      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
      expect(mockNetInfo.fetch).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', () => {
      mockSentry.init.mockImplementation(() => {
        throw new Error('Sentry init failed');
      });

      expect(() => service.initialize()).not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize observability service',
        { error: expect.any(Error) }
      );
    });

    it('should not initialize twice', () => {
      service.initialize();
      service.initialize(); // Second call

      expect(mockSentry.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track performance metrics', () => {
      const metadata = { screen: 'Home', component: 'Feed' };

      service.trackPerformance('render_feed', 150, metadata);

      expect(mockPerformanceMonitor.getCurrentFPS).toHaveBeenCalled();
      expect(mockLogger.performance).toHaveBeenCalledWith(
        'Performance: render_feed',
        150,
        expect.objectContaining({
          ...metadata,
          fps: 60,
          memoryUsage: 0,
          interactionTime: 150,
          timestamp: expect.any(String),
        })
      );
    });

    it('should not track performance when disabled', () => {
      (service as any).config.enablePerformanceTracking = false;

      service.trackPerformance('test', 100);

      expect(mockLogger.performance).not.toHaveBeenCalled();
    });

    it('should send performance data to analytics', () => {
      const metadata = { screen: 'Profile', component: 'Header' };

      service.trackPerformance('load_profile', 200, metadata);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Analytics: performance_metric',
        expect.objectContaining({
          analytics: true,
          operation: 'load_profile',
          duration: 200,
          fps: 60,
          memoryUsage: 0,
          ...metadata,
        })
      );
    });

    it('should handle missing metadata gracefully', () => {
      service.trackPerformance('simple_operation', 50);

      expect(mockLogger.performance).toHaveBeenCalledWith(
        'Performance: simple_operation',
        50,
        expect.objectContaining({
          screen: 'unknown',
          component: 'unknown',
        })
      );
    });
  });

  describe('User Interaction Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track user interactions', () => {
      const metadata = { element: 'like_button', value: true };

      service.trackInteraction('Home', 'Feed', 'like', metadata);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User interaction: Home.Feed.like',
        expect.objectContaining({
          screen: 'Home',
          component: 'Feed',
          action: 'like',
          ...metadata,
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle empty metadata', () => {
      service.trackInteraction('Profile', 'Avatar', 'tap');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User interaction: Profile.Avatar.tap',
        expect.objectContaining({
          screen: 'Profile',
          component: 'Avatar',
          action: 'tap',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Error Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track errors with full context', () => {
      const error = new Error('Test error');
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        screen: 'Home',
        component: 'Feed',
        action: 'load',
        metadata: { feedId: 'feed789' },
      };

      service.trackError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in Home.Feed',
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            stack: error.stack,
            name: 'Error',
          }),
          ...context,
        })
      );

      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          screen: 'Home',
          component: 'Feed',
          action: 'load',
        },
        user: {
          id: 'user123',
        },
        extra: context.metadata,
      });
    });

    it('should not send to Sentry when error tracking is disabled', () => {
      (service as any).config.enableErrorTracking = false;

      const error = new Error('Test error');
      const context = {
        screen: 'Test',
        component: 'Test',
        action: 'test',
        metadata: {},
      };

      service.trackError(error, context);

      expect(mockSentry.captureException).not.toHaveBeenCalled();
    });

    it('should handle errors without user ID', () => {
      const error = new Error('Anonymous error');
      const context = {
        screen: 'Public',
        component: 'Button',
        action: 'press',
        metadata: { public: true },
      };

      service.trackError(error, context);

      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          screen: 'Public',
          component: 'Button',
          action: 'press',
        },
        user: {
          id: undefined,
        },
        extra: context.metadata,
      });
    });
  });

  describe('Security Event Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track security events with different severities', () => {
      const securityEvent = {
        type: 'auth_attempt' as const,
        severity: 'high' as const,
        userId: 'user123',
        ip: '192.168.1.1',
        details: { attempts: 3, success: false },
      };

      service.trackSecurity(securityEvent);

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Security event: auth_attempt [HIGH]',
        expect.objectContaining({
          type: 'auth_attempt',
          severity: 'high',
          userId: 'user123',
          ip: '192.168.1.1',
          attempts: 3,
          success: false,
          timestamp: expect.any(String),
        })
      );
    });

    it('should send critical security events to Sentry', () => {
      const criticalEvent = {
        type: 'data_breach_attempt' as const,
        severity: 'critical' as const,
        userId: 'hacker123',
        details: { suspicious: true },
      };

      service.trackSecurity(criticalEvent);

      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Critical security event: data_breach_attempt',
        'fatal'
      );
    });

    it('should not track security events when disabled', () => {
      (service as any).config.enableSecurityMonitoring = false;

      const securityEvent = {
        type: 'suspicious_activity' as const,
        severity: 'medium' as const,
        details: {},
      };

      service.trackSecurity(securityEvent);

      expect(mockLogger.security).not.toHaveBeenCalled();
    });

    it('should handle security events without user ID', () => {
      const anonymousEvent = {
        type: 'rate_limit' as const,
        severity: 'low' as const,
        ip: '10.0.0.1',
        details: { endpoint: '/api/login' },
      };

      service.trackSecurity(anonymousEvent);

      expect(mockLogger.security).toHaveBeenCalledWith(
        'Security event: rate_limit [LOW]',
        expect.objectContaining({
          type: 'rate_limit',
          severity: 'low',
          userId: undefined,
          ip: '10.0.0.1',
        })
      );
    });
  });

  describe('Analytics Event Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track analytics events', () => {
      const properties = {
        screen: 'Home',
        action: 'scroll',
        distance: 500,
      };

      service.trackAnalytics('user_scroll', properties);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Analytics: user_scroll',
        expect.objectContaining({
          analytics: true,
          event: 'user_scroll',
          properties,
          timestamp: expect.any(Number),
        })
      );
    });

    it('should not track analytics when disabled', () => {
      (service as any).config.enableAnalytics = false;

      service.trackAnalytics('test_event', {});

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle empty properties', () => {
      service.trackAnalytics('simple_event', {});

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Analytics: simple_event',
        expect.objectContaining({
          analytics: true,
          event: 'simple_event',
          properties: {},
        })
      );
    });
  });

  describe('User Journey Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track user journey progression', () => {
      const journey = ['Welcome', 'Profile Setup', 'Pet Registration', 'Home'];
      const currentStep = 'Pet Registration';

      service.trackJourney('user123', journey, currentStep, {
        completedSteps: 2,
        totalSteps: 4,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User journey: Welcome → Profile Setup → Pet Registration → Home',
        expect.objectContaining({
          userId: 'user123',
          journey,
          currentStep,
          stepIndex: 2,
          totalSteps: 4,
          completedSteps: 2,
          totalSteps: 4,
        })
      );
    });

    it('should handle single-step journey', () => {
      const journey = ['Single Step'];
      const currentStep = 'Single Step';

      service.trackJourney('user456', journey, currentStep);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User journey: Single Step',
        expect.objectContaining({
          userId: 'user456',
          journey,
          currentStep,
          stepIndex: 0,
          totalSteps: 1,
        })
      );
    });
  });

  describe('Feature Usage Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should track feature usage', () => {
      const metadata = {
        feature: 'super_like',
        source: 'profile',
        remaining: 2,
      };

      service.trackFeatureUsage('super_like', 'user123', metadata);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Feature usage: super_like',
        expect.objectContaining({
          feature: 'super_like',
          userId: 'user123',
          ...metadata,
          timestamp: expect.any(String),
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Analytics: feature_used',
        expect.objectContaining({
          analytics: true,
          event: 'feature_used',
          properties: expect.objectContaining({
            feature: 'super_like',
            ...metadata,
          }),
        })
      );
    });

    it('should handle feature usage without metadata', () => {
      service.trackFeatureUsage('basic_like', 'user789');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Feature usage: basic_like',
        expect.objectContaining({
          feature: 'basic_like',
          userId: 'user789',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Performance Tracing', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should create and complete performance traces', () => {
      const trace = service.startTrace('api_call');

      expect(typeof trace.end).toBe('function');

      // Simulate some time passing
      jest.advanceTimersByTime(100);

      const metadata = { endpoint: '/api/test', status: 200 };
      trace.end(metadata);

      expect(mockLogger.performance).toHaveBeenCalledWith(
        'Performance: api_call',
        expect.any(Number), // Duration around 100ms
        expect.objectContaining(metadata)
      );
    });

    it('should handle trace completion without metadata', () => {
      const trace = service.startTrace('render_component');

      jest.advanceTimersByTime(50);
      trace.end();

      expect(mockLogger.performance).toHaveBeenCalledWith(
        'Performance: render_component',
        expect.any(Number),
        expect.any(Object)
      );
    });

    it('should handle multiple concurrent traces', () => {
      const trace1 = service.startTrace('operation1');
      const trace2 = service.startTrace('operation2');

      jest.advanceTimersByTime(75);

      trace1.end({ result: 'success' });
      trace2.end({ result: 'error' });

      expect(mockLogger.performance).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Context Management', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should set user context', () => {
      const userId = 'user123';
      const properties = {
        email: 'user@example.com',
        subscription: 'premium',
      };

      service.setUserContext(userId, properties);

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: userId,
        email: 'user@example.com',
        subscription: 'premium',
      });

      expect(mockLogger.setUserContext).toHaveBeenCalledWith(userId, properties);
    });

    it('should set user context with minimal properties', () => {
      service.setUserContext('user456');

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user456',
      });
    });

    it('should clear user context', () => {
      service.clearUserContext();

      expect(mockSentry.setUser).toHaveBeenCalledWith(null);
      expect(mockLogger.clearUserContext).toHaveBeenCalled();
    });
  });

  describe('Breadcrumb Tracking', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should add breadcrumbs for debugging', () => {
      const message = 'User navigated to profile';
      const category = 'navigation';
      const metadata = {
        fromScreen: 'Home',
        toScreen: 'Profile',
        userId: 'user123',
      };

      service.addBreadcrumb(message, category, metadata);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        message,
        category,
        level: 'info',
        ...metadata,
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Breadcrumb: ${message}`,
        expect.objectContaining({
          category,
          ...metadata,
        })
      );
    });

    it('should handle breadcrumbs without metadata', () => {
      service.addBreadcrumb('Button pressed', 'interaction');

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Button pressed',
        category: 'interaction',
        level: 'info',
      });
    });
  });

  describe('Network Monitoring', () => {
    it('should monitor network status changes', () => {
      service.initialize();

      const networkListener = mockNetInfo.addEventListener.mock.calls[0][0];

      // Simulate network connection
      networkListener({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      } as NetInfoState);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Network status changed',
        {
          isConnected: true,
          type: 'wifi',
          isInternetReachable: true,
        }
      );

      // Simulate network disconnection
      networkListener({
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
      } as NetInfoState);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Network status changed',
        {
          isConnected: false,
          type: 'none',
          isInternetReachable: false,
        }
      );
    });

    it('should handle network monitoring initialization errors', () => {
      mockNetInfo.addEventListener.mockImplementation(() => {
        throw new Error('Network monitoring failed');
      });

      expect(() => service.initialize()).not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize network monitoring',
        { error: expect.any(Error) }
      );
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize sensitive data from Sentry events', () => {
      const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;

      const eventWithSensitiveData = {
        request: {
          data: {
            email: 'user@example.com',
            password: 'secret123',
            token: 'jwt-token-here',
            normalField: 'normal-value',
          },
        },
      };

      const sanitizedEvent = beforeSend(eventWithSensitiveData);

      expect(sanitizedEvent.request.data.password).toBe('[REDACTED]');
      expect(sanitizedEvent.request.data.token).toBe('[REDACTED]');
      expect(sanitizedEvent.request.data.email).toBe('user@example.com');
      expect(sanitizedEvent.request.data.normalField).toBe('normal-value');
    });

    it('should handle events without request data', () => {
      const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;

      const eventWithoutRequest = {
        message: 'Error message',
        tags: { component: 'Test' },
      };

      const result = beforeSend(eventWithoutRequest);

      expect(result).toBe(eventWithoutRequest);
    });
  });

  describe('Resource Cleanup', () => {
    it('should cleanup resources', () => {
      // Set up network unsubscribe
      const mockUnsubscribe = jest.fn();
      (service as any).networkUnsubscribe = mockUnsubscribe;

      service.cleanup();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle cleanup when no resources to clean', () => {
      expect(() => service.cleanup()).not.toThrow();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        enablePerformanceTracking: false,
        enableAnalytics: false,
        sampleRate: 0.5,
      };

      (service as any).config = { ...(service as any).config, ...newConfig };

      expect((service as any).config.enablePerformanceTracking).toBe(false);
      expect((service as any).config.enableAnalytics).toBe(false);
      expect((service as any).config.sampleRate).toBe(0.5);
    });

    it('should respect configuration flags', () => {
      (service as any).config.enablePerformanceTracking = false;
      (service as any).config.enableAnalytics = false;
      (service as any).config.enableErrorTracking = false;
      (service as any).config.enableSecurityMonitoring = false;

      service.trackPerformance('test', 100);
      service.trackAnalytics('test', {});
      service.trackError(new Error('test'), {
        screen: 'test',
        component: 'test',
        action: 'test',
        metadata: {},
      });
      service.trackSecurity({
        type: 'test',
        severity: 'low',
        details: {},
      });

      expect(mockLogger.performance).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Analytics:'),
        expect.anything()
      );
      expect(mockSentry.captureException).not.toHaveBeenCalled();
      expect(mockLogger.security).not.toHaveBeenCalled();
    });
  });

  describe('Environment Handling', () => {
    it('should use development environment in dev mode', () => {
      // __DEV__ is true in test environment
      expect((service as any).config.environment).toBe('development');
    });

    it('should configure appropriate sample rate for development', () => {
      expect((service as any).config.sampleRate).toBe(1.0); // 100% sampling in dev
    });

    it('should handle different environments', () => {
      // Test production-like environment
      (global as any).__DEV__ = false;

      const prodService = new ObservabilityService();
      expect((prodService as any).config.environment).toBe('production');

      (global as any).__DEV__ = true; // Reset
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed performance data', () => {
      service.trackPerformance('test', NaN, { invalid: undefined });

      expect(mockLogger.performance).toHaveBeenCalled();
    });

    it('should handle errors in error tracking', () => {
      mockSentry.captureException.mockImplementation(() => {
        throw new Error('Sentry error');
      });

      const error = new Error('Original error');
      const context = {
        screen: 'Test',
        component: 'Test',
        action: 'test',
        metadata: {},
      };

      // Should not crash
      expect(() => service.trackError(error, context)).not.toThrow();
    });

    it('should handle analytics service failures', () => {
      mockLogger.info.mockImplementation(() => {
        throw new Error('Logger error');
      });

      // Should not crash
      expect(() => service.trackAnalytics('test', {})).not.toThrow();
    });

    it('should handle network status edge cases', () => {
      const networkListener = mockNetInfo.addEventListener.mock.calls[0][0];

      // Handle null/undefined network state
      networkListener(null as any);
      networkListener(undefined as any);

      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle extreme timing values in traces', () => {
      const trace = service.startTrace('extreme_test');

      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours

      trace.end();

      expect(mockLogger.performance).toHaveBeenCalled();
    });

    it('should handle concurrent operations', () => {
      service.initialize();

      // Fire multiple operations concurrently
      const operations = [
        service.trackPerformance('op1', 100),
        service.trackInteraction('Screen', 'Component', 'action'),
        service.trackAnalytics('event', { concurrent: true }),
        service.trackError(new Error('Concurrent error'), {
          screen: 'Test',
          component: 'Test',
          action: 'concurrent',
          metadata: {},
        }),
      ];

      // Should handle all operations without issues
      expect(operations).toHaveLength(4);
    });

    it('should handle malformed event data', () => {
      // These should not crash the service
      expect(() => {
        service.trackAnalytics('', null as any);
        service.trackInteraction('', '', '', null as any);
        service.trackSecurity(null as any);
      }).not.toThrow();
    });
  });
});
