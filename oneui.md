# 🎬 ONE UI - Extracted Components and Hooks

This document contains extracted code from various UI components and hooks for the PawfectMatch mobile app.

## 🎯 Double Tap Like Gesture Component

```typescript
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
      <Animated.View
        style={StyleSheet.flatten([styles.container, style, containerStyle])}
      >
        {children}

        {/* Heart overlay */}
        <Animated.View
          style={StyleSheet.flatten([styles.heartOverlay, heartStyle])}
        >
          <Text
            style={StyleSheet.flatten([
              styles.heart,
              {
                fontSize: heartConfig.size,
                color: heartConfig.color,
              },
            ])}
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
      <Animated.View
        style={StyleSheet.flatten([styles.container, containerStyle])}
      >
        {children}

        {heartComponent && (
          <Animated.View
            style={StyleSheet.flatten([styles.heartOverlay, heartStyle])}
          >
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
```

## 🎯 Pinch Zoom Gesture Component

```typescript
/**
 * 🎬 ULTRA PREMIUM PINCH-TO-ZOOM WITH MOMENTUM
 * Professional-grade gesture recognition with physics-based momentum
 * Performance optimized with Reanimated and Gesture Handler
 */

import React, { useCallback, useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withDecay,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { Theme } from '../theme/unified-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PinchZoomProps {
  /** Image source */
  source: { uri: string } | number;
  /** Initial scale */
  initialScale?: number;
  /** Minimum scale */
  minScale?: number;
  /** Maximum scale */
  maxScale?: number;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Enable momentum */
  enableMomentum?: boolean;
  /** Momentum decay configuration */
  momentumConfig?: {
    velocity: number;
    clamp: [number, number];
    deceleration: number;
  };
  /** Haptic feedback configuration */
  hapticConfig?: {
    enabled: boolean;
    onZoomStart?: boolean;
    onZoomEnd?: boolean;
    onLimitReached?: boolean;
  };
  /** Callback when zoom starts */
  onZoomStart?: () => void;
  /** Callback when zoom ends */
  onZoomEnd?: () => void;
  /** Callback when scale changes */
  onScaleChange?: (scale: number) => void;
  /** Additional styles */
  style?: any;
  /** Disable gesture */
  disabled?: boolean;
  /** Image resize mode */
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

const DEFAULT_MOMENTUM_CONFIG = {
  velocity: 0.5,
  clamp: [1, 4] as [number, number],
  deceleration: 0.998,
};

const DEFAULT_HAPTIC_CONFIG = {
  enabled: true,
  onZoomStart: true,
  onZoomEnd: true,
  onLimitReached: true,
};

/**
 * Ultra Premium Pinch-to-Zoom Component
 * Creates stunning zoom experience with momentum physics
 */
export function PinchZoom({
  source,
  initialScale = 1,
  minScale = 1,
  maxScale = 4,
  width = SCREEN_WIDTH,
  height = 320,
  enableMomentum = true,
  momentumConfig = DEFAULT_MOMENTUM_CONFIG,
  hapticConfig = DEFAULT_HAPTIC_CONFIG,
  onZoomStart,
  onZoomEnd,
  onScaleChange,
  style,
  disabled = false,
  resizeMode = "cover",
}: PinchZoomProps) {
  // Shared values for transformations
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Gesture state tracking
  const isZooming = useSharedValue(false);
  const lastScale = useSharedValue(initialScale);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  // Haptic feedback function
  const triggerHaptic = useCallback(
    (type: "start" | "end" | "limit") => {
      if (!hapticConfig.enabled || disabled) return;

      switch (type) {
        case "start":
          if (hapticConfig.onZoomStart) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          break;
        case "end":
          if (hapticConfig.onZoomEnd) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          break;
        case "limit":
          if (hapticConfig.onLimitReached) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          break;
      }
    },
    [hapticConfig, disabled],
  );

  // Scale change callback
  const handleScaleChange = useCallback(
    (newScale: number) => {
      onScaleChange?.(newScale);
    },
    [onScaleChange],
  );

  // Pinch gesture configuration
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (disabled) return;

      isZooming.value = true;
      lastScale.value = scale.value;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;

      runOnJS(triggerHaptic)("start");
      if (onZoomStart) {
        runOnJS(onZoomStart as () => void)();
      }
    })
    .onUpdate((event) => {
      if (disabled) return;

      const newScale = lastScale.value * event.scale;

      // Clamp scale to limits
      if (newScale < minScale) {
        scale.value = minScale;
        runOnJS(triggerHaptic)("limit");
      } else if (newScale > maxScale) {
        scale.value = maxScale;
        runOnJS(triggerHaptic)("limit");
      } else {
        scale.value = newScale;
      }

      // Update focal point
      focalX.value = event.focalX;
      focalY.value = event.focalY;

      // Calculate translation based on focal point
      const scaleDiff = scale.value - lastScale.value;
      const focalPointX = focalX.value - width / 2;
      const focalPointY = focalY.value - height / 2;

      translateX.value =
        lastTranslateX.value - (focalPointX * scaleDiff) / scale.value;
      translateY.value =
        lastTranslateY.value - (focalPointY * scaleDiff) / scale.value;

      runOnJS(handleScaleChange)(scale.value);
    })
    .onEnd((event) => {
      if (disabled) return;

      isZooming.value = false;

      // Apply momentum if enabled
      if (enableMomentum && event.velocity !== 0) {
        const velocity = event.velocity;
        const currentScale = scale.value;

        // Calculate momentum scale
        const momentumScale = withDecay({
          velocity: velocity * momentumConfig.velocity,
          clamp: momentumConfig.clamp,
          deceleration: momentumConfig.deceleration,
        });

        // Apply momentum with limits
        scale.value = interpolate(
          momentumScale,
          [0, 1],
          [currentScale, Math.min(maxScale, currentScale * 1.5)],
          Extrapolate.CLAMP,
        );

        // Ensure scale stays within bounds
        if (scale.value < minScale) {
          scale.value = withSpring(minScale, {
            stiffness: 300,
            damping: 20,
            mass: 0.8,
          });
        } else if (scale.value > maxScale) {
          scale.value = withSpring(maxScale, {
            stiffness: 300,
            damping: 20,
            mass: 0.8,
          });
        }
      } else {
        // Snap to nearest valid scale
        if (scale.value < minScale) {
          scale.value = withSpring(minScale, {
            stiffness: 400,
            damping: 25,
            mass: 0.6,
          });
        } else if (scale.value > maxScale) {
          scale.value = withSpring(maxScale, {
            stiffness: 400,
            damping: 25,
            mass: 0.6,
          });
        }
      }

      runOnJS(triggerHaptic)("end");
      if (onZoomEnd) {
        runOnJS(onZoomEnd as () => void)();
      }
      runOnJS(handleScaleChange)(scale.value);
    });

  // Pan gesture for moving zoomed image
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (disabled || scale.value <= minScale) return;

      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (disabled || scale.value <= minScale) return;

      const maxTranslateX = (width * (scale.value - 1)) / 2;
      const maxTranslateY = (height * (scale.value - 1)) / 2;

      translateX.value = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, lastTranslateX.value + event.translationX),
      );

      translateY.value = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, lastTranslateY.value + event.translationY),
      );
    })
    .onEnd(() => {
      if (disabled || scale.value <= minScale) return;

      // Apply momentum to pan
      if (enableMomentum) {
        translateX.value = withDecay({
          velocity: 0,
          clamp: [
            -(width * (scale.value - 1)) / 2,
            (width * (scale.value - 1)) / 2,
          ],
        });

        translateY.value = withDecay({
          velocity: 0,
          clamp: [
            -(height * (scale.value - 1)) / 2,
            (height * (scale.value - 1)) / 2,
          ],
        });
      }
    });

  // Double-tap to reset zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (disabled) return;

      scale.value = withSpring(initialScale, {
        stiffness: 400,
        damping: 20,
        mass: 0.8,
      });

      translateX.value = withSpring(0, {
        stiffness: 400,
        damping: 20,
        mass: 0.8,
      });

      translateY.value = withSpring(0, {
        stiffness: 400,
        damping: 20,
        mass: 0.8,
      });

      runOnJS(handleScaleChange)(initialScale);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scale.value,
          [minScale, maxScale],
          [1, 1.02],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={StyleSheet.flatten([
          styles.container,
          { width, height },
          style,
          containerStyle,
        ])}
      >
        <Animated.View
          style={StyleSheet.flatten([styles.imageContainer, animatedStyle])}
        >
          <Image
            source={source}
            style={StyleSheet.flatten([styles.image, { width, height }])}
            resizeMode={resizeMode}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Pinch-to-Zoom with Custom Content
 */
export function PinchZoomContent({
  children,
  initialScale = 1,
  minScale = 1,
  maxScale = 3,
  width = SCREEN_WIDTH,
  height = 300,
  ...props
}: Omit<PinchZoomProps, "source" | "resizeMode"> & {
  children: React.ReactNode;
}) {
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = scale.value * event.scale;
      scale.value = Math.max(minScale, Math.min(maxScale, newScale));
    })
    .onEnd(() => {
      if (scale.value < minScale) {
        scale.value = withSpring(minScale);
      } else if (scale.value > maxScale) {
        scale.value = withSpring(maxScale);
      }
    });

  const panGesture = Gesture.Pan().onUpdate((event) => {
    if (scale.value > minScale) {
      translateX.value += event.translationX;
      translateY.value += event.translationY;
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
      <Animated.View
        style={StyleSheet.flatten([styles.container, { width, height }])}
      >
        <Animated.View
          style={StyleSheet.flatten([styles.contentContainer, animatedStyle])}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Hook for managing pinch-zoom state
 */
export function usePinchZoom(
  initialScale: number = 1,
  minScale: number = 1,
  maxScale: number = 4,
) {
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const resetZoom = useCallback(() => {
    scale.value = withSpring(initialScale);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, [initialScale]);

  const setZoom = useCallback(
    (newScale: number) => {
      const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
      scale.value = withSpring(clampedScale);
    },
    [minScale, maxScale],
  );

  return {
    scale,
    translateX,
    translateY,
    resetZoom,
    setZoom,
  };
}

/**
 * Preset configurations for different use cases
 */
export const PINCH_ZOOM_PRESETS = {
  subtle: {
    minScale: 1,
    maxScale: 2,
    momentumConfig: { velocity: 0.3, clamp: [1, 2], deceleration: 0.995 },
    hapticConfig: {
      enabled: true,
      onZoomStart: false,
      onZoomEnd: true,
      onLimitReached: false,
    },
  },
  medium: {
    minScale: 1,
    maxScale: 3,
    momentumConfig: { velocity: 0.5, clamp: [1, 3], deceleration: 0.998 },
    hapticConfig: {
      enabled: true,
      onZoomStart: true,
      onZoomEnd: true,
      onLimitReached: true,
    },
  },
  dramatic: {
    minScale: 0.8,
    maxScale: 5,
    momentumConfig: { velocity: 0.7, clamp: [0.8, 5], deceleration: 0.999 },
    hapticConfig: {
      enabled: true,
      onZoomStart: true,
      onZoomEnd: true,
      onLimitReached: true,
    },
  },
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "Theme.colors.neutral[950]",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
```

