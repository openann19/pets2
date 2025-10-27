/**
 * useEntranceAnimation Hook
 * Entrance animations (fadeIn, slideIn, scaleIn, bounceIn)
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { PREMIUM_ANIMATIONS } from "./constants";

export const useEntranceAnimation = (
  type: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn" = "fadeIn",
  delay = 0,
) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(-50);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const animate = () => {
      switch (type) {
        case "fadeIn":
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "slideIn":
          translateY.value = withDelay(
            delay,
            withSpring(0, PREMIUM_ANIMATIONS.spring.gentle),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "scaleIn":
          scale.value = withDelay(
            delay,
            withSpring(1, PREMIUM_ANIMATIONS.spring.bouncy),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
        case "bounceIn":
          scale.value = withDelay(
            delay,
            withSequence(
              withTiming(1.2, { duration: 300 }),
              withTiming(0.9, { duration: 200 }),
              withTiming(1, { duration: 300 }),
            ),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
          break;
      }
    };

    animate();
  }, [type, delay]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const start = () => {
    // Animation already started in useEffect, but this can be used to restart
    switch (type) {
      case "fadeIn":
        opacity.value = withTiming(1, { duration: 500 });
        break;
      case "slideIn":
        translateY.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
        opacity.value = withTiming(1, { duration: 500 });
        break;
      case "scaleIn":
        scale.value = withSpring(1, PREMIUM_ANIMATIONS.spring.bouncy);
        opacity.value = withTiming(1, { duration: 500 });
        break;
      case "bounceIn":
        scale.value = withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(0.9, { duration: 200 }),
          withTiming(1, { duration: 300 }),
        );
        opacity.value = withTiming(1, { duration: 500 });
        break;
    }
  };

  return {
    entranceStyle,
    animatedStyle: entranceStyle,
    start,
  };
};

export default useEntranceAnimation;
