/**
 * 🎯 TACTILE PRESS SYSTEM 2.0
 * 
 * Global press feedback primitive with:
 * - Crisp 60-90ms downscale (0.98) + light haptic
 * - Release springs with tiny overshoot (1.02)
 * - Debounced haptics (one per 120ms window)
 * - Zero runOnJS in frame loop
 * - Reduced motion support
 * 
 * DoD: Zero runOnJS in frame loop; one haptic per 120ms window
 */

import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { haptic } from '@/foundation/haptics';
import { useReduceMotion } from './useReducedMotion';

interface PressFeedbackConfig {
  /** Scale value when pressed (default: 0.98) */
  pressedScale?: number;
  /** Scale value when released with overshoot (default: 1.02) */
  overshootScale?: number;
  /** Duration of press animation (default: 90ms) */
  pressDuration?: number;
  /** Spring config for release (default: damping: 15, stiffness: 300) */
  springConfig?: {
    damping: number;
    stiffness: number;
  };
  /** Whether to trigger haptic feedback (default: true) */
  hapticEnabled?: boolean;
}

const DEFAULT_CONFIG: Required<PressFeedbackConfig> = {
  pressedScale: 0.98,
  overshootScale: 1.02,
  pressDuration: 90,
  springConfig: {
    damping: 15,
    stiffness: 300,
  },
  hapticEnabled: true,
};

/**
 * Haptic debounce state (shared across all instances)
 */
let lastHapticTime = 0;
const HAPTIC_DEBOUNCE_MS = 120;

/**
 * Trigger haptic with debouncing
 */
function triggerDebouncedHaptic(): void {
  const now = Date.now();
  if (now - lastHapticTime >= HAPTIC_DEBOUNCE_MS) {
    haptic.tap();
    lastHapticTime = now;
  }
}

/**
 * Hook for tactile press feedback
 * 
 * @example
 * ```tsx
 * const { animatedStyle, handlePressIn, handlePressOut } = usePressFeedback();
 * 
 * <Pressable
 *   onPressIn={handlePressIn}
 *   onPressOut={handlePressOut}
 *   style={animatedStyle}
 * >
 *   <Button />
 * </Pressable>
 * ```
 */
export function usePressFeedback(config: PressFeedbackConfig = {}) {
  const reducedMotion = useReduceMotion();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);
  const hapticTriggered = useRef(false);

  // Animated style with scale transform
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Handle press in
  const handlePressIn = useCallback(() => {
    'worklet';
    if (reducedMotion) {
      scale.value = withTiming(mergedConfig.pressedScale, {
        duration: 60,
      });
      return;
    }

    isPressed.value = true;
    hapticTriggered.current = false;
    
    // Animate to pressed scale
    scale.value = withTiming(mergedConfig.pressedScale, {
      duration: mergedConfig.pressDuration,
    });

    // Trigger haptic after animation starts (not in frame loop)
    if (mergedConfig.hapticEnabled && !hapticTriggered.current) {
      hapticTriggered.current = true;
      runOnJS(triggerDebouncedHaptic)();
    }
  }, [reducedMotion, mergedConfig]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    'worklet';
    if (reducedMotion) {
      scale.value = withTiming(1, { duration: 60 });
      return;
    }

    isPressed.value = false;
    
    // Spring back with overshoot
    scale.value = withSpring(
      1,
      {
        damping: mergedConfig.springConfig.damping,
        stiffness: mergedConfig.springConfig.stiffness,
      },
      (finished) => {
        if (finished) {
          // Tiny overshoot then settle
          scale.value = withSpring(
            mergedConfig.overshootScale,
            {
              damping: 20,
              stiffness: 400,
            },
            () => {
              scale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
              });
            }
          );
        }
      }
    );
  }, [reducedMotion, mergedConfig]);

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
    scale,
  };
}

/**
 * Simplified hook for basic press feedback (no overshoot)
 */
export function useSimplePressFeedback() {
  return usePressFeedback({
    overshootScale: 1,
    springConfig: {
      damping: 20,
      stiffness: 350,
    },
  });
}

