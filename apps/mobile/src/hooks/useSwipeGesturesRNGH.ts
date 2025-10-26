import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

type Opts = {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onSwipeUp?: () => void;
  swipeThreshold?: number;      // fraction of width
  verticalThreshold?: number;   // fraction of height
  overshoot?: number;           // px
  enabled?: boolean;
};

export function useSwipeGesturesRNGH({
  onSwipeRight, onSwipeLeft, onSwipeUp,
  swipeThreshold = 0.30,
  verticalThreshold = 0.30,
  overshoot = 60,
  enabled = true,
}: Opts = {}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onChange(e => { tx.value += e.changeX; ty.value += e.changeY; })
    .onEnd(() => {
      const xT = W * swipeThreshold, yT = H * verticalThreshold;

      if (tx.value > xT) {
        tx.value = withTiming(W + overshoot, { duration: 180 }, () => {
          onSwipeRight && runOnJS(onSwipeRight)(); tx.value = 0; ty.value = 0;
        }); return;
      }
      if (tx.value < -xT) {
        tx.value = withTiming(-W - overshoot, { duration: 180 }, () => {
          onSwipeLeft && runOnJS(onSwipeLeft)(); tx.value = 0; ty.value = 0;
        }); return;
      }
      if (ty.value < -yT) {
        ty.value = withTiming(-H - overshoot, { duration: 200 }, () => {
          onSwipeUp && runOnJS(onSwipeUp)(); tx.value = 0; ty.value = 0;
        }); return;
      }
      tx.value = withSpring(0, { damping: 18, stiffness: 220, mass: 0.8 });
      ty.value = withSpring(0, { damping: 18, stiffness: 220, mass: 0.8 });
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(tx.value, [-W, 0, W], [-18, 0, 18], Extrapolate.CLAMP);
    return { transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate}deg` }] };
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
