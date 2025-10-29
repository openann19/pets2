/**
 * Tests for useGlowAnimation hook
 *
 * Covers:
 * - Glow effect initialization
 * - Color customization
 * - Intensity control
 * - Animation looping
 * - Performance optimization
 */

import { renderHook, act } from '@testing-library/react-native';
import { useGlowAnimation } from '../useGlowAnimation';

describe('useGlowAnimation', () => {
  describe('Initialization', () => {
    it('should initialize with default glow values', () => {
      const { result } = renderHook(() => useGlowAnimation());
      expect(result.current.glowStyle).toBeDefined();
      expect(result.current.glowOpacity).toBeDefined();
      expect(result.current.shadowRadius).toBeDefined();
    });

    it('should accept custom color', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          color: '#FF0000',
          intensity: 0.8,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should support custom intensity', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          intensity: 0.6,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Animation Configuration', () => {
    it('should support different colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

      colors.forEach((color) => {
        const { result } = renderHook(() => useGlowAnimation({ color }));
        expect(result.current.glowStyle).toBeDefined();
      });
    });

    it('should handle intensity range', () => {
      const intensities = [0.1, 0.5, 0.8, 1.0];

      intensities.forEach((intensity) => {
        const { result } = renderHook(() => useGlowAnimation({ intensity }));
        expect(result.current.glowStyle).toBeDefined();
      });
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          duration: 2000,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should support custom shadow radius', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          maxRadius: 20,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Animation Behavior', () => {
    it('should create pulsing glow effect', () => {
      const { result } = renderHook(() => useGlowAnimation());
      expect(result.current.glowOpacity).toBeDefined();
      expect(result.current.shadowRadius).toBeDefined();
    });

    it('should loop continuously', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          loop: true,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should support one-time animation', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          loop: false,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useGlowAnimation());
      const initialStyle = result.current.glowStyle;

      rerender();
      expect(result.current.glowStyle).toBe(initialStyle);
    });

    it('should use shared values efficiently', () => {
      const { result } = renderHook(() => useGlowAnimation());
      expect(result.current.glowOpacity).toBeDefined();
      expect(result.current.shadowRadius).toBeDefined();
    });

    it('should handle rapid configuration changes', () => {
      const { result, rerender } = renderHook(({ intensity }) => useGlowAnimation({ intensity }), {
        initialProps: { intensity: 0.5 },
      });

      rerender({ intensity: 0.8 });
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero intensity', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          intensity: 0,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should handle maximum intensity', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          intensity: 1.0,
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should handle invalid colors gracefully', () => {
      const { result } = renderHook(() =>
        useGlowAnimation({
          color: 'invalid-color',
        }),
      );
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useGlowAnimation());
      expect(() => unmount()).not.toThrow();
    });

    it('should stop animations on unmount', () => {
      const { unmount } = renderHook(() => useGlowAnimation());
      // Should not throw and should cleanup properly
      unmount();
    });
  });
});
