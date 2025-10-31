import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springs, fromVelocity } from '@/foundation/motion';

const { width: W, height: H } = Dimensions.get('window');

type Opts = {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onSwipeUp?: () => void;
  swipeThreshold?: number; // fraction of width
  verticalThreshold?: number; // fraction of height
  overshoot?: number; // px
  enabled?: boolean;
};

export function useSwipeGesturesRNGH({
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  swipeThreshold = 0.3,
  verticalThreshold = 0.3,
  overshoot = 60,
  enabled = true,
}: Opts = {}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onChange((e) => {
      tx.value += e.changeX;
      ty.value += e.changeY;
    })
    .onEnd((e) => {
      const xT = W * swipeThreshold;
      const yT = H * verticalThreshold;
      const velocityX = e.velocityX;
      const velocityY = e.velocityY;

      if (tx.value > xT || (tx.value > 0 && Math.abs(velocityX) > 500 && velocityX > 0)) {
        // Swipe right - use momentum-based spring
        const springConfig = Math.abs(velocityX) > 500 
          ? fromVelocity(velocityX)
          : springs.bouncy;
        tx.value = withSpring(W + overshoot, {
          ...springConfig,
          velocity: velocityX,
        }, () => {
          onSwipeRight && runOnJS(onSwipeRight)();
          tx.value = 0;
          ty.value = 0;
        });
        return;
      }
      if (tx.value < -xT || (tx.value < 0 && Math.abs(velocityX) > 500 && velocityX < 0)) {
        // Swipe left - use momentum-based spring
        const springConfig = Math.abs(velocityX) > 500 
          ? fromVelocity(velocityX)
          : springs.bouncy;
        tx.value = withSpring(-W - overshoot, {
          ...springConfig,
          velocity: velocityX,
        }, () => {
          onSwipeLeft && runOnJS(onSwipeLeft)();
          tx.value = 0;
          ty.value = 0;
        });
        return;
      }
      if (ty.value < -yT || (ty.value < 0 && Math.abs(velocityY) > 500 && velocityY < 0)) {
        // Swipe up - use momentum-based spring
        const springConfig = Math.abs(velocityY) > 500 
          ? fromVelocity(velocityY)
          : springs.bouncy;
        ty.value = withSpring(-H - overshoot, {
          ...springConfig,
          velocity: velocityY,
        }, () => {
          onSwipeUp && runOnJS(onSwipeUp)();
          tx.value = 0;
          ty.value = 0;
        });
        return;
      }
      // Snap back with momentum-aware spring
      const snapBackConfig = (Math.abs(velocityX) > 300 || Math.abs(velocityY) > 300)
        ? springs.snappy
        : springs.gentle;
      tx.value = withSpring(0, snapBackConfig);
      ty.value = withSpring(0, snapBackConfig);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(tx.value, [-W, 0, W], [-18, 0, 18], Extrapolate.CLAMP);
    return {
      transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate}deg` }],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, W * 0.25], [0, 1], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(tx.value, [0, W * 0.25], [0.9, 1], Extrapolate.CLAMP) }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-W * 0.25, 0], [1, 0], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(tx.value, [-W * 0.25, 0], [1, 0.9], Extrapolate.CLAMP) }],
  }));

  const superStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [-H * 0.2, 0], [1, 0], Extrapolate.CLAMP),
  }));

  return { gesture, cardStyle, likeStyle, nopeStyle, superStyle, tx, ty };
}
