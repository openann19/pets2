import React, { useEffect, type ReactNode } from "react";
import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import Animated from "react-native-reanimated";

/**
 * FadeInUp Animation Component
 * Fade in and slide up animation for entrance effects
 */

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({ children, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default FadeInUp;

