/**
 * Tests for useParallaxEffect hook
 */

import { renderHook } from '@testing-library/react-native';
import { useParallaxEffect } from '../useParallaxEffect';

jest.mock('react-native-reanimated', () => {


  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useParallaxEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default speed', () => {
      const { result } = renderHook(() => useParallaxEffect());

      expect(result.current).toBeDefined();
    });

    it('should initialize with custom speed', () => {
      const { result } = renderHook(() => useParallaxEffect(0.7));

      expect(result.current).toBeDefined();
    });

    it('should handle different speed values', () => {
      const speeds = [0, 0.25, 0.5, 0.75, 1, 1.5];

      speeds.forEach((speed) => {
        const { result } = renderHook(() => useParallaxEffect(speed));

        expect(result.current).toBeDefined();
      });
    });
  });

  describe('parallax effect', () => {
    it('should provide parallax style', () => {
      const { result } = renderHook(() => useParallaxEffect(0.5));

      expect(result.current.parallaxStyle).toBeDefined();
    });

    it('should handle speed changes', () => {
      const { result, rerender } = renderHook(
        (props) => useParallaxEffect(props.speed),
        { initialProps: { speed: 0.3 } }
      );

      expect(result.current.parallaxStyle).toBeDefined();

      rerender({ speed: 0.8 });

      expect(result.current.parallaxStyle).toBeDefined();
    });

    it('should handle negative speed values', () => {
      const { result } = renderHook(() => useParallaxEffect(-0.5));

      expect(result.current).toBeDefined();
    });
  });

  describe('scroll handling', () => {
    it('should provide scroll handler', () => {
      const { result } = renderHook(() => useParallaxEffect());

      expect(result.current.onScroll).toBeDefined();
      expect(typeof result.current.onScroll).toBe('function');
    });

    it('should handle scroll events', () => {
      const { result } = renderHook(() => useParallaxEffect());

      const mockEvent = {
        nativeEvent: {
          contentOffset: { y: 100 },
        },
      };

      result.current.onScroll(mockEvent as any);
    });
  });
});

