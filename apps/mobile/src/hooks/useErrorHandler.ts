import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { logger } from '../services/logger';

type EventData = Record<string, unknown>;

interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onRetry?: () => void;
  retryable?: boolean;
}

interface NetworkError {
  message: string;
  status?: number;
  code?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Comprehensive error handling hook for React Native
 */
export const useErrorHandler = () => {
  const handleError = useCallback(
    (
      error: Error | NetworkError | ValidationError[] | string,
      context?: string,
      options: ErrorHandlerOptions = {},
    ) => {
      const {
        showAlert = true,
        logError = true,
        fallbackMessage = 'Something went wrong. Please try again.',
        onRetry,
        retryable = false,
      } = options;

      // Normalize error to string message
      let errorMessage = fallbackMessage;
      let errorDetails: EventData = {};

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else if (Array.isArray(error)) {
        // Validation errors array
        const firstError = error[0];
        if (firstError && typeof firstError === 'object' && 'message' in firstError) {
          errorMessage = firstError.message;
        }
        errorDetails['validationErrors'] = error;
      } else if (error && typeof error === 'object') {
        // Network error
        const networkError = error;
        errorMessage = networkError.message || fallbackMessage;

        if (networkError.status) {
          errorDetails['status'] = networkError.status;
          errorDetails['code'] = networkError.code;

          // Customize message based on status code
          switch (networkError.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input.';
              break;
            case 401:
              errorMessage = 'Session expired. Please log in again.';
              break;
            case 403:
              errorMessage = 'Access denied. You may not have permission for this action.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please wait a moment and try again.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
          }
        }
      }

      // Log error if requested
      if (logError) {
        logger.error('Error handled by useErrorHandler', {
          message: errorMessage,
          context,
          details: errorDetails,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        });
      }

      // Show alert if requested
      if (showAlert) {
        const alertButtons: Array<{ text: string; onPress?: () => void }> = [{ text: 'OK' }];

        // Add retry button if retryable and callback provided
        if (retryable && onRetry) {
          alertButtons.unshift({
            text: 'Retry',
            onPress: onRetry,
          });
        }

        Alert.alert('Error', errorMessage, alertButtons);
      }

      return {
        message: errorMessage,
        details: errorDetails,
        retryable,
        canRetry: retryable && !!onRetry,
      };
    },
    [],
  );

  // Specific error handlers for common scenarios
  const handleNetworkError = useCallback(
    (error: NetworkError | Error | string, context?: string, onRetry?: () => void) =>
      handleError(error, context, {
        showAlert: true,
        logError: true,
        fallbackMessage: 'Network error. Please check your connection and try again.',
        ...(onRetry && { onRetry }),
        retryable: true,
      }),
    [handleError],
  );

  const handleAuthError = useCallback(
    (context?: string) =>
      handleError('Authentication failed. Please log in again.', context, {
        showAlert: true,
        logError: true,
      }),
    [handleError],
  );

  const handleValidationError = useCallback(
    (errors: ValidationError[], context?: string) => {
      const errorMessage =
        errors.length === 1 && errors[0]
          ? errors[0].message
          : `${errors.length} validation errors found.`;

      return handleError(errorMessage, context, {
        showAlert: true,
        logError: true,
        fallbackMessage: 'Please check your input and try again.',
      });
    },
    [handleError],
  );

  const handleOfflineError = useCallback(
    (context?: string, onRetry?: () => void) =>
      handleError('You appear to be offline. Please check your connection.', context, {
        showAlert: true,
        logError: false, // Don't log offline errors as they're expected
        ...(onRetry && { onRetry }),
        retryable: true,
      }),
    [handleError],
  );

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    handleOfflineError,
  };
};

export default useErrorHandler;
