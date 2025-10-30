/**
 * 🎬 MOTION TOKENS
 * 
 * ⚠️ DEPRECATED: This file is a re-export for backwards compatibility.
 * Import from '@foundation/motion' or '@/foundation' instead.
 * 
 * This file will be removed in a future version.
 */

// Re-export from foundation (single source of truth)
export {
  durations as motionDurations,
  durations,
  easings,
  scales as motionScale,
  scales,
  motionOpacity,
  springs as motionSpring,
  springs,
  motionTokens as motion,
  motionTokens,
  getEasingArray,
  getSpringConfig,
  type MotionDuration,
  type MotionEasing,
  type MotionScale,
  type MotionOpacity,
  type MotionSpring,
} from '@/foundation/motion';

// Legacy easing arrays for backwards compatibility
import { easings } from '@/foundation/motion';

export const motionEasing = {
  standard: easings.enter,
  emphasized: easings.emphasized,
  decel: [0, 0, 0.2, 1] as const,
  accel: [0.3, 0, 1, 1] as const,
  standardArray: easings.enter,
  emphasizedArray: easings.emphasized,
  decelArray: [0, 0, 0.2, 1] as const,
  accelArray: [0.3, 0, 1, 1] as const,
} as const;
