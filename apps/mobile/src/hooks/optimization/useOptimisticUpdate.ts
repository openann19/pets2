/**
 * Optimistic Update Hook
 * 
 * Provides optimistic UI updates with automatic rollback on error
 */
import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdateOptions<T> {
  /** Initial optimistic state */
  optimisticValue: T;
  /** Async function to perform the actual update */
  updateFn: () => Promise<T>;
  /** Callback on success */
  onSuccess?: (value: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Whether to automatically rollback on error */
  rollbackOnError?: boolean;
}

interface OptimisticUpdateState<T> {
  value: T;
  isUpdating: boolean;
  error: Error | null;
  isOptimistic: boolean;
}

/**
 * Hook for optimistic UI updates
 * 
 * Immediately updates UI, then syncs with server.
 * Automatically rolls back on error if configured.
 */
export function useOptimisticUpdate<T>(
  initialValue: T,
  options?: Partial<OptimisticUpdateOptions<T>>,
) {
  const [state, setState] = useState<OptimisticUpdateState<T>>({
    value: initialValue,
    isUpdating: false,
    error: null,
    isOptimistic: false,
  });

  const originalValueRef = useRef<T>(initialValue);
  const rollbackOnError = options?.rollbackOnError ?? true;

  const update = useCallback(
    async (newValue: T, updateFn?: () => Promise<T>) => {
      const updateFunction = updateFn || options?.updateFn;
      if (!updateFunction) {
        throw new Error('updateFn is required');
      }

      // Store original value for rollback
      originalValueRef.current = state.value;

      // Optimistically update UI
      setState({
        value: newValue,
        isUpdating: true,
        error: null,
        isOptimistic: true,
      });

      try {
        // Perform actual update
        const result = await updateFunction();
        
        setState({
          value: result,
          isUpdating: false,
          error: null,
          isOptimistic: false,
        });

        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Rollback on error if configured
        const finalValue = rollbackOnError ? originalValueRef.current : newValue;
        
        setState({
          value: finalValue,
          isUpdating: false,
          error: err,
          isOptimistic: false,
        });

        options?.onError?.(err);
        throw err;
      }
    },
    [state.value, options, rollbackOnError],
  );

  const rollback = useCallback(() => {
    setState({
      value: originalValueRef.current,
      isUpdating: false,
      error: null,
      isOptimistic: false,
    });
  }, []);

  return {
    value: state.value,
    isUpdating: state.isUpdating,
    error: state.error,
    isOptimistic: state.isOptimistic,
    update,
    rollback,
  };
}