## 🎨 Motion Primitives

```typescript
import React, { useEffect, useRef } from "react";
import type { ViewStyle, FlatListProps } from "react-native";
import { StyleSheet } from "react-native";
import { View, Animated, ScrollView, FlatList, Easing } from "react-native";
import { Theme } from "../theme/unified-theme";

// === PROJECT HYPERION: MOTION & ANIMATION PRIMITIVES ===
const MotionSystem = Theme.motion;

// Staggered FadeInUp List Component
interface StaggeredFadeInUpListProps {
  children: React.ReactNode[];
  delay?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const StaggeredFadeInUpList: React.FC<StaggeredFadeInUpListProps> = ({
  children,
  delay = 100,
  style,
  containerStyle,
}) => {
  const animatedValues = useRef(
    children.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.spring(animatedValue, {
        damping: 25,
        stiffness: 300,
        mass: 1,
        toValue: 1,
        delay: index * delay,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(delay, animations).start();
  }, [animatedValues, delay]);

  return (
    <View style={StyleSheet.flatten([containerStyle])}>
      {children.map((child, index) => {
        const animatedValue = animatedValues[index];
        if (!animatedValue) return null;
        return (
          <Animated.View
            key={index}
            style={StyleSheet.flatten([
              {
                opacity: animatedValue,
                transform: [
                  {
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
              style,
            ])}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
};

// Physics-Based ScaleIn Component
interface PhysicsBasedScaleInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  trigger?: boolean;
}

export const PhysicsBasedScaleIn: React.FC<PhysicsBasedScaleInProps> = ({
  children,
  delay = 0,
  style,
  trigger = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.spring(animatedValue, {
        damping: 10,
        stiffness: 600,
        mass: 0.5,
        toValue: 1,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [animatedValue, delay, trigger]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        },
        style,
      ])}
    >
      {children}
    </Animated.View>
  );
};

// Seamless PageTransition Component
interface PageTransitionProps {
  children: React.ReactNode;
  type?: "fade" | "slideLeft" | "slideRight" | "scale" | "sharedElement";
  duration?: number;
  style?: ViewStyle;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = "fade",
  duration = 300,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration]);

  const getTransitionStyle = () => {
    switch (type) {
      case "fade":
        return {
          opacity: animatedValue,
        };

      case "slideLeft":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };

      case "slideRight":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };

      case "scale":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        };

      case "sharedElement":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };

      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={StyleSheet.flatten([getTransitionStyle(), style])}>
      {children}
    </Animated.View>
  );
};

// GestureWrapper Higher-Order Component
interface GestureWrapperProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  style?: ViewStyle;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  style,
}) => {
  // This would integrate with react-native-gesture-handler
  // For now, returning a basic wrapper
  return <View style={style}>{children}</View>;
};

// Enhanced FlatList with Staggered Animations
interface AnimatedFlatListProps<T> extends FlatListProps<T> {
  animationType?: "staggered" | "fadeIn" | "slideIn" | "none";
  animationDelay?: number;
}

export function AnimatedFlatList<T>({
  animationType = "staggered",
  animationDelay = 100,
  ...props
}: AnimatedFlatListProps<T>) {
  const animatedValues = useRef<Map<number, Animated.Value>>(new Map()).current;

  const getAnimatedStyle = (index: number) => {
    if (animationType === "none") return {};

    let animatedValue = animatedValues.get(index);
    if (!animatedValue) {
      animatedValue = new Animated.Value(0);
      animatedValues.set(index, animatedValue);

      // Trigger animation
      Animated.spring(animatedValue, {
        damping: 25,
        stiffness: 300,
        mass: 1,
        toValue: 1,
        delay: index * animationDelay,
        useNativeDriver: true,
      }).start();
    }

    switch (animationType) {
      case "staggered":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };

      case "fadeIn":
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        };

      case "slideIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      default:
        return {};
    }
  };

  return (
    <FlatList
      {...props}
      renderItem={(info) => (
        <Animated.View style={getAnimatedStyle(info.index)}>
          {props.renderItem?.(info)}
        </Animated.View>
      )}
    />
  );
}

// Scroll-triggered Animation Container
interface ScrollTriggerProps {
  children: React.ReactNode;
  triggerPoint?: number; // 0-1, where 1 is bottom of screen
  animation?: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn";
  delay?: number;
  style?: ViewStyle;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  triggerPoint = 0.8,
  animation = "slideIn",
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  // This would integrate with scroll position
  // For now, trigger immediately
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(animatedValue, {
          damping: 20,
          stiffness: 400,
          mass: 0.8,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animatedValue, delay]);

  const getAnimationStyle = () => {
    switch (animation) {
      case "slideIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      case "scaleIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };

      case "bounceIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
        };

      case "fadeIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={StyleSheet.flatten([getAnimationStyle(), style])}>
      {children}
    </Animated.View>
  );
};

export default {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  GestureWrapper,
  AnimatedFlatList,
  ScrollTrigger,
};
```

