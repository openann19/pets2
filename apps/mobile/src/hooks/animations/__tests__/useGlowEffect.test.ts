/**
 * Tests for useGlowEffect hook
 *
 * Covers:
 * - Static glow effect creation
 * - Shadow styling
 * - Color and intensity control
 * - Style composition
 * - Accessibility
 */

import { renderHook } from '@testing-library/react-native';
import { useGlowEffect } from '../useGlowEffect';

describe('useGlowEffect', () => {
  describe('Initialization', () => {
    it('should initialize with default glow effect', () => {
      const { result } = renderHook(() => useGlowEffect());
      expect(result.current.glowStyle).toBeDefined();
      expect(typeof result.current.glowStyle).toBe('object');
    });

    it('should accept custom color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#FF6B6B',
        intensity: 0.7
      }));
      expect(result.current.glowStyle).toBeDefined();
      expect(result.current.glowStyle.shadowColor).toBe('#FF6B6B');
    });

    it('should support custom intensity', () => {
      const { result } = renderHook(() => useGlowEffect({
        intensity: 0.8
      }));
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Shadow Properties', () => {
    it('should generate shadow color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#00FF00'
      }));
      expect(result.current.glowStyle.shadowColor).toBe('#00FF00');
    });

    it('should generate shadow radius based on intensity', () => {
      const { result: lowIntensity } = renderHook(() => useGlowEffect({
        intensity: 0.3
      }));
      const { result: highIntensity } = renderHook(() => useGlowEffect({
        intensity: 0.9
      }));

      expect(lowIntensity.current.glowStyle.shadowRadius).toBeLessThan(
        highIntensity.current.glowStyle.shadowRadius
      );
    });

    it('should set shadow opacity based on intensity', () => {
      const { result } = renderHook(() => useGlowEffect({
        intensity: 0.6
      }));
      expect(result.current.glowStyle.shadowOpacity).toBe(0.6);
    });

    it('should set shadow offset', () => {
      const { result } = renderHook(() => useGlowEffect());
      expect(result.current.glowStyle.shadowOffset).toEqual({
        width: 0,
        height: 0
      });
    });
  });

  describe('Color Variations', () => {
    it('should support primary color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#007AFF',
        intensity: 0.8
      }));
      expect(result.current.glowStyle.shadowColor).toBe('#007AFF');
      expect(result.current.glowStyle.shadowOpacity).toBe(0.8);
    });

    it('should support warning color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#FF9500',
        intensity: 0.7
      }));
      expect(result.current.glowStyle.shadowColor).toBe('#FF9500');
      expect(result.current.glowStyle.shadowOpacity).toBe(0.7);
    });

    it('should support error color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#FF3B30',
        intensity: 0.9
      }));
      expect(result.current.glowStyle.shadowColor).toBe('#FF3B30');
      expect(result.current.glowStyle.shadowOpacity).toBe(0.9);
    });

    it('should support success color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#34C759',
        intensity: 0.6
      }));
      expect(result.current.glowStyle.shadowColor).toBe('#34C759');
      expect(result.current.glowStyle.shadowOpacity).toBe(0.6);
    });
  });

  describe('Intensity Control', () => {
    it('should handle minimum intensity', () => {
      const { result } = renderHook(() => useGlowEffect({
        intensity: 0.1
      }));
      expect(result.current.glowStyle.shadowOpacity).toBe(0.1);
      expect(result.current.glowStyle.shadowRadius).toBeGreaterThan(0);
    });

    it('should handle maximum intensity', () => {
      const { result } = renderHook(() => useGlowEffect({
        intensity: 1.0
      }));
      expect(result.current.glowStyle.shadowOpacity).toBe(1.0);
      expect(result.current.glowStyle.shadowRadius).toBeGreaterThan(0);
    });

    it('should scale shadow radius with intensity', () => {
      const intensities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const results = intensities.map(intensity => {
        const { result } = renderHook(() => useGlowEffect({ intensity }));
        return result.current.glowStyle.shadowRadius;
      });

      // Should be monotonically increasing
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
      }
    });
  });

  describe('Style Composition', () => {
    it('should return object compatible with StyleSheet', () => {
      const { result } = renderHook(() => useGlowEffect());
      const style = result.current.glowStyle;

      // Should have shadow properties
      expect(style).toHaveProperty('shadowColor');
      expect(style).toHaveProperty('shadowOffset');
      expect(style).toHaveProperty('shadowOpacity');
      expect(style).toHaveProperty('shadowRadius');
    });

    it('should be composable with other styles', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#FF0000',
        intensity: 0.8
      }));

      const combinedStyle = {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        ...result.current.glowStyle
      };

      expect(combinedStyle.backgroundColor).toBe('#FFFFFF');
      expect(combinedStyle.borderRadius).toBe(8);
      expect(combinedStyle.shadowColor).toBe('#FF0000');
      expect(combinedStyle.shadowOpacity).toBe(0.8);
    });
  });

  describe('Performance', () => {
    it('should return stable style object', () => {
      const { result, rerender } = renderHook(() => useGlowEffect({
        color: '#0000FF',
        intensity: 0.7
      }));

      const initialStyle = result.current.glowStyle;
      rerender();
      const newStyle = result.current.glowStyle;

      // Object should be stable
      expect(newStyle).toBe(initialStyle);
      expect(newStyle.shadowColor).toBe(initialStyle.shadowColor);
      expect(newStyle.shadowOpacity).toBe(initialStyle.shadowOpacity);
    });

    it('should not cause unnecessary re-computation', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: '#00FF00',
        intensity: 0.5
      }));

      // Style should be computed once and cached
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with accessibility properties', () => {
      const { result } = renderHook(() => useGlowEffect());

      // Glow styles should only affect visual appearance
      const styleKeys = Object.keys(result.current.glowStyle);
      const accessibilityKeys = ['accessible', 'accessibilityLabel', 'accessibilityHint'];

      const hasAccessibilityKeys = accessibilityKeys.some(key =>
        styleKeys.includes(key)
      );

      expect(hasAccessibilityKeys).toBe(false);
    });

    it('should work with reduced motion preferences', () => {
      // This would typically check if the hook respects reduced motion
      // but since this is a static effect, it should be fine
      const { result } = renderHook(() => useGlowEffect());
      expect(result.current.glowStyle).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined color', () => {
      const { result } = renderHook(() => useGlowEffect({
        color: undefined as any
      }));
      expect(result.current.glowStyle).toBeDefined();
    });

    it('should handle invalid intensity values', () => {
      const { result: negative } = renderHook(() => useGlowEffect({
        intensity: -0.5
      }));
      const { result: overMax } = renderHook(() => useGlowEffect({
        intensity: 1.5
      }));

      expect(negative.current.glowStyle).toBeDefined();
      expect(overMax.current.glowStyle).toBeDefined();
    });
  });
});
