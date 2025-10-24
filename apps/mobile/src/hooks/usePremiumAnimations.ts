import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";

// === PREMIUM ANIMATION CONSTANTS ===
export const PREMIUM_ANIMATIONS = {
  // Spring configurations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1.2,
    },
    bouncy: {
      damping: 8,
      stiffness: 200,
      mass: 0.8,
    },
    wobbly: {
      damping: 12,
      stiffness: 180,
      mass: 1,
    },
    stiff: {
      damping: 10,
      stiffness: 200,
      mass: 1,
    },
  },

  // Timing configurations
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
  },

  // Easing curves
  easing: {
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },

  // Stagger delays
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
} as const;

// === PREMIUM ANIMATION HOOKS ===

// Magnetic button effect
export const useMagneticEffect = (enabled = true) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleMagneticMove = (deltaX: number, deltaY: number) => {
    if (!enabled) return;

    rotateX.value = withSpring(
      interpolate(deltaY, [-50, 50], [10, -10], Extrapolate.CLAMP),
      PREMIUM_ANIMATIONS.spring.gentle,
    );
    rotateY.value = withSpring(
      interpolate(deltaX, [-50, 50], [-10, 10], Extrapolate.CLAMP),
      PREMIUM_ANIMATIONS.spring.gentle,
    );
  };

  const resetMagnetic = () => {
    if (!enabled) return;
    rotateX.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
    rotateY.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
  };

  const magneticStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return {
    magneticStyle,
    handleMagneticMove,
    resetMagnetic,
  };
};

// Ripple effect
export const useRippleEffect = () => {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const triggerRipple = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 0.6;
    rippleScale.value = withTiming(2, { duration: 300 });
    rippleOpacity.value = withTiming(0, { duration: 300 });
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return {
    rippleStyle,
    triggerRipple,
  };
};

// Shimmer effect
export const useShimmerEffect = (enabled = true) => {
  const shimmerOffset = useSharedValue(-100);

  useEffect(() => {
    if (enabled) {
      shimmerOffset.value = withRepeat(
        withSequence(
          withTiming(100, { duration: 2000 }),
          withDelay(1000, withTiming(-100, { duration: 0 })),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  return {
    shimmerStyle,
  };
};

// Glow effect
export const useGlowEffect = (enabled = true) => {
  const glowIntensity = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.4,
    shadowRadius: glowIntensity.value * 20,
  }));

  return {
    glowStyle,
  };
};

// Pulse effect
export const usePulseEffect = (enabled = true) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return {
    pulseStyle,
  };
};

// Floating effect
export const useFloatingEffect = (enabled = true) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    floatingStyle,
  };
};

// Entrance animations
export const useEntranceAnimation = (
  type: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn" = "fadeIn",
  delay = 0,
) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(-50);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const animate = () => {
      switch (type) {
        case "fadeIn":
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "slideIn":
          translateY.value = withDelay(
            delay,
            withSpring(0, PREMIUM_ANIMATIONS.spring.gentle),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "scaleIn":
          scale.value = withDelay(
            delay,
            withSpring(1, PREMIUM_ANIMATIONS.spring.bouncy),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "bounceIn":
          scale.value = withDelay(
            delay,
            withSequence(
              withTiming(1.2, { duration: 300 }),
              withTiming(0.9, { duration: 200 }),
              withTiming(1, { duration: 300 }),
            ),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
      }
    };

    animate();
  }, [type, delay]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return {
    entranceStyle,
  };
};

// Haptic feedback
export const useHapticFeedback = () => {
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  };

  const triggerSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const triggerError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return {
    triggerHaptic,
    triggerSuccess,
    triggerWarning,
    triggerError,
  };
};

// Staggered animations
export const useStaggeredAnimation = (
  count: number,
  delay = PREMIUM_ANIMATIONS.stagger.normal,
) => {
  const getStaggeredDelay = (index: number) => index * delay;

  return {
    getStaggeredDelay,
  };
};

// Page transition
export const usePageTransition = () => {
  const screenOpacity = useSharedValue(1);
  const screenTranslateY = useSharedValue(0);

  const enterScreen = () => {
    screenOpacity.value = 0;
    screenTranslateY.value = 50;
    screenOpacity.value = withSpring(1, PREMIUM_ANIMATIONS.spring.gentle);
    screenTranslateY.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
  };

  const exitScreen = (callback?: () => void) => {
    screenOpacity.value = withTiming(0, { duration: 300 });
    screenTranslateY.value = withTiming(-50, { duration: 300 });

    if (callback) {
      setTimeout(() => {
        runOnJS(callback)();
      }, 300);
    }
  };

  const pageStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslateY.value }],
  }));

  return {
    pageStyle,
    enterScreen,
    exitScreen,
  };
};

// Loading animation
export const useLoadingAnimation = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      false,
    );
  }, []);

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return {
    loadingStyle,
  };
};

// Parallax effect
export const useParallaxEffect = (speed = 0.5) => {
  const translateY = useSharedValue(0);

  const handleScroll = (scrollY: number) => {
    translateY.value = scrollY * speed;
  };

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    parallaxStyle,
    handleScroll,
  };
};

export default {
  PREMIUM_ANIMATIONS,
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useEntranceAnimation,
  useHapticFeedback,
  useStaggeredAnimation,
  usePageTransition,
  useLoadingAnimation,
  useParallaxEffect,
};