## 💬 Mobile Chat Component

```typescript
import { Ionicons } from "@expo/vector-icons";
import type { Message } from "@pawfectmatch/core";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../theme/Provider";
import { MessageBubble } from "./MessageBubble";
import { MobileVoiceRecorder } from "./MobileVoiceRecorder";

interface MobileChatProps {
  messages: Message[];
  onSendMessage: (content: string, type?: Message["messageType"]) => void;
  currentUserId: string;
  otherUserName: string;
}

export function MobileChat({
  messages,
  onSendMessage,
  currentUserId,
  otherUserName,
}: MobileChatProps): React.JSX.Element {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendText = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim(), "text");
      setInputText("");
    }
  };

  const handleVoiceMessage = (audioBlob: Blob, _duration: number) => {
    // For mobile, we'll create a data URL for the blob
    const reader = new FileReader();
    reader.onload = () => {
      const audioUrl = reader.result as string;
      onSendMessage(audioUrl, "voice");
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }) => {
    if (e.nativeEvent.key === "Enter") {
      handleSendText();
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <View
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      {/* Header */}
      <View
        style={StyleSheet.flatten([
          styles.header,
          { backgroundColor: colors.card },
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            styles.headerTitle,
            { color: colors.text },
          ])}
        >
          {otherUserName}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.sender._id === currentUserId}
            currentUserId={currentUserId}
          />
        )}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View
        style={StyleSheet.flatten([
          styles.inputContainer,
          { backgroundColor: colors.card },
        ])}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={StyleSheet.flatten([
              styles.textInput,
              { backgroundColor: colors.background, color: colors.text },
            ])}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${otherUserName}...`}
            placeholderTextColor={colors.gray500}
            multiline
            maxLength={500}
            onKeyPress={handleKeyPress}
          />

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.voiceButton,
              { backgroundColor: colors.primary },
            ])}
            onPress={() => {
              setShowVoiceRecorder(true);
            }}
          >
            <Ionicons name="mic" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : colors.gray400,
              },
            ])}
            onPress={handleSendText}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder ? (
        <MobileVoiceRecorder
          onSend={handleVoiceMessage}
          onCancel={() => {
            setShowVoiceRecorder(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

## 💬 Quick Replies Component

```typescript
import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { EliteButton, FadeInUp } from "../EliteComponents";
import { Spacing, BorderRadius } from "../../animation";
import { Theme } from '../theme/unified-theme';

interface QuickRepliesProps {
  replies: string[];
  onReplySelect: (reply: string) => void;
  visible?: boolean;
}

const DEFAULT_REPLIES = [
  "Sounds good! 👍",
  "When works for you?",
  "Let's do it! 🎾",
  "Perfect! 😊",
];

export function QuickReplies({
  replies = DEFAULT_REPLIES,
  onReplySelect,
  visible = true,
}: QuickRepliesProps): React.JSX.Element | null {
  if (!visible || replies.length === 0) return null;

  const renderReply = ({ item, index }: { item: string; index: number }) => (
    <FadeInUp delay={index * 100}>
      <EliteButton
        title={item}
        variant="glass"
        size="sm"
        magnetic
        ripple
        onPress={() => {
          onReplySelect(item);
        }}
        style={[styles.quickReply]}
      />
    </FadeInUp>
  );

  const keyExtractor = (item: string, index: number) => index.toString();

  return (
    <FadeInUp delay={0}>
      <View style={styles.container}>
        <FlatList
          data={replies}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderReply}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.repliesList}
        />
      </View>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  repliesList: {
    paddingHorizontal: Spacing.xs,
  },
  quickReply: {
    backgroundColor: "Theme.colors.neutral[0]",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
```

## 💬 Reaction Picker Component

```typescript
/**
 * Reaction Picker Component
 * Displays emoji reactions for messages
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  type ListRenderItem,
} from "react-native";
import { useTheme } from "../../theme/Provider";
import { Theme } from '../theme/unified-theme';

export interface Reaction {
  emoji: string;
  label: string;
}

const REACTIONS: Reaction[] = [
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👍", label: "Like" },
  { emoji: "👏", label: "Clap" },
];

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reaction: string) => void;
  position?: { x: number; y: number };
}

export function ReactionPicker({
  visible,
  onClose,
  onSelect,
  position,
}: ReactionPickerProps): JSX.Element {
  const { colors } = useTheme();
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleSelect = (reaction: string): void => {
    setSelectedReaction(reaction);
    onSelect(reaction);
    // Auto close after selection
    setTimeout(() => {
      onClose();
      setSelectedReaction(null);
    }, 300);
  };

  const renderReaction: ListRenderItem<Reaction> = ({ item }) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.reactionButton,
        selectedReaction === item.emoji && styles.selectedReaction,
      ])}
      onPress={() => handleSelect(item.emoji)}
      accessibilityLabel={`React with ${item.label}`}
      accessibilityRole="button"
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={StyleSheet.flatten([
            styles.container,
            position && {
              position: "absolute",
              top: position.y,
              left: position.x,
            },
          ])}
        >
          <FlatList
            data={REACTIONS}
            renderItem={renderReaction}
            keyExtractor={(item) => item.emoji}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reactionsList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  container: {
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  reactionsList: {
    paddingHorizontal: 5,
    gap: 5,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  selectedReaction: {
    backgroundColor: "#e3f2fd",
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 24,
  },
});
```

## 🎯 Swipe Gestures Hook

```typescript
import { useRef, useCallback } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export interface SwipeGestureState {
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<string>;
  likeOpacity: Animated.AnimatedInterpolation<string | number>;
  nopeOpacity: Animated.AnimatedInterpolation<string | number>;
  panResponder: PanResponder.Instance;
}

export interface UseSwipeGesturesOptions {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
}

/**
 * Hook for managing swipe gestures and animations
 */
export function useSwipeGestures({
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
}: UseSwipeGesturesOptions): SwipeGestureState {
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;

  // Rotate interpolation
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-30deg", "0deg", "30deg"],
    extrapolate: "clamp",
  });

  // Like opacity (right swipe)
  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Nope opacity (left swipe)
  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Reset position animation
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [position]);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      {
        useNativeDriver: false,
      },
    ),
    onPanResponderRelease: (_evt, gestureState) => {
      const { dx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.3;

      if (dx > swipeThreshold) {
        // Swipe right - like
        onSwipeRight();
      } else if (dx < -swipeThreshold) {
        // Swipe left - pass
        onSwipeLeft();
      } else if (dy < -swipeThreshold) {
        // Swipe up - super like
        onSwipeUp();
      } else {
        // Snap back
        resetPosition();
      }
    },
  });

  return {
    position,
    rotate,
    likeOpacity,
    nopeOpacity,
    panResponder,
  };
}
```

## 💬 Chat Scroll Hook

```typescript
import { useRef, useState, useEffect } from "react";
import type { FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UseChatScrollOptions {
  matchId: string;
  enabled?: boolean;
}

export interface UseChatScrollReturn {
  flatListRef: React.RefObject<FlatList<any>>;
  initialOffset: number;
  handleScroll: (offset: number) => Promise<void>;
}

/**
 * Hook for managing chat scroll position persistence
 */
export function useChatScroll({
  matchId,
  enabled = true,
}: UseChatScrollOptions): UseChatScrollReturn {
  const flatListRef = useRef<FlatList<any>>(null);
  const [initialOffset, setInitialOffset] = useState(0);
  const didRestoreRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    const restore = async () => {
      if (!enabled) return;

      try {
        const saved = await AsyncStorage.getItem(
          `mobile_chat_scroll_${matchId}`,
        );
        if (saved) {
          setInitialOffset(Number(saved));
        }
      } catch (error) {
        console.error(
          `Failed to restore scroll position for chat ${matchId}:`,
          error,
        );
      }
    };

    void restore();
  }, [matchId, enabled]);

  // Scroll to initial position when data loads
  useEffect(() => {
    if (initialOffset > 0 && !didRestoreRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
        didRestoreRef.current = true;
      });
    }
  }, [initialOffset]);

  const handleScroll = async (offset: number) => {
    if (!enabled) return;

    try {
      await AsyncStorage.setItem(
        `mobile_chat_scroll_${matchId}`,
        String(offset),
      );
    } catch (error) {
      console.error(
        `Failed to save scroll position for chat ${matchId}:`,
        error,
      );
    }
  };

  return {
    flatListRef,
    initialOffset,
    handleScroll,
  };
}
```

## 🎯 Matches Data Hook

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { FlatList } from "react-native";

import { matchesAPI } from "../services/api";

export interface Match {
  _id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  petAge: number;
  petBreed: string;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  isOnline: boolean;
  matchedAt: string;
  unreadCount: number;
}

export interface UseMatchesDataReturn {
  matches: Match[];
  likedYou: Match[];
  selectedTab: "matches" | "likedYou";
  refreshing: boolean;
  isLoading: boolean;
  initialOffset: number;
  listRef: React.RefObject<FlatList<Match>>;
  loadMatches: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setSelectedTab: (tab: "matches" | "likedYou") => void;
  handleScroll: (offset: number) => Promise<void>;
}

export function useMatchesData(): UseMatchesDataReturn {
  const [selectedTab, setSelectedTab] = useState<"matches" | "likedYou">(
    "matches",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const listRef = useRef<FlatList<Match>>(null);
  const queryClient = useQueryClient();

  // Query for matches data
  const {
    data: matchesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      try {
        const realMatches = await matchesAPI.getMatches();
        return realMatches as Match[];
      } catch (error) {
        logger.error("Failed to load matches:", { error });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        "Connection Error",
        "Unable to load matches. Please check your connection and try again.",
        [
          {
            text: "Retry",
            onPress: () => refetch(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }
  }, [error, refetch]);

  // Mutation for refreshing matches
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const realMatches = await matchesAPI.getMatches();
      return realMatches as Match[];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["matches"], data);
    },
  });

  // Restore scroll position
  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem("mobile_matches_scroll");
        if (saved) setInitialOffset(Number(saved));
      } catch {
        // Ignore storage errors
      }
    };
    restore();
  }, []);

  // Scroll to initial position when data loads
  useEffect(() => {
    if (!isLoading && initialOffset > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
      });
    }
  }, [isLoading, initialOffset]);

  const loadMatches = async () => {
    await refetch();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMutation.mutateAsync();
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = async (offset: number) => {
    try {
      await AsyncStorage.setItem("mobile_matches_scroll", String(offset));
    } catch {
      // Ignore storage errors
    }
  };

  // Query for liked you data
  const { data: likedYouData, isLoading: isLoadingLikedYou } = useQuery({
    queryKey: ["liked-you"],
    queryFn: async () => {
      try {
        const likedYouMatches = await matchesAPI.getLikedYou();
        return likedYouMatches as Match[];
      } catch (error) {
        logger.error("Failed to load liked you:", { error });
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const matches = matchesData || [];
  const likedYou = likedYouData || [];

  return {
    matches,
    likedYou,
    selectedTab,
    refreshing: refreshing || refreshMutation.isPending,
    isLoading,
    initialOffset,
    listRef,
    loadMatches,
    onRefresh,
    setSelectedTab,
    handleScroll,
  };
}
```

## 🎨 Theme Provider

```typescript
/**
 * 🎨 UNIFIED THEME PROVIDER
 * Single source of truth for theme management in the mobile app
 */

import React, { createContext, useContext, useMemo } from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import type { Theme, ColorScheme } from "./types";
import { createTheme } from "./rnTokens";

const ThemeCtx = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{
  scheme?: ColorScheme;
  children: React.ReactNode;
}> = ({ scheme, children }) => {
  const auto: ColorScheme = ((Appearance.getColorScheme() as ColorSchemeName) ??
    "light") as ColorScheme;
  const value = useMemo(() => createTheme(scheme ?? auto), [scheme, auto]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): Theme => {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
};

// Re-export adapter utilities for backward compatibility
export { getExtendedColors, getThemeColors, getIsDark } from "./adapters";
export type { ExtendedColors } from "./adapters";
```
