/**
 * Performance Monitoring Hook
 * 
 * Tracks frame rate, memory usage, and performance metrics
 */
import { useEffect, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { logger } from '@pawfectmatch/core';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage?: number;
  renderTime: number;
  interactionsBlocked: number;
}

interface UsePerformanceMonitorOptions {
  /** Screen/component name for tracking */
  name: string;
  /** Whether to log metrics */
  logMetrics?: boolean;
  /** Thresholds for warnings */
  thresholds?: {
    minFrameRate?: number;
    maxMemoryMB?: number;
    maxRenderTime?: number;
  };
  /** Callback when thresholds exceeded */
  onThresholdExceeded?: (metrics: PerformanceMetrics) => void;
}

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(options: UsePerformanceMonitorOptions) {
  const {
    name,
    logMetrics = false,
    thresholds = {
      minFrameRate: 55,
      maxMemoryMB: 200,
      maxRenderTime: 16,
    },
    onThresholdExceeded,
  } = options;

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const renderStartTimeRef = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frameRate: 60,
    renderTime: 0,
    interactionsBlocked: 0,
  });

  // Measure render time
  useEffect(() => {
    renderStartTimeRef.current = Date.now();

    return () => {
      const renderTime = Date.now() - renderStartTimeRef.current;
      
      if (renderTime > (thresholds.maxRenderTime || 16)) {
        if (logMetrics) {
          logger.warn(`[Perf] ${name}: Slow render ${renderTime}ms`);
        }
      }
    };
  });

  // Track frame rate
  useEffect(() => {
    let animationFrameId: number;
    let lastCheck = Date.now();
    const checkInterval = 1000; // Check every second

    const measureFrameRate = () => {
      const now = Date.now();
      const delta = now - lastCheck;

      if (delta >= checkInterval) {
        const frameRate = Math.round((frameCountRef.current / delta) * 1000);
        frameCountRef.current = 0;
        lastCheck = now;

        const newMetrics: PerformanceMetrics = {
          frameRate,
          renderTime: Date.now() - renderStartTimeRef.current,
          interactionsBlocked: 0,
        };

        // Check for memory on native platforms
        if (Platform.OS !== 'web') {
          // Memory monitoring would require native modules
          // For now, we skip it
        }

        setMetrics(newMetrics);

        // Check thresholds
        if (frameRate < (thresholds.minFrameRate || 55)) {
          if (logMetrics) {
            logger.warn(`[Perf] ${name}: Low frame rate ${frameRate}fps`);
          }
          onThresholdExceeded?.(newMetrics);
        }

        if (logMetrics) {
          logger.info(`[Perf] ${name}:`, newMetrics);
        }
      }

      frameCountRef.current++;
      animationFrameId = requestAnimationFrame(measureFrameRate);
    };

    animationFrameId = requestAnimationFrame(measureFrameRate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [name, logMetrics, thresholds, onThresholdExceeded]);

  // Track blocked interactions (using InteractionManager.runAfterInteractions)
  useEffect(() => {
    // InteractionManager doesn't have event listeners
    // Instead, we use runAfterInteractions to detect when interactions are complete
    const checkInteractions = () => {
      InteractionManager.runAfterInteractions(() => {
        // This callback runs when interactions are done
        // Can be used for performance monitoring
      });
    };

    checkInteractions();
  }, []);

  return metrics;
}

/**
 * Hook for measuring async operation performance
 */
export function useAsyncPerformance(name: string) {
  const operationsRef = useRef<Map<string, number>>(new Map());

  const startMeasure = (operationId: string) => {
    operationsRef.current.set(operationId, Date.now());
  };

  const endMeasure = (operationId: string): number => {
    const startTime = operationsRef.current.get(operationId);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    operationsRef.current.delete(operationId);
    return duration;
  };

  const measureAsync = async <T,>(
    operationId: string,
    fn: () => Promise<T>,
  ): Promise<T> => {
    startMeasure(operationId);
    try {
      const result = await fn();
      const duration = endMeasure(operationId);
      logger.info(`[Perf] ${name}: ${operationId} took ${duration}ms`);
      return result;
    } catch (error) {
      endMeasure(operationId);
      throw error;
    }
  };

  return { measureAsync, startMeasure, endMeasure };
}
