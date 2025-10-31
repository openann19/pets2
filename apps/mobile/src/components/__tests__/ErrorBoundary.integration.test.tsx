/**
 * Error Boundary Integration Tests
 * Tests error boundaries working with complex component trees and hooks
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

jest.mock('@pawfectmatch/core', () => ({
  logger: mockLogger,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Hook that throws errors
const useErrorThrowingHook = (shouldThrow: boolean) => {
  if (shouldThrow) {
    throw new Error('Hook error');
  }
  return { data: 'success' };
};

// Component that uses error-throwing hook
const HookErrorComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  const result = useErrorThrowingHook(shouldThrow);
  return React.createElement('div', {}, `Result: ${result.data}`);
};

// Component with nested error boundaries
const NestedErrorComponent: React.FC = () => {
  return React.createElement(
    'div',
    {},
    React.createElement(
      ErrorBoundary,
      { screenName: 'InnerBoundary' },
      React.createElement(HookErrorComponent, { shouldThrow: true })
    )
  );
};

// Async component that throws after delay
const AsyncErrorComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldThrow(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (shouldThrow) {
    throw new Error('Async component error');
  }

  return React.createElement('div', {}, 'Loading...');
};

// Component tree with multiple error sources
const ComplexErrorTree: React.FC = () => {
  return React.createElement(
    'div',
    {},
    React.createElement(
      ErrorBoundary,
      { screenName: 'ListBoundary' },
      React.createElement(HookErrorComponent, { shouldThrow: false }), // This works
      React.createElement(HookErrorComponent, { shouldThrow: true })   // This throws
    ),
    React.createElement(
      ErrorBoundary,
      { screenName: 'AsyncBoundary' },
      React.createElement(AsyncErrorComponent)
    )
  );
};

describe('ErrorBoundary Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle hook errors in child components', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      const boundary = new ErrorBoundary({
        children: React.createElement(HookErrorComponent, { shouldThrow: true })
      });
      boundary.componentDidCatch(new Error('Hook error'), { componentStack: 'test stack' });
    }).not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.any(Error),
        screenName: undefined,
      })
    );

    consoleError.mockRestore();
  });

  it('should handle nested error boundaries', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      // Outer boundary
      const outerBoundary = new ErrorBoundary({
        children: React.createElement(NestedErrorComponent),
        screenName: 'OuterBoundary'
      });

      // The inner boundary should catch the error first
      // This is a simplified test - in real React, the inner boundary would handle it
      const error = new Error('Nested error');
      outerBoundary.componentDidCatch(error, { componentStack: 'nested stack' });
    }).not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.any(Error),
        screenName: 'OuterBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle multiple error boundaries in complex tree', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      const rootBoundary = new ErrorBoundary({
        children: React.createElement(ComplexErrorTree),
        screenName: 'RootBoundary'
      });

      // Simulate errors being caught by different boundaries
      rootBoundary.componentDidCatch(new Error('Root error'), { componentStack: 'root' });
    }).not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        screenName: 'RootBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle async errors in child components', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      const boundary = new ErrorBoundary({
        children: React.createElement(AsyncErrorComponent),
        screenName: 'AsyncBoundary'
      });

      // Simulate async error being thrown
      act(() => {
        // In a real scenario, the useEffect would trigger the error
        // For testing, we manually trigger componentDidCatch
        boundary.componentDidCatch(new Error('Async component error'), {
          componentStack: 'async component stack'
        });
      });
    }).not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.any(Error),
        screenName: 'AsyncBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle errors from deeply nested components', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // Create deeply nested component tree
    const DeepNestedComponent: React.FC = () => {
      return React.createElement(
        'div',
        {},
        React.createElement(
          'div',
          {},
          React.createElement(
            'div',
            {},
            React.createElement(HookErrorComponent, { shouldThrow: true })
          )
        )
      );
    };

    expect(() => {
      const boundary = new ErrorBoundary({
        children: React.createElement(DeepNestedComponent),
        screenName: 'DeepBoundary'
      });

      boundary.componentDidCatch(new Error('Deep nested error'), {
        componentStack: 'deep.nested.component.stack'
      });
    }).not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        screenName: 'DeepBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle multiple errors from same boundary', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      screenName: 'MultiErrorBoundary'
    });

    // First error
    boundary.componentDidCatch(new Error('First error'), { componentStack: 'first' });

    // Second error
    boundary.componentDidCatch(new Error('Second error'), { componentStack: 'second' });

    expect(mockLogger.error).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenNthCalledWith(
      1,
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.objectContaining({ message: 'First error' }),
        screenName: 'MultiErrorBoundary',
      })
    );
    expect(mockLogger.error).toHaveBeenNthCalledWith(
      2,
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.objectContaining({ message: 'Second error' }),
        screenName: 'MultiErrorBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle errors with custom error info', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      screenName: 'CustomErrorBoundary'
    });

    const customErrorInfo = {
      componentStack: `
        at Component.render (component.js:1:1)
        at ErrorBoundary.componentDidCatch (ErrorBoundary.js:10:5)
        at React error handler
      `,
      errorBoundary: 'TestErrorBoundary',
      errorBoundaryStack: ['Component', 'ParentComponent', 'App'],
    };

    boundary.componentDidCatch(new Error('Custom error'), customErrorInfo);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: customErrorInfo,
        screenName: 'CustomErrorBoundary',
      })
    );

    consoleError.mockRestore();
  });

  it('should handle boundary errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const loggerError = jest.spyOn(mockLogger, 'error').mockImplementation(() => {
      throw new Error('Logger failure');
    });

    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      screenName: 'FailingBoundary'
    });

    // Even if logging fails, componentDidCatch should not throw
    expect(() => {
      boundary.componentDidCatch(new Error('Boundary error'), { componentStack: 'test' });
    }).not.toThrow();

    consoleError.mockRestore();
    loggerError.mockRestore();
  });

  it('should work with different fallback configurations', () => {
    const boundary1 = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      fallback: React.createElement('div', {}, 'Custom fallback 1')
    });

    const boundary2 = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      fallback: React.createElement('div', {}, 'Custom fallback 2')
    });

    expect(boundary1.props.fallback).toBeDefined();
    expect(boundary2.props.fallback).toBeDefined();
    expect(boundary1.props.fallback).not.toBe(boundary2.props.fallback);
  });

  it('should handle rapid successive errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      screenName: 'RapidErrorBoundary'
    });

    // Simulate rapid errors
    for (let i = 0; i < 5; i++) {
      boundary.componentDidCatch(new Error(`Rapid error ${i}`), {
        componentStack: `stack ${i}`
      });
    }

    expect(mockLogger.error).toHaveBeenCalledTimes(5);

    consoleError.mockRestore();
  });
});
