/**
 * LiquidTabs – measured layout, external index sync
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Pressable, Text, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring, useSharedValue, Easing } from 'react-native-reanimated';
import { durations, easings, scales, springs } from '@/foundation/motion';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { LiquidIndicator } from './LiquidIndicator';
import { LiquidIndicatorGel } from './LiquidIndicatorGel';
import { LiquidIndicatorFallback } from './LiquidIndicatorFallback';
import { useCapabilities } from '@/foundation/useCapabilities';
import { hapticSimple } from '@/foundation/haptics';

export type Tab = { key: string; title: string; onPress: () => void };

export function LiquidTabs({ tabs, index }: { tabs: Tab[]; index: number }) {
  const reduced = useReducedMotion();
  const caps = useCapabilities(true);
  const wFrac = useMemo(() => 1 / Math.max(1, tabs.length), [tabs.length]);

  const containerW = useSharedValue(0);
  const leftPx = useSharedValue(0);
  const pillScale = useSharedValue(1);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      containerW.value = w;
      leftPx.value = index * wFrac * w;
    }
  };

  // keep in sync if parent changes index
  useEffect(() => {
    leftPx.value = withTiming(index * containerW.value * wFrac, {
      duration: durations.md,
      easing: Easing.bezier(...easings.enter),
    });
  }, [index, leftPx, containerW, wFrac]);

  const onTab = (i: number, cb: () => void) => {
    pillScale.value = scales.pressed;
    requestAnimationFrame(() => (pillScale.value = 1));
    leftPx.value = withTiming(i * containerW.value * wFrac, {
      duration: durations.md,
      easing: Easing.bezier(...easings.enter),
    });
    hapticSimple('soft');
    cb();
  };

  const pillStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: withSpring(pillScale.value, springs.standard) }],
      left: leftPx.value,
      width: containerW.value * wFrac,
    }),
    [],
  );

  return (
    <View
      onLayout={onLayout}
      style={{ position: 'absolute', left: 16, right: 16, bottom: 12, borderRadius: 18, backgroundColor: 'rgba(10,10,10,0.7)' }}
    >
      <Animated.View style={[{ position: 'absolute', bottom: 6, height: 34 }, pillStyle]}>
        {caps.skia && !reduced ? (
          <LiquidIndicatorGel width={containerW.value * wFrac || 0} />
        ) : (
          <LiquidIndicatorFallback width={containerW.value * wFrac || 0} />
        )}
      </Animated.View>

      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        {tabs.map((t, i) => (
          <Pressable
            key={t.key}
            onPress={() => onTab(i, t.onPress)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === i }}
            accessibilityLabel={t.title}
          >
            <Text style={{ color: index === i ? 'white' : '#bbb', fontWeight: '700' }}>{t.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

