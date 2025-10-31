import { useTheme } from '@mobile/theme';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import { hardClamp, rubberClamp, rubberScale } from '../../utils/elastic';
import { springs } from '@/foundation/motion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PinchZoomProProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enableMomentum?: boolean;
  onScaleChange?: (s: number) => void;
  disabled?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  backgroundColor?: string;
  haptics?: boolean;
}

export function PinchZoomPro({
  source,
  width = SCREEN_WIDTH,
  height = 320,
  initialScale = 1,
  minScale = 1,
  maxScale = 4,
  enableMomentum = true,
  onScaleChange,
  disabled = false,
  resizeMode = 'cover',
  backgroundColor,
  haptics = false,
}: PinchZoomProProps) {
  const theme = useTheme();
  const finalBackgroundColor = backgroundColor || theme.colors.bg;
  const scale = useSharedValue(initialScale);
  const lastScale = useSharedValue(initialScale);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lastTx = useSharedValue(0);
  const lastTy = useSharedValue(0);

  const trigger = useCallback(
    (style: 'Light' | 'Medium' | 'Heavy') => {
      if (!haptics) return;
      const map = {
        Light: Haptics.ImpactFeedbackStyle.Light,
        Medium: Haptics.ImpactFeedbackStyle.Medium,
        Heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(map[style]);
    },
    [haptics],
  );

  const pinch = Gesture.Pinch()
    .enabled(!disabled)
    .onStart(() => {
      lastScale.value = scale.value;
      if (haptics) runOnJS(trigger)('Light');
    })
    .onUpdate((e) => {
      // raw scale
      const raw = lastScale.value * e.scale;
      // rubber-band while out-of-bounds
      const s = rubberScale(raw, minScale, maxScale, 0.42);
      scale.value = s;
      if (onScaleChange) runOnJS(onScaleChange)(s);
    })
    .onEnd(() => {
      // snap back to hard clamp
      if (scale.value < minScale) scale.value = withSpring(minScale);
      if (scale.value > maxScale) scale.value = withSpring(maxScale);
      if (haptics) runOnJS(trigger)('Medium');
    });

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      lastTx.value = tx.value;
      lastTy.value = ty.value;
    })
    .onUpdate((e) => {
      // content bounds at current scale
      const maxX = (width * (scale.value - 1)) / 2;
      const maxY = (height * (scale.value - 1)) / 2;

      // desired translation
      const nx = lastTx.value + e.translationX;
      const ny = lastTy.value + e.translationY;

      // elastic while panning outside bounds
      tx.value = rubberClamp(nx, -maxX, maxX, 0.5);
      ty.value = rubberClamp(ny, -maxY, maxY, 0.5);
    })
    .onEnd((e) => {
      // only momentum when zoomed-in & allowed
      const zoomed = scale.value > minScale + 0.001;
      if (enableMomentum && zoomed) {
        const maxX = (width * (scale.value - 1)) / 2;
        const maxY = (height * (scale.value - 1)) / 2;
        tx.value = withDecay({
          velocity: e.velocityX,
          clamp: [-maxX, maxX],
        });
        ty.value = withDecay({
          velocity: e.velocityY,
          clamp: [-maxY, maxY],
        });
      } else {
        // snap to hard clamp
        const maxX = (width * (scale.value - 1)) / 2;
        const maxY = (height * (scale.value - 1)) / 2;
        tx.value = withSpring(hardClamp(tx.value, -maxX, maxX));
        ty.value = withSpring(hardClamp(ty.value, -maxY, maxY));
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!disabled)
    .maxDelay(280)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      // quick zoom toggle with center snap
      const target = scale.value > 1.001 ? 1 : Math.min(2, maxScale);
      scale.value = withSpring(target, springs.velocity);
      tx.value = withSpring(0, springs.snappy);
      ty.value = withSpring(0, springs.snappy);
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[styles.container, { width, height, backgroundColor: finalBackgroundColor }]}
      >
        <Animated.View style={[styles.center, imageStyle]}>
          <Image
            source={source}
            style={{ width, height, backgroundColor: theme.colors.onSurface }}
            resizeMode={resizeMode}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12 },
  center: { alignItems: 'center', justifyContent: 'center' },
});

export default PinchZoomPro;
