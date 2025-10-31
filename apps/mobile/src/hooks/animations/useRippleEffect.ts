/**
 * useRippleEffect Hook
 * Ripple animation effect on press
 */

import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { durations, motionEasing } from '@/foundation/motion';

export const useRippleEffect = () => {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const triggerRipple = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 0.6;
    rippleScale.value = withTiming(2, { 
      duration: durations.md,
      easing: motionEasing.enter,
    });
    rippleOpacity.value = withTiming(0, { 
      duration: durations.md,
      easing: motionEasing.exit,
    });
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
