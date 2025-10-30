import React, { useEffect, type ReactNode } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";

/**
 * ScaleIn Animation Component
 * Scale and fade in animation for entrance effects
 */

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, delay = 0 }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default ScaleIn;
