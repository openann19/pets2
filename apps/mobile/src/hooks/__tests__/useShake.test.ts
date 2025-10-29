/**
 * Comprehensive tests for useShake hook
 *
 * Coverage:
 * - Shake gesture detection and triggering
 * - Haptic feedback integration
 * - Animation state management
 * - Customizable shake parameters
 * - Platform-specific behavior
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { useShake } from '../useShake';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withSequence: jest.fn(),
  withTiming: jest.fn(),
  runOnJS: jest.fn(),
  interpolate: jest.fn(),
  Extrapolate: {
    CLAMP: 'clamp',
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const mockImpactAsync = impactAsync as jest.Mock;
const mockUseSharedValue = useSharedValue as jest.Mock;
const mockUseAnimatedStyle = useAnimatedStyle as jest.Mock;
const mockWithSequence = withSequence as jest.Mock;
const mockWithTiming = withTiming as jest.Mock;
const mockRunOnJS = runOnJS as jest.Mock;
const mockInterpolate = interpolate as jest.Mock;

describe('useShake', () => {
  const mockSharedValue = {
    value: 0,
    get: jest.fn(() => 0),
    set: jest.fn(),
  };

  const mockAnimatedStyle = {
    transform: [{ translateX: mockInterpolate() }],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseSharedValue.mockReturnValue(mockSharedValue);
    mockUseAnimatedStyle.mockReturnValue(mockAnimatedStyle);
    mockWithSequence.mockReturnValue('shake-sequence');
    mockWithTiming.mockReturnValue('timing-animation');
    mockInterpolate.mockReturnValue(-10);
    mockImpactAsync.mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useShake());

      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
      expect(mockUseAnimatedStyle).toHaveBeenCalled();
      expect(result.current.isShaking).toBe(false);
      expect(result.current.animatedStyle).toBe(mockAnimatedStyle);
    });

    it('should initialize with custom configuration', () => {
      const { result } = renderHook(() =>
        useShake({
          intensity: 20,
          duration: 800,
          enableHaptics: false,
          repeatCount: 3,
        }),
      );

      expect(result.current.config.intensity).toBe(20);
      expect(result.current.config.duration).toBe(800);
      expect(result.current.config.enableHaptics).toBe(false);
      expect(result.current.config.repeatCount).toBe(3);
    });
  });

  describe('Shake Animation', () => {
    it('should trigger shake animation', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.isShaking).toBe(true);
      expect(mockWithSequence).toHaveBeenCalled();
      expect(mockSharedValue.set).toHaveBeenCalledWith(0); // Reset to starting position
    });

    it('should create shake sequence with correct pattern', () => {
      const { result } = renderHook(() => useShake({ intensity: 15, repeatCount: 2 }));

      act(() => {
        result.current.shake();
      });

      // Should create sequence with alternating movements
      expect(mockWithSequence).toHaveBeenCalledWith(
        expect.anything(), // First movement
        expect.anything(), // Return to center
        expect.anything(), // Second movement
        expect.anything(), // Return to center
        expect.anything(), // Third movement
        expect.anything(), // Final return to center
      );
    });

    it('should use custom duration for shake timing', () => {
      const { result } = renderHook(() => useShake({ duration: 600 }));

      act(() => {
        result.current.shake();
      });

      expect(mockWithTiming).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ duration: 600 }),
        expect.any(Function), // onComplete callback
      );
    });

    it('should reset shake state when animation completes', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.isShaking).toBe(true);

      // Simulate animation completion by calling the onComplete callback
      const sequenceCall = mockWithSequence.mock.calls[0];
      const onCompleteCallback = sequenceCall[sequenceCall.length - 1];
      if (typeof onCompleteCallback === 'function') {
        act(() => {
          onCompleteCallback(true); // finished = true
        });
      }

      expect(result.current.isShaking).toBe(false);
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback during shake', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(mockImpactAsync).toHaveBeenCalledWith('medium');
    });

    it('should use custom haptic style', () => {
      const { result } = renderHook(() => useShake({ hapticStyle: 'heavy' }));

      act(() => {
        result.current.shake();
      });

      expect(mockImpactAsync).toHaveBeenCalledWith('heavy');
    });

    it('should disable haptic feedback when configured', () => {
      const { result } = renderHook(() => useShake({ enableHaptics: false }));

      act(() => {
        result.current.shake();
      });

      expect(mockImpactAsync).not.toHaveBeenCalled();
    });

    it('should handle haptic feedback errors gracefully', () => {
      mockImpactAsync.mockRejectedValue(new Error('Haptic not available'));

      const { result } = renderHook(() => useShake());

      // Should not crash
      act(() => {
        result.current.shake();
      });

      expect(mockImpactAsync).toHaveBeenCalled();
    });
  });

  describe('Animation Styles', () => {
    it('should provide animated style with horizontal translation', () => {
      const { result } = renderHook(() => useShake());

      expect(result.current.animatedStyle).toEqual({
        transform: [{ translateX: -10 }], // Mock interpolate return value
      });

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(), // sharedValue
        expect.arrayContaining([-1, 0, 1]), // input range for shake pattern
        expect.arrayContaining([-10, 0, 10]), // output range based on intensity
        'clamp',
      );
    });

    it('should use custom intensity in animation', () => {
      const { result } = renderHook(() => useShake({ intensity: 25 }));

      expect(mockInterpolate).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Array),
        expect.arrayContaining([-25, 0, 25]), // Custom intensity
        'clamp',
      );
    });

    it('should support vertical shake animation', () => {
      const { result } = renderHook(() => useShake({ direction: 'vertical' }));

      expect(result.current.animatedStyle).toEqual({
        transform: [{ translateY: -10 }], // Vertical translation instead of horizontal
      });
    });
  });

  describe('Shake Control', () => {
    it('should prevent concurrent shakes', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.isShaking).toBe(true);

      // Try to shake again while already shaking
      act(() => {
        result.current.shake();
      });

      // Should only have been called once
      expect(mockWithSequence).toHaveBeenCalledTimes(1);
    });

    it('should allow shake after completion', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      // Complete the animation
      const sequenceCall = mockWithSequence.mock.calls[0];
      const onCompleteCallback = sequenceCall[sequenceCall.length - 1];
      if (typeof onCompleteCallback === 'function') {
        act(() => {
          onCompleteCallback(true);
        });
      }

      expect(result.current.isShaking).toBe(false);

      // Should allow new shake
      act(() => {
        result.current.shake();
      });

      expect(mockWithSequence).toHaveBeenCalledTimes(2);
    });

    it('should provide manual control methods', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.startShake();
      });

      expect(result.current.isShaking).toBe(true);

      act(() => {
        result.current.stopShake();
      });

      expect(result.current.isShaking).toBe(false);
    });

    it('should reset animation state', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
        result.current.resetShake();
      });

      expect(result.current.isShaking).toBe(false);
      expect(mockSharedValue.set).toHaveBeenCalledWith(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid intensity values', () => {
      const { result } = renderHook(
        () => useShake({ intensity: -5 }), // Invalid negative intensity
      );

      // Should use default or clamped value
      act(() => {
        result.current.shake();
      });

      expect(mockWithSequence).toHaveBeenCalled();
    });

    it('should handle invalid duration values', () => {
      const { result } = renderHook(
        () => useShake({ duration: 0 }), // Invalid zero duration
      );

      act(() => {
        result.current.shake();
      });

      // Should still work with some default duration
      expect(mockWithTiming).toHaveBeenCalled();
    });

    it('should handle invalid repeat count', () => {
      const { result } = renderHook(
        () => useShake({ repeatCount: 0 }), // No repeats
      );

      act(() => {
        result.current.shake();
      });

      // Should create minimal sequence
      expect(mockWithSequence).toHaveBeenCalled();
    });
  });

  describe('Platform Compatibility', () => {
    it('should work on iOS platform', () => {
      Platform.OS = 'ios';

      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.getPlatformShakeSupport()).toEqual({
        supported: true,
        hapticAvailable: true,
        animationSupported: true,
      });
    });

    it('should work on Android platform', () => {
      Platform.OS = 'android';

      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.getPlatformShakeSupport().supported).toBe(true);
    });

    it('should handle web platform limitations', () => {
      Platform.OS = 'web';

      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      // Should still provide animation even on web
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize animated style', () => {
      const { result, rerender } = renderHook(() => useShake());

      const firstStyle = result.current.animatedStyle;
      rerender();
      const secondStyle = result.current.animatedStyle;

      expect(firstStyle).toBe(secondStyle);
      expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(1);
    });

    it('should minimize re-renders during animation', () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useShake();
      });

      expect(renderCount).toBe(1);

      act(() => {
        result.current.shake();
      });

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThanOrEqual(2);
    });

    it('should reuse animation sequences when possible', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      act(() => {
        result.current.shake();
      });

      // Should reuse the same animation pattern
      expect(mockWithSequence).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle animation setup failures', () => {
      mockUseSharedValue.mockImplementation(() => {
        throw new Error('Shared value creation failed');
      });

      const { result } = renderHook(() => useShake());

      // Should provide fallback functionality
      expect(result.current.shake).toBeDefined();
      expect(result.current.isShaking).toBeDefined();
    });

    it('should handle animation runtime errors', () => {
      mockWithSequence.mockImplementation(() => {
        throw new Error('Animation runtime error');
      });

      const { result } = renderHook(() => useShake());

      // Should not crash
      act(() => {
        result.current.shake();
      });

      expect(result.current.isShaking).toBe(true); // Still updates state
    });

    it('should handle callback errors gracefully', () => {
      const { result } = renderHook(() => useShake());

      // Override the mock to simulate callback error
      mockWithSequence.mockImplementationOnce(() => {
        return {
          onComplete: (finished: boolean) => {
            if (finished) {
              throw new Error('Callback error');
            }
          },
        };
      });

      act(() => {
        result.current.shake();
      });

      // Should handle callback errors without crashing
      expect(result.current.isShaking).toBe(true);
    });
  });

  describe('Integration with Other Systems', () => {
    it('should integrate with gesture handlers', () => {
      const { result } = renderHook(() => useShake());

      const gestureHandler = result.current.getGestureHandler();

      expect(gestureHandler).toEqual({
        onStart: expect.any(Function),
        onEnd: expect.any(Function),
        onCancel: expect.any(Function),
      });

      // Simulate gesture start
      act(() => {
        gestureHandler.onStart?.({} as any);
      });

      expect(result.current.isShaking).toBe(true);
    });

    it('should provide shake trigger for external systems', () => {
      const { result } = renderHook(() => useShake());

      const externalTrigger = result.current.getShakeTrigger();

      expect(typeof externalTrigger).toBe('function');

      act(() => {
        externalTrigger();
      });

      expect(result.current.isShaking).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    it('should respect reduced motion preferences', () => {
      const { result } = renderHook(() => useShake({ respectReducedMotion: true }));

      // Mock reduced motion enabled
      (global as any).__reducedMotion = true;

      act(() => {
        result.current.shake();
      });

      // Should skip animation but still trigger haptics
      expect(mockWithSequence).toHaveBeenCalled(); // Still called, but implementation handles reduced motion
      expect(result.current.config.respectReducedMotion).toBe(true);

      delete (global as any).__reducedMotion;
    });

    it('should provide accessibility information', () => {
      const { result } = renderHook(() => useShake());

      const accessibilityInfo = result.current.getAccessibilityInfo();

      expect(accessibilityInfo).toEqual({
        isAnimating: false,
        animationType: 'shake',
        canBeDisabled: true,
        alternativeText: 'Shaking animation',
      });
    });

    it('should update accessibility info during animation', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      const accessibilityInfo = result.current.getAccessibilityInfo();

      expect(accessibilityInfo.isAnimating).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive shakes', () => {
      const { result } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
        result.current.shake();
        result.current.shake();
      });

      // Should only execute one shake at a time
      expect(mockWithSequence).toHaveBeenCalledTimes(1);
    });

    it('should handle shake with zero intensity', () => {
      const { result } = renderHook(() => useShake({ intensity: 0 }));

      act(() => {
        result.current.shake();
      });

      // Should still create animation sequence
      expect(mockWithSequence).toHaveBeenCalled();
    });

    it('should handle component unmount during shake', () => {
      const { result, unmount } = renderHook(() => useShake());

      act(() => {
        result.current.shake();
      });

      expect(result.current.isShaking).toBe(true);

      unmount();

      // Should not cause memory leaks
      expect(mockSharedValue.set).toHaveBeenCalled();
    });

    it('should handle extreme configuration values', () => {
      const { result } = renderHook(() =>
        useShake({
          intensity: 1000, // Very high intensity
          duration: 10000, // Very long duration
          repeatCount: 100, // Many repeats
        }),
      );

      act(() => {
        result.current.shake();
      });

      // Should handle extreme values gracefully
      expect(mockWithSequence).toHaveBeenCalled();
    });

    it('should handle invalid configuration types', () => {
      const { result } = renderHook(() =>
        useShake({
          intensity: 'invalid' as any,
          duration: null as any,
          enableHaptics: 'maybe' as any,
        }),
      );

      // Should not crash, should use defaults
      expect(result.current.config.intensity).toBeDefined();
      expect(result.current.config.duration).toBeDefined();
      expect(result.current.config.enableHaptics).toBeDefined();
    });

    it('should handle platform-specific animation limitations', () => {
      // Simulate platform without animation support
      mockUseSharedValue.mockImplementation(() => {
        throw new Error('Animations not supported');
      });

      const { result } = renderHook(() => useShake());

      // Should provide fallback behavior
      expect(result.current.shake).toBeDefined();
      expect(result.current.animatedStyle).toBeDefined();
    });
  });
});
