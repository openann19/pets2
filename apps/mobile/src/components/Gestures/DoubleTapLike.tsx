import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { springs, durations, motionEasing, type SpringConfig } from '@/foundation/motion';

export interface DoubleTapLikeProps {
  children: React.ReactNode;
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  scaleConfig?: SpringConfig;
  heartConfig?: { size: number; color: string; showMs: number };
  haptic?: 'off' | 'light' | 'medium' | 'heavy';
  style?: any;
  disabled?: boolean;
  maxDelay?: number;
}

export const DEFAULT_SCALE = springs.light;
export const getDefaultHeart = (theme: any) => ({
  size: 64,
  color: theme.colors.danger,
  showMs: 600,
});

export function DoubleTapLike({
  children,
  onDoubleTap,
  onSingleTap,
  scaleConfig = DEFAULT_SCALE,
  heartConfig,
  haptic = 'medium',
  style,
  disabled,
  maxDelay = 300,
}: DoubleTapLikeProps) {
  const theme = useTheme();

  // Use theme-based default if heartConfig not provided
  const finalHeartConfig = heartConfig || getDefaultHeart(theme);
  // start at 1 to avoid an initial shrink/blink
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartRotate = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    if (haptic === 'off' || disabled) return;
    const style =
      haptic === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : haptic === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium;
    Haptics.impactAsync(style);
  }, [haptic, disabled]);

  const animateScale = useCallback(() => {
    'worklet';
    cancelAnimation(scale);
    scale.value = withSpring(0.96, scaleConfig, () => {
      scale.value = withSpring(1, scaleConfig);
    });
  }, [scaleConfig]);

  const animateHeart = useCallback(() => {
    'worklet';
    cancelAnimation(heartScale);
    cancelAnimation(heartOpacity);
    cancelAnimation(heartRotate);
    heartScale.value = withSpring(1, springs.light);
    heartOpacity.value = withSpring(1, springs.standard);
    heartRotate.value = withSpring(360, springs.bouncy);
    // fade out using withDelay (worklet-safe)
    heartOpacity.value = withDelay(finalHeartConfig.showMs, withTiming(0, { 
      duration: durations.sm,
      easing: motionEasing.exit,
    }));
    heartScale.value = withDelay(finalHeartConfig.showMs, withTiming(0, { 
      duration: durations.sm,
      easing: motionEasing.exit,
    }));
    heartRotate.value = withDelay(finalHeartConfig.showMs, withTiming(0, { 
      duration: durations.sm,
      easing: motionEasing.exit,
    }));
  }, [finalHeartConfig.showMs]);

  const handleDoubleTap = useCallback(() => {
    if (disabled) return;
    runOnJS(triggerHaptic)();
    // keep UI thread worklets on UI
    animateHeart();
    animateScale();
    if (onDoubleTap) runOnJS(onDoubleTap)();
  }, [disabled, triggerHaptic, animateHeart, animateScale, onDoubleTap]);

  // Recognizers: double wins, otherwise single
  const singleTap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(250)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      animateScale();
      if (onSingleTap) runOnJS(onSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .enabled(!disabled)
    .numberOfTaps(2)
    .maxDelay(maxDelay)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      handleDoubleTap();
    });

  const gesture = Gesture.Exclusive(doubleTap, singleTap);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }, { rotate: `${heartRotate.value}deg` }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, style, containerStyle]}>
        {children}
        <Animated.View style={[styles.heartOverlay, heartStyle]}>
          <Text
            style={[
              styles.heart,
              { fontSize: finalHeartConfig.size, color: finalHeartConfig.color },
            ]}
          >
            ❤️
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  heartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
    zIndex: 1000,
    pointerEvents: 'none',
  },
  heart: {
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
