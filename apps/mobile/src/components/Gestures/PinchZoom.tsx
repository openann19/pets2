import { useCallback, useRef } from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  withDecay,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/useTheme';

let SCREEN_WIDTH = 375;

try {
  const dimensions = Dimensions.get('window');
  SCREEN_WIDTH = dimensions.width;
} catch (error) {
  // Use fallback dimensions for testing environments
}

export interface PinchZoomProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enableMomentum?: boolean;
  enableHaptics?: boolean;
  enableDoubleTapReset?: boolean;
  onScaleChange?: (s: number) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onPanStart?: () => void;
  onPanEnd?: () => void;
  onDoubleTap?: () => void;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function PinchZoom({
  source,
  width = SCREEN_WIDTH,
  height = 320,
  initialScale = 1,
  minScale = 1,
  maxScale = 4,
  enableMomentum = true,
  enableHaptics = true,
  enableDoubleTapReset = true,
  onScaleChange,
  onZoomStart,
  onZoomEnd,
  onPanStart,
  onPanEnd,
  onDoubleTap,
  style,
  resizeMode = 'cover',
  disabled = false,
  accessibilityLabel = 'Zoomable image',
  accessibilityHint = 'Pinch to zoom, drag to pan, double tap to reset',
}: PinchZoomProps) {
  const theme = useTheme();
  const isZooming = useRef(false);
  const isPanning = useRef(false);

  const styles = StyleSheet?.create?.(() => ({
    container: {
      overflow: 'hidden',
      backgroundColor: theme?.colors?.bg || '#ffffff',
      borderRadius: theme?.radius?.md || 8,
    },
    imageContainer: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    image: {
      backgroundColor: theme?.colors?.surface || '#f5f5f5',
      borderRadius: theme?.radius?.md || 8,
    },
  }))() || {
    container: {
      overflow: 'hidden',
      backgroundColor: theme?.colors?.bg || '#ffffff',
      borderRadius: theme?.radius?.md || 8,
    },
    imageContainer: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    image: {
      backgroundColor: theme?.colors?.surface || '#f5f5f5',
      borderRadius: theme?.radius?.md || 8,
    },
  };
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(initialScale);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const boundsX = () => (width * (scale.value - 1)) / 2;
  const boundsY = () => (height * (scale.value - 1)) / 2;

  const notifyScale = useCallback((s: number) => onScaleChange?.(s), [onScaleChange]);
  const triggerHaptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'selection') => {
      if (!enableHaptics) return;
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          break;
        case 'selection':
          Haptics.selectionAsync().catch(() => {});
          break;
      }
    },
    [enableHaptics],
  );

  const handleZoomStart = useCallback(() => {
    if (!isZooming.current) {
      isZooming.current = true;
      triggerHaptic('light');
      onZoomStart?.();
    }
  }, [onZoomStart, triggerHaptic]);

  const handleZoomEnd = useCallback(() => {
    if (isZooming.current) {
      isZooming.current = false;
      triggerHaptic('selection');
      onZoomEnd?.();
    }
  }, [onZoomEnd, triggerHaptic]);

  const handlePanStart = useCallback(() => {
    if (!isPanning.current && scale.value > minScale) {
      isPanning.current = true;
      onPanStart?.();
    }
  }, [onPanStart, scale.value, minScale]);

  const handlePanEnd = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      onPanEnd?.();
    }
  }, [onPanEnd]);

  const handleDoubleTap = useCallback(() => {
    if (!enableDoubleTapReset) return;
    triggerHaptic('medium');
    onDoubleTap?.();
  }, [enableDoubleTapReset, onDoubleTap, triggerHaptic]);

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      if (disabled) return;
      lastScale.value = scale.value;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
      runOnJS(handleZoomStart)();
    })
    .onChange((e) => {
      'worklet';
      if (disabled) return;
      const next = clamp(lastScale.value * e.scale, minScale, maxScale);
      scale.value = next;
      if (onScaleChange) runOnJS(notifyScale)(next);
      translateX.value = clamp(translateX.value, -boundsX(), boundsX());
      translateY.value = clamp(translateY.value, -boundsY(), boundsY());
    })
    .onEnd(() => {
      'worklet';
      if (disabled) return;
      // Snap/clamp on pinch end; keep momentum to pan only
      if (scale.value < minScale) scale.value = withSpring(minScale);
      if (scale.value > maxScale) scale.value = withSpring(maxScale);
      runOnJS(handleZoomEnd)();
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (disabled || scale.value <= minScale) return;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
      runOnJS(handlePanStart)();
    })
    .onUpdate((event) => {
      'worklet';
      if (disabled || scale.value <= minScale) return;
      const maxTranslateX = (width * (scale.value - 1)) / 2;
      const maxTranslateY = (height * (scale.value - 1)) / 2;
      translateX.value = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, lastTranslateX.value + event.translationX),
      );
      translateY.value = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, lastTranslateY.value + event.translationY),
      );
    })
    .onEnd((e) => {
      'worklet';
      if (disabled || scale.value <= minScale) return;
      if (enableMomentum) {
        translateX.value = withDecay({
          velocity: e.velocityX,
          clamp: [-(width * (scale.value - 1)) / 2, (width * (scale.value - 1)) / 2],
        });
        translateY.value = withDecay({
          velocity: e.velocityY,
          clamp: [-(height * (scale.value - 1)) / 2, (height * (scale.value - 1)) / 2],
        });
      }
      runOnJS(handlePanEnd)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      if (disabled || !enableDoubleTapReset) return;
      // Cancel any ongoing animations
      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);

      scale.value = withSpring(initialScale);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      runOnJS(notifyScale)(initialScale);
      runOnJS(handleDoubleTap)();
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[styles.container, { width, height }, style]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="image"
        accessibilityLiveRegion="polite"
      >
        <Animated.View style={[animatedStyle, styles.imageContainer]}>
          <Image
            source={source}
            style={[styles.image, { width, height }]}
            resizeMode={resizeMode}
            accessible={false}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
