/**
 * Hook for managing pinch-to-zoom and pan gestures in photo editor
 * Uses react-native-gesture-handler for performant gestures
 */

import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export interface UsePhotoPinchZoomOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enabled?: boolean;
}

export interface UsePhotoPinchZoomReturn {
  scale: ReturnType<typeof useSharedValue<number>>;
  translateX: ReturnType<typeof useSharedValue<number>>;
  translateY: ReturnType<typeof useSharedValue<number>>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  gesture: ReturnType<typeof Gesture.Simultaneous>;
}

export function usePhotoPinchZoom({
  initialScale = 1,
  minScale = 1,
  maxScale = 4,
  enabled = true,
}: UsePhotoPinchZoomOptions = {}): UsePhotoPinchZoomReturn {
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .enabled(enabled)
    .onUpdate((e) => {
      scale.value = Math.max(minScale, Math.min(maxScale, e.scale));
    })
    .onEnd(() => {
      if (scale.value <= 1.02) {
        // snap back
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      // gentle bounds clamp (simple)
      translateX.value = withSpring(translateX.value * 0.9);
      translateY.value = withSpring(translateY.value * 0.9);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return {
    scale,
    translateX,
    translateY,
    animatedStyle,
    gesture: composed,
  };
}
