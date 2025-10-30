import { useCallback, useState } from 'react';

export interface UseAsyncActionOptions<TResult, TArgs extends any[] = []> {
  action: (...args: TArgs) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

export interface UseAsyncActionReturn<TResult, TArgs extends any[] = []> {
  data: TResult | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  reset: () => void;
}

/**
 * Hook for managing async actions with loading, error, and success states
 *
 * @example
 * const { data, isLoading, error, execute } = useAsyncAction({
 *   action: async (userId: string) => await api.getUser(userId),
 *   onSuccess: (user) => logger.info('User loaded', { userId: user.id }),
 *   onError: (error) => logger.error('Failed to load user', { error })
 * });
 */
export function useAsyncAction<TResult, TArgs extends any[] = []>({
  action,
  onSuccess,
  onError,
  immediate = false,
}: UseAsyncActionOptions<TResult, TArgs>): UseAsyncActionReturn<TResult, TArgs> {
  const [data, setData] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      // Prevent duplicate execution while loading
      if (isLoading) {
        return undefined;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await action(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [action, onSuccess, onError, isLoading],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
