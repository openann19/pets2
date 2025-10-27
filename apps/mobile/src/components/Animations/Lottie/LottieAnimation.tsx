/**
 * 🎬 BASE LOTTIE ANIMATION COMPONENT
 * Professional-grade Lottie animation wrapper with lifecycle management
 */

import React, { useRef, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import type { AnimationObject } from "lottie-react-native";
import type { ViewStyle } from "react-native";
import { View, StyleSheet } from "react-native";

export interface LottieAnimationProps {
  /** Animation source (JSON file or URL) */
  source: string | AnimationObject | { uri: string };
  /** Animation width */
  width?: number;
  /** Animation height */
  height?: number;
  /** Whether to auto-play */
  autoPlay?: boolean;
  /** Whether to loop */
  loop?: boolean;
  /** Animation speed multiplier */
  speed?: number;
  /** Callback when animation finishes */
  onAnimationFinish?: () => void;
  /** Additional styles */
  style?: ViewStyle;
  /** Whether animation is visible */
  visible?: boolean;
  /** Color filters for theming */
  colorFilters?: Array<{
    keypath: string;
    color: string;
  }>;
}

export function LottieAnimation({
  source,
  width = 200,
  height = 200,
  autoPlay = true,
  loop = false,
  speed = 1,
  onAnimationFinish,
  style,
  visible = true,
  colorFilters,
}: LottieAnimationProps) {
  const animationRef = useRef<LottieView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (animationRef.current && isLoaded) {
      if (autoPlay) {
        animationRef.current.play();
      }
    }
  }, [autoPlay, isLoaded]);

  const handleAnimationFinish = () => {
    onAnimationFinish?.();
  };

  if (!visible) return null;

  useEffect(() => {
    if (animationRef.current && isLoaded) {
      if (autoPlay) {
        animationRef.current.play();
      }
    }
  }, [autoPlay, isLoaded]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <LottieView
        ref={animationRef}
        source={source}
        style={{ width, height }}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={handleAnimationFinish}
        colorFilters={colorFilters}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
