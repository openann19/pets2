/**
 * PROJECT HYPERION: UNIFIED ANIMATION HOOKS
 *
 * Centralized animation system using react-native-reanimated exclusively.
 * Replaces all legacy Animated API usage with performant, UI-thread animations.
 *
 * Features:
 * - All animations run on UI thread for 60fps performance
 * - Consistent spring physics across the app
 * - Accessibility-aware (respects reduced motion)
 * - Composable and reusable hooks
 */

import { useEffect, useCallback, useState } from "react";
import { Dimensions, AccessibilityInfo } from "react-native";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// === ACCESSIBILITY AWARE ANIMATION CONFIG ===
let prefersReducedMotion = false;

// Initialize reduced motion preference
AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
  prefersReducedMotion = isEnabled;
});

// === SPRING CONFIGURATIONS ===
const SPRING_CONFIGS = {
  standard: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
  },
  gentle: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
  snappy: {
    damping: 15,
    stiffness: 500,
    mass: 0.6,
  },
  bouncy: {
    damping: 10,
    stiffness: 600,
    mass: 0.5,
  },
};

const TIMING_CONFIGS = {
  fast: 150,
  standard: 300,
  slow: 500,
};

// === 1. SPRING ANIMATION HOOK ===
interface UseSpringAnimationReturn {
  value: ReturnType<typeof useSharedValue<number>>;
  animate: (
    toValue: number,
    customConfig?: Partial<typeof SPRING_CONFIGS.standard>,
  ) => void;
  reset: () => void;
}

export function useSpringAnimation(
  initialValue: number = 0,
  config: keyof typeof SPRING_CONFIGS = "standard",
): UseSpringAnimationReturn {
  const animatedValue = useSharedValue(initialValue);

  const animate = useCallback(
    (
      toValue: number,
      customConfig?: Partial<typeof SPRING_CONFIGS.standard>,
    ) => {
      const springConfig = {
        ...SPRING_CONFIGS[config],
        ...customConfig,
      };

      // Respect reduced motion preference
      if (prefersReducedMotion) {
        animatedValue.value = withTiming(toValue, {
          duration: TIMING_CONFIGS.standard,
        });
      } else {
        animatedValue.value = withSpring(toValue, springConfig);
      }
    },
    [animatedValue, config],
  );

  const reset = useCallback(() => {
    animatedValue.value = withSpring(initialValue, SPRING_CONFIGS[config]);
  }, [animatedValue, initialValue, config]);

  return {
    value: animatedValue,
    animate,
    reset,
  };
}

interface UseEntranceAnimationReturn {
  start: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

// === 2. ENTRANCE ANIMATION HOOK ===
export function useEntranceAnimation(
  type:
    | "fadeInUp"
    | "scaleIn"
    | "slideInLeft"
    | "slideInRight"
    | "fadeIn" = "fadeInUp",
  delay: number = 0,
  config: keyof typeof SPRING_CONFIGS = "standard",
): UseEntranceAnimationReturn {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const start = useCallback(() => {
    const springConfig = SPRING_CONFIGS[config];

    if (prefersReducedMotion) {
      opacity.value = withTiming(1, { duration: TIMING_CONFIGS.standard });
      return;
    }

    switch (type) {
      case "fadeInUp":
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateY.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case "scaleIn":
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        scale.value = withDelay(delay, withSpring(1, springConfig));
        break;
      case "slideInLeft":
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateX.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case "slideInRight":
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateX.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case "fadeIn":
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        break;
    }
  }, [type, delay, config, opacity, translateX, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const initialValues = {
      fadeInUp: { translateY: 30, translateX: 0, scale: 1 },
      scaleIn: { translateY: 0, translateX: 0, scale: 0.8 },
      slideInLeft: { translateY: 0, translateX: -50, scale: 1 },
      slideInRight: { translateY: 0, translateX: 50, scale: 1 },
      fadeIn: { translateY: 0, translateX: 0, scale: 1 },
    };

    const initial = initialValues[type];

    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value + initial.translateX },
        { translateY: translateY.value + initial.translateY },
        { scale: scale.value * initial.scale },
      ] as const,
    };
  });

  return {
    start,
    animatedStyle,
  };
}

