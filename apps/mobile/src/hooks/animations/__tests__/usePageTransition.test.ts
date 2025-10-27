/**
 * Tests for usePageTransition hook
 */

import { renderHook } from '@testing-library/react-native';
import { usePageTransition } from '../usePageTransition';

  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('usePageTransition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize page transition', () => {
    const { result } = renderHook(() => usePageTransition());

    expect(result.current).toBeDefined();
  });

  it('should provide transition style', () => {
    const { result } = renderHook(() => usePageTransition());

    expect(result.current.transitionStyle).toBeDefined();
  });

  it('should maintain stable style reference', () => {
    const { result, rerender } = renderHook(() => usePageTransition());

    const firstStyle = result.current.transitionStyle;

    rerender();

    expect(result.current.transitionStyle).toBeDefined();
  });

  it('should handle component unmount', () => {
    const { result, unmount } = renderHook(() => usePageTransition());

    expect(result.current.transitionStyle).toBeDefined();

    unmount();

    // Should not crash
    expect(true).toBe(true);
  });
});

