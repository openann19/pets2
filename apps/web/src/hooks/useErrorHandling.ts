/**
 * Enhanced Error Handling Hook - Web Version
 * 
 * Comprehensive error handling matching mobile useErrorHandling exactly
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { logger } from '@pawfectmatch/core';
import { getSafeWindow } from '@pawfectmatch/core/utils/env';

export type ErrorType =
  | 'network'
  | 'timeout'
  | 'server'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not_found'
  | 'rate_limit'
  | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  retryCount: number;
  originalError: Error;
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: ErrorType[];
}

export interface UseErrorHandlingOptions extends RetryOptions {
  onError?: (error: ErrorInfo) => void;
  onRetry?: (attempt: number) => void;
  showAlert?: boolean;
  logError?: boolean;
}

export interface UseErrorHandlingReturn {
  error: ErrorInfo | null;
  isRetrying: boolean;
  handleError: (error: unknown, context?: string) => ErrorInfo;
  retry: () => Promise<void>;
  clearError: () => void;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    context?: string
  ) => Promise<T>;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['network', 'timeout', 'server'],
};

/**
 * Classify error type from error object
 */
function classifyError(error: unknown): ErrorType {
  if (!error || typeof error !== 'object') return 'unknown';

  const err = error as { status?: number; code?: string; message?: string };

  // HTTP status codes
  if (err.status) {
    if (err.status === 401) return 'authentication';
    if (err.status === 403) return 'authorization';
    if (err.status === 404) return 'not_found';
    if (err.status === 422) return 'validation';
    if (err.status === 429) return 'rate_limit';
    if (err.status >= 500) return 'server';
    if (err.status === 408) return 'timeout';
  }

  // Error codes
  if (err.code) {
    if (['NETWORK_ERROR', 'ENOTFOUND', 'ECONNREFUSED'].includes(err.code)) {
      return 'network';
    }
    if (err.code === 'TIMEOUT') return 'timeout';
  }

  // Message-based detection
  const message = err.message?.toLowerCase() || '';
  if (message.includes('network') || message.includes('connection')) {
    return 'network';
  }
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return 'authentication';
  }
  if (message.includes('forbidden') || message.includes('authorization')) {
    return 'authorization';
  }
  if (message.includes('not found')) return 'not_found';
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }

  return 'unknown';
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(errorType: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    network: 'Unable to connect. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    server: 'Server error. Please try again later.',
    authentication: 'Your session has expired. Please log in again.',
    authorization: 'You don\'t have permission to perform this action.',
    validation: 'Invalid input. Please check your information.',
    not_found: 'The requested item was not found.',
    rate_limit: 'Too many requests. Please wait a moment and try again.',
    unknown: 'Something went wrong. Please try again.',
  };

  return messages[errorType];
}

/**
 * Enhanced error handling hook
 */
export function useErrorHandling(
  options: UseErrorHandlingOptions = {}
): UseErrorHandlingReturn {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    initialDelay = DEFAULT_RETRY_OPTIONS.initialDelay,
    maxDelay = DEFAULT_RETRY_OPTIONS.maxDelay,
    backoffMultiplier = DEFAULT_RETRY_OPTIONS.backoffMultiplier,
    retryableErrors = DEFAULT_RETRY_OPTIONS.retryableErrors,
    onError,
    onRetry,
    showAlert = false,
    logError = true,
  } = options;

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryOperationRef = useRef<(() => Promise<unknown>) | null>(null);
  const retryCountRef = useRef(0);

  /**
   * Handle error and classify it
   */
  const handleError = useCallback(
    (err: unknown, context?: string): ErrorInfo => {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      const errorType = classifyError(err);
      const userMessage = getUserFriendlyMessage(errorType);
      const canRetry = retryableErrors.includes(errorType);

      const errorInfo: ErrorInfo = {
        type: errorType,
        message: errorObj.message,
        userMessage,
        canRetry,
        retryCount: retryCountRef.current,
        originalError: errorObj,
      };

      // Log error
      if (logError) {
        logger.error('Error handled', {
          type: errorType,
          message: errorObj.message,
          context,
          canRetry,
        });
      }

      // Call custom error handler
      onError?.(errorInfo);

      // Show alert if requested
      const win = getSafeWindow();
      if (showAlert && win) {
        const shouldRetry = win.confirm(userMessage + '\n\nWould you like to retry?');
        if (shouldRetry && canRetry) {
          retry();
        }
      }

      setError(errorInfo);
      return errorInfo;
    },
    [retryableErrors, logError, showAlert, onError]
  );

  /**
   * Retry the last operation
   */
  const retry = useCallback(async () => {
    if (!retryOperationRef.current || !error?.canRetry) return;

    if (retryCountRef.current >= maxRetries) {
      setError({
        ...error,
        userMessage: 'Maximum retry attempts reached. Please try again later.',
        canRetry: false,
      });
      return;
    }

    setIsRetrying(true);
    retryCountRef.current += 1;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      initialDelay * Math.pow(backoffMultiplier, retryCountRef.current - 1),
      maxDelay
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      onRetry?.(retryCountRef.current);
      await retryOperationRef.current();
      // Success - clear error
      setError(null);
      retryCountRef.current = 0;
    } catch (err) {
      // Failed again - update error
      handleError(err);
    } finally {
      setIsRetrying(false);
    }
  }, [
    error,
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    onRetry,
    handleError,
  ]);

  /**
   * Execute operation with automatic retry
   */
  const executeWithRetry = useCallback(
    async <T,>(operation: () => Promise<T>, context?: string): Promise<T> => {
      retryOperationRef.current = operation as () => Promise<unknown>;
      retryCountRef.current = 0;

      try {
        // Check network connectivity first
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('No internet connection');
        }

        const result = await operation();
        // Success - clear any previous errors
        setError(null);
        retryCountRef.current = 0;
        return result;
      } catch (err) {
        handleError(err, context);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
    retryOperationRef.current = null;
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearError,
    executeWithRetry,
  };
}

