/**
 * API Error Classifier
 * Classifies errors and determines retry eligibility
 */

// Logger removed - not used in this file

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorClassification {
  type: ErrorType;
  retryable: boolean;
  userMessage: string;
  statusCode?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class APIErrorClassifier {
  private static readonly ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Network connection failed. Please check your internet connection.',
    [ErrorType.AUTHENTICATION]: 'Your session has expired. Please sign in again.',
    [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorType.VALIDATION]: 'Invalid input. Please check your data and try again.',
    [ErrorType.SERVER]: 'Server error. Please try again later.',
    [ErrorType.CLIENT]: 'Invalid request. Please check your input.',
    [ErrorType.TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  /**
   * Classify an error
   */
  classify(
    error: unknown,
    context?: {
      endpoint?: string;
      method?: string;
      statusCode?: number;
    },
  ): ErrorClassification {
    const statusCode = context?.statusCode || this.extractStatusCode(error);

    // Classify by status code first
    if (statusCode) {
      return this.classifyByStatusCode(statusCode);
    }

    // Classify by error message
    const errorMessage = this.extractErrorMessage(error);
    return this.classifyByMessage(errorMessage, error);
  }

  /**
   * Classify error by HTTP status code
   */
  private classifyByStatusCode(statusCode: number): ErrorClassification {
    switch (true) {
      case statusCode >= 500:
        return {
          type: ErrorType.SERVER,
          retryable: true,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.SERVER],
          statusCode,
          severity: 'high',
        };

      case statusCode === 401:
        return {
          type: ErrorType.AUTHENTICATION,
          retryable: false,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHENTICATION],
          statusCode,
          severity: 'high',
        };

      case statusCode === 403:
        return {
          type: ErrorType.AUTHORIZATION,
          retryable: false,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHORIZATION],
          statusCode,
          severity: 'medium',
        };

      case statusCode === 404:
        return {
          type: ErrorType.CLIENT,
          retryable: false,
          userMessage: 'Resource not found.',
          statusCode,
          severity: 'low',
        };

      case statusCode === 408:
        return {
          type: ErrorType.TIMEOUT,
          retryable: true,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.TIMEOUT],
          statusCode,
          severity: 'medium',
        };

      case statusCode === 429:
        return {
          type: ErrorType.RATE_LIMIT,
          retryable: true,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.RATE_LIMIT],
          statusCode,
          severity: 'medium',
        };

      case statusCode >= 400:
        return {
          type: ErrorType.VALIDATION,
          retryable: false,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.VALIDATION],
          statusCode,
          severity: 'medium',
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          retryable: false,
          userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.UNKNOWN],
          statusCode,
          severity: 'low',
        };
    }
  }

  /**
   * Classify error by error message
   */
  private classifyByMessage(errorMessage: string, error: unknown): ErrorClassification {
    const lowerMessage = errorMessage.toLowerCase();

    // Network errors
    if (this.isNetworkError(lowerMessage)) {
      return {
        type: ErrorType.NETWORK,
        retryable: true,
        userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.NETWORK],
        severity: 'high',
      };
    }

    // Timeout errors
    if (this.isTimeoutError(lowerMessage)) {
      return {
        type: ErrorType.TIMEOUT,
        retryable: true,
        userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.TIMEOUT],
        severity: 'medium',
      };
    }

    // Auth errors
    if (this.isAuthenticationError(lowerMessage)) {
      return {
        type: ErrorType.AUTHENTICATION,
        retryable: false,
        userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHENTICATION],
        severity: 'high',
      };
    }

    // Unknown error
    return {
      type: ErrorType.UNKNOWN,
      retryable: this.isRetryableError(error),
      userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.UNKNOWN],
      severity: 'medium',
    };
  }

  /**
   * Check if error is network error
   */
  private isNetworkError(message: string): boolean {
    const networkKeywords = [
      'network',
      'connection',
      'econnrefused',
      'enotfound',
      'econnreset',
      'fetch failed',
      'network error',
    ];

    return networkKeywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Check if error is timeout error
   */
  private isTimeoutError(message: string): boolean {
    const timeoutKeywords = ['timeout', 'timed out', 'etimedout', 'request timeout'];

    return timeoutKeywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Check if error is authentication error
   */
  private isAuthenticationError(message: string): boolean {
    const authKeywords = [
      'unauthorized',
      'authentication',
      'token',
      'invalid credentials',
      'session expired',
    ];

    return authKeywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Check if error is generally retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return this.isNetworkError(message) || this.isTimeoutError(message);
    }
    return false;
  }

  /**
   * Extract status code from error
   */
  private extractStatusCode(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        return error.status;
      }
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
      }
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const response = error.response as { status?: number; statusCode?: number };
        return response.status || response.statusCode;
      }
    }
    return undefined;
  }

  /**
   * Extract error message
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
    }
    return String(error);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(
    error: unknown,
    context?: {
      endpoint?: string;
      method?: string;
      statusCode?: number;
    },
  ): string {
    const classification = this.classify(error, context);
    return classification.userMessage;
  }
}
