// Mobile Animations for PawfectMatch Premium
// High-impact micro-interactions for React Native

import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { SPRING, DUR } from '../animation/index';

// Re-export animation constants for direct use
// No longer wrapping in AnimationConfigs object - import SPRING and DUR directly
export { SPRING, DUR };

interface UseHoverLiftReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
}

// Hover lift effect for cards
export function useHoverLift(): UseHoverLiftReturn {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
      shadowOpacity: shadowOpacity.value,
      shadowRadius: interpolate(shadowOpacity.value, [0.1, 0.3], [4, 20], Extrapolate.CLAMP),
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(1.05, SPRING.stiff);
    translateY.value = withSpring(-8, SPRING.stiff);
    shadowOpacity.value = withTiming(0.3, { duration: DUR.fast });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING.soft);
    translateY.value = withSpring(0, SPRING.soft);
    shadowOpacity.value = withTiming(0.1, { duration: DUR.fast });
  };

  return { animatedStyle, onPressIn, onPressOut };
}

interface UsePulseReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  startPulse: () => void;
}

// Pulse animation for premium elements
export function usePulse(): UsePulseReturn {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const startPulse = () => {
    opacity.value = withSequence(
      withTiming(0.8, { duration: 1000 }),
      withTiming(1, { duration: 1000 }),
    );
  };

  return { animatedStyle, startPulse };
}

interface UseSwipeAnimationsReturn {
  swipeRightStyle: ReturnType<typeof useAnimatedStyle>;
  swipeLeftStyle: ReturnType<typeof useAnimatedStyle>;
  animateSwipeRight: (onComplete?: () => void) => void;
  animateSwipeLeft: (onComplete?: () => void) => void;
  resetSwipe: () => void;
}

// Swipe animations for pet cards
export function useSwipeAnimations(): UseSwipeAnimationsReturn {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const swipeRightStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
      opacity: opacity.value,
    };
  });

  const swipeLeftStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
      opacity: opacity.value,
    };
  });

  const animateSwipeRight = (onComplete?: () => void) => {
    const config = { duration: DUR.normal };
    translateX.value = withTiming(300, config);
    rotate.value = withTiming(15, config);
    opacity.value = withTiming(0, config, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  };

  const animateSwipeLeft = (onComplete?: () => void) => {
    const config = { duration: DUR.normal };
    translateX.value = withTiming(-300, config);
    rotate.value = withTiming(-15, config);
    opacity.value = withTiming(0, config, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  };

  const resetSwipe = () => {
    translateX.value = withSpring(0, SPRING.soft);
    rotate.value = withSpring(0, SPRING.soft);
    opacity.value = withSpring(1, SPRING.soft);
  };

  return {
    swipeRightStyle,
    swipeLeftStyle,
    animateSwipeRight,
    animateSwipeLeft,
    resetSwipe,
  };
}

interface UseButtonMicroReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
  onHover: () => void;
}

// Button micro-interactions
export function useButtonMicro(): UseButtonMicroReturn {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.98, SPRING.stiff);
    translateY.value = withSpring(2, SPRING.stiff);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING.soft);
    translateY.value = withSpring(0, SPRING.soft);
  };

  const onHover = () => {
    scale.value = withSpring(1.02, SPRING.soft);
    translateY.value = withSpring(-2, SPRING.soft);
  };

  return { animatedStyle, onPressIn, onPressOut, onHover };
}

interface UseCardEntranceReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  startEntrance: () => void;
}

// Card entrance animation
export function useCardEntrance(delay: number = 0): UseCardEntranceReturn {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const startEntrance = () => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 600 }));
  };

  return { animatedStyle, startEntrance };
}

interface UseShimmerReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  startShimmer: () => void;
}

// Shimmer loading effect
export function useShimmer(): UseShimmerReturn {
  const translateX = useSharedValue(-200);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const startShimmer = () => {
    translateX.value = withTiming(200, { duration: 2000 });
  };

  return { animatedStyle, startShimmer };
}

interface UseBounceInReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  startBounce: () => void;
}

// Bounce animation for notifications
export function useBounceIn(): UseBounceInReturn {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const startBounce = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 250 }),
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
    opacity.value = withTiming(1, { duration: 250 });
  };

  return { animatedStyle, startBounce };
}

interface UseGlowReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  startGlow: () => void;
  stopGlow: () => void;
}

// Glow effect for premium elements
export function useGlow(): UseGlowReturn {
  const shadowOpacity = useSharedValue(0);
  const shadowRadius = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: shadowOpacity.value,
      shadowRadius: shadowRadius.value,
    };
  });

  const startGlow = () => {
    const config = { duration: DUR.normal };
    shadowOpacity.value = withTiming(0.4, config);
    shadowRadius.value = withTiming(20, config);
  };

  const stopGlow = () => {
    const config = { duration: DUR.normal };
    shadowOpacity.value = withTiming(0, config);
    shadowRadius.value = withTiming(0, config);
  };

  return { animatedStyle, startGlow, stopGlow };
}

interface UseHoverScaleReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  onHover: () => void;
  onLeave: () => void;
}

// Scale hover effect
export function useHoverScale(): UseHoverScaleReturn {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onHover = () => {
    scale.value = withSpring(1.05, SPRING.soft);
  };

  const onLeave = () => {
    scale.value = withSpring(1, SPRING.soft);
  };

  return { animatedStyle, onHover, onLeave };
}

// Enhanced haptic feedback
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  const hapticTypes = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };

  Haptics.impactAsync(hapticTypes[type]);
}

// Sound feedback (if available)
export function triggerSound(type: 'hover' | 'press' = 'press'): void {
  // Note: Sound feedback would require additional audio setup
  // This is a placeholder for future implementation
  logger.info(`Sound feedback: ${type}`);
}