interface UseSwipeGestureReturn {
  gestureHandler: ReturnType<typeof useAnimatedGestureHandler>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  translateX: ReturnType<typeof useSharedValue<number>>;
  translateY: ReturnType<typeof useSharedValue<number>>;
}

// === 3. SWIPE GESTURE HOOK ===
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  threshold: number = 120,
): UseSwipeGestureReturn {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Optional: Add haptic feedback on start
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      // Determine swipe direction
      if (absX > threshold && absX > absY) {
        // Horizontal swipe
        if (translationX > 0) {
          // Swipe right
          translateX.value = withTiming(SCREEN_WIDTH + 100, {
            duration: TIMING_CONFIGS.standard,
          });
          opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
          if (onSwipeRight) runOnJS(onSwipeRight)();
        } else {
          // Swipe left
          translateX.value = withTiming(-SCREEN_WIDTH - 100, {
            duration: TIMING_CONFIGS.standard,
          });
          opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
        }
      } else if (absY > threshold && translationY < 0) {
        // Swipe up
        translateY.value = withTiming(-SCREEN_HEIGHT - 100, {
          duration: TIMING_CONFIGS.standard,
        });
        opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
        if (onSwipeUp) runOnJS(onSwipeUp)();
      } else {
        // Return to center
        translateX.value = withSpring(0, SPRING_CONFIGS.standard);
        translateY.value = withSpring(0, SPRING_CONFIGS.standard);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ] as const,
      opacity: opacity.value,
    };
  });

  return {
    gestureHandler,
    animatedStyle,
    translateX,
    translateY,
  };
}

interface UsePressAnimationReturn {
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

// === 4. PRESS ANIMATION HOOK ===
export function usePressAnimation(
  config: keyof typeof SPRING_CONFIGS = "snappy",
): UsePressAnimationReturn {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (prefersReducedMotion) return;

    scale.value = withSpring(0.96, SPRING_CONFIGS[config]);
    opacity.value = withSpring(0.8, SPRING_CONFIGS[config]);
  }, [scale, opacity, config]);

  const handlePressOut = useCallback(() => {
    if (prefersReducedMotion) return;

    scale.value = withSpring(1, SPRING_CONFIGS[config]);
    opacity.value = withSpring(1, SPRING_CONFIGS[config]);
  }, [scale, opacity, config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return {
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
}

interface UseGlowAnimationReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

// === 5. GLOW ANIMATION HOOK ===
export function useGlowAnimation(
  color: string = "#ec4899",
  intensity: number = 1,
  duration: number = 2000,
): UseGlowAnimationReturn {
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      glowIntensity.value = withSequence(
        withTiming(intensity, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 }),
      );
    };

    const interval = setInterval(animate, duration);
    animate(); // Start immediately

    return () => {
      clearInterval(interval);
    };
  }, [glowIntensity, intensity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(
      glowIntensity.value,
      [0, 1],
      [0.1, 0.8],
      Extrapolate.CLAMP,
    ),
    shadowRadius: interpolate(
      glowIntensity.value,
      [0, 1],
      [4, 16],
      Extrapolate.CLAMP,
    ),
    elevation: interpolate(
      glowIntensity.value,
      [0, 1],
      [2, 12],
      Extrapolate.CLAMP,
    ),
  }));

  return {
    animatedStyle,
  };
}

interface UseMagneticEffectReturn {
  handleTouchStart: (
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
  ) => void;
  handleTouchEnd: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

// === 6. MAGNETIC EFFECT HOOK ===
export function useMagneticEffect(
  sensitivity: number = 0.3,
  maxDistance: number = 30,
): UseMagneticEffectReturn {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleTouchStart = useCallback(
    (touchX: number, touchY: number, centerX: number, centerY: number) => {
      if (prefersReducedMotion) return;

      const deltaX = touchX - centerX;
      const deltaY = touchY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        translateX.value = withSpring(
          deltaX * sensitivity,
          SPRING_CONFIGS.gentle,
        );
        translateY.value = withSpring(
          deltaY * sensitivity,
          SPRING_CONFIGS.gentle,
        );
      } else {
        const angle = Math.atan2(deltaY, deltaX);
        translateX.value = withSpring(
          Math.cos(angle) * maxDistance * sensitivity,
          SPRING_CONFIGS.gentle,
        );
        translateY.value = withSpring(
          Math.sin(angle) * maxDistance * sensitivity,
          SPRING_CONFIGS.gentle,
        );
      }
    },
    [translateX, translateY, sensitivity, maxDistance],
  );

