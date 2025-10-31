/**
 * Comprehensive Hook Testing Suite
 * Tests all test utilities and patterns
 */
/// <reference types="jest" />
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from './test-utils';
import { useState, useEffect } from 'react';

// Mock a simple hook for testing
function useSimpleCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

describe('Comprehensive Hook Testing Suite', () => {
  describe('useSimpleCounter', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useSimpleCounter());
      expect(result.current?.count).toBe(0);
    });

    it('should initialize with provided value', () => {
      const { result } = renderHook(() => useSimpleCounter(10));
      expect(result.current?.count).toBe(10);
    });

    it('should increment counter', () => {
      const { result } = renderHook(() => useSimpleCounter());

      act(() => {
        result.current?.increment();
      });

      expect(result.current?.count).toBe(1);
    });

    it('should decrement counter', () => {
      const { result } = renderHook(() => useSimpleCounter(5));

      act(() => {
        result.current?.decrement();
      });

      expect(result.current?.count).toBe(4);
    });

    it('should reset counter', () => {
      const { result } = renderHook(() => useSimpleCounter(5));

      act(() => {
        result.current?.increment();
        result.current?.increment();
      });

      expect(result.current?.count).toBe(7);

      act(() => {
        result.current?.reset();
      });

      expect(result.current?.count).toBe(5);
    });

    it('should handle rerender', () => {
      const { result, rerender } = renderHook(() => useSimpleCounter(3));

      expect(result.current?.count).toBe(3);

      rerender();

      expect(result.current?.count).toBe(3);
    });
  });

  describe('Test Utilities', () => {
    it('should provide Jest globals', () => {
      expect(describe).toBeDefined();
      expect(it).toBeDefined();
      expect(expect).toBeDefined();
      expect(jest).toBeDefined();
      expect(beforeEach).toBeDefined();
      expect(afterEach).toBeDefined();
    });

    it('should support async tests', async () => {
      await Promise.resolve();
      expect(true).toBe(true);
    });

    it('should support mocking', () => {
      const mockFn = jest.fn(() => 'mocked');
      expect(mockFn()).toBe('mocked');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
