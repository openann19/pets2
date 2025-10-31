/**
 * React 18 Concurrent Features Hook
 * 
 * Provides useDeferredValue and useTransition wrappers for performance optimization
 */
import { useDeferredValue, useTransition, startTransition } from 'react';

/**
 * Hook for deferring non-critical updates
 * 
 * Use this for values that don't need immediate updates (e.g., search results)
 */
export function useDeferredValueOptimized<T>(value: T): T {
  return useDeferredValue(value);
}

/**
 * Hook for marking heavy updates as transitions
 * 
 * Use this for expensive operations that can be interrupted
 */
export function useTransitionOptimized() {
  const [isPending, startTransitionFn] = useTransition();
  return { isPending, startTransition: startTransitionFn };
}

/**
 * Utility function for starting transitions outside hooks
 */
export { startTransition };

/**
 * Hook combining deferred values and transitions for heavy list operations
 */
export function useOptimizedListUpdates<T>(items: T[]) {
  const deferredItems = useDeferredValue(items);
  const [isPending, startTransitionFn] = useTransition();

  const updateItems = (_newItems: T[]) => {
    startTransitionFn(() => {
      // Update items in transition
      // This allows React to interrupt if needed
      // Implementation would update state with newItems here
    });
  };

  return {
    items: deferredItems,
    isPending,
    updateItems,
  };
}
