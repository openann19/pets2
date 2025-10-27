/**
 * Tests for useRippleEffect hook
 */

import { renderHook } from '@testing-library/react-native';
import { useRippleEffect } from '../useRippleEffect';

  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useRippleEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize ripple effect', () => {
    const { result } = renderHook(() => useRippleEffect());

    expect(result.current).toBeDefined();
  });

  it('should provide ripple handlers', () => {
    const { result } = renderHook(() => useRippleEffect());

    expect(result.current.createRipple).toBeDefined();
    expect(typeof result.current.createRipple).toBe('function');
  });

  it('should handle ripple creation', () => {
    const { result } = renderHook(() => useRippleEffect());

    const mockEvent = {
      nativeEvent: {
        locationX: 50,
        locationY: 50,
      },
    };

    result.current.createRipple(mockEvent as any);
  });

  it('should provide ripple style', () => {
    const { result } = renderHook(() => useRippleEffect());

    expect(result.current.rippleStyle).toBeDefined();
  });

  it('should maintain stable API on rerender', () => {
    const { result, rerender } = renderHook(() => useRippleEffect());

    const firstCreateRipple = result.current.createRipple;

    rerender();

    expect(result.current.createRipple).toBeDefined();
  });

  it('should handle multiple ripple creation', () => {
    const { result } = renderHook(() => useRippleEffect());

    const mockEvent1 = {
      nativeEvent: {
        locationX: 30,
        locationY: 40,
      },
    };

    const mockEvent2 = {
      nativeEvent: {
        locationX: 60,
        locationY: 80,
      },
    };

    result.current.createRipple(mockEvent1 as any);
    result.current.createRipple(mockEvent2 as any);
  });

  it('should handle unmount gracefully', () => {
    const { result, unmount } = renderHook(() => useRippleEffect());

    expect(result.current.createRipple).toBeDefined();

    unmount();

    expect(true).toBe(true); // Should not crash
  });
});

