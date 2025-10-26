/**
 * useLoadingAnimation Hook
 * Loading spinner animation
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const useLoadingAnimation = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      false,
    );
  }, []);

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return {
    loadingStyle,
  };
};

export default useLoadingAnimation;
