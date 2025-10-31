/**
 * Type-Safe Error Handling Utilities
 * P0 Security Fix: Replace error: any with proper type guards
 */

/**
 * Type guard to check if value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extract error message safely from unknown error
 */
export function getErrorMessage(error: unknown, fallback = 'An unknown error occurred'): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallback;
}

/**
 * Extract error code from unknown error if available
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    if ('errorCode' in error && typeof error.errorCode === 'string') {
      return error.errorCode;
    }
  }
  return undefined;
}

/**
 * Extract error details/context from unknown error
 */
export function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  if (error && typeof error === 'object') {
    if ('details' in error && typeof error.details === 'object' && error.details !== null) {
      return error.details as Record<string, unknown>;
    }
  }
  return undefined;
}

/**
 * Convert unknown error to a standardized error object
 */
export interface StandardizedError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export function standardizeError(error: unknown): StandardizedError {
  const standardized: StandardizedError = {
    message: getErrorMessage(error),
  };

  const code = getErrorCode(error);
  if (code) {
    standardized.code = code;
  }

  const details = getErrorDetails(error);
  if (details) {
    standardized.details = details;
  }

  if (isError(error) && error.stack) {
    standardized.stack = error.stack;
  }

  return standardized;
}

/**
 * Safe logger.error wrapper that handles unknown errors
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const standardized = standardizeError(error);
  // eslint-disable-next-line no-console
  console.error('Error:', {
    ...standardized,
    ...context,
  });
}

