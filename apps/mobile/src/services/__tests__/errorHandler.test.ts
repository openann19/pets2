/**
 * Comprehensive tests for ErrorHandler
 *
 * Coverage:
 * - General error handling with user notifications
 * - API-specific error handling
 * - Network error handling
 * - Validation error handling
 * - Authentication error handling
 * - Permission error handling
 * - Error message translation to user-friendly messages
 * - Logging functionality
 * - Error wrapping for async functions
 * - Error creation with codes
 * - Alert notifications
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Alert } from 'react-native';
import { errorHandler } from '../errorHandler';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockAlert = Alert.alert as jest.Mock;
const mockLogger = require('../logger').logger;

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('General Error Handling', () => {
    it('should handle errors with default options', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        userId: 'user123',
        metadata: { extra: 'data' },
      };

      errorHandler.handleError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Test error',
        stack: error.stack,
        context,
        timestamp: expect.any(String),
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'An unexpected error occurred. Please try again.',
      );
    });

    it('should skip notification when disabled', () => {
      const error = new Error('Silent error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      errorHandler.handleError(error, context, { showNotification: false });

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('should skip logging when disabled', () => {
      const error = new Error('Unlogged error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      errorHandler.handleError(error, context, { logToService: false });

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalled();
    });

    it('should use custom fallback message', () => {
      const error = new Error('Custom error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      errorHandler.handleError(error, context, {
        fallbackMessage: 'Custom fallback message',
      });

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Custom fallback message');
    });
  });

  describe('API Error Handling', () => {
    it('should handle API errors with enhanced context', () => {
      const error = new Error('API Error');
      const context = {
        component: 'APIService',
        action: 'fetchData',
        userId: 'user123',
      };
      const apiContext = {
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 500,
      };

      errorHandler.handleApiError(error, context, apiContext);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'API Error',
        stack: error.stack,
        context: {
          ...context,
          ...apiContext,
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle API errors without optional fields', () => {
      const error = new Error('Partial API Error');
      const context = {
        component: 'APIService',
        action: 'fetchData',
      };
      const apiContext = {}; // Empty API context

      errorHandler.handleApiError(error, context, apiContext);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Partial API Error',
        stack: error.stack,
        context: {
          ...context,
          ...apiContext,
        },
        timestamp: expect.any(String),
      });
    });
  });

  describe('Specialized Error Handlers', () => {
    const testContext = {
      component: 'TestComponent',
      action: 'testAction',
      userId: 'user123',
    };

    it('should handle network errors with specific message', () => {
      const error = new Error('Network timeout');

      errorHandler.handleNetworkError(error, testContext);

      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Network error. Please check your connection and try again.',
      );
    });

    it('should handle validation errors with specific message', () => {
      const error = new Error('Invalid input');

      errorHandler.handleValidationError(error, testContext);

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please check your input and try again.');
    });

    it('should handle authentication errors with specific message', () => {
      const error = new Error('Session expired');

      errorHandler.handleAuthError(error, testContext);

      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Authentication failed. Please log in again.',
      );
    });

    it('should handle permission errors with specific message', () => {
      const error = new Error('Access denied');

      errorHandler.handlePermissionError(error, testContext);

      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        "You don't have permission to perform this action.",
      );
    });

    it('should respect custom options in specialized handlers', () => {
      const error = new Error('Network error');

      errorHandler.handleNetworkError(error, testContext, {
        showNotification: false,
        logToService: false,
      });

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('User-Friendly Message Translation', () => {
    it('should translate network errors', () => {
      const networkErrors = [
        new Error('Network request failed'),
        new Error('Fetch failed'),
        new Error('Connection timeout'),
      ];

      networkErrors.forEach((error) => {
        const message = (errorHandler as any).getUserFriendlyMessage(error);
        expect(message).toBe('Please check your internet connection and try again.');
      });
    });

    it('should translate authentication errors', () => {
      const authErrors = [
        new Error('Unauthorized access'),
        new Error('401 Unauthorized'),
        new Error('Session expired'),
      ];

      authErrors.forEach((error) => {
        const message = (errorHandler as any).getUserFriendlyMessage(error);
        expect(message).toBe('Your session has expired. Please log in again.');
      });
    });

    it('should translate permission errors', () => {
      const permissionErrors = [
        new Error('Forbidden action'),
        new Error('403 Forbidden'),
        new Error('Access denied'),
      ];

      permissionErrors.forEach((error) => {
        const message = (errorHandler as any).getUserFriendlyMessage(error);
        expect(message).toBe("You don't have permission to perform this action.");
      });
    });

    it('should translate server errors', () => {
      const serverErrors = [
        new Error('Internal server error'),
        new Error('500 Server Error'),
        new Error('Service unavailable'),
      ];

      serverErrors.forEach((error) => {
        const message = (errorHandler as any).getUserFriendlyMessage(error);
        expect(message).toBe('Server error occurred. Please try again later.');
      });
    });

    it('should translate not found errors', () => {
      const notFoundErrors = [
        new Error('Resource not found'),
        new Error('404 Not Found'),
        new Error('Item does not exist'),
      ];

      notFoundErrors.forEach((error) => {
        const message = (errorHandler as any).getUserFriendlyMessage(error);
        expect(message).toBe('The requested resource was not found.');
      });
    });

    it('should return original message for user-friendly errors', () => {
      const userFriendlyError = new Error('Please enter a valid email address');

      const message = (errorHandler as any).getUserFriendlyMessage(userFriendlyError);

      expect(message).toBe('Please enter a valid email address');
    });

    it('should return generic message for unknown errors', () => {
      const unknownError = new Error(
        'Some random error that is very long and contains Error: prefix',
      );

      const message = (errorHandler as any).getUserFriendlyMessage(unknownError);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle very long error messages', () => {
      const longError = new Error('A'.repeat(200));

      const message = (errorHandler as any).getUserFriendlyMessage(longError);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle error objects without messages', () => {
      const errorWithoutMessage = new Error();

      const message = (errorHandler as any).getUserFriendlyMessage(errorWithoutMessage);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('Error Creation', () => {
    it('should create error with message only', () => {
      const error = errorHandler.createError('Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error message');
    });

    it('should create error with message and code', () => {
      const error = errorHandler.createError('Test error', 'VALIDATION_ERROR');

      expect(error.message).toBe('Test error');
      expect((error as any).code).toBe('VALIDATION_ERROR');
    });

    it('should handle empty code', () => {
      const error = errorHandler.createError('Test error', '');

      expect(error.message).toBe('Test error');
      expect((error as any).code).toBeUndefined();
    });
  });

  describe('Async Function Wrapping', () => {
    it('should wrap successful async functions', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const result = await errorHandler.wrapAsync(asyncFn, context);

      expect(result).toBe('success');
      expect(asyncFn).toHaveBeenCalled();
    });

    it('should wrap failed async functions and handle errors', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const result = await errorHandler.wrapAsync(asyncFn, context);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalled();
    });

    it('should wrap functions that throw non-Error objects', async () => {
      const asyncFn = jest.fn().mockRejectedValue('String error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const result = await errorHandler.wrapAsync(asyncFn, context);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'String error',
        stack: undefined,
        context,
        timestamp: expect.any(String),
      });
    });

    it('should respect error handling options in wrapAsync', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Test error'));
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const result = await errorHandler.wrapAsync(asyncFn, context, {
        showNotification: false,
        logToService: false,
      });

      expect(result).toBeNull();
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('Alert Notifications', () => {
    it('should show user notifications with default OK button', () => {
      (errorHandler as any).showUserNotification('Test Title', 'Test Message');

      expect(mockAlert).toHaveBeenCalledWith('Test Title', 'Test Message', [{ text: 'OK' }]);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longTitle = 'B'.repeat(200);

      (errorHandler as any).showUserNotification(longTitle, longMessage);

      expect(mockAlert).toHaveBeenCalledWith(longTitle, longMessage, [{ text: 'OK' }]);
    });

    it('should handle empty title and message', () => {
      (errorHandler as any).showUserNotification('', '');

      expect(mockAlert).toHaveBeenCalledWith('', '', [{ text: 'OK' }]);
    });
  });

  describe('Logging', () => {
    it('should log errors with full context', () => {
      const error = new Error('Test logging error');
      const context = {
        component: 'LoggerTest',
        action: 'logTest',
        userId: 'user123',
        metadata: { testData: 'value' },
      };

      (errorHandler as any).logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Test logging error',
        stack: error.stack,
        context,
        timestamp: expect.any(String),
      });
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('No stack error');
      error.stack = undefined;
      const context = {
        component: 'StackTest',
        action: 'noStack',
      };

      (errorHandler as any).logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'No stack error',
        stack: undefined,
        context,
        timestamp: expect.any(String),
      });
    });

    it('should handle complex metadata objects', () => {
      const error = new Error('Complex metadata error');
      const context = {
        component: 'ComplexTest',
        action: 'complexMetadata',
        metadata: {
          nested: {
            object: {
              with: 'deep properties',
              array: [1, 2, { complex: 'item' }],
              function: () => 'should be logged',
            },
          },
          circular: {} as any,
        },
      };

      // Create circular reference for testing
      context.metadata.circular = context.metadata;

      (errorHandler as any).logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Complex metadata error',
        stack: error.stack,
        context,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Error Context Handling', () => {
    it('should handle missing optional context fields', () => {
      const error = new Error('Minimal context error');
      const minimalContext = {
        component: 'MinimalTest',
        action: 'minimalAction',
      };

      errorHandler.handleError(error, minimalContext);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Minimal context error',
        stack: error.stack,
        context: minimalContext,
        timestamp: expect.any(String),
      });
    });

    it('should handle null and undefined metadata', () => {
      const error = new Error('Null metadata error');
      const context = {
        component: 'NullTest',
        action: 'nullMetadata',
        userId: undefined,
        metadata: null as any,
      };

      errorHandler.handleError(error, context);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle very large context objects', () => {
      const error = new Error('Large context error');
      const largeContext = {
        component: 'LargeTest',
        action: 'largeContext',
        metadata: {
          largeArray: Array.from({ length: 1000 }, (_, i) => `item${i}`),
          largeString: 'A'.repeat(10000),
          nestedObjects: Array.from({ length: 100 }, () => ({
            property1: 'value1',
            property2: 'value2',
            array: Array.from({ length: 50 }, () => Math.random()),
          })),
        },
      };

      errorHandler.handleError(error, largeContext);

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete API error flow', () => {
      const apiError = new Error('API request failed');
      const context = {
        component: 'APIService',
        action: 'fetchData',
        userId: 'user123',
      };
      const apiContext = {
        endpoint: '/api/data',
        method: 'GET',
        statusCode: 404,
      };

      errorHandler.handleApiError(apiError, context, apiContext, {
        showNotification: true,
        logToService: true,
        fallbackMessage: 'Custom API error',
      });

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'API request failed',
        stack: apiError.stack,
        context: {
          ...context,
          ...apiContext,
        },
        timestamp: expect.any(String),
      });

      expect(mockAlert).toHaveBeenCalledWith('Error', 'The requested resource was not found.');
    });

    it('should handle async error wrapping in complex scenarios', async () => {
      let callCount = 0;
      const complexAsyncFn = async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt fails');
        }
        if (callCount === 2) {
          throw 'String error';
        }
        return 'success';
      };

      const context = {
        component: 'ComplexAsync',
        action: 'complexOperation',
      };

      // First call - Error object
      const result1 = await errorHandler.wrapAsync(() => complexAsyncFn(), context, {
        showNotification: false,
      });
      expect(result1).toBeNull();

      // Second call - String error
      const result2 = await errorHandler.wrapAsync(() => complexAsyncFn(), context, {
        showNotification: false,
      });
      expect(result2).toBeNull();

      // Third call - Success
      const result3 = await errorHandler.wrapAsync(() => complexAsyncFn(), context, {
        showNotification: false,
      });
      expect(result3).toBe('success');
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors with circular references', () => {
      const error = new Error('Circular reference error');
      const circularContext = {
        component: 'CircularTest',
        action: 'circularReference',
        metadata: {},
      } as any;

      circularContext.metadata.self = circularContext.metadata;

      errorHandler.handleError(error, circularContext);

      // Should not crash despite circular reference
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle extremely long error messages', () => {
      const longError = new Error('A'.repeat(10000));
      const context = {
        component: 'LongErrorTest',
        action: 'longMessage',
      };

      errorHandler.handleError(longError, context, { showNotification: false });

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'A'.repeat(10000),
        stack: longError.stack,
        context,
        timestamp: expect.any(String),
      });
    });

    it('should handle errors with special characters', () => {
      const specialError = new Error('Error with émojis 🚀 and spëcial chärs');
      const context = {
        component: 'SpecialCharsTest',
        action: 'unicodeError',
        metadata: {
          emojis: '😀🎉🔥',
          accents: 'café naïve résumé',
          symbols: '!@#$%^&*()',
        },
      };

      errorHandler.handleError(specialError, context, { showNotification: false });

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        message: 'Error with émojis 🚀 and spëcial chärs',
        stack: specialError.stack,
        context,
        timestamp: expect.any(String),
      });
    });

    it('should handle rapid consecutive errors', () => {
      const context = {
        component: 'RapidErrorTest',
        action: 'rapidErrors',
      };

      // Fire multiple errors rapidly
      for (let i = 0; i < 10; i++) {
        const error = new Error(`Error ${i}`);
        errorHandler.handleError(
          error,
          {
            ...context,
            metadata: { index: i },
          },
          { showNotification: false },
        );
      }

      expect(mockLogger.error).toHaveBeenCalledTimes(10);
    });

    it('should handle errors during error handling', () => {
      // Make Alert.alert throw an error
      mockAlert.mockImplementation(() => {
        throw new Error('Alert failed');
      });

      const error = new Error('Original error');
      const context = {
        component: 'ErrorInErrorTest',
        action: 'errorHandlingFailure',
      };

      // Should not crash even if notification fails
      expect(() => {
        errorHandler.handleError(error, context);
      }).not.toThrow();

      expect(mockLogger.error).toHaveBeenCalled(); // Original error still logged
    });

    it('should handle null and undefined errors', () => {
      const context = {
        component: 'NullErrorTest',
        action: 'nullError',
      };

      // Should handle gracefully
      expect(() => {
        errorHandler.handleError(null as any, context);
        errorHandler.handleError(undefined as any, context);
      }).not.toThrow();
    });

    it('should handle errors with prototype manipulation', () => {
      const error = new Error('Prototype error');
      // Mess with the prototype
      Object.setPrototypeOf(error, null);

      const context = {
        component: 'PrototypeTest',
        action: 'prototypeError',
      };

      errorHandler.handleError(error, context, { showNotification: false });

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
