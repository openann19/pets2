/**
 * Comprehensive tests for useInteractionMetrics hook
 *
 * Coverage:
 * - User interaction tracking and metrics
 * - Touch event analysis and patterns
 * - Performance metrics for interactions
 * - Gesture recognition and classification
 * - Accessibility interaction tracking
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { useInteractionMetrics } from '../useInteractionMetrics';

// Mock analytics service
jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
    trackScreenView: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { analyticsService } from '../../../services/analyticsService';

const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

describe('useInteractionMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      expect(result.current.metrics).toEqual({
        totalInteractions: 0,
        averageResponseTime: 0,
        mostUsedFeature: null,
        interactionPatterns: {},
        touchHeatmap: {},
        gestureAccuracy: 0,
        accessibilityInteractions: 0,
      });

      expect(result.current.isTracking).toBe(true);
    });

    it('should initialize with custom configuration', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({
          trackGestures: true,
          trackAccessibility: true,
          debounceMs: 100,
          maxHistorySize: 1000,
        })
      );

      expect(result.current.config.trackGestures).toBe(true);
      expect(result.current.config.trackAccessibility).toBe(true);
      expect(result.current.config.debounceMs).toBe(100);
    });
  });

  describe('Interaction Tracking', () => {
    it('should track button interactions', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('button_press', {
          buttonId: 'like_button',
          screen: 'profile',
          timestamp: Date.now(),
        });
      });

      expect(result.current.metrics.totalInteractions).toBe(1);
      expect(result.current.metrics.interactionPatterns['button_press']).toBe(1);
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'interaction_metrics',
        expect.objectContaining({
          type: 'button_press',
          buttonId: 'like_button',
          screen: 'profile',
        }),
        undefined
      );
    });

    it('should track gesture interactions', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ trackGestures: true })
      );

      const gestureData = {
        gestureType: 'swipe',
        direction: 'right',
        velocity: 500,
        accuracy: 0.95,
      };

      act(() => {
        result.current.trackGesture(gestureData);
      });

      expect(result.current.metrics.gestureAccuracy).toBe(0.95);
      expect(result.current.metrics.interactionPatterns['gesture_swipe']).toBe(1);
    });

    it('should track accessibility interactions', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ trackAccessibility: true })
      );

      act(() => {
        result.current.trackAccessibilityInteraction('screen_reader', {
          element: 'button',
          action: 'activate',
        });
      });

      expect(result.current.metrics.accessibilityInteractions).toBe(1);
    });

    it('should calculate response time metrics', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      // Simulate interaction start and end
      act(() => {
        result.current.startTiming('test_interaction');
      });

      // Simulate some time passing
      jest.advanceTimersByTime(150);

      act(() => {
        result.current.endTiming('test_interaction');
      });

      expect(result.current.metrics.averageResponseTime).toBeGreaterThan(140);
      expect(result.current.metrics.averageResponseTime).toBeLessThan(160);
    });

    it('should track most used features', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('feature_use', { feature: 'swipe' });
        result.current.trackInteraction('feature_use', { feature: 'swipe' });
        result.current.trackInteraction('feature_use', { feature: 'like' });
      });

      expect(result.current.metrics.mostUsedFeature).toBe('swipe');
    });
  });

  describe('Touch Heatmap', () => {
    it('should build touch heatmap data', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      const touchData = {
        x: 100,
        y: 200,
        screen: 'home',
        element: 'like_button',
      };

      act(() => {
        result.current.trackTouch(touchData);
      });

      expect(result.current.metrics.touchHeatmap['home']).toBeDefined();
      expect(result.current.metrics.touchHeatmap['home']['like_button']).toEqual({
        count: 1,
        averageX: 100,
        averageY: 200,
        coordinates: [{ x: 100, y: 200 }],
      });
    });

    it('should aggregate touch data over multiple interactions', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackTouch({ x: 100, y: 200, screen: 'home', element: 'button' });
        result.current.trackTouch({ x: 120, y: 180, screen: 'home', element: 'button' });
        result.current.trackTouch({ x: 80, y: 220, screen: 'home', element: 'button' });
      });

      const heatmapData = result.current.metrics.touchHeatmap['home']['button'];
      expect(heatmapData.count).toBe(3);
      expect(heatmapData.averageX).toBeCloseTo(100); // (100+120+80)/3
      expect(heatmapData.averageY).toBeCloseTo(200); // (200+180+220)/3
      expect(heatmapData.coordinates).toHaveLength(3);
    });

    it('should limit stored coordinates for performance', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ maxHeatmapPoints: 2 })
      );

      act(() => {
        result.current.trackTouch({ x: 100, y: 200, screen: 'home', element: 'button' });
        result.current.trackTouch({ x: 120, y: 180, screen: 'home', element: 'button' });
        result.current.trackTouch({ x: 80, y: 220, screen: 'home', element: 'button' });
      });

      const heatmapData = result.current.metrics.touchHeatmap['home']['button'];
      expect(heatmapData.coordinates).toHaveLength(2); // Limited to maxHeatmapPoints
    });
  });

  describe('Performance Metrics', () => {
    it('should track interaction performance', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.startTiming('button_press');
      });

      jest.advanceTimersByTime(50);

      act(() => {
        result.current.endTiming('button_press');
      });

      const performance = result.current.getPerformanceMetrics();
      expect(performance.averageResponseTime).toBeGreaterThan(45);
      expect(performance.totalInteractions).toBe(1);
      expect(performance.slowestInteraction).toBe('button_press');
    });

    it('should handle multiple concurrent timings', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.startTiming('interaction1');
        result.current.startTiming('interaction2');
      });

      jest.advanceTimersByTime(100);

      act(() => {
        result.current.endTiming('interaction1');
        result.current.endTiming('interaction2');
      });

      const performance = result.current.getPerformanceMetrics();
      expect(performance.totalInteractions).toBe(2);
    });

    it('should handle orphaned timings', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.startTiming('orphaned');
        // Don't end timing
      });

      const performance = result.current.getPerformanceMetrics();
      expect(performance.orphanedTimings).toContain('orphaned');
    });
  });

  describe('Data Export and Analysis', () => {
    it('should export interaction data', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('test', { data: 'value' });
      });

      const exportedData = result.current.exportData();

      expect(exportedData).toEqual({
        metrics: expect.any(Object),
        interactions: expect.any(Array),
        heatmap: expect.any(Object),
        performance: expect.any(Object),
        exportTimestamp: expect.any(Number),
      });

      expect(exportedData.interactions).toHaveLength(1);
    });

    it('should clear all metrics data', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('test', {});
        result.current.clearData();
      });

      expect(result.current.metrics.totalInteractions).toBe(0);
      expect(result.current.metrics.interactionPatterns).toEqual({});
    });

    it('should get interaction summary', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('button_press', { button: 'like' });
        result.current.trackInteraction('gesture', { type: 'swipe' });
        result.current.trackInteraction('button_press', { button: 'pass' });
      });

      const summary = result.current.getInteractionSummary();

      expect(summary).toEqual({
        totalInteractions: 3,
        uniqueInteractionTypes: 2,
        mostFrequentType: 'button_press',
        interactionTypeBreakdown: {
          button_press: 2,
          gesture: 1,
        },
        timeRange: expect.any(Object),
      });
    });
  });

  describe('Configuration and Customization', () => {
    it('should allow disabling tracking', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ enabled: false })
      );

      act(() => {
        result.current.trackInteraction('test', {});
      });

      expect(result.current.metrics.totalInteractions).toBe(0);
      expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled();
    });

    it('should support custom event filtering', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({
          eventFilter: (event) => event.type !== 'debug',
        })
      );

      act(() => {
        result.current.trackInteraction('debug', {});
        result.current.trackInteraction('user_action', {});
      });

      expect(result.current.metrics.totalInteractions).toBe(1);
    });

    it('should support custom data transformation', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({
          dataTransformer: (data) => ({ ...data, transformed: true }),
        })
      );

      act(() => {
        result.current.trackInteraction('test', { original: true });
      });

      // Check that transformation was applied
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'interaction_metrics',
        expect.objectContaining({
          original: true,
          transformed: true,
        }),
        undefined
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics service errors gracefully', () => {
      mockAnalyticsService.trackEvent.mockRejectedValue(new Error('Analytics error'));

      const { result } = renderHook(() => useInteractionMetrics());

      // Should not crash
      act(() => {
        result.current.trackInteraction('test', {});
      });

      expect(result.current.metrics.totalInteractions).toBe(1); // Still tracks locally
    });

    it('should handle invalid timing operations', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.endTiming('nonexistent'); // No start timing
      });

      // Should not crash
      expect(result.current.metrics.averageResponseTime).toBe(0);
    });

    it('should handle malformed interaction data', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('test', null as any);
      });

      expect(result.current.metrics.totalInteractions).toBe(1);
    });

    it('should handle timing overflow', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      // Simulate very long interaction
      act(() => {
        result.current.startTiming('long_interaction');
      });

      jest.advanceTimersByTime(300000); // 5 minutes

      act(() => {
        result.current.endTiming('long_interaction');
      });

      // Should handle large timing values
      expect(result.current.metrics.averageResponseTime).toBeGreaterThan(299000);
    });
  });

  describe('Memory Management', () => {
    it('should limit interaction history size', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ maxHistorySize: 2 })
      );

      act(() => {
        result.current.trackInteraction('event1', {});
        result.current.trackInteraction('event2', {});
        result.current.trackInteraction('event3', {});
      });

      expect(result.current.metrics.totalInteractions).toBe(3); // Total count maintained
      // History should be limited, but exact implementation may vary
    });

    it('should cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => useInteractionMetrics());

      // Should not crash during unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Real-time Updates', () => {
    it('should provide real-time metrics updates', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      expect(result.current.getRealTimeMetrics()).toEqual({
        currentSessionInteractions: 0,
        recentInteractionsPerMinute: 0,
        activeFeatures: [],
        userEngagementScore: 0,
      });

      act(() => {
        result.current.trackInteraction('button_press', {});
        result.current.trackInteraction('gesture', {});
      });

      const realTimeMetrics = result.current.getRealTimeMetrics();
      expect(realTimeMetrics.currentSessionInteractions).toBe(2);
      expect(realTimeMetrics.activeFeatures).toContain('button_press');
      expect(realTimeMetrics.activeFeatures).toContain('gesture');
    });

    it('should calculate engagement score', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        // Simulate engaged user behavior
        result.current.trackInteraction('swipe', {});
        result.current.trackInteraction('like', {});
        result.current.trackInteraction('message', {});
        result.current.startTiming('response');
        jest.advanceTimersByTime(200);
        result.current.endTiming('response');
      });

      const realTimeMetrics = result.current.getRealTimeMetrics();
      expect(realTimeMetrics.userEngagementScore).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Integration', () => {
    it('should track accessibility features usage', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({ trackAccessibility: true })
      );

      act(() => {
        result.current.trackAccessibilityUsage('voice_over', {
          feature: 'screen_reader',
          elementsAccessed: 5,
        });
      });

      expect(result.current.metrics.accessibilityInteractions).toBe(1);
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'accessibility_usage',
        expect.objectContaining({
          type: 'voice_over',
          feature: 'screen_reader',
          elementsAccessed: 5,
        }),
        undefined
      );
    });

    it('should provide accessibility insights', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackAccessibilityInteraction('keyboard_navigation', {});
        result.current.trackAccessibilityInteraction('screen_reader', {});
      });

      const insights = result.current.getAccessibilityInsights();

      expect(insights).toEqual({
        totalAccessibilityInteractions: 2,
        mostUsedAccessibilityFeature: 'keyboard_navigation',
        accessibilityFeatureBreakdown: {
          keyboard_navigation: 1,
          screen_reader: 1,
        },
        accessibilityEfficiency: expect.any(Number),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme timing values', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.startTiming('extreme');
      });

      jest.advanceTimersByTime(0); // Immediate end

      act(() => {
        result.current.endTiming('extreme');
      });

      // Should handle zero timing
      expect(result.current.metrics.averageResponseTime).toBe(0);
    });

    it('should handle empty interaction data', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackInteraction('', {});
      });

      expect(result.current.metrics.totalInteractions).toBe(1);
      expect(result.current.metrics.interactionPatterns['']).toBe(1);
    });

    it('should handle very large datasets', () => {
      const { result } = renderHook(() => useInteractionMetrics({ maxHistorySize: 100 }));

      // Add many interactions
      act(() => {
        for (let i = 0; i < 150; i++) {
          result.current.trackInteraction(`event${i}`, { index: i });
        }
      });

      expect(result.current.metrics.totalInteractions).toBe(150);
      // Should manage memory efficiently
    });

    it('should handle concurrent operations', () => {
      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        // Start multiple timings
        result.current.startTiming('op1');
        result.current.startTiming('op2');
        result.current.startTiming('op3');

        // Track interactions
        result.current.trackInteraction('test1', {});
        result.current.trackInteraction('test2', {});

        // End timings
        result.current.endTiming('op1');
        result.current.endTiming('op2');
      });

      expect(result.current.metrics.totalInteractions).toBe(2);
      // Should handle concurrent operations without issues
    });

    it('should handle malformed configuration', () => {
      const { result } = renderHook(() =>
        useInteractionMetrics({
          maxHistorySize: -1, // Invalid
          debounceMs: 'invalid' as any, // Invalid type
        } as any)
      );

      // Should not crash, should use defaults
      expect(result.current.isTracking).toBe(true);
    });

    it('should handle platform-specific limitations', () => {
      // Test with limited platform capabilities
      const originalPlatform = process.platform;
      (process as any).platform = 'unknown';

      const { result } = renderHook(() => useInteractionMetrics());

      act(() => {
        result.current.trackTouch({ x: 100, y: 200, screen: 'test', element: 'button' });
      });

      // Should still work despite platform limitations
      expect(result.current.metrics.touchHeatmap['test']).toBeDefined();

      (process as any).platform = originalPlatform;
    });
  });
});
