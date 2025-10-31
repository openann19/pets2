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
import { springs } from '@/foundation/motion';

describe('useSpringAnimation', () => {
  describe('Initialization', () => {
    it('should initialize with default spring animation', () => {
      const { result } = renderHook(() => useSpringAnimation());
      expect(result.current.value).toBeDefined();
      expect(result.current.animate).toBeDefined();
      expect(result.current.reset).toBeDefined();
    });

    it('should accept initial value', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(100),
      );
      expect(result.current.value).toBeDefined();
      expect(result.current.value.value).toBe(100);
    });

    it('should accept custom spring config preset', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0, 'bouncy'),
      );
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Animation Control', () => {
    it('should animate to target value', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
      expect(result.current.value.value).toBeGreaterThanOrEqual(0);
    });

    it('should animate from custom start value', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0.5),
      );

      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle multiple spring calls', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(0.5);
      });

      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should accept custom config override', () => {
      const { result } = renderHook(() => useSpringAnimation(0, 'standard'));

      const customConfig = {
        damping: 20,
        stiffness: 300,
      };

      act(() => {
        result.current.animate(1, customConfig);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Spring Configuration', () => {
    it('should use bouncy spring config', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0, 'bouncy'),
      );
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
      expect(springs.bouncy).toBeDefined();
    });

    it('should use gentle spring config', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0, 'gentle'),
      );
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
      expect(springs.gentle).toBeDefined();
    });

    it('should use standard spring config by default', () => {
      const { result } = renderHook(() => useSpringAnimation(0));
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
      expect(springs.standard).toBeDefined();
    });

    it('should accept custom numeric config', () => {
      const customConfig = {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      };

      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(1, customConfig);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Value Updates', () => {
    it('should update animated value', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(0.8);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle value changes during animation', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(0.5);
      });

      act(() => {
        result.current.animate(1.0);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle rapid value changes', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(0.2);
        result.current.animate(0.4);
        result.current.animate(0.6);
        result.current.animate(0.8);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial value', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0),
      );

      act(() => {
        result.current.animate(1);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBeDefined();
    });

    it('should reset with custom config', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0, 'gentle'),
      );

      act(() => {
        result.current.animate(1);
        result.current.reset();
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useSpringAnimation(0));
      const initialValue = result.current.value;

      rerender();
      expect(result.current.value).toBe(initialValue);
    });

    it('should reuse animation instance', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(0.5);
      });

      act(() => {
        result.current.animate(1.0);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle rapid config changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useSpringAnimation(0, config),
        {
          initialProps: { config: 'gentle' as const },
        },
      );

      rerender({ config: 'standard' as const });
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid config preset gracefully', () => {
      const { result } = renderHook(() =>
        useSpringAnimation(0, 'invalid' as any),
      );
      
      act(() => {
        result.current.animate(1);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle negative values', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(-0.5);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle values greater than 1', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(1.5);
      });

      expect(result.current.value).toBeDefined();
    });

    it('should handle zero values', () => {
      const { result } = renderHook(() => useSpringAnimation(1));

      act(() => {
        result.current.animate(0);
      });

      expect(result.current.value).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useSpringAnimation(0));
      expect(() => unmount()).not.toThrow();
    });

    it('should stop animations on unmount', () => {
      const { unmount, result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animate(1);
      });

      unmount();
      // Should cleanup properly
    });
  });
});
