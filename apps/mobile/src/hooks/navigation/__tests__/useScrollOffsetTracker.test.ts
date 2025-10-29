/**
 * Comprehensive tests for useScrollOffsetTracker hook
 * Tests scroll tracking, offset retrieval, and callback stability
 */

import { renderHook, act } from '@testing-library/react-native';
import { useScrollOffsetTracker } from '../useScrollOffsetTracker';

describe('useScrollOffsetTracker', () => {
  describe('Basic Functionality', () => {
    it('should initialize with offset of 0', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      expect(result.current.getOffset()).toBe(0);
    });

    it('should return onScroll and getOffset functions', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      expect(typeof result.current.onScroll).toBe('function');
      expect(typeof result.current.getOffset).toBe('function');
    });

    it('should track scroll offset', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 150 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result.current.getOffset()).toBe(150);
    });

    it('should update tracked offset on subsequent scrolls', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 100 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 300 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result.current.getOffset()).toBe(300);
    });
  });

  describe('Callback Stability', () => {
    it('should return stable onScroll reference', () => {
      const { result, rerender } = renderHook(() => useScrollOffsetTracker());

      const firstOnScroll = result.current.onScroll;

      rerender();

      expect(result.current.onScroll).toBe(firstOnScroll);
    });

    it('should return stable getOffset reference', () => {
      const { result, rerender } = renderHook(() => useScrollOffsetTracker());

      const firstGetOffset = result.current.getOffset;

      rerender();

      expect(result.current.getOffset).toBe(firstGetOffset);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative offset', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: -50 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result.current.getOffset()).toBe(-50);
    });

    it('should handle zero offset', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 0 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result.current.getOffset()).toBe(0);
    });

    it('should handle very large offset values', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 999999 },
            contentSize: { width: 375, height: 999999 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result.current.getOffset()).toBe(999999);
    });

    it('should handle rapid scroll events', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      // Simulate rapid scrolling
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.onScroll({
            nativeEvent: {
              contentOffset: { x: 0, y: i * 100 },
              contentSize: { width: 375, height: 10000 },
              layoutMeasurement: { width: 375, height: 812 },
            },
          } as any);
        });
      }

      expect(result.current.getOffset()).toBe(900);
    });
  });

  describe('Integration with FlatList', () => {
    it('should work with FlatList scroll events', () => {
      const { result } = renderHook(() => useScrollOffsetTracker());

      const mockFlatListEvent = {
        nativeEvent: {
          contentOffset: { x: 0, y: 250 },
          contentSize: { width: 375, height: 5000 },
          layoutMeasurement: { width: 375, height: 812 },
          target: null,
        },
      };

      act(() => {
        result.current.onScroll(mockFlatListEvent as any);
      });

      expect(result.current.getOffset()).toBe(250);
    });
  });

  describe('Multiple Instances', () => {
    it('should work independently across multiple hooks', () => {
      const { result: result1 } = renderHook(() => useScrollOffsetTracker());
      const { result: result2 } = renderHook(() => useScrollOffsetTracker());

      act(() => {
        result1.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 100 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      act(() => {
        result2.current.onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y: 200 },
            contentSize: { width: 375, height: 1000 },
            layoutMeasurement: { width: 375, height: 812 },
          },
        } as any);
      });

      expect(result1.current.getOffset()).toBe(100);
      expect(result2.current.getOffset()).toBe(200);
    });
  });
});
