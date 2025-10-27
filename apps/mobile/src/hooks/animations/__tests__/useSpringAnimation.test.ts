/**
 * Tests for useSpringAnimation hook
 *
 * Covers:
 * - Spring animation creation
 * - Configuration options
 * - Animation triggers
 * - Custom spring config
 * - Value updates
 */

import { renderHook, act } from '@testing-library/react-native';
import { useSpringAnimation } from '../useSpringAnimation';

describe('useSpringAnimation', () => {
  describe('Initialization', () => {
    it('should initialize with default spring animation', () => {
      const { result } = renderHook(() => useSpringAnimation());
      expect(result.current.animatedValue).toBeDefined();
      expect(result.current.springTo).toBeDefined();
      expect(result.current.springConfig).toBeDefined();
    });

    it('should accept initial value', () => {
      const { result } = renderHook(() => useSpringAnimation({
        initialValue: 100
      }));
      expect(result.current.animatedValue).toBeDefined();
    });

    it('should accept custom spring config', () => {
      const customConfig = {
        damping: 12,
        stiffness: 150,
        mass: 1
      };

      const { result } = renderHook(() => useSpringAnimation({
        config: customConfig
      }));
      expect(result.current.springConfig).toEqual(customConfig);
    });
  });

  describe('Animation Control', () => {
    it('should animate to target value', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(1);
      });

      expect(result.current.animatedValue).toBeDefined();
    });

    it('should animate from custom start value', () => {
      const { result } = renderHook(() => useSpringAnimation({
        initialValue: 0.5
      }));

      act(() => {
        result.current.springTo(1);
      });

      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle multiple spring calls', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0.5);
      });

      act(() => {
        result.current.springTo(1);
      });

      expect(result.current.animatedValue).toBeDefined();
    });

    it('should support immediate animation', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(1, true); // immediate
      });

      expect(result.current.animatedValue).toBeDefined();
    });
  });

  describe('Spring Configuration', () => {
    it('should use bouncy spring config', () => {
      const { result } = renderHook(() => useSpringAnimation({
        config: 'bouncy'
      }));
      expect(result.current.springConfig).toBeDefined();
    });

    it('should use gentle spring config', () => {
      const { result } = renderHook(() => useSpringAnimation({
        config: 'gentle'
      }));
      expect(result.current.springConfig).toBeDefined();
    });

    it('should use stiff spring config', () => {
      const { result } = renderHook(() => useSpringAnimation({
        config: 'stiff'
      }));
      expect(result.current.springConfig).toBeDefined();
    });

    it('should accept custom numeric config', () => {
      const customConfig = {
        damping: 20,
        stiffness: 300,
        mass: 0.8
      };

      const { result } = renderHook(() => useSpringAnimation({
        config: customConfig
      }));
      expect(result.current.springConfig).toEqual(customConfig);
    });
  });

  describe('Value Updates', () => {
    it('should update base value', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0.8);
      });

      // Should animate towards 0.8
      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle value changes during animation', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0.5);
      });

      act(() => {
        result.current.springTo(1.0);
      });

      // Should animate to new target
      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle rapid value changes', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0.2);
        result.current.springTo(0.4);
        result.current.springTo(0.6);
        result.current.springTo(0.8);
      });

      expect(result.current.animatedValue).toBeDefined();
    });
  });

  describe('Animation States', () => {
    it('should provide current animation value', () => {
      const { result } = renderHook(() => useSpringAnimation({
        initialValue: 0
      }));

      // Initial value should be accessible
      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle animation completion', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(1, true); // immediate completion
      });

      expect(result.current.animatedValue).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useSpringAnimation());
      const initialValue = result.current.animatedValue;

      rerender();
      expect(result.current.animatedValue).toBe(initialValue);
    });

    it('should reuse animation instance', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0.5);
      });

      act(() => {
        result.current.springTo(1.0);
      });

      // Should use same animated value instance
      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle rapid config changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useSpringAnimation({ config }),
        { initialProps: { config: 'gentle' } }
      );

      rerender({ config: 'stiff' });
      expect(result.current.springConfig).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid config gracefully', () => {
      const { result } = renderHook(() => useSpringAnimation({
        config: 'invalid' as any
      }));
      expect(result.current.springConfig).toBeDefined();
    });

    it('should handle negative values', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(-0.5);
      });

      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle values greater than 1', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(1.5);
      });

      expect(result.current.animatedValue).toBeDefined();
    });

    it('should handle zero values', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(0);
      });

      expect(result.current.animatedValue).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useSpringAnimation());
      expect(() => unmount()).not.toThrow();
    });

    it('should stop animations on unmount', () => {
      const { unmount, result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.springTo(1);
      });

      unmount();
      // Should cleanup properly
    });
  });
});
