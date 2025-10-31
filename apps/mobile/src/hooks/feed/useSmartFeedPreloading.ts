/**
 * Smart Feed Preloading Hook
 * Phase 1: Performance & Scalability
 * 
 * Implements intersection observer-like behavior for React Native
 * to automatically preload next pet profiles as user approaches the end of feed
 */

import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { logger } from '@pawfectmatch/core';

export interface PreloadConfig {
  /** Number of items ahead to preload */
  preloadAhead: number;
  /** Threshold percentage (0-1) for triggering preload */
  threshold: number;
  /** Minimum items remaining before preload triggers */
  minRemaining: number;
  /** Callback when preload should be triggered */
  onPreload: (nextIndex: number) => Promise<void> | void;
  /** Callback when items are preloaded */
  onPreloadComplete?: () => void;
  /** Maximum number of concurrent preloads */
  maxConcurrent?: number;
}

export interface SmartFeedPreloadingReturn {
  /** Register current position for preload monitoring */
  registerPosition: (currentIndex: number, totalItems: number) => void;
  /** Manually trigger preload */
  triggerPreload: (nextIndex: number) => Promise<void>;
  /** Clear pending preloads */
  clearPreloads: () => void;
  /** Get preload statistics */
  getStats: () => {
    preloadedCount: number;
    pendingPreloads: number;
  };
}

const DEFAULT_CONFIG: Partial<PreloadConfig> = {
  preloadAhead: 5,
  threshold: 0.3, // Preload when 30% of feed remaining
  minRemaining: 10,
  maxConcurrent: 3,
};

/**
 * Smart Feed Preloading Hook
 * 
 * Automatically preloads next pet profiles based on current scroll/swipe position
 * Uses intelligent batching to avoid performance issues
 */
export function useSmartFeedPreloading(
  config: PreloadConfig,
): SmartFeedPreloadingReturn {
  const {
    preloadAhead = 5,
    threshold = 0.3,
    minRemaining = 10,
    onPreload,
    onPreloadComplete,
    maxConcurrent = 3,
  } = { ...DEFAULT_CONFIG, ...config };

  const currentPositionRef = useRef<{
    currentIndex: number;
    totalItems: number;
  }>({ currentIndex: 0, totalItems: 0 });

  const preloadQueueRef = useRef<Set<number>>(new Set());
  const activePreloadsRef = useRef<Set<number>>(new Set());
  const preloadedCountRef = useRef(0);

  /**
   * Execute preload for a specific index
   */
  const executePreload = useCallback(
    async (index: number): Promise<void> => {
      // Skip if already preloaded or in progress
      if (preloadQueueRef.current.has(index) || activePreloadsRef.current.has(index)) {
        return;
      }

      // Check concurrency limit
      if (activePreloadsRef.current.size >= maxConcurrent) {
        preloadQueueRef.current.add(index);
        return;
      }

      activePreloadsRef.current.add(index);
      preloadQueueRef.current.add(index);

      try {
        // Use InteractionManager to defer preload until interactions complete
        await InteractionManager.runAfterInteractions(async () => {
          await onPreload(index);
          preloadedCountRef.current += 1;
          onPreloadComplete?.();
        });
      } catch (error) {
        logger.warn('Feed preload failed', { error, index });
      } finally {
        activePreloadsRef.current.delete(index);
        
        // Process next item in queue if slots available
        if (preloadQueueRef.current.size > 0 && activePreloadsRef.current.size < maxConcurrent) {
          const nextIndex = Array.from(preloadQueueRef.current)[0];
          preloadQueueRef.current.delete(nextIndex);
          void executePreload(nextIndex);
        }
      }
    },
    [onPreload, onPreloadComplete, maxConcurrent],
  );

  /**
   * Register current position and trigger preload if needed
   */
  const registerPosition = useCallback(
    (currentIndex: number, totalItems: number) => {
      currentPositionRef.current = { currentIndex, totalItems };

      const remaining = totalItems - currentIndex;
      const shouldPreload =
        remaining <= minRemaining ||
        remaining / totalItems <= threshold;

      if (shouldPreload && remaining > 0) {
        // Preload next N items ahead
        const nextIndices = Array.from(
          { length: Math.min(preloadAhead, remaining) },
          (_, i) => currentIndex + i + 1,
        );

        nextIndices.forEach((index) => {
          if (index < totalItems && !preloadQueueRef.current.has(index)) {
            void executePreload(index);
          }
        });
      }
    },
    [preloadAhead, threshold, minRemaining, executePreload],
  );

  /**
   * Manually trigger preload for specific index
   */
  const triggerPreload = useCallback(
    async (nextIndex: number): Promise<void> => {
      await executePreload(nextIndex);
    },
    [executePreload],
  );

  /**
   * Clear all pending preloads
   */
  const clearPreloads = useCallback(() => {
    preloadQueueRef.current.clear();
    // Note: active preloads will complete, but new ones won't start
  }, []);

  /**
   * Get preload statistics
   */
  const getStats = useCallback(
    () => ({
      preloadedCount: preloadedCountRef.current,
      pendingPreloads: preloadQueueRef.current.size + activePreloadsRef.current.size,
    }),
    [],
  );

  return {
    registerPosition,
    triggerPreload,
    clearPreloads,
    getStats,
  };
}

