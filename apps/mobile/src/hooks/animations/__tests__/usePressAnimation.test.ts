/**
 * Comprehensive tests for usePressAnimation hook
 *
 * Coverage:
 * - Press animation states (pressed, released)
 * - Scale and opacity animations
 * - Touch event handling
 * - Custom animation configurations
 * - Haptic feedback integration
 * - Accessibility support
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/groups';
import { renderHook, act } from '@testing-library/react-native';
import { usePressAnimation } from '../usePressAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
  runOnJS: jest.fn(),
  interpolate: jest.fn(),
  Extrapolate: {
    CLAMP: 'clamp',
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
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
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

const mockUseSharedValue = useSharedValue as jest.Mock;
const mockUseAnimatedStyle = useAnimatedStyle as jest.Mock;
const mockWithSpring = withSpring as jest.Mock;
const mockWithTiming = withTiming as jest.Mock;
const mockInterpolate = interpolate as jest.Mock;
const mockImpactAsync = impactAsync as jest.Mock;

describe('usePressAnimation', () => {
  const mockSharedValue = {
    value: 0,
    get: jest.fn(() => 0),
    set: jest.fn(),
  };

  const mockAnimatedStyle = {
    transform: [{ scale: mockInterpolate() }],
    opacity: mockInterpolate(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseSharedValue.mockReturnValue(mockSharedValue);
    mockUseAnimatedStyle.mockReturnValue(mockAnimatedStyle);
    mockWithSpring.mockReturnValue('spring-animation');
    mockWithTiming.mockReturnValue('timing-animation');
    mockInterpolate.mockReturnValue(0.8);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => usePressAnimation());

      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
      expect(result.current.isPressed).toBe(false);
      expect(result.current.animatedStyle).toBe(mockAnimatedStyle);
    });

    it('should initialize with custom scale range', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          scaleRange: [1, 0.9],
        })
      );

      expect(result.current.config.scaleRange).toEqual([1, 0.9]);
    });

    it('should initialize with custom opacity range', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          opacityRange: [1, 0.7],
        })
      );

      expect(result.current.config.opacityRange).toEqual([1, 0.7]);
    });

    it('should initialize with haptic feedback enabled', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          enableHaptics: true,
          hapticStyle: 'medium',
        })
      );

      expect(result.current.config.enableHaptics).toBe(true);
      expect(result.current.config.hapticStyle).toBe('medium');
    });
  });

  describe('Press Event Handling', () => {
    it('should handle press in event', () => {
      const { result } = renderHook(() => usePressAnimation());

      act(() => {
        result.current.handlePressIn();
      });

      expect(result.current.isPressed).toBe(true);
      expect(mockSharedValue.set).toHaveBeenCalledWith(1);
      expect(mockWithSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          damping: 15,
          stiffness: 400,
        })
      );
    });

    it('should handle press out event', () => {
      const { result } = renderHook(() => usePressAnimation());

      // First press in
      act(() => {
        result.current.handlePressIn();
      });

      // Then press out
      act(() => {
        result.current.handlePressOut();
      });

      expect(result.current.isPressed).toBe(false);
      expect(mockSharedValue.set).toHaveBeenCalledWith(0);
      expect(mockWithSpring).toHaveBeenCalledWith(
        0,
        expect.any(Object)
      );
    });

    it('should handle press out with custom animation config', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          animationConfig: {
            release: {
              damping: 20,
              stiffness: 300,
            },
          },
        })
      );

      act(() => {
        result.current.handlePressOut();
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          damping: 20,
          stiffness: 300,
        })
      );
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on press in', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          enableHaptics: true,
          hapticStyle: 'light',
        })
      );

      act(() => {
        result.current.handlePressIn();
      });

      expect(mockImpactAsync).toHaveBeenCalledWith('light');
    });

    it('should trigger haptic feedback on press out', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          enableHaptics: true,
          hapticStyle: 'medium',
          hapticOnRelease: true,
        })
      );

      act(() => {
        result.current.handlePressOut();
      });

      expect(mockImpactAsync).toHaveBeenCalledWith('medium');
    });

    it('should not trigger haptic feedback when disabled', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          enableHaptics: false,
        })
      );

      act(() => {
        result.current.handlePressIn();
      });

      expect(mockImpactAsync).not.toHaveBeenCalled();
    });

    it('should handle haptic feedback errors gracefully', () => {
      mockImpactAsync.mockRejectedValue(new Error('Haptic not available'));

      const { result } = renderHook(() =>
        usePressAnimation({
          enableHaptics: true,
        })
      );

      // Should not throw
      act(() => {
        result.current.handlePressIn();
      });

      expect(mockImpactAsync).toHaveBeenCalled();
    });
  });

  describe('Animation Styles', () => {
    it('should provide animated style with scale and opacity', () => {
      const { result } = renderHook(() => usePressAnimation());

      expect(result.current.animatedStyle).toEqual({
        transform: [{ scale: 0.8 }],
        opacity: 0.8,
      });

      expect(mockInterpolate).toHaveBeenCalledTimes(2); // scale and opacity
    });

    it('should use custom scale range in animation', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          scaleRange: [1, 0.85],
        })
      );

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([0, 1]),
        expect.arrayContaining([1, 0.85])
      );
    });

    it('should use custom opacity range in animation', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          opacityRange: [1, 0.6],
        })
      );

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([0, 1]),
        expect.arrayContaining([1, 0.6])
      );
    });

    it('should clamp interpolation values', () => {
      renderHook(() => usePressAnimation());

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        expect.any(Array),
        'clamp'
      );
    });
  });

  describe('Press Handlers for Components', () => {
    it('should provide pressable props for React Native components', () => {
      const { result } = renderHook(() => usePressAnimation());

      const pressableProps = result.current.getPressableProps();

      expect(pressableProps).toEqual({
        onPressIn: expect.any(Function),
        onPressOut: expect.any(Function),
        style: mockAnimatedStyle,
      });
    });

    it('should merge with existing pressable props', () => {
      const { result } = renderHook(() => usePressAnimation());

      const existingProps = {
        onPress: jest.fn(),
        disabled: false,
      };

      const pressableProps = result.current.getPressableProps(existingProps);

      expect(pressableProps.onPress).toBe(existingProps.onPress);
      expect(pressableProps.disabled).toBe(false);
      expect(pressableProps.onPressIn).toBeDefined();
      expect(pressableProps.onPressOut).toBeDefined();
      expect(pressableProps.style).toBeDefined();
    });

    it('should handle touch events properly', () => {
      const { result } = renderHook(() => usePressAnimation());

      const pressableProps = result.current.getPressableProps();

      // Simulate press in
      act(() => {
        pressableProps.onPressIn?.({} as any);
      });

      expect(result.current.isPressed).toBe(true);

      // Simulate press out
      act(() => {
        pressableProps.onPressOut?.({} as any);
      });

      expect(result.current.isPressed).toBe(false);
    });
  });

  describe('Custom Animation Configurations', () => {
    it('should use custom spring config for press in', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          animationConfig: {
            press: {
              damping: 10,
              stiffness: 500,
            },
          },
        })
      );

      act(() => {
        result.current.handlePressIn();
      });

      expect(mockWithSpring).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          damping: 10,
          stiffness: 500,
        })
      );
    });

    it('should use custom timing config for press out', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          useTiming: true,
          animationConfig: {
            release: {
              duration: 300,
            },
          },
        })
      );

      act(() => {
        result.current.handlePressOut();
      });

      expect(mockWithTiming).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          duration: 300,
        })
      );
    });

    it('should support timing animation instead of spring', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          useTiming: true,
        })
      );

      act(() => {
        result.current.handlePressOut();
      });

      expect(mockWithTiming).toHaveBeenCalledWith(0, expect.any(Object));
      expect(mockWithSpring).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should track pressed state correctly', () => {
      const { result } = renderHook(() => usePressAnimation());

      expect(result.current.isPressed).toBe(false);

      act(() => {
        result.current.handlePressIn();
      });

      expect(result.current.isPressed).toBe(true);

      act(() => {
        result.current.handlePressOut();
      });

      expect(result.current.isPressed).toBe(false);
    });

    it('should reset state when needed', () => {
      const { result } = renderHook(() => usePressAnimation());

      act(() => {
        result.current.handlePressIn();
      });

      expect(result.current.isPressed).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isPressed).toBe(false);
      expect(mockSharedValue.set).toHaveBeenCalledWith(0);
    });

    it('should provide current animation progress', () => {
      const { result } = renderHook(() => usePressAnimation());

      const progress = result.current.getAnimationProgress();
      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Accessibility Support', () => {
    it('should provide accessibility props', () => {
      const { result } = renderHook(() => usePressAnimation());

      const accessibilityProps = result.current.getAccessibilityProps();

      expect(accessibilityProps).toEqual({
        accessibilityRole: 'button',
        accessibilityState: {
          pressed: false,
        },
      });
    });

    it('should update accessibility state when pressed', () => {
      const { result } = renderHook(() => usePressAnimation());

      act(() => {
        result.current.handlePressIn();
      });

      const accessibilityProps = result.current.getAccessibilityProps();

      expect(accessibilityProps.accessibilityState?.pressed).toBe(true);
    });

    it('should merge with custom accessibility props', () => {
      const { result } = renderHook(() => usePressAnimation());

      const customProps = {
        accessibilityLabel: 'Custom Button',
        accessibilityHint: 'Press to activate',
      };

      const accessibilityProps = result.current.getAccessibilityProps(customProps);

      expect(accessibilityProps.accessibilityLabel).toBe('Custom Button');
      expect(accessibilityProps.accessibilityHint).toBe('Press to activate');
      expect(accessibilityProps.accessibilityRole).toBe('button');
      expect(accessibilityProps.accessibilityState?.pressed).toBe(false);
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize animated style', () => {
      const { result, rerender } = renderHook(() => usePressAnimation());

      const firstStyle = result.current.animatedStyle;
      rerender();
      const secondStyle = result.current.animatedStyle;

      expect(firstStyle).toBe(secondStyle);
      expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(1);
    });

    it('should memoize configuration', () => {
      const { result, rerender } = renderHook(() =>
        usePressAnimation({ scaleRange: [1, 0.9] })
      );

      const firstConfig = result.current.config;
      rerender();
      const secondConfig = result.current.config;

      expect(firstConfig).toBe(secondConfig);
    });

    it('should not recreate functions on re-render', () => {
      const { result, rerender } = renderHook(() => usePressAnimation());

      const firstPressIn = result.current.handlePressIn;
      const firstPressOut = result.current.handlePressOut;
      rerender();
      const secondPressIn = result.current.handlePressIn;
      const secondPressOut = result.current.handlePressOut;

      expect(firstPressIn).toBe(secondPressIn);
      expect(firstPressOut).toBe(secondPressOut);
    });
  });

  describe('Error Handling', () => {
    it('should handle animation errors gracefully', () => {
      mockWithSpring.mockImplementation(() => {
        throw new Error('Animation error');
      });

      const { result } = renderHook(() => usePressAnimation());

      // Should not crash
      act(() => {
        result.current.handlePressIn();
      });

      expect(result.current.isPressed).toBe(true);
    });

    it('should handle invalid configuration values', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          scaleRange: [1, 1.5], // Invalid: pressed scale larger than default
          opacityRange: [0.5, 1.5], // Invalid: opacity > 1
        })
      );

      // Should still work with potentially corrected values
      expect(result.current.config.scaleRange).toEqual([1, 1.5]);
      expect(result.current.config.opacityRange).toEqual([0.5, 1.5]);
    });

    it('should handle rapid press events', () => {
      const { result } = renderHook(() => usePressAnimation());

      act(() => {
        result.current.handlePressIn();
        result.current.handlePressOut();
        result.current.handlePressIn();
        result.current.handlePressOut();
      });

      expect(mockWithSpring).toHaveBeenCalledTimes(4);
    });

    it('should handle concurrent press events', () => {
      const { result } = renderHook(() => usePressAnimation());

      // Simulate rapid concurrent events
      act(() => {
        result.current.handlePressIn();
        result.current.handlePressIn(); // Double press in
        result.current.handlePressOut();
        result.current.handlePressOut(); // Double press out
      });

      expect(result.current.isPressed).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with button components', () => {
      const { result } = renderHook(() => usePressAnimation());

      const pressableProps = result.current.getPressableProps({
        onPress: jest.fn(),
        style: { backgroundColor: 'blue' },
      });

      expect(pressableProps.onPress).toBeDefined();
      expect(pressableProps.onPressIn).toBeDefined();
      expect(pressableProps.onPressOut).toBeDefined();
      expect(pressableProps.style).toEqual(
        expect.arrayContaining([
          { backgroundColor: 'blue' },
          mockAnimatedStyle,
        ])
      );
    });

    it('should support different press feedback styles', () => {
      const testCases = [
        { style: 'light', expected: 'light' },
        { style: 'medium', expected: 'medium' },
        { style: 'heavy', expected: 'heavy' },
      ];

      testCases.forEach(({ style, expected }) => {
        const { result } = renderHook(() =>
          usePressAnimation({
            enableHaptics: true,
            hapticStyle: style as any,
          })
        );

        act(() => {
          result.current.handlePressIn();
        });

        expect(mockImpactAsync).toHaveBeenCalledWith(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme scale ranges', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          scaleRange: [1, 0.1], // Very small pressed scale
        })
      );

      act(() => {
        result.current.handlePressIn();
      });

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        [1, 0.1],
        'clamp'
      );
    });

    it('should handle zero opacity ranges', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          opacityRange: [1, 0], // Fade to invisible
        })
      );

      act(() => {
        result.current.handlePressIn();
      });

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        [1, 0],
        'clamp'
      );
    });

    it('should handle very fast press/release cycles', () => {
      const { result } = renderHook(() => usePressAnimation());

      // Very rapid interactions
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.handlePressIn();
          result.current.handlePressOut();
        });
      }

      expect(mockWithSpring).toHaveBeenCalledTimes(20); // 10 press in + 10 press out
    });

    it('should handle component unmounting during animation', () => {
      const { result, unmount } = renderHook(() => usePressAnimation());

      act(() => {
        result.current.handlePressIn();
      });

      expect(result.current.isPressed).toBe(true);

      // Unmount during pressed state
      unmount();

      // Should not cause memory leaks (in real implementation)
      expect(mockSharedValue.set).toHaveBeenCalledWith(1);
    });

    it('should handle invalid animation configurations', () => {
      const { result } = renderHook(() =>
        usePressAnimation({
          animationConfig: {
            press: {
              damping: 0, // Invalid
              stiffness: -100, // Invalid
            },
          },
        })
      );

      // Should still work
      act(() => {
        result.current.handlePressIn();
      });

      expect(mockWithSpring).toHaveBeenCalled();
    });
  });
});
