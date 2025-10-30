/**
 * 🎬 UNIFIED MOTION SYSTEM
 * Single source of truth for all animations
 * Respects Reduce Motion and enforces consistent timing/easing
 * 
 * ⚠️ Uses foundation/motion tokens - single source of truth
 */

import { useEffect, useMemo } from 'react';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import { durations, easings, scales, getSpringConfig } from '@/foundation/motion';
import { useAnimationTelemetry } from '@/foundation/telemetry';

export type MotionPreset =
  | 'enterUp'
  | 'enterFade'
  | 'exitDown'
  | 'cardStagger'
  | 'press'
  | 'fabPop';

export interface MotionConfig {
  duration?: number;
  easing?: readonly [number, number, number, number];
  dy?: number;
  opacity?: number;
  stagger?: number;
  scaleFrom?: number;
  spring?: { damping: number; stiffness: number; mass: number };
}

export function useMotion(preset: MotionPreset): MotionConfig {
  const reduceMotion = useReduceMotion();
  const telemetry = useAnimationTelemetry(`motion-${preset}`, `useMotion(${preset})`);
  
  // Track animation start
  useEffect(() => {
    telemetry.start();
  }, [preset, telemetry]);

  const config: MotionConfig = useMemo((): MotionConfig => {
    switch (preset) {
      case 'enterUp':
        return {
          duration: durations.md,
          dy: 24,
          opacity: 0,
        };
      case 'enterFade':
        return {
          duration: durations.sm,
          opacity: 0,
        };
      case 'exitDown':
        return {
          duration: durations.sm,
          dy: 16,
          opacity: 0,
        };
      case 'cardStagger':
        return {
          duration: durations.md,
          dy: 16,
          opacity: 0,
          stagger: 60,
        };
      case 'press':
        return {
          scaleFrom: scales.pressed,
          spring: getSpringConfig('standard'),
        };
      case 'fabPop':
        return {
          scaleFrom: 0.8,
          spring: getSpringConfig('gentle'),
        };
    }
  }, [preset]);

  // Respect Reduce Motion
  if (reduceMotion) {
    if (config.duration !== undefined) {
      config.duration = durations.xs;
    }
    // Disable parallax effects
    if (config.dy !== undefined) {
      config.dy = 0;
    }
  }

  return config;
}

// Legacy Motion object for backwards compatibility
export const Motion = {
  time: durations,
  easing: {
    standard: easings.enter,
    emphasized: easings.emphasized,
    decel: easings.enter, // Legacy fallback
    accel: easings.exit,
  },
  spring: {
    card: getSpringConfig('gentle'),
    chip: getSpringConfig('standard'),
  },
};
