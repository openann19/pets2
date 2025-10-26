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
        style={[styles.container, { width, height }, style, containerStyle]}
      >
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={source}
            style={[styles.image, { width, height }]}
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
      <Animated.View style={[styles.container, { width, height }]}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
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
    backgroundColor: "#000",
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
