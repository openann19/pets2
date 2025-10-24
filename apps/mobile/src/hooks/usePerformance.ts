/**
 * Performance Optimization Utilities
 * React hooks and utilities for preventing unnecessary re-renders
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { logger } from '../services/logger';

/**
 * Hook for stable callback references
 * Prevents child components from re-rendering due to new function references
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) as T;
}

/**
 * Hook for stable object references
 * Prevents child components from re-rendering due to new object references
 */
export function useStableValue<T>(value: T): T {
  const valueRef = useRef<T>(value);
  valueRef.current = value;
  return valueRef.current;
}

/**
 * Hook for debounced values
 * Useful for search inputs and other frequently changing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 * Prevents excessive function calls (useful for scroll handlers, resize events)
 */
export function useThrottle<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      return callback(...args);
    }
  }, [callback, delay]) as T;
}

/**
 * Hook for conditional rendering optimization
 * Only re-renders when condition changes
 */
export function useConditionalRender<T>(
  condition: boolean,
  render: () => T,
  fallback: T = null as T
): T {
  const lastConditionRef = useRef<boolean>(condition);
  const lastResultRef = useRef<T>(condition ? render() : fallback);

  if (condition !== lastConditionRef.current) {
    lastConditionRef.current = condition;
    lastResultRef.current = condition ? render() : fallback;
  }

  return lastResultRef.current;
}

/**
 * Hook for expensive computations with custom comparison
 */
export function useMemoCompare<T>(
  next: T,
  compare: (previous: T | undefined, next: T) => boolean
): T {
  const previousRef = useRef<T | undefined>(undefined);
  const previous = previousRef.current;

  const isEqual = compare(previous, next);

  React.useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });

  return isEqual ? previous! : next;
}

/**
 * Hook for previous value tracking
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * Performance monitoring hook
 * Logs render counts and performance metrics
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = __DEV__) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  renderCountRef.current += 1;

  React.useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;

    if (renderCountRef.current > 1) {
      logger.performance(`Component Render: ${componentName}`, timeSinceLastRender, {
        renderCount: renderCountRef.current,
        componentName
      });
    }

    lastRenderTimeRef.current = now;
  });

  // Log on unmount
  React.useEffect(() => {
    return () => {
      if (enabled && renderCountRef.current > 1) {
        logger.performance(`Component Unmount: ${componentName}`, 0, {
          totalRenders: renderCountRef.current,
          componentName
        });
      }
    };
  }, [componentName, enabled]);
}

/**
 * Context selector hook for optimized context consumption
 * Only triggers re-renders when selected values change
 */
export function useContextSelector<T, R>(
  context: React.Context<T>,
  selector: (value: T) => R
): R {
  const [, forceUpdate] = useState({});
  const selectedRef = useRef<R | undefined>(undefined);
  const selectorRef = useRef(selector);

  selectorRef.current = selector;

  const contextValue = React.useContext(context);

  const selected = selector(contextValue);

  if (!Object.is(selected, selectedRef.current)) {
    selectedRef.current = selected;
    forceUpdate({});
  }

  return selected;
}

/**
 * Optimized event handler creator
 * Prevents recreation of event handlers on every render
 */
export function useEventHandler<T extends (...args: never[]) => unknown>(
  handler: T,
  deps: React.DependencyList = []
): T {
  const handlerRef = useRef<T | undefined>(undefined);

  // Update handler ref when dependencies change
  React.useEffect(() => {
    handlerRef.current = handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handler, ...deps]);

  // Return stable function that calls current handler
  return useCallback((...args: Parameters<T>) => {
    return handlerRef.current?.(...args);
  }, []) as T;
}

/**
 * Hook for list virtualization
 * Helps optimize rendering of large lists
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useThrottle((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    setScrollTop(event.nativeEvent.contentOffset.y);
  }, 16); // ~60fps

  return {
    visibleItems,
    totalHeight,
    onScroll: handleScroll,
  };
}

/**
 * Hook for imperative handle with stable reference
 */
export function useImperativeHandleStable<T>(
  ref: React.Ref<T>,
  createHandle: () => T,
  deps: React.DependencyList = []
) {
  const handleRef = useRef<T | undefined>(undefined);

  React.useImperativeHandle(ref, () => {
    if (!handleRef.current) {
      handleRef.current = createHandle();
    }
    return handleRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createHandle, ...deps]);
}

// Import React for useEffect
import React from 'react';
