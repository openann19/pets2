/**
 * 🧪 COMPREHENSIVE TESTS FOR MOMENTUM ANIMATION HOOK
 * 
 * Tests for useMomentumAnimation hook
 * Coverage: ≥75% target
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { useMomentumAnimation } from '@/hooks/animations/useMomentumAnimation';
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
    withDecay: jest.fn((config: any) => ({ value: config.velocity || 0 })),
  };
});

// Mock useReduceMotion
jest.mock('@/hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
}));

describe('useMomentumAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
      expect(result.current.position).toBeDefined();
    });

    it('should accept custom friction', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          friction: 0.98,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should accept clamp values', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          clamp: [0, 1000],
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Decay-Based Momentum', () => {
    it('should use decay animation by default', () => {
      const { useSharedValue, withDecay } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          useSpring: false,
        })
      );

      expect(withDecay).toHaveBeenCalled();
    });

    it('should apply friction to decay', () => {
      const { withDecay } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          friction: 0.95,
          useSpring: false,
        })
      );

      expect(withDecay).toHaveBeenCalledWith(
        expect.objectContaining({
          deceleration: 0.95,
        })
      );
    });

    it('should apply clamp to decay', () => {
      const { withDecay } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          clamp: [0, 1000],
          useSpring: false,
        })
      );

      expect(withDecay).toHaveBeenCalledWith(
        expect.objectContaining({
          clamp: [0, 1000],
        })
      );
    });
  });

  describe('Spring-Based Momentum', () => {
    it('should use spring animation when useSpring is true', () => {
      const { withSpring } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          useSpring: true,
        })
      );

      expect(withSpring).toHaveBeenCalled();
    });

    it('should use custom spring config', () => {
      const { withSpring } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          useSpring: true,
          springConfig: springs.bouncy,
        })
      );

      expect(withSpring).toHaveBeenCalled();
    });

    it('should convert velocity to spring animation', () => {
      const { withSpring } = require('react-native-reanimated');

      renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 500,
          useSpring: true,
        })
      );

      expect(withSpring).toHaveBeenCalled();
    });
  });

  describe('Velocity Handling', () => {
    it('should handle positive velocity', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 500,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should handle negative velocity', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: -500,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should handle zero velocity', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 0,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should handle high velocity', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 5000,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should handle reduced motion preference', () => {
      const { useReduceMotion } = require('@/hooks/useReducedMotion');
      useReduceMotion.mockReturnValue(true);

      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle velocity updates', () => {
      const { result, rerender } = renderHook(
        ({ velocity }) =>
          useMomentumAnimation({
            initialVelocity: velocity,
          }),
        {
          initialProps: { velocity: 100 },
        }
      );

      expect(result.current.animatedStyle).toBeDefined();

      rerender({ velocity: 200 });

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should handle extreme friction values', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          friction: 0.99,
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });

    it('should handle negative clamp values', () => {
      const { result } = renderHook(() =>
        useMomentumAnimation({
          initialVelocity: 100,
          clamp: [-1000, 1000],
        })
      );

      expect(result.current.animatedStyle).toBeDefined();
    });
  });
});

describe('velocityToSpring', () => {
  it('should export velocityToSpring helper', () => {
    const { velocityToSpring } = require('@/hooks/animations/useMomentumAnimation');
    expect(velocityToSpring).toBeDefined();
    expect(typeof velocityToSpring).toBe('function');
  });

  it('should convert velocity to spring config', () => {
    const { velocityToSpring } = require('@/hooks/animations/useMomentumAnimation');
    const config = velocityToSpring(500);
    expect(config).toBeDefined();
    expect(config).toHaveProperty('stiffness');
    expect(config).toHaveProperty('damping');
  });
});

