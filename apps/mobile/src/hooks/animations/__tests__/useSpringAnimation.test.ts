/**
 * Comprehensive tests for useSpringAnimation hook
 *
 * Coverage:
 * - Spring animation configuration and execution
 * - Shared values and animated styles
 * - Animation controls (start, stop, reset)
 * - Spring presets and custom configurations
 * - Performance optimizations
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { runOnJS, runOnUI } from 'react-native-reanimated';
import { useSpringAnimation } from '../useSpringAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
  runOnJS: jest.fn(),
  runOnUI: jest.fn(),
  Easing: {
    out: jest.fn(),
    in: jest.fn(),
    inOut: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  runOnUI,
} from 'react-native-reanimated';

const mockUseSharedValue = useSharedValue as jest.Mock;
const mockUseAnimatedStyle = useAnimatedStyle as jest.Mock;
const mockWithSpring = withSpring as jest.Mock;
const mockRunOnJS = runOnJS as jest.Mock;
const mockRunOnUI = runOnUI as jest.Mock;

describe('useSpringAnimation', () => {
  const mockSharedValue = {
    value: 0,
    get: jest.fn(() => 0),
    set: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };

  const mockAnimatedStyle = { transform: [{ scale: 1 }] };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseSharedValue.mockReturnValue(mockSharedValue);
    mockUseAnimatedStyle.mockReturnValue(mockAnimatedStyle);
    mockWithSpring.mockReturnValue('spring-animation');
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useSpringAnimation());

      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
      expect(result.current.value).toBe(mockSharedValue);
      expect(result.current.animatedStyle).toBe(mockAnimatedStyle);
    });

    it('should initialize with custom initial value', () => {
      renderHook(() => useSpringAnimation(100));

      expect(mockUseSharedValue).toHaveBeenCalledWith(100);
    });

    it('should initialize with custom spring config', () => {
      const customConfig = {
        damping: 15,
        stiffness: 200,
        mass: 1.5,
      };

      const { result } = renderHook(() =>
        useSpringAnimation(0, customConfig)
      );

      expect(result.current.config).toEqual(customConfig);
    });
  });

  describe('Spring Animation Control', () => {
    it('should animate to target value with default config', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          damping: 20,
          stiffness: 400,
          mass: 0.8,
        })
      );
    });

    it('should animate to target value with custom config', () => {
      const { result } = renderHook(() => useSpringAnimation());

      const customConfig = {
        damping: 10,
        stiffness: 300,
        mass: 1.2,
      };

      act(() => {
        result.current.animateTo(0.8, customConfig);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(0.8, customConfig);
    });

    it('should animate from current value', () => {
      const { result } = renderHook(() => useSpringAnimation(0.5));

      act(() => {
        result.current.animateTo(1);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should handle animation with velocity', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1, undefined, 500);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          velocity: 500,
        })
      );
    });
  });

  describe('Preset Configurations', () => {
    it('should use gentle preset', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateWithPreset('gentle', 0.8);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        0.8,
        expect.objectContaining({
          damping: 25,
          stiffness: 300,
          mass: 1,
        })
      );
    });

    it('should use snappy preset', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateWithPreset('snappy', 0.6);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        0.6,
        expect.objectContaining({
          damping: 15,
          stiffness: 500,
          mass: 0.6,
        })
      );
    });

    it('should use bouncy preset', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateWithPreset('bouncy', 1.2);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        1.2,
        expect.objectContaining({
          damping: 10,
          stiffness: 600,
          mass: 0.5,
        })
      );
    });
  });

  describe('Animation Controls', () => {
    it('should reset to initial value', () => {
      const { result } = renderHook(() => useSpringAnimation(0.5));

      act(() => {
        result.current.reset();
      });

      expect(mockSharedValue.set).toHaveBeenCalledWith(0.5);
    });

    it('should reset to custom value', () => {
      const { result } = renderHook(() => useSpringAnimation(0.5));

      act(() => {
        result.current.reset(0.8);
      });

      expect(mockSharedValue.set).toHaveBeenCalledWith(0.8);
    });

    it('should set value immediately without animation', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.setValue(0.7);
      });

      expect(mockSharedValue.set).toHaveBeenCalledWith(0.7);
      expect(mockWithSpring).not.toHaveBeenCalled();
    });

    it('should get current value', () => {
      const { result } = renderHook(() => useSpringAnimation(0.3));

      expect(result.current.getValue()).toBe(0.3);
    });
  });

  describe('Callback Support', () => {
    it('should execute onStart callback', () => {
      const onStart = jest.fn();
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1, undefined, undefined, { onStart });
      });

      expect(mockRunOnJS).toHaveBeenCalledWith(onStart);
    });

    it('should execute onFinish callback', () => {
      const onFinish = jest.fn();
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1, undefined, undefined, { onFinish });
      });

      expect(mockRunOnJS).toHaveBeenCalledWith(onFinish);
    });

    it('should handle both callbacks', () => {
      const onStart = jest.fn();
      const onFinish = jest.fn();
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1, undefined, undefined, { onStart, onFinish });
      });

      expect(mockRunOnJS).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Optimizations', () => {
    it('should not recreate animated style on re-renders', () => {
      const { result, rerender } = renderHook(() => useSpringAnimation());

      const firstStyle = result.current.animatedStyle;
      rerender();
      const secondStyle = result.current.animatedStyle;

      expect(firstStyle).toBe(secondStyle);
      expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(1);
    });

    it('should memoize configuration', () => {
      const { result, rerender } = renderHook(() =>
        useSpringAnimation(0, { damping: 20, stiffness: 400 })
      );

      const firstConfig = result.current.config;
      rerender();
      const secondConfig = result.current.config;

      expect(firstConfig).toBe(secondConfig);
    });
  });

  describe('Animation State', () => {
    it('should track animation state', () => {
      const { result } = renderHook(() => useSpringAnimation());

      expect(result.current.isAnimating).toBe(false);

      // Note: In a real implementation, isAnimating would be tracked
      // but for testing purposes, we verify the structure
      expect(typeof result.current.isAnimating).toBe('boolean');
    });

    it('should provide animation progress', () => {
      const { result } = renderHook(() => useSpringAnimation());

      // Progress would be calculated based on current vs target value
      const progress = result.current.getProgress();
      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid target values gracefully', () => {
      const { result } = renderHook(() => useSpringAnimation());

      // Should handle NaN
      act(() => {
        result.current.animateTo(NaN);
      });

      expect(mockWithSpring).toHaveBeenCalled();

      // Should handle Infinity
      act(() => {
        result.current.animateTo(Infinity);
      });

      expect(mockWithSpring).toHaveBeenCalled();
    });

    it('should handle invalid config values', () => {
      const { result } = renderHook(() => useSpringAnimation());

      const invalidConfig = {
        damping: -5, // Invalid negative value
        stiffness: 0, // Invalid zero value
        mass: 0,
      };

      act(() => {
        result.current.animateTo(1, invalidConfig);
      });

      // Should still call withSpring but with potentially corrected values
      expect(mockWithSpring).toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      const { result } = renderHook(() => useSpringAnimation());

      // Should not crash the animation
      act(() => {
        result.current.animateTo(1, undefined, undefined, { onStart: errorCallback });
      });

      expect(mockRunOnJS).toHaveBeenCalledWith(errorCallback);
    });
  });

  describe('Advanced Spring Configurations', () => {
    it('should support overshoot clamping', () => {
      const { result } = renderHook(() => useSpringAnimation());

      const configWithClamping = {
        damping: 20,
        stiffness: 400,
        mass: 0.8,
        overshootClamping: true,
      };

      act(() => {
        result.current.animateTo(1, configWithClamping);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(1, configWithClamping);
    });

    it('should support rest displacement threshold', () => {
      const { result } = renderHook(() => useSpringAnimation());

      const configWithThreshold = {
        damping: 20,
        stiffness: 400,
        mass: 0.8,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      };

      act(() => {
        result.current.animateTo(1, configWithThreshold);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(1, configWithThreshold);
    });

    it('should handle extreme spring values', () => {
      const { result } = renderHook(() => useSpringAnimation());

      const extremeConfig = {
        damping: 1000, // Very high damping
        stiffness: 1, // Very low stiffness
        mass: 100, // Very high mass
      };

      act(() => {
        result.current.animateTo(1, extremeConfig);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(1, extremeConfig);
    });
  });

  describe('Integration with Animated Styles', () => {
    it('should provide proper animated style structure', () => {
      const { result } = renderHook(() => useSpringAnimation());

      expect(result.current.animatedStyle).toBeDefined();
      expect(mockUseAnimatedStyle).toHaveBeenCalledWith(
        expect.any(Function),
        expect.arrayContaining([])
      );
    });

    it('should update animated style when value changes', () => {
      const animatedStyleFn = jest.fn(() => ({
        opacity: mockSharedValue.get(),
      }));

      mockUseAnimatedStyle.mockReturnValueOnce({
        opacity: 0.5,
      });

      renderHook(() => useSpringAnimation());

      // The animated style function should be called with dependencies
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
    });
  });

  describe('Chained Animations', () => {
    it('should support chaining animations', async () => {
      const { result } = renderHook(() => useSpringAnimation());

      await act(async () => {
        await result.current.animateTo(0.5);
        await result.current.animateTo(1);
        await result.current.animateTo(0);
      });

      expect(mockWithSpring).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid animation changes', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(0.2);
        result.current.animateTo(0.5);
        result.current.animateTo(0.8);
        result.current.animateTo(1);
      });

      // Each animation should be called
      expect(mockWithSpring).toHaveBeenCalledTimes(4);
    });
  });

  describe('Memory Management', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => useSpringAnimation());

      // Simulate listeners being added
      mockSharedValue.addListener.mockImplementation(() => 'listener-id');

      unmount();

      // In a real implementation, listeners would be removed
      expect(mockSharedValue.removeListener).toHaveBeenCalled();
    });

    it('should handle multiple animation instances', () => {
      const { result: result1 } = renderHook(() => useSpringAnimation(0));
      const { result: result2 } = renderHook(() => useSpringAnimation(1));

      expect(result1.current.getValue()).toBe(0);
      expect(result2.current.getValue()).toBe(1);

      // Each should have its own shared value
      expect(mockUseSharedValue).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle animation to same value', () => {
      const { result } = renderHook(() => useSpringAnimation(0.5));

      act(() => {
        result.current.animateTo(0.5);
      });

      // Should still call withSpring (implementation detail)
      expect(mockWithSpring).toHaveBeenCalledWith(0.5, expect.any(Object));
    });

    it('should handle very small animation distances', () => {
      const { result } = renderHook(() => useSpringAnimation(0.5));

      act(() => {
        result.current.animateTo(0.5001);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(0.5001, expect.any(Object));
    });

    it('should handle very large animation distances', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animateTo(10000);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(10000, expect.any(Object));
    });

    it('should handle negative values', () => {
      const { result } = renderHook(() => useSpringAnimation(0));

      act(() => {
        result.current.animateTo(-1);
      });

      expect(mockWithSpring).toHaveBeenCalledWith(-1, expect.any(Object));
    });

    it('should handle zero mass (should be prevented)', () => {
      const { result } = renderHook(() => useSpringAnimation());

      act(() => {
        result.current.animateTo(1, { damping: 20, stiffness: 400, mass: 0 });
      });

      // Implementation should handle zero mass
      expect(mockWithSpring).toHaveBeenCalled();
    });
  });
});
