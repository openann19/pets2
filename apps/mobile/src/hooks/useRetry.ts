import { useCallback, useRef, useState } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onFailure?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: Error | null;
}

/**
 * Hook for handling retry logic with exponential backoff
 */
export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
    onFailure
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const executeWithRetry = useCallback(async <T>(
    operation: (signal?: AbortSignal) => Promise<T>
  ): Promise<T> => {
    setState(prev => ({ ...prev, isRetrying: true, attemptCount: 0, lastError: null }));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Create abort controller for this attempt
        abortControllerRef.current = new AbortController();

        const result = await operation(abortControllerRef.current.signal);

        // Success - reset state
        setState({
          isRetrying: false,
          attemptCount: attempt,
          lastError: null
        });

        return result;

      } catch (error) {
        const isLastAttempt = attempt === maxAttempts;
        const currentError = error instanceof Error ? error : new Error(String(error));

        setState(prev => ({
          ...prev,
          attemptCount: attempt,
          lastError: currentError
        }));

        // Call retry callback if provided
        if (onRetry && !isLastAttempt) {
          onRetry(attempt);
        }

        // If this is the last attempt or error is not retryable, fail
        if (isLastAttempt || shouldNotRetry(error)) {
          setState(prev => ({ ...prev, isRetrying: false }));

          if (onFailure) {
            onFailure(currentError);
          }

          throw currentError;
        }

        // Wait before retrying (with exponential backoff)
        if (!isLastAttempt) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);

          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    // This should never be reached, but just in case
    throw state.lastError || new Error('Retry logic failed unexpectedly');
  }, [maxAttempts, delayMs, backoffMultiplier, onRetry, onFailure, state.lastError]);

  const reset = useCallback(() => {
    clearTimeoutRef();
    abort();
    setState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null
    });
  }, [clearTimeoutRef, abort]);

  return {
    executeWithRetry,
    reset,
    isRetrying: state.isRetrying,
    attemptCount: state.attemptCount,
    lastError: state.lastError,
    canRetry: state.attemptCount < maxAttempts
  };
};

/**
 * Determine if an error should not be retried
 */
function shouldNotRetry(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { status?: number; code?: string };

  // Don't retry authentication errors
  if (err.status === 401 || err.status === 403) {
    return true;
  }

  // Don't retry validation errors (400)
  if (err.status === 400) {
    return true;
  }

  // Don't retry not found errors (404)
  if (err.status === 404) {
    return true;
  }

  // Don't retry if it's a network error that suggests no connection
  if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT') {
    return false; // Actually, we might want to retry network errors
  }

  // Retry other errors by default
  return false;
}

export default useRetry;
