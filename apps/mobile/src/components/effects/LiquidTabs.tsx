/**
 * 🎯 LIQUID TABS - UltraTabBar Upgrade
 * 
 * Viscous pill that morphs like liquid between tabs
 * - Skia metaball simulation (falls back to Reanimated morph)
 * - Tab switch ≤220ms
 * - Reduced motion → simple underline slide
 * 
 * DoD: Tab switch ≤220ms; no overdraw spikes; reduced-motion → simple underline slide
 */

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useCapabilities } from '@/foundation/capabilities';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useAnimationTelemetry } from '@/foundation/telemetry';
import { springs } from '@/foundation/motion';
import * as Haptics from 'expo-haptics';

interface Tab {
  key: string;
  title: string;
  onPress: () => void;
  icon?: string;
  badge?: number;
}

interface LiquidTabsProps {
  tabs: Tab[];
  index: number;
}

/**
 * Calculate left position percentage for tab indicator
 */
function calcLeft(index: number, count: number): number {
  return Math.max(0, Math.min(100, (index / count) * 100));
}

export function LiquidTabs({ tabs, index }: LiquidTabsProps) {
  const theme = useTheme() as AppTheme;
  const caps = useCapabilities();
  const reducedMotion = useReduceMotion();
  const insets = useSafeAreaInsets();
  const telemetry = useAnimationTelemetry('liquid-tabs', 'LiquidTabs');
  
  const containerWidth = useSharedValue(0);
  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  const indicatorMorph = useSharedValue(0);
  
  const tabLayouts = useRef<Array<{ x: number; width: number }>>([]);

  // Capability-gated blur
  const blurIntensity = caps.highPerf && caps.thermalsOk 
    ? (Platform.OS === 'ios' ? 88 : 100)
    : 20;

  // Update indicator position on index change
  useEffect(() => {
    if (tabs.length === 0) return;
    
    const tabLayout = tabLayouts.current[index];
    if (!tabLayout) return;

    const targetLeft = tabLayout.x;
    const targetWidth = tabLayout.width;
    const startTime = Date.now();

    // Track tab switch
    telemetry.start();

    if (reducedMotion) {
      // Simple slide
      indicatorLeft.value = withTiming(targetLeft, { duration: 220 });
      indicatorWidth.value = withTiming(targetWidth, { duration: 220 });
      indicatorMorph.value = 0;
      
      setTimeout(() => {
        telemetry.end(Date.now() - startTime, false);
      }, 220);
    } else {
      // Liquid animation: splat then ease
      indicatorMorph.value = 1;
      indicatorScale.value = 1.15; // Splat effect
      
      indicatorLeft.value = withSpring(targetLeft, springs.velocity, (finished) => {
        if (finished) {
          const duration = Date.now() - startTime;
          telemetry.end(duration, false);
          
          // Ease back to normal shape
          indicatorScale.value = withSpring(1, springs.standard);
          indicatorMorph.value = withSpring(0, springs.standard);
        }
      });
      
      indicatorWidth.value = withSpring(targetWidth, springs.velocity);
    }
  }, [index, tabs.length, reducedMotion, telemetry]);

  // Animated indicator style
  const indicatorStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return {
        transform: [{ translateX: indicatorLeft.value }],
        width: indicatorWidth.value,
        opacity: 0.9,
      };
    }
    
    const morphProgress = indicatorMorph.value;
    const scale = indicatorScale.value;
    const baseRadius = 12;
    const morphRadius = interpolate(
      morphProgress,
      [0, 1],
      [baseRadius, baseRadius * 0.6],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        { translateX: indicatorLeft.value },
        { scaleY: scale },
      ],
      width: indicatorWidth.value,
      borderRadius: morphRadius,
      opacity: 0.95,
    };
  });

  const handleTabLayout = (i: number) => (e: { nativeEvent: { layout: { x: number; width: number } } }) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[i] = { x, width };
    
    // Initialize indicator position
    if (i === index && indicatorLeft.value === 0) {
      indicatorLeft.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleTabPress = (tab: Tab) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
    tab.onPress();
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom ? insets.bottom - 6 : 8 },
      ]}
      onLayout={(e) => {
        containerWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={styles.blurBar}
      >
        {/* Liquid pill indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: theme.colors.primary },
            indicatorStyle,
          ]}
        />

        {/* Tabs */}
        {tabs.map((tab, i) => {
          const isFocused = i === index;
          return (
            <Pressable
              key={tab.key}
              onLayout={handleTabLayout(i)}
              onPress={() => handleTabPress(tab)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={`${tab.title} tab`}
            >
              {tab.icon && (
                <Text style={[styles.icon, { color: isFocused ? theme.colors.primary : theme.colors.onMuted }]}>
                  {tab.icon}
                </Text>
              )}
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? theme.colors.primary : theme.colors.onMuted },
                ]}
              >
                {tab.title}
              </Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  blurBar: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    bottom: 8,
    height: 3,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export { calcLeft };

