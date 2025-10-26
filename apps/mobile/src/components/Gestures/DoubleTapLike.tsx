/**
 * 🎬 ULTRA PREMIUM DOUBLE-TAP-TO-LIKE GESTURE
 * Professional-grade gesture recognition with haptic feedback
 * Performance optimized with Reanimated and Gesture Handler
 */

import React, { useCallback } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { View, Text, StyleSheet } from "react-native";

export interface DoubleTapLikeProps {
  /** Children to wrap with gesture detection */
  children: React.ReactNode;
  /** Callback when double-tap is detected */
  onDoubleTap?: () => void;
  /** Callback when single tap is detected */
  onSingleTap?: () => void;
  /** Maximum time between taps in milliseconds */
  maxDelay?: number;
  /** Scale animation configuration */
  scaleConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  /** Heart animation configuration */
  heartConfig?: {
    size: number;
    color: string;
    duration: number;
  };
  /** Haptic feedback configuration */
  hapticConfig?: {
    enabled: boolean;
    style: "light" | "medium" | "heavy";
  };
  /** Additional styles */
  style?: any;
  /** Disable gesture */
  disabled?: boolean;
}

const DEFAULT_SCALE_CONFIG = {
  stiffness: 400,
  damping: 14,
  mass: 0.8,
};

const DEFAULT_HEART_CONFIG = {
  size: 64,
  color: "#ff4757",
  duration: 600,
};

const DEFAULT_HAPTIC_CONFIG = {
  enabled: true,
  style: "medium" as const,
};

/**
 * Ultra Premium Double-Tap-to-Like Component
 * Creates stunning gesture recognition with heart animation
 */
