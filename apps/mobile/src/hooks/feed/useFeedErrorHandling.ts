/**
 * Feed Error Handling Hook
 * Phase 2: Comprehensive Error Handling & Recovery
 * 
 * Provides robust error handling for feed operations with:
 * - Error boundaries
 * - Retry mechanisms
 * - Error recovery
 * - User-friendly error messages
 * - Error analytics
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { telemetry } from '../../lib/telemetry';

export interface FeedError {
  /** Error ID for tracking */
  id: string;
  /** Error message */
  message: string;
  /** Error type */
  type: 'network' | 'auth' | 'server' | 'unknown';
  /** Timestamp */
  timestamp: number;
  /** Retry count */
  retryCount: number;
  /** Whether error is recoverable */
  recoverable: boolean;
  /** Original error object */
  originalError?: Error;
}

export interface UseFeedErrorHandlingOptions {
  /** Max retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Enable exponential backoff */
  exponentialBackoff?: boolean;
  /** Show alerts for errors */
  showAlerts?: boolean;
  /** Custom error handler */
  onError?: (error: FeedError) => void;
  /** Custom recovery handler */
  onRecover?: (error: FeedError) => void;
}

export interface UseFeedErrorHandlingReturn {
  /** Current error */
  error: FeedError | null;
  /** Whether retry is in progress */
  isRetrying: boolean;
  /** Execute operation with error handling */
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    context?: string,
  ) => Promise<T>;
  /** Retry last failed operation */
  retry: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
  /** Get error history */
  getErrorHistory: () => FeedError[];
}

/**
 * Feed Error Handling Hook
 * 
 * Comprehensive error handling with retry and recovery
 */
export function useFeedErrorHandling(
  options: UseFeedErrorHandlingOptions = {},
): UseFeedErrorHandlingReturn {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    showAlerts = true,
    onError,
    onRecover,
  } = options;

  const [error, setError] = useState<FeedError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const errorHistoryRef = useRef<FeedError[]>([]);
  const lastOperationRef = useRef<{
    operation: () => Promise<unknown>;
    context?: string;
  } | null>(null);

  /**
   * Classify error type
   */
  const classifyError = useCallback((err: unknown): FeedError['type'] => {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return 'network';
      }
      if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
        return 'auth';
      }
      if (message.includes('server') || message.includes('500') || message.includes('503')) {
        return 'server';
      }
    }
    return 'unknown';
  }, []);

  /**
   * Check if error is recoverable
   */
  const isRecoverable = useCallback((errorType: FeedError['type']): boolean => {
    return errorType === 'network' || errorType === 'server';
  }, []);

  /**
   * Create error object
   */
  const createError = useCallback(
    (err: unknown, retryCount: number = 0): FeedError => {
      const errorType = classifyError(err);
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      const recoverable = isRecoverable(errorType);

      const feedError: FeedError = {
        id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        message: errorMessage,
        type: errorType,
        timestamp: Date.now(),
        retryCount,
        recoverable,
        originalError: err instanceof Error ? err : undefined,
      };

      // Add to history (keep last 10)
      errorHistoryRef.current.push(feedError);
      if (errorHistoryRef.current.length > 10) {
        errorHistoryRef.current.shift();
      }

      return feedError;
    },
    [classifyError, isRecoverable],
  );

  /**
   * Execute operation with error handling
   */
  const executeWithRetry = useCallback(
    async <T,>(operation: () => Promise<T>, context?: string): Promise<T> => {
      // Store operation for retry
      lastOperationRef.current = { operation, context };

      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          const result = await operation();

          // Clear error on success
          if (error) {
            setError(null);
            onRecover?.(error);
          }

          return result;
        } catch (err: unknown) {
          const feedError = createError(err, retryCount);

          // Check if we should retry
          if (
            retryCount < maxRetries &&
            feedError.recoverable &&
            feedError.type !== 'auth'
          ) {
            retryCount += 1;

            // Calculate delay with exponential backoff
            const delay = exponentialBackoff
              ? retryDelay * Math.pow(2, retryCount - 1)
              : retryDelay;

            logger.warn('Feed operation failed, retrying', {
              error: feedError.message,
              retryCount,
              delay,
              context,
            });

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, delay));

            continue;
          }

          // No more retries or non-recoverable error
          setError(feedError);
          onError?.(feedError);

          // Track error via logger (telemetry.trackError may not have this exact signature)
          logger.error('Feed operation error', {
            message: feedError.message,
            type: feedError.type,
            recoverable: feedError.recoverable,
            retryCount: feedError.retryCount,
            context,
            errorId: feedError.id,
          });

          // Show alert if enabled
          if (showAlerts) {
            const alertMessage =
              feedError.type === 'network'
                ? 'Network error. Please check your connection and try again.'
                : feedError.type === 'auth'
                  ? 'Authentication error. Please sign in again.'
                  : 'Something went wrong. Please try again.';

            Alert.alert('Error', alertMessage, [
              {
                text: 'OK',
                onPress: () => {},
              },
            ]);
          }

          throw err;
        }
      }

      // Should never reach here, but TypeScript needs it
      throw new Error('Max retries exceeded');
    },
    [
      error,
      maxRetries,
      exponentialBackoff,
      retryDelay,
      showAlerts,
      onError,
      onRecover,
      createError,
    ],
  );

  /**
   * Retry last failed operation
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!lastOperationRef.current) {
      logger.warn('No operation to retry');
      return;
    }

    setIsRetrying(true);

    try {
      await executeWithRetry(
        lastOperationRef.current.operation,
        lastOperationRef.current.context,
      );
    } catch (err) {
      logger.error('Retry failed', { error: err });
    } finally {
      setIsRetrying(false);
    }
  }, [executeWithRetry]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get error history
   */
  const getErrorHistory = useCallback((): FeedError[] => {
    return [...errorHistoryRef.current];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lastOperationRef.current = null;
    };
  }, []);

  return {
    error,
    isRetrying,
    executeWithRetry,
    retry,
    clearError,
    getErrorHistory,
  };
}

