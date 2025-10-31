/**
 * @jest-environment jsdom
 * Comprehensive tests for useScrollOffsetTracker hook
 */
/// <reference types="jest" />
import { renderHook, act } from '@testing-library/react-native';
import { NativeScrollEvent } from 'react-native';
import { useScrollOffsetTracker } from '../../navigation/useScrollOffsetTracker';

describe('useScrollOffsetTracker', () => {
  it('should initialize with offset 0', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());

    expect(result.current.getOffset()).toBe(0);
  });

  it('should track scroll offset correctly', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    const mockEvent = {
      nativeEvent: {
        contentOffset: { y: 150 },
      },
    } as any;

    act(() => {
      onScroll(mockEvent);
    });

    expect(getOffset()).toBe(150);
  });

  it('should update offset on multiple scroll events', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: 50 } },
      } as any);
    });
    expect(getOffset()).toBe(50);

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: 125 } },
      } as any);
    });
    expect(getOffset()).toBe(125);

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: 300 } },
      } as any);
    });
    expect(getOffset()).toBe(300);
  });

  it('should handle zero offset', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: 0 } },
      } as any);
    });

    expect(getOffset()).toBe(0);
  });

  it('should handle negative offset', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: -50 } },
      } as any);
    });

    expect(getOffset()).toBe(-50);
  });

  it('should maintain latest offset across multiple calls', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      onScroll({ nativeEvent: { contentOffset: { y: 10 } } } as any);
      onScroll({ nativeEvent: { contentOffset: { y: 20 } } } as any);
      onScroll({ nativeEvent: { contentOffset: { y: 30 } } } as any);
    });

    expect(getOffset()).toBe(30);
  });

  it('should return stable references for callbacks', () => {
    const { result, rerender } = renderHook(() => useScrollOffsetTracker());
    const firstOnScroll = result.current.onScroll;
    const firstGetOffset = result.current.getOffset;

    rerender();

    expect(result.current.onScroll).toBe(firstOnScroll);
    expect(result.current.getOffset).toBe(firstGetOffset);
  });

  it('should handle rapid scroll events', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      for (let i = 0; i < 100; i++) {
        onScroll({
          nativeEvent: { contentOffset: { y: i * 10 } },
        } as any);
      }
    });

    expect(getOffset()).toBe(990);
  });

  it('should handle large offset values', () => {
    const { result } = renderHook(() => useScrollOffsetTracker());
    const { onScroll, getOffset } = result.current;

    act(() => {
      onScroll({
        nativeEvent: { contentOffset: { y: 999999 } },
      } as any);
    });

    expect(getOffset()).toBe(999999);
  });

  it('should work correctly with multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useScrollOffsetTracker());
    const { result: result2 } = renderHook(() => useScrollOffsetTracker());

    act(() => {
      result1.current.onScroll({
        nativeEvent: { contentOffset: { y: 100 } },
      } as any);
      result2.current.onScroll({
        nativeEvent: { contentOffset: { y: 200 } },
      } as any);
    });

    expect(result1.current.getOffset()).toBe(100);
    expect(result2.current.getOffset()).toBe(200);
  });
});