export function DoubleTapLike({
  children,
  onDoubleTap,
  onSingleTap,
  maxDelay = 300,
  scaleConfig = DEFAULT_SCALE_CONFIG,
  heartConfig = DEFAULT_HEART_CONFIG,
  hapticConfig = DEFAULT_HAPTIC_CONFIG,
  style,
  disabled = false,
}: DoubleTapLikeProps) {
  // Shared values for animations
  const scale = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartRotation = useSharedValue(0);

  // Tap tracking
  const lastTapTime = useSharedValue(0);
  const tapCount = useSharedValue(0);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if (hapticConfig.enabled && !disabled) {
      switch (hapticConfig.style) {
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
    }
  }, [hapticConfig, disabled]);

  // Heart animation function
  const animateHeart = useCallback(() => {
    "worklet";

    // Reset heart animation
    heartScale.value = 0;
    heartOpacity.value = 0;
    heartRotation.value = 0;

    // Animate heart appearance
    heartScale.value = withSpring(1, {
      stiffness: 500,
      damping: 15,
      mass: 0.5,
    });

    heartOpacity.value = withSpring(1, {
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    });

    heartRotation.value = withSpring(360, {
      stiffness: 200,
      damping: 10,
      mass: 1,
    });

    // Fade out after duration
    setTimeout(() => {
      heartOpacity.value = withSpring(0, {
        stiffness: 400,
        damping: 25,
        mass: 0.6,
      });

      heartScale.value = withSpring(0, {
        stiffness: 400,
        damping: 25,
        mass: 0.6,
      });
    }, heartConfig.duration);
  }, [heartConfig.duration]);

  // Scale animation function
  const animateScale = useCallback(() => {
    "worklet";

    scale.value = withSpring(0.95, scaleConfig, () => {
      scale.value = withSpring(1, scaleConfig);
    });
  }, [scaleConfig]);

  // Double-tap handler
  const handleDoubleTap = useCallback(() => {
    if (disabled) return;

    runOnJS(triggerHaptic)();
    runOnJS(animateHeart)();
    runOnJS(animateScale)();
    onDoubleTap?.();
  }, [disabled, triggerHaptic, animateHeart, animateScale, onDoubleTap]);

  // Single-tap handler
  const handleSingleTap = useCallback(() => {
    if (disabled) return;

    runOnJS(animateScale)();
    onSingleTap?.();
  }, [disabled, animateScale, onSingleTap]);

  // Gesture configuration
  const singleTap = Gesture.Tap().onEnd(() => {
    const now = Date.now();
    const timeDiff = now - lastTapTime.value;

    if (timeDiff < maxDelay) {
      tapCount.value += 1;
      if (tapCount.value === 2) {
        runOnJS(handleDoubleTap)();
        tapCount.value = 0;
      }
    } else {
      tapCount.value = 1;
      runOnJS(handleSingleTap)();
    }

    lastTapTime.value = now;
  });

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartRotation.value}deg` },
    ],
    opacity: heartOpacity.value,
  }));

  return (
    <GestureDetector gesture={singleTap}>
      <Animated.View style={[styles.container, style, containerStyle]}>
        {children}

        {/* Heart overlay */}
        <Animated.View style={[styles.heartOverlay, heartStyle]}>
          <Text
            style={[
              styles.heart,
              {
                fontSize: heartConfig.size,
                color: heartConfig.color,
              },
            ]}
          >
            ❤️
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Double-Tap-to-Like with Custom Heart Component
 */
export function DoubleTapLikeCustom({
  children,
  onDoubleTap,
  onSingleTap,
  heartComponent,
  ...props
}: DoubleTapLikeProps & {
  heartComponent?: React.ReactNode;
}) {
  const scale = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const handleDoubleTap = useCallback(() => {
    "worklet";

    // Animate container scale
    scale.value = withSpring(
      0.95,
      {
        stiffness: 400,
        damping: 14,
        mass: 0.8,
      },
      () => {
        scale.value = withSpring(1, {
          stiffness: 400,
          damping: 14,
          mass: 0.8,
        });
      },
    );

    // Animate heart
    heartScale.value = withSpring(1, {
      stiffness: 500,
      damping: 15,
      mass: 0.5,
    });

    heartOpacity.value = withSpring(1, {
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    });

    // Fade out
    setTimeout(() => {
      heartOpacity.value = withSpring(0, {
        stiffness: 400,
        damping: 25,
        mass: 0.6,
      });

      heartScale.value = withSpring(0, {
        stiffness: 400,
        damping: 25,
        mass: 0.6,
      });
    }, 600);

    if (onDoubleTap) {
      runOnJS(onDoubleTap as () => void)();
    }
  }, [onDoubleTap]);

  const singleTap = Gesture.Tap().onEnd(() => {
    if (onSingleTap) {
      runOnJS(onSingleTap as () => void)();
    }
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  return (
    <GestureDetector gesture={singleTap}>
      <Animated.View style={[styles.container, containerStyle]}>
        {children}

        {heartComponent && (
          <Animated.View style={[styles.heartOverlay, heartStyle]}>
            {heartComponent}
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Hook for managing double-tap gestures
 */
export function useDoubleTapGesture(
  onDoubleTap?: () => void,
  onSingleTap?: () => void,
  maxDelay: number = 300,
) {
  const lastTapTime = useSharedValue(0);
  const tapCount = useSharedValue(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTapTime.value;

    if (timeDiff < maxDelay) {
      tapCount.value += 1;
      if (tapCount.value === 2) {
        onDoubleTap?.();
        tapCount.value = 0;
      }
    } else {
      tapCount.value = 1;
      onSingleTap?.();
    }

    lastTapTime.value = now;
  }, [maxDelay, onDoubleTap, onSingleTap]);

  return {
    handleTap,
    reset: () => {
      tapCount.value = 0;
      lastTapTime.value = 0;
    },
  };
}

/**
 * Preset configurations for different use cases
 */
export const DOUBLE_TAP_PRESETS = {
  subtle: {
    scaleConfig: { stiffness: 300, damping: 20, mass: 1 },
    heartConfig: { size: 48, color: "#ff4757", duration: 400 },
    hapticConfig: { enabled: true, style: "light" as const },
  },
  medium: {
    scaleConfig: { stiffness: 400, damping: 14, mass: 0.8 },
    heartConfig: { size: 64, color: "#ff4757", duration: 600 },
    hapticConfig: { enabled: true, style: "medium" as const },
  },
  dramatic: {
    scaleConfig: { stiffness: 500, damping: 10, mass: 0.6 },
    heartConfig: { size: 80, color: "#ff4757", duration: 800 },
    hapticConfig: { enabled: true, style: "heavy" as const },
  },
  bouncy: {
    scaleConfig: { stiffness: 600, damping: 8, mass: 0.5 },
    heartConfig: { size: 72, color: "#ff4757", duration: 700 },
    hapticConfig: { enabled: true, style: "medium" as const },
  },
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  heartOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
    zIndex: 1000,
    pointerEvents: "none",
  },
  heart: {
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