  const handleTouchEnd = useCallback(() => {
    if (prefersReducedMotion) return;

    translateX.value = withSpring(0, SPRING_CONFIGS.gentle);
    translateY.value = withSpring(0, SPRING_CONFIGS.gentle);
  }, [translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ] as const,
  }));

  return {
    handleTouchStart,
    handleTouchEnd,
    animatedStyle,
  };
}

// === 7. STAGGERED ANIMATION HOOK ===
interface UseStaggeredAnimationReturn {
  start: () => void;
  getAnimatedStyle: (index: number) => ReturnType<typeof useAnimatedStyle>;
}

export function useStaggeredAnimation(
  itemCount: number,
  delayMs: number = 100,
  config: keyof typeof SPRING_CONFIGS = "standard",
): UseStaggeredAnimationReturn {
  const springConfig = SPRING_CONFIGS[config];
  const delaySteps = delayMs;

  const start = useCallback(() => {
    // Animation is managed by individual shared values
  }, []);

  const getAnimatedStyle = useCallback(
    (index: number) => {
      // Create shared values for this item
      const translateY = useSharedValue(30);
      const opacity = useSharedValue(0);

      useEffect(() => {
        if (prefersReducedMotion) {
          opacity.value = withTiming(1, { duration: TIMING_CONFIGS.standard });
          translateY.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
        } else {
          opacity.value = withDelay(
            index * delaySteps,
            withSpring(1, springConfig),
          );
          translateY.value = withDelay(
            index * delaySteps,
            withSpring(0, springConfig),
          );
        }
      }, [index, delaySteps]);

      return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      }));
    },
    [delaySteps, springConfig],
  );

  return {
    start,
    getAnimatedStyle,
  };
}

// === 8. RIPPLE EFFECT HOOK ===
interface UseRippleEffectReturn {
  handlePress: (x: number, y: number, onComplete?: () => void) => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useRippleEffect(
  color: string = "#ffffff",
  opacity: number = 0.3,
): UseRippleEffectReturn {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);

  const handlePress = useCallback(
    (x: number, y: number, onComplete?: () => void) => {
      if (prefersReducedMotion) {
        if (onComplete) onComplete();
        return;
      }

      rippleX.value = x;
      rippleY.value = y;
      rippleOpacity.value = opacity;
      rippleScale.value = 0;

      rippleScale.value = withTiming(1, { duration: TIMING_CONFIGS.standard });
      rippleOpacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });

      if (onComplete) {
        setTimeout(onComplete, TIMING_CONFIGS.standard);
      }
    },
    [rippleX, rippleY, rippleScale, rippleOpacity, opacity],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: rippleX.value - 50,
    top: rippleY.value - 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color,
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return {
    handlePress,
    animatedStyle,
  };
}

// === 9. SHIMMER EFFECT HOOK ===
interface UseShimmerEffectReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useShimmerEffect(
  colors: string[] = ["#ffffff40", "#ffffff90", "#ffffff40"],
  duration: number = 2000,
): UseShimmerEffectReturn {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    shimmerProgress.value = withSequence(
      withTiming(1, { duration }),
      withDelay(1000, withTiming(0, { duration: 0 })),
    );
  }, [shimmerProgress, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const gradientColors = colors;
    return {
      backgroundColor: gradientColors[0],
      // Additional shimmer effect would be handled by a wrapper component
    };
  });

  return {
    animatedStyle,
  };
}

// === 10. SCROLL ANIMATION HOOK ===
interface UseScrollAnimationReturn {
  onScroll: ReturnType<typeof useAnimatedScrollHandler>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useScrollAnimation(
  parallaxSpeed: number = 0.5,
): UseScrollAnimationReturn {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [50 * parallaxSpeed, 0, -50 * parallaxSpeed],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  return {
    onScroll,
    animatedStyle,
  };
}

// === EXPORT ALL HOOKS ===
export const UnifiedAnimations = {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGesture,
  usePressAnimation,
  useGlowAnimation,
  useMagneticEffect,
  useStaggeredAnimation,
  useRippleEffect,
  useShimmerEffect,
  useScrollAnimation,
};

export default UnifiedAnimations;
