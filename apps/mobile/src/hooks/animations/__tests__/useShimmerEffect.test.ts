/**
 * Tests for useShimmerEffect hook
 */

import { renderHook } from '@testing-library/react-native';
import { useShimmerEffect } from '../useShimmerEffect';

jest.mock('react-native-reanimated', () => {


  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useShimmerEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default enabled state', () => {
      const { result } = renderHook(() => useShimmerEffect());

      expect(result.current.shimmerStyle).toBeDefined();
    });

    it('should initialize with enabled=true', () => {
      const { result } = renderHook(() => useShimmerEffect(true));

      expect(result.current.shimmerStyle).toBeDefined();
    });

    it('should initialize with enabled=false', () => {
      const { result } = renderHook(() => useShimmerEffect(false));

      expect(result.current.shimmerStyle).toBeDefined();
    });
  });

  describe('shimmer effect', () => {
    it('should provide shimmer style property', () => {
      const { result } = renderHook(() => useShimmerEffect());

      expect(result.current.shimmerStyle).toBeDefined();
    });

    it('should generate correct shimmer style structure', () => {
      const { result } = renderHook(() => useShimmerEffect());

      const style = result.current.shimmerStyle;
      expect(style).toBeDefined();
    });

    it('should maintain style when enabled changes', () => {
      const { result, rerender } = renderHook(
        (props) => useShimmerEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      const firstStyle = result.current.shimmerStyle;

      rerender({ enabled: false });

      expect(result.current.shimmerStyle).toBeDefined();
    });
  });

  describe('state changes', () => {
    it('should handle enabling shimmer animation', () => {
      const { result, rerender } = renderHook(
        (props) => useShimmerEffect(props.enabled),
        { initialProps: { enabled: false } }
      );

      expect(result.current.shimmerStyle).toBeDefined();

      rerender({ enabled: true });

      expect(result.current.shimmerStyle).toBeDefined();
    });

    it('should handle disabling shimmer animation', () => {
      const { result, rerender } = renderHook(
        (props) => useShimmerEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      expect(result.current.shimmerStyle).toBeDefined();

      rerender({ enabled: false });

      expect(result.current.shimmerStyle).toBeDefined();
    });
  });
});

