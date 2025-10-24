/**
 * Web Error Handling Utilities
 * Production-hardened error handling for Next.js web application
 * Features: Error classification, user-friendly messages, logging integration
 */

import { logger } from '@pawfectmatch/core';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface WebError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  originalError?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Classify error type based on error characteristics
 */
export function classifyError(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401') || message.includes('auth')) {
      return ErrorType.AUTHENTICATION;
    }

    // Authorization errors
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorType.AUTHORIZATION;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('400') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }

    // Server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return ErrorType.SERVER;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Determine error severity
 */
export function determineSeverity(errorType: ErrorType, _error: unknown): ErrorSeverity {
  switch (errorType) {
    case ErrorType.NETWORK:
      return ErrorSeverity.MEDIUM;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.HIGH;
    case ErrorType.VALIDATION:
      return ErrorSeverity.LOW;
    case ErrorType.SERVER:
      return ErrorSeverity.HIGH;
    case ErrorType.CLIENT:
      return ErrorSeverity.MEDIUM;
    case ErrorType.UNKNOWN:
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Generate user-friendly error messages
 */
export function getUserFriendlyMessage(errorType: ErrorType, originalMessage?: string): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Connection lost. Please check your internet and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorType.VALIDATION:
      return originalMessage ?? 'Please check your input and try again.';
    case ErrorType.SERVER:
      return 'Server temporarily unavailable. Please try again later.';
    case ErrorType.CLIENT:
      return 'Something went wrong. Please refresh the page and try again.';
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Sanitize error data for logging
 */
export function sanitizeErrorData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password', 'token', 'apikey', 'secret', 'key', 'auth',
    'credit', 'card', 'cvv', 'ssn', 'social', 'address', 'phone'
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create standardized web error object
 */
export function createWebError(
  error: unknown,
  context?: Record<string, unknown>
): WebError {
  const errorType = classifyError(error);
  const severity = determineSeverity(errorType, error);

  const originalError = error instanceof Error ? error : new Error(String(error));
  const userMessage = getUserFriendlyMessage(errorType, originalError.message);

  // Gather context information
  const errorContext: Record<string, unknown> = {
    ...context,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
  };

  const webError: WebError = {
    type: errorType,
    severity,
    message: originalError.message,
    userMessage,
    originalError,
    context: sanitizeErrorData(errorContext),
    timestamp: new Date().toISOString(),
  };

  return webError;
}

/**
 * Log error with appropriate level and context
 */
export function logWebError(webError: WebError): void {
  const logData = {
    type: webError.type,
    severity: webError.severity,
    message: webError.message,
    context: webError.context,
    url: webError.url,
    userAgent: webError.userAgent,
    timestamp: webError.timestamp,
  };

  switch (webError.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error('Critical web error', logData);
      break;
    case ErrorSeverity.HIGH:
      logger.error('High severity web error', logData);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn('Medium severity web error', logData);
      break;
    case ErrorSeverity.LOW:
    default:
      logger.info('Low severity web error', logData);
      break;
  }
}

/**
 * Handle API errors specifically
 */
export function handleApiError(
  error: unknown,
  endpoint: string,
  method: string,
  context?: Record<string, unknown>
): WebError {
  const webError = createWebError(error, {
    ...context,
    endpoint,
    method,
    component: 'API',
  });

  logWebError(webError);
  return webError;
}

/**
 * Handle component errors
 */
export function handleComponentError(
  error: unknown,
  componentName: string,
  context?: Record<string, unknown>
): WebError {
  const webError = createWebError(error, {
    ...context,
    component: componentName,
    componentType: 'React',
  });

  logWebError(webError);
  return webError;
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  error: unknown,
  context?: Record<string, unknown>
): WebError {
  const webError = createWebError(error, {
    ...context,
    component: 'Authentication',
  });

  // Authentication errors are high severity
  webError.severity = ErrorSeverity.HIGH;

  logWebError(webError);
  return webError;
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const webError = createWebError(event.reason, {
      type: 'unhandledrejection',
      component: 'Global',
    });
    logWebError(webError);
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const webError = createWebError(event.error, {
      type: 'uncaughterror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      component: 'Global',
    });
    logWebError(webError);
  });
}

/**
 * React Error Boundary error handler
 */
export function handleBoundaryError(
  error: Error,
  errorInfo: { componentStack: string },
  context?: Record<string, unknown>
): WebError {
  const webError = createWebError(error, {
    ...context,
    componentStack: errorInfo.componentStack,
    component: 'ErrorBoundary',
  });

  logWebError(webError);
  return webError;
}

// Export utilities
export { setupGlobalErrorHandler as initializeErrorHandling };
