import NetInfo from '@react-native-community/netinfo';
import { useCallback } from 'react';
import { logger } from '../services/logger';
import { useErrorHandler } from './useErrorHandler';
import { useRetry } from './useRetry';

interface RecoveryOptions {
  enableOfflineRetry?: boolean;
  maxOfflineRetries?: number;
  enableNetworkRetry?: boolean;
  maxNetworkRetries?: number;
  onRecoverySuccess?: () => void;
  onRecoveryFailure?: (error: Error) => void;
}

/**
 * Comprehensive error recovery hook that handles different types of errors
 * with appropriate recovery strategies
 */
export const useErrorRecovery = (options: RecoveryOptions = {}) => {
  const {
    enableOfflineRetry = true,
    maxOfflineRetries = 5,
    enableNetworkRetry = true,
    maxNetworkRetries = 3,
    onRecoverySuccess: _onRecoverySuccess,
    onRecoveryFailure,
  } = options;

  const { handleError, handleNetworkError, handleOfflineError } = useErrorHandler();

  const offlineRetry = useRetry({
    maxAttempts: maxOfflineRetries,
    delayMs: 2000, // 2 seconds
    backoffMultiplier: 1.5,
    onRetry: (attempt) => {
      logger.info(`Offline retry attempt ${attempt}/${maxOfflineRetries}`);
    },
    onFailure: (error) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Offline retry failed', { error: errorObj });
      onRecoveryFailure?.(errorObj);
    },
  });

  const networkRetry = useRetry({
    maxAttempts: maxNetworkRetries,
    delayMs: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt) => {
      logger.info(`Network retry attempt ${attempt}/${maxNetworkRetries}`);
    },
    onFailure: (error) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Network retry failed', { error: errorObj });
      onRecoveryFailure?.(errorObj);
    },
  });

  /**
   * Execute operation with comprehensive error recovery
   */
  const executeWithRecovery = useCallback(
    async <T>(operation: () => Promise<T>, context?: string): Promise<T> => {
      try {
        // Check network connectivity first
        const networkState = await NetInfo.fetch();

        if (!networkState.isConnected && enableOfflineRetry) {
          // Handle offline scenario
          return await offlineRetry.executeWithRetry(async () => {
            // Check connectivity again
            const currentState = await NetInfo.fetch();
            if (!currentState.isConnected) {
              throw new Error('No internet connection');
            }

            return await operation();
          });
        }

        // Normal operation with network retry
        if (enableNetworkRetry) {
          return await networkRetry.executeWithRetry(async () => {
            return await operation();
          });
        }

        // Execute without retry
        return await operation();
      } catch (error) {
        // Type guard for error handling
        const errorToHandle = error instanceof Error ? error : new Error(String(error));

        handleError(errorToHandle, context, {
          showAlert: false, // We'll handle UI feedback
          logError: true,
        });

        // Determine error type and handle appropriately
        if (isNetworkError(error)) {
          handleNetworkError(errorToHandle, context, () => {
            // Retry callback
            executeWithRecovery(operation, context).catch(() => {
              // Retry failed, show final error
              handleError(errorToHandle, context);
            });
          });
        } else if (isOfflineError(error)) {
          handleOfflineError(context, () => {
            executeWithRecovery(operation, context).catch(() => {
              handleError(errorToHandle, context);
            });
          });
        } else {
          // Generic error handling
          handleError(errorToHandle, context);
        }

        throw error;
      }
    },
    [
      enableOfflineRetry,
      enableNetworkRetry,
      offlineRetry,
      networkRetry,
      handleError,
      handleNetworkError,
      handleOfflineError,
    ],
  );

  /**
   * Reset all recovery states
   */
  const resetRecovery = useCallback(() => {
    offlineRetry.reset();
    networkRetry.reset();
  }, [offlineRetry, networkRetry]);

  /**
   * Check if currently recovering from an error
   */
  const isRecovering = offlineRetry.isRetrying || networkRetry.isRetrying;

  /**
   * Get current recovery state
   */
  const getRecoveryState = useCallback(
    () => ({
      isRecovering,
      offlineAttempts: offlineRetry.attemptCount,
      networkAttempts: networkRetry.attemptCount,
      lastOfflineError: offlineRetry.lastError,
      lastNetworkError: networkRetry.lastError,
      canRetryOffline: offlineRetry.canRetry,
      canRetryNetwork: networkRetry.canRetry,
    }),
    [isRecovering, offlineRetry, networkRetry],
  );

  return {
    executeWithRecovery,
    resetRecovery,
    isRecovering,
    getRecoveryState,
  };
};

/**
 * Check if error is a network-related error
 */
function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { status?: number; code?: string; message?: string };

  // HTTP status codes indicating network/server issues
  const networkStatusCodes = [408, 500, 502, 503, 504];
  if (err.status && networkStatusCodes.includes(err.status)) {
    return true;
  }

  // Error codes indicating network issues
  const networkErrorCodes = ['NETWORK_ERROR', 'TIMEOUT', 'ENOTFOUND', 'ECONNREFUSED'];
  if (err.code && networkErrorCodes.includes(err.code)) {
    return true;
  }

  // Message-based detection
  const message = err.message?.toLowerCase() || '';
  if (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('server')
  ) {
    return true;
  }

  return false;
}

/**
 * Check if error is specifically an offline/no-connection error
 */
function isOfflineError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { code?: string; message?: string };
  const message = err.message?.toLowerCase() || '';
  return (
    message.includes('offline') ||
    message.includes('no internet') ||
    message.includes('no connection') ||
    err.code === 'NETWORK_ERROR'
  );
}

export default useErrorRecovery;
