/**
 * Performance Monitoring for Hooks
 * Tracks and reports hook performance metrics
 */

import { useEffect, useRef } from "react";
import { logger } from "@pawfectmatch/core";

interface PerformanceMetrics {
  hookName: string;
  screenName: string;
  mountTime: number;
  renderCount: number;
  avgRenderTime: number;
  slowRenders: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();

  recordMount(hookName: string, screenName: string, mountTime: number): void {
    const key = `${hookName}-${screenName}`;
    this.metrics.set(key, {
      hookName,
      screenName,
      mountTime,
      renderCount: 0,
      avgRenderTime: 0,
      slowRenders: 0,
    });
  }

  recordRender(hookName: string, screenName: string, renderTime: number): void {
    const key = `${hookName}-${screenName}`;
    const metric = this.metrics.get(key);

    if (metric) {
      metric.renderCount += 1;
      metric.avgRenderTime =
        (metric.avgRenderTime * (metric.renderCount - 1) + renderTime) /
        metric.renderCount;

      if (renderTime > 16) {
        // Flag renders over 1 frame (16.67ms at 60fps)
        metric.slowRenders += 1;
      }
    }
  }

  getReport(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  getMetric(hookName: string, screenName: string): PerformanceMetrics | undefined {
    const key = `${hookName}-${screenName}`;
    return this.metrics.get(key);
  }

  logReport(): void {
    const report = this.getReport();
    
    report.forEach((metric) => {
      if (metric.renderCount > 0) {
        logger.info("Hook Performance", {
          hook: metric.hookName,
          screen: metric.screenName,
          mountTime: `${metric.mountTime.toFixed(2)}ms`,
          avgRenderTime: `${metric.avgRenderTime.toFixed(2)}ms`,
          renderCount: metric.renderCount,
          slowRenders: metric.slowRenders,
        });
      }
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor performance of other hooks
 */
export function usePerformanceMonitor(
  hookName: string,
  screenName: string
): void {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    performanceMonitor.recordMount(hookName, screenName, mountTime);

    return () => {
      // Cleanup if needed
    };
  }, [hookName, screenName]);

  useEffect(() => {
    const renderStart = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStart;
      performanceMonitor.recordRender(hookName, screenName, renderTime);
    };
  });
}

/**
 * Logs performance report
 */
export function logPerformanceReport(): void {
  performanceMonitor.logReport();
}

