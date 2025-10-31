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
  private logError(error: Error | null | undefined, context: ErrorContext): void {
    // In production, this would send to a logging service like Sentry
    const safeError = error || new Error('Unknown error');
    logger.error('Error occurred', {
      message: safeError.message || 'Unknown error',
      stack: safeError.stack || undefined, // Explicitly set to undefined if no stack
      context,
      timestamp: new Date().toISOString(),
    });
  }

  private showUserNotification(title: string, message: string): void {
    try {
      Alert.alert(title, message, [{ text: 'OK' }]);
    } catch (notificationError) {
      // If notification fails, log but don't crash
      logger.error('Failed to show user notification', {
        error: notificationError,
        title,
        message,
      });
    }
  }

  private getUserFriendlyMessage(error: Error, context?: ErrorContext & { statusCode?: number }): string {
    // Handle empty message
    if (!error.message || error.message.trim() === '') {
      return 'An unexpected error occurred. Please try again.';
    }

    // Check statusCode from context first (more reliable than parsing error message)
    if (context?.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (context?.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (context?.statusCode === 403) {
      return "You don't have permission to perform this action.";
    }
    if (context?.statusCode === 500) {
      return 'Server error occurred. Please try again later.';
    }

    const message = error.message.toLowerCase();

    // Network errors - check first before user-friendly check
    if (message.includes('network') || message.includes('fetch') || message.includes('connection timeout') || message.includes('connection')) {
      return 'Please check your internet connection and try again.';
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401') || message.includes('session expired') || message.includes('authentication failed')) {
      return 'Your session has expired. Please log in again.';
    }

    // Permission errors
    if (message.includes('forbidden') || message.includes('403') || message.includes('access denied') || message.includes('permission')) {
      return "You don't have permission to perform this action.";
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404') || message.includes('does not exist') || message.includes('resource not found')) {
      return 'The requested resource was not found.';
    }

    // Server errors
    if (message.includes('server') || message.includes('500') || message.includes('service unavailable') || message.includes('internal error')) {
      return 'Server error occurred. Please try again later.';
    }

    // Return the original message only if it's clearly user-friendly (short, no technical jargon)
    // Be strict: messages containing "error", "failed", "timeout", etc. are NOT user-friendly
    const technicalTerms = ['error', 'exception', 'failed', 'timeout', 'denied', 'expired', 'unavailable', 'network', 'connection', 'server', 'unauthorized', 'forbidden', 'not found'];
    const lowerMessage = error.message.toLowerCase();
    const containsTechnicalTerm = technicalTerms.some(term => lowerMessage.includes(term));
    
    const isUserFriendly = error.message.length < 100 && 
      !error.message.includes('Error:') && 
      !containsTechnicalTerm &&
      !error.message.match(/\d{3}/); // No HTTP status codes like 404, 500

    if (isUserFriendly) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle general errors
   */
  handleError(error: Error | null | undefined, context: ErrorContext, options: ErrorHandlerOptions = {}): void {
    const { showNotification = true, logToService = true } = options;

    // Normalize null/undefined errors
    const safeError = error || new Error('Unknown error');

    if (logToService) {
      this.logError(safeError, context);
    }

    if (showNotification) {
      const fallbackMessage = options.fallbackMessage;
      const userMessage = fallbackMessage || this.getUserFriendlyMessage(safeError, context);
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

    // Pass statusCode in context so getUserFriendlyMessage can use it
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
