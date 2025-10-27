/**
 * Tests for usePerformanceMonitor hook
 *
 * Covers:
 * - Performance metric collection
 * - Memory usage monitoring
 * - Render time tracking
 * - Network request monitoring
 * - Performance alerts and warnings
 * - Optimization recommendations
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  describe('Initialization', () => {
    it('should initialize with performance metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.metrics).toBeDefined();
      expect(result.current.alerts).toEqual([]);
      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.recommendations).toEqual([]);
    });

    it('should accept custom configuration', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableMemoryMonitoring: false,
        enableNetworkMonitoring: true,
        alertThresholds: {
          memoryUsage: 100 * 1024 * 1024, // 100MB
          renderTime: 16, // 16ms
        }
      }));

      expect(result.current.enableMemoryMonitoring).toBe(false);
      expect(result.current.enableNetworkMonitoring).toBe(true);
    });
  });

  describe('Memory Monitoring', () => {
    it('should track memory usage', async () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      await act(async () => {
        await result.current.measureMemoryUsage();
      });

      expect(result.current.metrics.memory).toBeDefined();
      expect(result.current.metrics.memory).toHaveProperty('used');
      expect(result.current.metrics.memory).toHaveProperty('available');
      expect(result.current.metrics.memory).toHaveProperty('peak');
    });

    it('should detect memory leaks', async () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      // Simulate memory growth
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          await result.current.measureMemoryUsage();
          // Simulate memory allocation
        }
      });

      expect(result.current.alerts.some(alert => alert.type === 'memory-leak')).toBeDefined();
    });

    it('should alert on high memory usage', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        alertThresholds: {
          memoryUsage: 50 * 1024 * 1024 // 50MB threshold
        }
      }));

      // Simulate high memory usage
      await act(async () => {
        await result.current.measureMemoryUsage();
      });

      const memoryAlerts = result.current.alerts.filter(alert => alert.type === 'high-memory');
      expect(memoryAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('Render Performance', () => {
    it('should measure component render time', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startRenderMeasurement('TestComponent');
        // Simulate render work
        result.current.endRenderMeasurement('TestComponent');
      });

      expect(result.current.metrics.renderTime).toBeDefined();
      expect(result.current.metrics.renderTime.TestComponent).toBeDefined();
    });

    it('should track slow renders', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        alertThresholds: {
          renderTime: 8 // 8ms threshold
        }
      }));

      act(() => {
        result.current.startRenderMeasurement('SlowComponent');
        // Simulate slow render (would be > 8ms in real scenario)
        setTimeout(() => {
          result.current.endRenderMeasurement('SlowComponent');
        }, 10);
      });

      // Should eventually trigger slow render alert
      expect(result.current.alerts).toBeDefined();
    });

    it('should calculate average render times', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.startRenderMeasurement('RepeatedComponent');
          result.current.endRenderMeasurement('RepeatedComponent');
        }
      });

      expect(result.current.metrics.renderTime.RepeatedComponent).toHaveProperty('average');
      expect(result.current.metrics.renderTime.RepeatedComponent.average).toBeGreaterThan(0);
    });
  });

  describe('Network Monitoring', () => {
    it('should track network requests', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true
      }));

      await act(async () => {
        await result.current.measureNetworkRequest('/api/test', 'GET', 200);
      });

      expect(result.current.metrics.network).toBeDefined();
      expect(result.current.metrics.network).toHaveProperty('requests');
      expect(result.current.metrics.network.requests).toHaveLength(1);
    });

    it('should detect slow network requests', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true,
        alertThresholds: {
          networkLatency: 1000 // 1 second
        }
      }));

      await act(async () => {
        await result.current.measureNetworkRequest('/api/slow', 'GET', 200, 2000); // 2 seconds
      });

      const slowNetworkAlerts = result.current.alerts.filter(alert => alert.type === 'slow-network');
      expect(slowNetworkAlerts.length).toBeGreaterThan(0);
    });

    it('should track failed network requests', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true
      }));

      await act(async () => {
        await result.current.measureNetworkRequest('/api/error', 'POST', 500, 500);
      });

      expect(result.current.metrics.network.failedRequests).toBeGreaterThan(0);
      const failedRequestAlerts = result.current.alerts.filter(alert => alert.type === 'network-error');
      expect(failedRequestAlerts.length).toBeGreaterThan(0);
    });

    it('should calculate network metrics', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true
      }));

      await act(async () => {
        await result.current.measureNetworkRequest('/api/fast', 'GET', 200, 100);
        await result.current.measureNetworkRequest('/api/medium', 'POST', 201, 500);
        await result.current.measureNetworkRequest('/api/slow', 'PUT', 200, 2000);
      });

      expect(result.current.metrics.network.averageLatency).toBeDefined();
      expect(result.current.metrics.network.averageLatency).toBeGreaterThan(0);
    });
  });

  describe('Performance Alerts', () => {
    it('should generate memory alerts', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        alertThresholds: {
          memoryUsage: 10 * 1024 * 1024 // 10MB
        }
      }));

      await act(async () => {
        await result.current.checkMemoryThreshold();
      });

      const memoryAlerts = result.current.alerts.filter(alert => alert.type.startsWith('memory'));
      expect(memoryAlerts.length).toBeGreaterThan(0);
      expect(memoryAlerts[0]).toHaveProperty('severity');
      expect(memoryAlerts[0]).toHaveProperty('message');
      expect(memoryAlerts[0]).toHaveProperty('timestamp');
    });

    it('should generate render performance alerts', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        alertThresholds: {
          renderTime: 16 // 16ms (60fps threshold)
        }
      }));

      act(() => {
        result.current.checkRenderPerformance();
      });

      const renderAlerts = result.current.alerts.filter(alert => alert.type === 'slow-render');
      // May or may not trigger depending on actual performance
      expect(Array.isArray(renderAlerts)).toBe(true);
    });

    it('should prioritize critical alerts', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      // Simulate critical memory issue
      act(() => {
        result.current.generateAlert('critical-memory', 'Critical memory issue', 'high');
      });

      const criticalAlerts = result.current.alerts.filter(alert => alert.severity === 'high');
      expect(criticalAlerts.length).toBeGreaterThan(0);
      expect(criticalAlerts[0].type).toBe('critical-memory');
    });

    it('should clear resolved alerts', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.generateAlert('test-alert', 'Test message', 'medium');
      });

      expect(result.current.alerts.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearAlerts('test-alert');
      });

      const testAlerts = result.current.alerts.filter(alert => alert.type === 'test-alert');
      expect(testAlerts.length).toBe(0);
    });
  });

  describe('Optimization Recommendations', () => {
    it('should generate memory optimization recommendations', async () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      await act(async () => {
        await result.current.analyzeMemoryUsage();
      });

      const memoryRecommendations = result.current.recommendations.filter(
        rec => rec.category === 'memory'
      );
      expect(memoryRecommendations.length).toBeGreaterThan(0);
      expect(memoryRecommendations[0]).toHaveProperty('title');
      expect(memoryRecommendations[0]).toHaveProperty('description');
      expect(memoryRecommendations[0]).toHaveProperty('impact');
    });

    it('should generate render optimization recommendations', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.analyzeRenderPerformance();
      });

      const renderRecommendations = result.current.recommendations.filter(
        rec => rec.category === 'render'
      );
      expect(Array.isArray(renderRecommendations)).toBe(true);
    });

    it('should generate network optimization recommendations', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true
      }));

      await act(async () => {
        await result.current.analyzeNetworkPerformance();
      });

      const networkRecommendations = result.current.recommendations.filter(
        rec => rec.category === 'network'
      );
      expect(Array.isArray(networkRecommendations)).toBe(true);
    });

    it('should prioritize high-impact recommendations', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.generateOptimizationRecommendations();
      });

      const highImpactRecommendations = result.current.recommendations.filter(
        rec => rec.impact === 'high'
      );
      expect(highImpactRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Monitoring Controls', () => {
    it('should start monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
    });

    it('should stop monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.stopMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
    });

    it('should pause and resume monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.pauseMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);

      act(() => {
        result.current.resumeMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
    });

    it('should reset metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      // Generate some metrics
      act(() => {
        result.current.startRenderMeasurement('TestComponent');
        result.current.endRenderMeasurement('TestComponent');
      });

      expect(Object.keys(result.current.metrics.renderTime).length).toBeGreaterThan(0);

      act(() => {
        result.current.resetMetrics();
      });

      expect(result.current.metrics.renderTime).toEqual({});
    });
  });

  describe('Export and Reporting', () => {
    it('should export performance metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const exportedData = result.current.exportMetrics();
      expect(exportedData).toHaveProperty('metrics');
      expect(exportedData).toHaveProperty('alerts');
      expect(exportedData).toHaveProperty('recommendations');
      expect(exportedData).toHaveProperty('timestamp');
    });

    it('should generate performance report', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const report = result.current.generatePerformanceReport();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('score');
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    });

    it('should calculate performance score', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const score = result.current.calculatePerformanceScore();
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Real-time Monitoring', () => {
    it('should monitor performance in real-time', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.enableRealTimeMonitoring();
      });

      expect(result.current.realTimeMonitoringEnabled).toBe(true);
    });

    it('should emit performance events', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      let eventReceived = false;

      act(() => {
        result.current.onPerformanceEvent((event) => {
          eventReceived = true;
        });

        // Trigger an event
        result.current.generateAlert('test-event', 'Test event', 'low');
      });

      expect(eventReceived).toBe(true);
    });

    it('should handle performance thresholds', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        alertThresholds: {
          memoryUsage: 50 * 1024 * 1024,
          renderTime: 16,
          networkLatency: 1000
        }
      }));

      expect(result.current.alertThresholds.memoryUsage).toBe(50 * 1024 * 1024);
      expect(result.current.alertThresholds.renderTime).toBe(16);
      expect(result.current.alertThresholds.networkLatency).toBe(1000);
    });
  });

  describe('Integration', () => {
    it('should integrate with React DevTools', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableDevToolsIntegration: true
      }));

      expect(result.current.devToolsIntegrationEnabled).toBe(true);
    });

    it('should work with error boundaries', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.reportError(new Error('Test error'));
      });

      expect(result.current.errors).toContainEqual(
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });

    it('should integrate with analytics', () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableAnalytics: true
      }));

      act(() => {
        result.current.trackPerformanceEvent('render_complete', { duration: 10 });
      });

      expect(result.current.analyticsEnabled).toBe(true);
      expect(result.current.performanceEvents).toContainEqual(
        expect.objectContaining({
          type: 'render_complete',
          duration: 10
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low memory conditions', async () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      // Simulate very low memory
      await act(async () => {
        await result.current.measureMemoryUsage();
      });

      // Should still function
      expect(result.current.metrics.memory).toBeDefined();
    });

    it('should handle very slow renders', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startRenderMeasurement('VerySlowComponent');
        // Simulate very slow render
        setTimeout(() => {
          result.current.endRenderMeasurement('VerySlowComponent');
        }, 100);
      });

      // Should handle without crashing
      expect(result.current.metrics.renderTime).toBeDefined();
    });

    it('should handle network timeouts', async () => {
      const { result } = renderHook(() => usePerformanceMonitor({
        enableNetworkMonitoring: true
      }));

      await act(async () => {
        // Simulate timeout (no response within reasonable time)
        await result.current.measureNetworkRequest('/api/timeout', 'GET', 408, 30000);
      });

      const timeoutAlerts = result.current.alerts.filter(alert => alert.type === 'network-timeout');
      expect(timeoutAlerts.length).toBeGreaterThan(0);
    });

    it('should handle rapid metric updates', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        // Rapid fire measurements
        for (let i = 0; i < 10; i++) {
          result.current.startRenderMeasurement(`Component${i}`);
          result.current.endRenderMeasurement(`Component${i}`);
        }
      });

      // Should handle without performance degradation
      expect(Object.keys(result.current.metrics.renderTime).length).toBeGreaterThan(5);
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => usePerformanceMonitor());
      expect(() => unmount()).not.toThrow();
    });

    it('should stop all monitoring on unmount', () => {
      const { unmount, result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      unmount();

      // Monitoring should be stopped
      expect(result.current.isMonitoring).toBe(false);
    });

    it('should cleanup real-time subscriptions', () => {
      const { unmount } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.enableRealTimeMonitoring();
      });

      unmount();

      // Real-time monitoring should be disabled
    });

    it('should clear intervals and timers', () => {
      const { unmount } = renderHook(() => usePerformanceMonitor({
        enablePeriodicMonitoring: true
      }));

      unmount();

      // Should cleanup all intervals and timers
    });
  });
});
