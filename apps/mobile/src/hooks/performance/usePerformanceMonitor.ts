/**
 * 🎯 PERFORMANCE MONITORING HOOK
 * 
 * React hook for performance monitoring in components
 */

import { useRef, useEffect } from 'react';
import { PerformanceMetricsCollector, type PerformanceBudget } from '@/foundation/performance-validation';

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(enabled = __DEV__) {
  const collector = useRef(new PerformanceMetricsCollector());

  useEffect(() => {
    if (!enabled) return;

    collector.current.start();

    let frameId: number;
    const measureFrame = () => {
      collector.current.recordFrame();
      frameId = requestAnimationFrame(measureFrame);
    };

    frameId = requestAnimationFrame(measureFrame);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      collector.current.stop();
    };
  }, [enabled]);

  return {
    metrics: collector.current.stop(),
    meetsBudget: (budget?: PerformanceBudget) => collector.current.meetsBudget(budget),
    start: () => collector.current.start(),
    stop: () => collector.current.stop(),
    recordFrame: () => collector.current.recordFrame(),
  };
}

export default usePerformanceMonitor;
