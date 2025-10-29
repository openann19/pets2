/**
 * Centralized Error Handler for Mobile App
 * Production-ready error handling with user notifications and logging
 */

import { Alert } from 'react-native';

import { logger } from './logger';

interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface ApiErrorContext extends ErrorContext {
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToService?: boolean;
  fallbackMessage?: string;
}

class ErrorHandler {
  private logError(error: Error, context: ErrorContext): void {
    // In production, this would send to a logging service like Sentry
    logger.error('Error occurred', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  private showUserNotification(title: string, message: string): void {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  private getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Please check your internet connection and try again.';
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return "You don't have permission to perform this action.";
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }

    if (message.includes('server') || message.includes('500')) {
      return 'Server error occurred. Please try again later.';
    }

    // Return the original message if it's already user-friendly
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle general errors
   */
  handleError(error: Error, context: ErrorContext, options: ErrorHandlerOptions = {}): void {
    const { showNotification = true, logToService = true } = options;

    if (logToService) {
      this.logError(error, context);
    }

    if (showNotification) {
      const userMessage = this.getUserFriendlyMessage(error);
      this.showUserNotification('Error', userMessage);
    }
  }

  /**
   * Handle API-specific errors
   */
  handleApiError(
    error: Error,
    context: ErrorContext,
    apiContext: {
      endpoint?: string;
      method?: string;
      statusCode?: number;
    },
    options: ErrorHandlerOptions = {},
  ): void {
    const enhancedContext: ApiErrorContext = {
      ...context,
      ...apiContext,
    };

    this.handleError(error, enhancedContext, options);
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error, context: ErrorContext, options: ErrorHandlerOptions = {}): void {
    const networkOptions: ErrorHandlerOptions = {
      ...options,
      fallbackMessage: 'Network error. Please check your connection and try again.',
    };

    this.handleError(error, context, networkOptions);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlerOptions = {},
  ): void {
    const validationOptions: ErrorHandlerOptions = {
      ...options,
      fallbackMessage: 'Please check your input and try again.',
    };

    this.handleError(error, context, validationOptions);
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: Error, context: ErrorContext, options: ErrorHandlerOptions = {}): void {
    const authOptions: ErrorHandlerOptions = {
      ...options,
      fallbackMessage: 'Authentication failed. Please log in again.',
    };

    this.handleError(error, context, authOptions);
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlerOptions = {},
  ): void {
    const permissionOptions: ErrorHandlerOptions = {
      ...options,
      fallbackMessage: "You don't have permission to perform this action.",
    };

    this.handleError(error, context, permissionOptions);
  }

  /**
   * Create a typed error with context
   */
  createError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code !== undefined && code !== '') {
      (error as Error & { code?: string }).code = code;
    }
    return error;
  }

  /**
   * Wrap async functions with error handling
   */
  async wrapAsync<T>(
    asyncFn: () => Promise<T>,
    context: ErrorContext,
    options: ErrorHandlerOptions = {},
  ): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), context, options);
      return null;
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
export default errorHandler;
