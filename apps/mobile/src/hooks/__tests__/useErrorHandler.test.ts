/**
 * useErrorHandler Hook Tests
 * Tests comprehensive error handling functionality
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '../__tests__/test-utils';
import { useErrorHandler } from '../useErrorHandler';

// Mock React Native Alert
const mockAlert = jest.fn();
jest.mock('react-native', () => ({
  Alert: {
    alert: mockAlert,
  },
  Platform: {
    OS: 'ios',
  },
}));

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

jest.mock('../services/logger', () => ({
  logger: mockLogger,
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleError', () => {
    it('should handle string errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      const errorResult = result.current.handleError('Test error message');

      expect(errorResult.message).toBe('Test error message');
      expect(errorResult.retryable).toBe(false);
      expect(errorResult.canRetry).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        message: 'Test error message',
        platform: 'ios',
      }));
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Test error message', [{ text: 'OK' }]);
    });

    it('should handle Error objects', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      const errorResult = result.current.handleError(error, 'test context');

      expect(errorResult.message).toBe('Test error');
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        message: 'Test error',
        context: 'test context',
        details: expect.objectContaining({
          stack: expect.any(String),
          name: 'Error',
        }),
      }));
    });

    it('should handle network errors with status codes', () => {
      const { result } = renderHook(() => useErrorHandler());
      const networkError = {
        message: 'Request failed',
        status: 404,
        code: 'NOT_FOUND',
      };

      const errorResult = result.current.handleError(networkError);

      expect(errorResult.message).toBe('Resource not found.');
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        details: expect.objectContaining({
          status: 404,
          code: 'NOT_FOUND',
        }),
      }));
    });

    it('should handle different HTTP status codes', () => {
      const { result } = renderHook(() => useErrorHandler());

      const testCases = [
        { status: 400, expectedMessage: 'Invalid request. Please check your input.' },
        { status: 401, expectedMessage: 'Session expired. Please log in again.' },
        { status: 403, expectedMessage: 'Access denied. You may not have permission for this action.' },
        { status: 404, expectedMessage: 'Resource not found.' },
        { status: 429, expectedMessage: 'Too many requests. Please wait a moment and try again.' },
        { status: 500, expectedMessage: 'Server error. Please try again later.' },
        { status: 503, expectedMessage: 'Service temporarily unavailable. Please try again later.' },
      ];

      testCases.forEach(({ status, expectedMessage }) => {
        const networkError = { message: 'Error', status };
        const errorResult = result.current.handleError(networkError);
        expect(errorResult.message).toBe(expectedMessage);
      });
    });

    it('should handle validation errors array', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationErrors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' },
      ];

      const errorResult = result.current.handleError(validationErrors);

      expect(errorResult.message).toBe('Email is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        details: expect.objectContaining({
          validationErrors: validationErrors,
        }),
      }));
    });

    it('should handle empty validation errors array', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationErrors: any[] = [];

      const errorResult = result.current.handleError(validationErrors);

      expect(errorResult.message).toBe('Something went wrong. Please try again.');
    });

    it('should use fallback message for unknown error types', () => {
      const { result } = renderHook(() => useErrorHandler());

      const errorResult = result.current.handleError(null as any);

      expect(errorResult.message).toBe('Something went wrong. Please try again.');
    });

    it('should customize fallback message', () => {
      const { result } = renderHook(() => useErrorHandler());

      const errorResult = result.current.handleError(null as any, 'test', {
        fallbackMessage: 'Custom error message',
      });

      expect(errorResult.message).toBe('Custom error message');
    });

    it('should skip alert when showAlert is false', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError('Test error', 'test', { showAlert: false });

      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('should skip logging when logError is false', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError('Test error', 'test', { logError: false });

      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should add retry button when retryable and onRetry provided', () => {
      const { result } = renderHook(() => useErrorHandler());
      const onRetry = jest.fn();

      result.current.handleError('Test error', 'test', {
        retryable: true,
        onRetry,
      });

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Test error', [
        { text: 'Retry', onPress: onRetry },
        { text: 'OK' },
      ]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return correct retry flags', () => {
      const { result } = renderHook(() => useErrorHandler());
      const onRetry = jest.fn();

      const errorResult = result.current.handleError('Test error', 'test', {
        retryable: true,
        onRetry,
      });

      expect(errorResult.retryable).toBe(true);
      expect(errorResult.canRetry).toBe(true);
    });
  });

  describe('Specialized Error Handlers', () => {
    it('should handle network errors with specialized logic', () => {
      const { result } = renderHook(() => useErrorHandler());
      const onRetry = jest.fn();

      const errorResult = result.current.handleNetworkError(
        { message: 'Network failed', status: 500 },
        'api call',
        onRetry
      );

      expect(errorResult.message).toBe('Server error. Please try again later.');
      expect(errorResult.retryable).toBe(true);
      expect(errorResult.canRetry).toBe(true);
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Server error. Please try again later.', [
        { text: 'Retry', onPress: onRetry },
        { text: 'OK' },
      ]);
    });

    it('should handle auth errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      const errorResult = result.current.handleAuthError('login attempt');

      expect(errorResult.message).toBe('Authentication failed. Please log in again.');
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        context: 'login attempt',
      }));
    });

    it('should handle validation errors', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password required' },
      ];

      const errorResult = result.current.handleValidationError(validationErrors, 'form submission');

      expect(errorResult.message).toBe('Invalid email format');
      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        context: 'form submission',
        details: expect.objectContaining({
          validationErrors: validationErrors,
        }),
      }));
    });

    it('should handle multiple validation errors', () => {
      const { result } = renderHook(() => useErrorHandler());
      const validationErrors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      const errorResult = result.current.handleValidationError(validationErrors);

      expect(errorResult.message).toBe('2 validation errors found.');
    });

    it('should handle offline errors without logging', () => {
      const { result } = renderHook(() => useErrorHandler());
      const onRetry = jest.fn();

      result.current.handleOfflineError('sync operation', onRetry);

      expect(mockLogger.error).not.toHaveBeenCalled(); // Offline errors don't get logged
      expect(mockAlert).toHaveBeenCalledWith('Error', 'You appear to be offline. Please check your connection.', [
        { text: 'Retry', onPress: onRetry },
        { text: 'OK' },
      ]);
    });
  });

  describe('Platform and Context', () => {
    it('should include platform information in logs', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError('Test error');

      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        platform: 'ios',
        timestamp: expect.any(String),
      }));
    });

    it('should include context in error logs', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError('Test error', 'user action');

      expect(mockLogger.error).toHaveBeenCalledWith('Error handled by useErrorHandler', expect.objectContaining({
        context: 'user action',
      }));
    });
  });

  describe('Error Boundary Behavior', () => {
    it('should not throw errors internally', () => {
      const { result } = renderHook(() => useErrorHandler());

      // These should not throw
      expect(() => result.current.handleError(undefined as any)).not.toThrow();
      expect(() => result.current.handleError({} as any)).not.toThrow();
      expect(() => result.current.handleNetworkError(null as any)).not.toThrow();
    });

    it('should handle logger errors gracefully', () => {
      mockLogger.error.mockImplementation(() => {
        throw new Error('Logger failed');
      });

      const { result } = renderHook(() => useErrorHandler());
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw even if logger fails
      expect(() => result.current.handleError('Test error')).not.toThrow();

      consoleError.mockRestore();
    });

    it('should handle Alert errors gracefully', () => {
      mockAlert.mockImplementation(() => {
        throw new Error('Alert failed');
      });

      const { result } = renderHook(() => useErrorHandler());
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw even if Alert fails
      expect(() => result.current.handleError('Test error')).not.toThrow();

      consoleError.mockRestore();
    });
  });
});
