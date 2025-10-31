/**
 * 🎨 ENHANCED ANIMATION VARIANTS SYSTEM
 * Expanded animation variants for premium personality across the app
 * Includes shimmer, pulse, wave, particle effects, and more
 */

import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import { springs } from '@/foundation/motion';

export type AnimationVariant =
  | 'shimmer'
  | 'pulse'
  | 'wave'
  | 'glow'
  | 'bounce'
  | 'elastic'
  | 'particle'
  | 'stagger'
  | 'countUp';

export interface UseEnhancedVariantOptions {
  variant: AnimationVariant;
  enabled?: boolean;
  duration?: number;
  delay?: number;
  intensity?: number;
  /** Color for animations (should use theme.colors.primary or other semantic colors) */
  color?: string;
  haptic?: boolean;
  onComplete?: () => void;
}

/**
 * Shimmer effect - sliding highlight animation
 */
function useShimmerVariant(
  enabled: boolean,
  duration: number,
  _color: string,
  intensity: number,
) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [enabled, duration]);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, intensity * 0.8, 0],
      Extrapolate.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [-100, 100],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return { shimmerStyle, progress };
}

/**
 * Pulse effect - rhythmic scale animation
 */
function usePulseVariant(
  enabled: boolean,
  duration: number,
  intensity: number,
) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!enabled) return;

    scale.value = withRepeat(
      withSequence(
        withTiming(1 + intensity * 0.1, { duration: duration / 2 }),
        withTiming(1, { duration: duration / 2 }),
      ),
      -1,
      true,
    );
  }, [enabled, duration, intensity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { pulseStyle, scale };
}

/**
 * Wave effect - cascading animation
 */
function useWaveVariant(
  enabled: boolean,
  duration: number,
  intensity: number,
) {
  const waveProgress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!enabled) return;

    waveProgress.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(intensity, { duration: duration / 4 }),
        withTiming(0.3, { duration: duration / 4 }),
        withTiming(intensity, { duration: duration / 4 }),
        withTiming(0.3, { duration: duration / 4 }),
      ),
      -1,
      true,
    );
  }, [enabled, duration, intensity]);

  const waveStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      waveProgress.value,
      [0, 0.5, 1],
      [0, -intensity * 10, 0],
      Extrapolate.CLAMP,
    );

    return {
      opacity: opacity.value,
      transform: [{ translateY }],
    };
  });

  return { waveStyle, waveProgress, opacity };
}

/**
 * Glow effect - pulsing shadow/glow
 */
function useGlowVariant(
  enabled: boolean,
  duration: number,
  color: string,
  intensity: number,
) {
  const glowOpacity = useSharedValue(0.3);
  const glowRadius = useSharedValue(8);

  useEffect(() => {
    if (!enabled) return;

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3 + intensity * 0.4, { duration: duration / 2 }),
        withTiming(0.3, { duration: duration / 2 }),
      ),
      -1,
      true,
    );

    glowRadius.value = withRepeat(
      withSequence(
        withTiming(8 + intensity * 8, { duration: duration / 2 }),
        withTiming(8, { duration: duration / 2 }),
      ),
      -1,
      true,
    );
  }, [enabled, duration, intensity]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOpacity: glowOpacity.value,
    shadowRadius: glowRadius.value,
    shadowOffset: { width: 0, height: 4 },
    elevation: glowRadius.value,
  }));

  return { glowStyle, glowOpacity, glowRadius };
}

/**
 * Bounce effect - playful bounce animation
 */
function useBounceVariant(
  enabled: boolean,
  duration: number,
  intensity: number,
) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    translateY.value = withRepeat(
      withSequence(
        withSpring(-intensity * 8, springs.bouncy),
        withSpring(0, springs.bouncy),
      ),
      -1,
      false,
    );
  }, [enabled, duration, intensity]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { bounceStyle, translateY };
}

/**
 * Elastic effect - rubber-like stretch
 */
