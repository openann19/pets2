/**
 * 🌌 AURORA BACKGROUND - PRO-GRADE ANIMATED BACKDROP
 *
 * Living gradient background with animated layers
 * - Multiple gradient layers with blend modes
 * - Smooth color transitions
 * - Parallax drift effect
 * - Theme-integrated
 * - Performance optimized
 */

import React, { memo, useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
export interface AuroraBackgroundProps {
  width: number;
  height: number;
  intensity?: number; // 0..1 strength of highlights
  speed?: number; // animation speed multiplier
  colorsA?: string[];
  colorsB?: string[];
  overlay?: boolean; // draw as overlay (absolute fill)
  style?: ViewStyle;
}

const AView = Animated.createAnimatedComponent(View);

export const AuroraBackground = memo(function AuroraBackground({
  width,
  height,
  intensity = 0.9,
  speed = 1,
  colorsA = ["#ec4899", "#f472b6", "#f9a8d4"],
  colorsB = ["#0ea5e9", "#22d3ee", "#a855f7"],
  overlay = true,
  style,
}: AuroraBackgroundProps): React.JSX.Element {
  // Animated values for gradient positions
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    // Main gradient sweep
    progress1.value = withRepeat(
      withTiming(1, {
        duration: Math.round(9000 / speed),
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );

    // Secondary gradient sweep (slower)
    progress2.value = withRepeat(
      withTiming(1, {
        duration: Math.round(12000 / speed),
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );

    // Subtle parallax drift
    drift.value = withRepeat(
      withTiming(1, {
        duration: 14000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [speed, progress1, progress2, drift]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (drift.value - 0.5) * 14 },
      { translateY: (drift.value - 0.5) * 10 },
    ],
  }));

  // Animated gradient positions
  const layer1Style = useAnimatedStyle(() => {
    const opacity = interpolate(progress1.value, [0, 0.5, 1], [0.8, 1, 0.8]);
    return { opacity };
  });

  const layer2Style = useAnimatedStyle(() => {
    const opacity = interpolate(progress2.value, [0, 0.5, 1], [0.6, 0.9, 0.6]);
    return { opacity };
  });

  const highlightStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress1.value,
      [0, 0.5, 1],
      [0.1, intensity * 0.15, 0.1],
    );
    return { opacity };
  });

  return (
    <AView
      style={[
        overlay ? StyleSheet.absoluteFillObject : { width, height },
        style,
        driftStyle,
      ]}
    >
      {/* Base gradient layer */}
      <AView style={[StyleSheet.absoluteFillObject, layer1Style]}>
        <LinearGradient
          colors={colorsA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </AView>

      {/* Secondary gradient layer */}
      <AView style={[StyleSheet.absoluteFillObject, layer2Style]}>
        <LinearGradient
          colors={colorsB}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </AView>

      {/* Highlight overlay */}
      <AView style={[StyleSheet.absoluteFillObject, highlightStyle]}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.05)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </AView>

      {/* Top sheen */}
      <View style={[StyleSheet.absoluteFillObject, { height: height * 0.55 }]}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.15)",
            "rgba(255,255,255,0.02)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    </AView>
  );
});

AuroraBackground.displayName = "AuroraBackground";

export default AuroraBackground;
