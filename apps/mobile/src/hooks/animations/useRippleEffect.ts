/**
 * useRippleEffect Hook
 * Ripple animation effect on press
 */

import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export const useRippleEffect = () => {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const triggerRipple = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 0.6;
    rippleScale.value = withTiming(2, { duration: 300 });
    rippleOpacity.value = withTiming(0, { duration: 300 });
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return {
    rippleStyle,
    triggerRipple,
  };
};

export default useRippleEffect;