function useElasticVariant(
  enabled: boolean,
  duration: number,
  intensity: number,
) {
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    if (!enabled) return;

    scaleX.value = withRepeat(
      withSequence(
        withSpring(1 + intensity * 0.1, springs.wobbly),
        withSpring(1 - intensity * 0.05, springs.wobbly),
        withSpring(1, springs.wobbly),
      ),
      -1,
      true,
    );

    scaleY.value = withRepeat(
      withSequence(
        withSpring(1 - intensity * 0.05, springs.wobbly),
        withSpring(1 + intensity * 0.1, springs.wobbly),
        withSpring(1, springs.wobbly),
      ),
      -1,
      true,
    );
  }, [enabled, duration, intensity]);

  const elasticStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }, { scaleY: scaleY.value }],
  }));

  return { elasticStyle, scaleX, scaleY };
}

/**
 * Count-up animation for numbers
 */
function useCountUpVariant(
  enabled: boolean,
  duration: number,
  targetValue: number,
  onComplete?: () => void,
) {
  const count = useSharedValue(0);
  const isComplete = useRef(false);

  useEffect(() => {
    if (!enabled || isComplete.current) return;

    count.value = withTiming(
      targetValue,
      {
        duration,
      },
      (finished) => {
        if (finished && !isComplete.current && onComplete) {
          isComplete.current = true;
          runOnJS(onComplete)();
        }
      },
    );
  }, [enabled, duration, targetValue, onComplete]);

  const getDisplayValue = () => {
    'worklet';
    return Math.round(count.value);
  };

  return { count, getDisplayValue };
}

/**
 * Main hook - Enhanced Animation Variants
 */
export function useEnhancedVariants(options: UseEnhancedVariantOptions) {
  const {
    variant,
    enabled = true,
    duration = 2000,
    delay = 0,
    intensity = 1,
    color = '#EC4899',
    haptic = false,
    onComplete,
  } = options;

  const reducedMotion = useReduceMotion();
  const effectiveEnabled = enabled && !reducedMotion;

  // Trigger haptic once on mount if enabled
  useEffect(() => {
    if (haptic && effectiveEnabled) {
      const timer = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [haptic, effectiveEnabled, delay]);

  const shimmer = useShimmerVariant(
    variant === 'shimmer' && effectiveEnabled,
    duration,
    color,
    intensity,
  );

  const pulse = usePulseVariant(
    variant === 'pulse' && effectiveEnabled,
    duration,
    intensity,
  );

  const wave = useWaveVariant(
    variant === 'wave' && effectiveEnabled,
    duration,
    intensity,
  );

  const glow = useGlowVariant(
    variant === 'glow' && effectiveEnabled,
    duration,
    color,
    intensity,
  );

  const bounce = useBounceVariant(
    variant === 'bounce' && effectiveEnabled,
    duration,
    intensity,
  );

  const elastic = useElasticVariant(
    variant === 'elastic' && effectiveEnabled,
    duration,
    intensity,
  );

  // Combine all animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      ...(shimmer.shimmerStyle || {}),
      ...(pulse.pulseStyle || {}),
      ...(wave.waveStyle || {}),
      ...(glow.glowStyle || {}),
      ...(bounce.bounceStyle || {}),
      ...(elastic.elasticStyle || {}),
    };
  });

  return {
    animatedStyle,
    shimmer,
    pulse,
    wave,
    glow,
    bounce,
    elastic,
  };
}

/**
 * Hook specifically for count-up animations
 */
export function useCountUpAnimation(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true,
  onComplete?: () => void,
) {
  const { count, getDisplayValue } = useCountUpVariant(
    enabled,
    duration,
    targetValue,
    onComplete,
  );

  const displayStyle = useAnimatedStyle(() => ({
    opacity: count.value > 0 ? 1 : 0,
  }));

  return {
    count,
    displayStyle,
    getDisplayValue,
  };
}

export default useEnhancedVariants;

