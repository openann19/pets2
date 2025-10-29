import React, { useCallback } from "react";
import { Image, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  withDecay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PinchZoomProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enableMomentum?: boolean;
  onScaleChange?: (s: number) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  style?: any;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  disabled?: boolean;
}

export function PinchZoom({
  source,
  width = SCREEN_WIDTH,
  height = 320,
  initialScale = 1,
  minScale = 1,
  maxScale = 4,
  enableMomentum = true,
  onScaleChange,
  onZoomStart,
  onZoomEnd,
  style,
  resizeMode = "cover",
  disabled = false,
}: PinchZoomProps) {
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(initialScale);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const boundsX = () => (width * (scale.value - 1)) / 2;
  const boundsY = () => (height * (scale.value - 1)) / 2;

  const notifyScale = useCallback((s: number) => onScaleChange?.(s), [onScaleChange]);

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      "worklet";
      if (disabled) return;
      lastScale.value = scale.value;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
      if (onZoomStart) runOnJS(onZoomStart)();
    })
    .onChange((e) => {
      "worklet";
      if (disabled) return;
      const next = clamp(lastScale.value * e.scale, minScale, maxScale);
      scale.value = next;
      if (onScaleChange) runOnJS(notifyScale)(next);
      translateX.value = clamp(translateX.value, -boundsX(), boundsX());
      translateY.value = clamp(translateY.value, -boundsY(), boundsY());
    })
    .onEnd(() => {
      "worklet";
      if (disabled) return;
      // Snap/clamp on pinch end; keep momentum to pan only
      if (scale.value < minScale) scale.value = withSpring(minScale);
      if (scale.value > maxScale) scale.value = withSpring(maxScale);
      if (onZoomEnd) runOnJS(onZoomEnd)();
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      "worklet";
      if (disabled || scale.value <= minScale) return;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      "worklet";
      if (disabled || scale.value <= minScale) return;
      const maxTranslateX = (width * (scale.value - 1)) / 2;
      const maxTranslateY = (height * (scale.value - 1)) / 2;
      translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX.value + event.translationX));
      translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY.value + event.translationY));
    })
    .onEnd((e) => {
      "worklet";
      if (disabled || scale.value <= minScale) return;
      if (enableMomentum) {
        translateX.value = withDecay({ velocity: e.velocityX, clamp: [-(width * (scale.value - 1)) / 2, (width * (scale.value - 1)) / 2] });
        translateY.value = withDecay({ velocity: e.velocityY, clamp: [-(height * (scale.value - 1)) / 2, (height * (scale.value - 1)) / 2] });
      }
    });

  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    "worklet";
    if (disabled) return;
    scale.value = withSpring(initialScale);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    if (onScaleChange) runOnJS(notifyScale)(initialScale);
  });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, { width, height }, style]}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image source={source} style={[styles.image, { width, height }] resizeMode={resizeMode} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: "#0a0a0a" },
  imageContainer: { justifyContent: "center", alignItems: "center" },
  image: { backgroundColor: "#f0f0f0" },
});
