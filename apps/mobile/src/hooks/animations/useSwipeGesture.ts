import { useMemo } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

export interface UseSwipeGesturesOptions {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
}

export interface SwipeGestureState {
  pan: ReturnType<typeof Gesture.Pan>;
  cardStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useSwipeGestures({ onSwipeRight, onSwipeLeft, onSwipeUp }: UseSwipeGesturesOptions): SwipeGestureState {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${(x.value / (screenWidth / 2)) * 30}deg` },
    ],
  }));
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          x.value += e.changeX;
          y.value += e.changeY;
        })
        .onEnd(() => {
          const thr = screenWidth * 0.3;
          if (x.value > thr) { runOnJS(onSwipeRight)(); x.value = withSpring(0); y.value = withSpring(0); }
          else if (x.value < -thr) { runOnJS(onSwipeLeft)(); x.value = withSpring(0); y.value = withSpring(0); }
          else if (y.value < -thr) { runOnJS(onSwipeUp)(); x.value = withSpring(0); y.value = withSpring(0); }
          else { x.value = withSpring(0); y.value = withSpring(0); }
        }),
    [onSwipeLeft, onSwipeRight, onSwipeUp],
  );
  return { pan, cardStyle };
}

export default useSwipeGestures;
