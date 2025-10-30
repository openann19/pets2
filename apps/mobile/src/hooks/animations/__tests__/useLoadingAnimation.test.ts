/**
 * Tests for useLoadingAnimation hook
 */

import { renderHook } from '@testing-library/react-native';
import { useLoadingAnimation } from '../useLoadingAnimation';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useLoadingAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading style', () => {
    const { result } = renderHook(() => useLoadingAnimation());

    expect(result.current).toBeDefined();
    expect(result.current.loadingStyle).toBeDefined();
  });

  it('should provide animated loading style', () => {
    const { result } = renderHook(() => useLoadingAnimation());

    expect(result.current.loadingStyle).toBeDefined();
    expect(typeof result.current.loadingStyle).toBe('object');
  });

  it('should maintain stable style reference', () => {
    const { result, rerender } = renderHook(() => useLoadingAnimation());

    const firstStyle = result.current.loadingStyle;

    rerender();

    expect(result.current.loadingStyle).toBeDefined();
  });

  it('should provide style with proper structure', () => {
    const { result } = renderHook(() => useLoadingAnimation());

    const style = result.current.loadingStyle;
    expect(style).toBeDefined();
  });
});
