/**
 * usePageTransition Hook
 * Page transition animations
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { PREMIUM_ANIMATIONS } from "./constants";

export const usePageTransition = () => {
  const screenOpacity = useSharedValue(1);
  const screenTranslateY = useSharedValue(0);

  const enterScreen = () => {
    screenOpacity.value = 0;
    screenTranslateY.value = 50;
    screenOpacity.value = withSpring(1, PREMIUM_ANIMATIONS.spring.gentle);
    screenTranslateY.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
  };

  const exitScreen = (callback?: () => void) => {
    screenOpacity.value = withTiming(0, { duration: 300 });
    screenTranslateY.value = withTiming(-50, { duration: 300 });

    if (callback) {
      setTimeout(() => {
        runOnJS(callback)();
      }, 300);
    }
  };

  const pageStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslateY.value }],
  }));

  return {
    pageStyle,
    enterScreen,
    exitScreen,
  };
};

export default usePageTransition;
