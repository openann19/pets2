/**
 * ✨ STELLAR CARD 3D - PRO-GRADE INTERACTIVE CARD
 *
 * Tactile 3D card with gesture-driven tilt
 * - 3D perspective transforms
 * - Gradient border with glow
 * - Moving specular highlight
 * - Gesture-responsive
 * - Theme-integrated
 * - Haptic feedback
 */

import React, { memo } from "react";
import { StyleSheet, View, Dimensions, type ViewStyle } from "react-native";
import {
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export interface StellarCard3DProps {
  width?: number;
  height?: number;
  radius?: number;
  borderWidth?: number;
  gradient?: string[];
  glowColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  onPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AView = Animated.createAnimatedComponent(View);

export const StellarCard3D = memo(function StellarCard3D({
  width = SCREEN_WIDTH * 0.86,
  height = SCREEN_WIDTH * 0.56,
  radius = 18,
  borderWidth = 3,
  gradient = ["#ec4899", "#f472b6", "#f9a8d4"],
  glowColor = "rgba(236,72,153,0.35)",
  style,
  children,
  onPress,
}: StellarCard3DProps): React.JSX.Element {
  // Gesture-driven tilt
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const isPressed = useSharedValue(0);

  const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = e.nativeEvent;
    tx.value = translationX;
    ty.value = translationY;
    isPressed.value = 1;
  };

  const onGestureEnd = () => {
    tx.value = withSpring(0, { damping: 16, stiffness: 120 });
    ty.value = withSpring(0, { damping: 16, stiffness: 120 });
    isPressed.value = withSpring(0);

    // Haptic feedback
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Ignore haptic errors
    });

    // Trigger press callback if provided
    if (onPress) {
      onPress();
    }
  };

  const tiltStyle = useAnimatedStyle(() => {
    const rx = interpolate(ty.value, [-80, 80], [10, -10], Extrapolate.CLAMP);
    const ry = interpolate(tx.value, [-80, 80], [-10, 10], Extrapolate.CLAMP);
    const scaleVal = interpolate(isPressed.value, [0, 1], [1, 0.98]);

    return {
      transform: [
        { perspective: 600 },
        { rotateX: `${rx}deg` as unknown as number },
        { rotateY: `${ry}deg` as unknown as number },
        { scale: scaleVal },
      ],
    };
  });

  // Moving highlight position (follows tilt)
  const highlightStyle = useAnimatedStyle(() => {
    const cx =
      width / 2 +
      interpolate(tx.value, [-80, 80], [-30, 30], Extrapolate.CLAMP);
    const cy =
      height / 2 +
      interpolate(ty.value, [-80, 80], [-30, 30], Extrapolate.CLAMP);
    return {
      left: cx - 80,
      top: cy - 80,
      opacity: interpolate(isPressed.value, [0, 1], [0.3, 0.6]),
    };
  });

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onEnded={onGestureEnd}
      onCancelled={onGestureEnd}
    >
      <AView style={[styles.container, style, { width, height }]}>
        <AView style={[styles.card, tiltStyle, { borderRadius: radius }]}>
          {/* Gradient border */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: radius, overflow: "hidden" },
            ]}
          >
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
            />
          </View>

          {/* Glow layer */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: radius,
                backgroundColor: glowColor,
                shadowColor: gradient[0],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
          />

          {/* Specular highlight */}
          <AView
            pointerEvents="none"
            style={[styles.highlight, highlightStyle]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.25)",
                "rgba(255,255,255,0.08)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.highlightGradient}
            />
          </AView>

          {/* Content slot */}
          <View style={[styles.inner, { borderRadius: radius - borderWidth }]}>
            {children}
          </View>
        </AView>
      </AView>
    </PanGestureHandler>
  );
});

StellarCard3D.displayName = "StellarCard3D";

const styles = StyleSheet.create({
  container: { alignSelf: "center" },
  card: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "rgba(12,12,18,0.65)",
  },
  inner: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(12,12,18,0.85)",
    margin: 3,
  },
  highlight: {
    position: "absolute",
    width: 160,
    height: 160,
  },
  highlightGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
});

export default StellarCard3D;
