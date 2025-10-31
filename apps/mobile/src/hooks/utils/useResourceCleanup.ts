/**
 * Advanced Hook Cleanup Utility
 * 
 * Comprehensive cleanup management for complex hooks combining:
 * - React Query subscriptions
 * - Timers (setTimeout/setInterval)
 * - WebSocket/EventEmitter connections
 * - Native modules (Audio, Location, etc.)
 * - Promise cancellations
 * 
 * @example
 * const cleanup = useResourceCleanup();
 * 
 * // Register timers
 * const timerId = setTimeout(() => {}, 1000);
 * cleanup.registerTimer(timerId);
 * 
 * // Register React Query cancellation
 * cleanup.registerQueryCancel(() => queryClient.cancelQueries({ queryKey }));
 * 
 * // Register native cleanup
 * cleanup.registerCleanup(() => recording.stopAndUnloadAsync());
 * 
 * // All cleanup runs automatically on unmount or manual call
 */

import { useEffect, useRef, useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';

export type CleanupFunction = () => void | Promise<void>;

export interface ResourceCleanupOptions {
  /** Automatically cleanup on unmount (default: true) */
  autoCleanup?: boolean;
  /** QueryClient instance for query cancellation */
  queryClient?: QueryClient;
}

export interface ResourceCleanupReturn {
  /** Register a cleanup function */
  registerCleanup: (cleanup: CleanupFunction) => void;
  /** Register a timer to be cleared */
  registerTimer: (timerId: NodeJS.Timeout | ReturnType<typeof setTimeout>) => void;
  /** Register multiple timers */
  registerTimers: (timerIds: Array<NodeJS.Timeout | ReturnType<typeof setTimeout>>) => void;
  /** Register a React Query cancellation */
  registerQueryCancel: (cancelFn: () => void) => void;
  /** Register an event listener removal */
  registerEventListener: (
    target: EventTarget,
    event: string,
    handler: EventListener,
  ) => void;
  /** Register a subscription removal */
  registerSubscription: (subscription: { remove?: () => void; unsubscribe?: () => void }) => void;
  /** Manually trigger cleanup */
  cleanup: () => Promise<void>;
  /** Check if cleanup has been called */
  isCleanedUp: boolean;
}

/**
 * Hook for managing complex resource cleanup
 */
export function useResourceCleanup(
  options: ResourceCleanupOptions = {},
): ResourceCleanupReturn {
  const { autoCleanup = true, queryClient } = options;

  const cleanupFunctionsRef = useRef<Set<CleanupFunction>>(new Set());
  const timersRef = useRef<Set<NodeJS.Timeout | ReturnType<typeof setTimeout>>>(new Set());
  const queryCancelsRef = useRef<Set<() => void>>(new Set());
  const eventListenersRef = useRef<
    Array<{ target: EventTarget; event: string; handler: EventListener }>
  >(new Array());
  const subscriptionsRef = useRef<
    Array<{ remove?: () => void; unsubscribe?: () => void }>
  >(new Array());
  const isCleanedUpRef = useRef(false);

  const registerCleanup = useCallback((cleanup: CleanupFunction) => {
    if (isCleanedUpRef.current) {
      // If already cleaned up, execute immediately
      void Promise.resolve(cleanup()).catch(() => {
        // Ignore cleanup errors after unmount
      });
      return;
    }
    cleanupFunctionsRef.current.add(cleanup);
  }, []);

  const registerTimer = useCallback(
    (timerId: NodeJS.Timeout | ReturnType<typeof setTimeout>) => {
      if (isCleanedUpRef.current) {
        clearTimeout(timerId as any);
        clearInterval(timerId as any);
        return;
      }
      timersRef.current.add(timerId);
    },
    [],
  );

  const registerTimers = useCallback(
    (timerIds: Array<NodeJS.Timeout | ReturnType<typeof setTimeout>>) => {
      timerIds.forEach(registerTimer);
    },
    [registerTimer],
  );

  const registerQueryCancel = useCallback(
    (cancelFn: () => void) => {
      if (isCleanedUpRef.current) {
        cancelFn();
        return;
      }
      queryCancelsRef.current.add(cancelFn);
    },
    [],
  );

  const registerEventListener = useCallback(
    (target: EventTarget, event: string, handler: EventListener) => {
      if (isCleanedUpRef.current) {
        target.removeEventListener(event, handler);
        return;
      }

      target.addEventListener(event, handler);
      eventListenersRef.current.push({ target, event, handler });
    },
    [],
  );

  const registerSubscription = useCallback(
    (subscription: { remove?: () => void; unsubscribe?: () => void }) => {
      if (isCleanedUpRef.current) {
        subscription.remove?.();
        subscription.unsubscribe?.();
        return;
      }
      subscriptionsRef.current.push(subscription);
    },
    [],
  );

  const cleanup = useCallback(async () => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;

    // Clear all timers
    timersRef.current.forEach((timerId) => {
      clearTimeout(timerId as any);
      clearInterval(timerId as any);
    });
    timersRef.current.clear();

    // Cancel all React Query queries
    queryCancelsRef.current.forEach((cancelFn) => {
      try {
        cancelFn();
      } catch (error) {
        // Ignore cancellation errors
        console.warn('Error canceling query:', error);
      }
    });
    queryCancelsRef.current.clear();

    // Cancel all queries via QueryClient if provided
    if (queryClient) {
      try {
        await queryClient.cancelQueries();
      } catch (error) {
        console.warn('Error canceling queries via QueryClient:', error);
      }
    }

    // Remove all event listeners
    eventListenersRef.current.forEach(({ target, event, handler }) => {
      try {
        target.removeEventListener(event, handler);
      } catch (error) {
        console.warn('Error removing event listener:', error);
      }
    });
    eventListenersRef.current = [];

    // Remove all subscriptions
    subscriptionsRef.current.forEach((subscription) => {
      try {
        subscription.remove?.();
        subscription.unsubscribe?.();
      } catch (error) {
        console.warn('Error removing subscription:', error);
      }
    });
    subscriptionsRef.current = [];

    // Execute all cleanup functions
    const cleanupPromises = Array.from(cleanupFunctionsRef.current).map((cleanupFn) =>
      Promise.resolve(cleanupFn()).catch((error) => {
        console.warn('Error in cleanup function:', error);
      }),
    );
    await Promise.allSettled(cleanupPromises);
    cleanupFunctionsRef.current.clear();
  }, [queryClient]);

  useEffect(() => {
    if (!autoCleanup) return;
    return () => {
      void cleanup();
    };
  }, [autoCleanup, cleanup]);

  return {
    registerCleanup,
    registerTimer,
    registerTimers,
    registerQueryCancel,
    registerEventListener,
    registerSubscription,
    cleanup,
    isCleanedUp: isCleanedUpRef.current,
  };
}
