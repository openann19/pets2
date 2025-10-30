/**
 * useParallaxEffect Hook
 * Parallax scrolling effect
 */

import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export const useParallaxEffect = (speed = 0.5) => {
  const translateY = useSharedValue(0);

  const handleScroll = (scrollY: number) => {
    translateY.value = scrollY * speed;
  };

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    parallaxStyle,
    handleScroll,
  };
};

export default useParallaxEffect;
