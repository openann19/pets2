/**
 * 🎬 UNIFIED MOTION SYSTEM
 * Single source of truth for all animations
 * Respects Reduce Motion and enforces consistent timing/easing
 */

import { Easing } from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Motion = {
  // Times tuned for 60fps and our brand feel
  time: { 
    xs: 120, 
    sm: 180, 
    md: 240, 
    lg: 320 
  },
  // Easing curves
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.2, 0, 0, 1),
    decel: Easing.bezier(0, 0, 0.2, 1),
    accel: Easing.bezier(0.3, 0, 1, 1),
  },
  // Springs for gestures / cards
  spring: {
    card: { damping: 18, stiffness: 220, mass: 1 },
    chip: { damping: 16, stiffness: 260, mass: 0.9 },
  },
};

export type MotionPreset =
  | 'enterUp' 
  | 'enterFade' 
  | 'exitDown'
  | 'cardStagger' 
  | 'press'
  | 'fabPop';

export interface MotionConfig {
  duration: number;
  easing: typeof Easing.bezier;
  dy?: number;
  opacity?: number;
  stagger?: number;
  scaleFrom?: number;
  spring?: typeof Motion.spring.card;
}

export function useMotion(preset: MotionPreset): MotionConfig {
  const reduceMotion = useReducedMotion();

  const config: MotionConfig = (() => {
    switch (preset) {
      case 'enterUp':
        return { 
          duration: Motion.time.md, 
          easing: Motion.easing.emphasized, 
          dy: 24, 
          opacity: 0 
        };
      case 'enterFade':
        return { 
          duration: Motion.time.sm, 
          easing: Motion.easing.standard, 
          opacity: 0 
        };
      case 'exitDown':
        return { 
          duration: Motion.time.sm, 
          easing: Motion.easing.accel, 
          dy: 16, 
          opacity: 0 
        };
      case 'cardStagger':
        return { 
          duration: Motion.time.md, 
          easing: Motion.easing.emphasized, 
          dy: 16, 
          opacity: 0, 
          stagger: 60 
        };
      case 'press':
        return { 
          scaleFrom: 0.98, 
          spring: Motion.spring.chip 
        };
      case 'fabPop':
        return { 
          scaleFrom: 0.8, 
          spring: Motion.spring.card 
        };
    }
  })();

  // Respect Reduce Motion
  if (reduceMotion) {
    config.duration = Motion.time.xs;
    // Disable parallax effects
    if (config.dy) {
      config.dy = 0;
    }
  }

  return config;
}

export { Motion };

