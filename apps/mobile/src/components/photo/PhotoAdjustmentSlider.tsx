import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../theme/unified-theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface PhotoAdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;           // default 1
  defaultValue?: number;   // for double-tap reset
  icon: string;
  onValueChange: (value: number) => void;
}

export const PhotoAdjustmentSlider: React.FC<PhotoAdjustmentSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue,
  icon,
  onValueChange,
}) => {
  const trackW = useSharedValue(0);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const pos = useSharedValue(pct);

  // animate when prop changes externally
  React.useEffect(() => {
    const target = Math.max(0, Math.min(1, (value - min) / (max - min)));
    pos.value = withTiming(target, { duration: 120 });
  }, [value, min, max, pos]);

  const onLayoutTrack = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    trackW.value = width;
  };

  const setFromPct = (p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    const raw = min + clamped * (max - min);
    const snapped = Math.round(raw / step) * step;
    onValueChange(Math.max(min, Math.min(max, snapped)));
  };

  // haptic tick when passing midpoints (0/25/50/75/100%)
  const lastTick = useRef<number>(-1);

  const drag = Gesture.Pan()
    .onBegin(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((e) => {
      if (!trackW.value) return;
      const nx = Math.max(0, Math.min(trackW.value, e.x));
      const np = nx / trackW.value;
      pos.value = np;
      setFromPct(np);

      const tick = Math.round(np * 4); // 0..4
      if (tick !== lastTick.current) {
        lastTick.current = tick;
        Haptics.selectionAsync();
      }
    })
    .onEnd(() => {
      lastTick.current = -1;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (defaultValue !== undefined) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const p = (defaultValue - min) / (max - min);
        pos.value = withSpring(p);
        onValueChange(defaultValue);
      }
    });

  const composed = Gesture.Exclusive(doubleTap, drag);

  // Animated styles for fill and thumb
  const fillStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: `${pos.value * 100}%` as any,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      left: `${pos.value * 100}%` as any,
    };
  });
  
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: Math.round(value) }}
      accessibilityActions={[
        { name: 'increment', label: 'Increase' },
        { name: 'decrement', label: 'Decrease' },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') setFromPct(Math.min(1, pct + step / (max - min)));
        if (e.nativeEvent.actionName === 'decrement') setFromPct(Math.max(0, pct - step / (max - min)));
      }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color="white" />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value)}</Text>
      </View>

      <GestureDetector gesture={composed}>
        <View style={styles.sliderTrack} onLayout={onLayoutTrack}>
          <View style={styles.sliderBackground}>
            <Animated.View style={[styles.sliderFill, fillStyle]} />
          </View>
          <Animated.View style={[styles.sliderThumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', columnGap: 12, marginBottom: 12 },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: 'white' },
  value: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary[500], minWidth: 50, textAlign: 'right' },

  sliderTrack: { height: 40, justifyContent: 'center' },
  sliderBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: Theme.colors.primary[500], borderRadius: 3 },

  sliderThumb: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: Theme.colors.primary[500],
    borderWidth: 3, borderColor: 'white',
    top: 8, // centers thumb on 6px track
  },
});
