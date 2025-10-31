/**
 * usePulseEffect Hook
 * Pulse animation effect
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { durations, motionEasing } from '@/foundation/motion';

export const usePulseEffect = (enabled = true) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { 
            duration: durations.lg * 3, // 960ms for pulse up
            easing: motionEasing.enter,
          }), 
          withTiming(1, { 
            duration: durations.lg * 3, // 960ms for pulse down
            easing: motionEasing.exit,
          })
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return {
    pulseStyle,
  };
};

export default usePulseEffect;
