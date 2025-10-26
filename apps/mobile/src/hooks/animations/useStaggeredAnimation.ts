/**
 * useStaggeredAnimation Hook
 * Staggered animation delays
 */

import { PREMIUM_ANIMATIONS } from "./constants";
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export const useStaggeredAnimation = (
  count: number,
  delay = PREMIUM_ANIMATIONS.stagger.normal,
) => {
  const getStaggeredDelay = (index: number) => index * delay;

  const opacity = useSharedValue(0);

  const start = () => {
    opacity.value = withDelay(0, withTiming(1, { duration: 500 }));
  };

  const getAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {
    getStaggeredDelay,
    start,
    getAnimatedStyle,
  };
};

export default useStaggeredAnimation;
