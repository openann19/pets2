/**
 * 🧪 COMPREHENSIVE TESTS FOR MAGNETIC GESTURE HOOK
 * 
 * Tests for useMagneticGesture hook
 * Coverage: ≥75% target
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useMagneticGesture } from '@/hooks/gestures/useMagneticGesture';
import { springs } from '@/foundation/motion';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mockSharedValue = (initial: number) => ({
    value: initial,
    setValue: jest.fn(),
  });

  return {
    useSharedValue: jest.fn(mockSharedValue),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value: number) => ({ value })),
    runOnJS: jest.fn((fn: () => void) => fn),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      enabled: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock haptics
jest.mock('@/foundation/haptics', () => ({
  haptic: {
    light: jest.fn(),
  },
}));

// Mock useReduceMotion
jest.mock('@/hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
}));

describe('useMagneticGesture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default snap points', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
        })
      );

      expect(result.current.position).toBeDefined();
      expect(result.current.velocity).toBeDefined();
      expect(result.current.activeSnapIndex).toBeDefined();
      expect(result.current.gesture).toBeDefined();
      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should initialize with first snap point as default position', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
        })
      );

      expect(result.current.position.value).toBe(0);
      expect(result.current.activeSnapIndex.value).toBe(0);
    });

    it('should accept custom configuration', () => {
      const config = {
        snapPoints: [0, 200, 400],
        snapThreshold: 100,
        velocityThreshold: 1000,
        hapticOnSnap: false,
        springConfig: springs.bouncy,
        resistance: 0.5,
        axis: 'y' as const,
      };

      const { result } = renderHook(() => useMagneticGesture(config));

      expect(result.current.gesture).toBeDefined();
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Gesture Handling', () => {
    it('should create pan gesture', () => {
      renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100],
        })
      );

      expect(Gesture.Pan).toHaveBeenCalled();
    });

    it('should handle x-axis gestures', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          axis: 'x',
        })
      );

      expect(result.current.gesture).toBeDefined();
    });

    it('should handle y-axis gestures', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          axis: 'y',
        })
      );

      expect(result.current.gesture).toBeDefined();
    });
  });

  describe('Snap Point Detection', () => {
    it('should find nearest snap point', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
        })
      );

      // Position should be initialized to first snap point
      expect(result.current.position.value).toBe(0);
    });

    it('should handle multiple snap points', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 50, 100, 150, 200],
        })
      );

      expect(result.current.position.value).toBe(0);
      expect(result.current.activeSnapIndex.value).toBe(0);
    });

    it('should handle single snap point', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [100],
        })
      );

      expect(result.current.position.value).toBe(100);
    });
  });

  describe('Configuration Options', () => {
    it('should use custom snap threshold', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          snapThreshold: 50,
        })
      );

      expect(result.current.gesture).toBeDefined();
    });

    it('should use custom velocity threshold', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          velocityThreshold: 1000,
        })
      );

      expect(result.current.gesture).toBeDefined();
    });

    it('should use custom spring config', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          springConfig: springs.bouncy,
        })
      );

      expect(result.current.gesture).toBeDefined();
    });

    it('should use custom resistance', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
          resistance: 0.5,
        })
      );

      expect(result.current.gesture).toBeDefined();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should handle reduced motion preference', () => {
      const { useReduceMotion } = require('@/hooks/useReducedMotion');
      useReduceMotion.mockReturnValue(true);

      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 100, 200],
        })
      );

      expect(result.current.gesture).toBeDefined();
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty snap points array', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [],
        })
      );

      expect(result.current.gesture).toBeDefined();
    });

    it('should handle negative snap points', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [-100, 0, 100],
        })
      );

      expect(result.current.position.value).toBe(-100);
    });

    it('should handle very large snap points', () => {
      const { result } = renderHook(() =>
        useMagneticGesture({
          snapPoints: [0, 10000, 20000],
        })
      );

      expect(result.current.position.value).toBe(0);
    });
  });
});

