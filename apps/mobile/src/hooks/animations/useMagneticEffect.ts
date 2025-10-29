/**
 * useMagneticEffect Hook
 * Magnetic button effect with 3D rotation
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PREMIUM_ANIMATIONS } from './constants';

export const useMagneticEffect = (enabled = true) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleMagneticMove = (deltaX: number, deltaY: number) => {
    if (!enabled) return;

    rotateX.value = withSpring(
      interpolate(deltaY, [-50, 50], [10, -10], Extrapolate.CLAMP),
      PREMIUM_ANIMATIONS.spring.gentle,
    );
    rotateY.value = withSpring(
      interpolate(deltaX, [-50, 50], [-10, 10], Extrapolate.CLAMP),
      PREMIUM_ANIMATIONS.spring.gentle,
    );
  };

  const resetMagnetic = () => {
    if (!enabled) return;
    rotateX.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
    rotateY.value = withSpring(0, PREMIUM_ANIMATIONS.spring.gentle);
  };

  const magneticStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return {
    magneticStyle,
    handleMagneticMove,
    resetMagnetic,
  };
};

export default useMagneticEffect;
