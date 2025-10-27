/**
 * Type-safe error handling utilities
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Safely extract error object for logging
 */
export function getErrorForLogging(error: unknown): string | Error {
  if (error instanceof Error) {
    return error;
  }
  return getErrorMessage(error);
}

/**
 * Check if error has a specific property
 */
export function hasErrorProperty(error: unknown, property: string): boolean {
  return error !== null && error !== undefined && typeof error === 'object' && property in error;
}

/**
 * Get error property safely
 */
export function getErrorProperty(error: unknown, property: string): unknown {
  if (hasErrorProperty(error, property)) {
    return (error as Record<string, unknown>)[property];
  }
  return undefined;
}

