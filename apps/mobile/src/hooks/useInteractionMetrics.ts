import { useCallback, useRef } from 'react';
import { logger } from '@pawfectmatch/core';

interface InteractionMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

interface UseInteractionMetricsOptions {
  name: string;
  enableLogging?: boolean;
  threshold?: number; // ms - log if interaction takes longer than this
}

export function useInteractionMetrics({
  name,
  enableLogging = true,
  threshold = 50, // 50ms threshold for "slow" interactions
}: UseInteractionMetricsOptions) {
  const metricsRef = useRef<Map<string, InteractionMetric>>(new Map());

  const startInteraction = useCallback(
    (id: string = 'default', metadata?: Record<string, unknown>) => {
      const metric: InteractionMetric = {
        name,
        startTime: performance.now(),
        success: false,
        metadata,
      };

      metricsRef.current.set(id, metric);

      if (enableLogging) {
        logger.debug(`🎯 Interaction started: ${name}`, { id, metadata });
      }
    },
    [name, enableLogging],
  );

  const endInteraction = useCallback(
    (id: string = 'default', success: boolean = true, metadata?: Record<string, unknown>) => {
      const metric = metricsRef.current.get(id);
      if (!metric) {
        logger.warn(`⚠️ No interaction found for id: ${id}`);
        return;
      }

      const endTime = performance.now();
      const duration = endTime - metric.startTime;

      const completedMetric: InteractionMetric = {
        ...metric,
        endTime,
        duration,
        success,
        metadata: { ...metric.metadata, ...metadata },
      };

      metricsRef.current.set(id, completedMetric);

      if (enableLogging) {
        const emoji = success ? '✅' : '❌';
        const speedEmoji = duration > threshold ? '🐌' : '⚡';

        logger.info(`${emoji}${speedEmoji} Interaction completed: ${name}`, {
          id,
          duration: `${duration.toFixed(2)}ms`,
          success,
          threshold: duration > threshold ? 'SLOW' : 'FAST',
          metadata: completedMetric.metadata,
        });

        // Log performance warning for slow interactions
        if (duration > threshold) {
          logger.warn(
            `🐌 Slow interaction detected: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
            {
              id,
              duration,
              metadata: completedMetric.metadata,
            },
          );
        }
      }

      return completedMetric;
    },
    [name, enableLogging, threshold],
  );

  const getMetrics = useCallback((id: string = 'default') => {
    return metricsRef.current.get(id);
  }, []);

  const getAllMetrics = useCallback(() => {
    return Array.from(metricsRef.current.values());
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
  }, []);

  // Helper for measuring a function execution
  const measureFunction = useCallback(
    async <T>(
      fn: () => T | Promise<T>,
      id: string = 'default',
      metadata?: Record<string, unknown>,
    ): Promise<{ result: T; metric: InteractionMetric }> => {
      startInteraction(id, metadata);

      try {
        const result = await fn();
        const metric = endInteraction(id, true);
        return { result, metric: metric! };
      } catch (error) {
        const metric = endInteraction(id, false, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    [startInteraction, endInteraction],
  );

  return {
    startInteraction,
    endInteraction,
    getMetrics,
    getAllMetrics,
    clearMetrics,
    measureFunction,
  };
}

// Specialized hooks for common gesture interactions
export function useDoubleTapMetrics() {
  return useInteractionMetrics({
    name: 'doubleTap',
    threshold: 50, // Double-tap should be very fast
  });
}

export function usePinchMetrics() {
  return useInteractionMetrics({
    name: 'pinch',
    threshold: 16, // Should stay under 16ms per frame
  });
}

export function useSwipeMetrics() {
  return useInteractionMetrics({
    name: 'swipe',
    threshold: 100, // Swipe gestures can be a bit slower
  });
}

export function useReactionMetrics() {
  return useInteractionMetrics({
    name: 'reaction',
    threshold: 80, // Reaction selection should be responsive
  });
}
