// navigation/UltraTabBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme as useNavigationTheme } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { tabBarController } from './tabbarController';
import { useTheme as useAppTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useCapabilities } from '@/foundation/capabilities';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { springs } from '@/foundation/motion';

type IconNameMap = {
  Home: { focused: 'home'; unfocused: 'home-outline' };
  Swipe: { focused: 'heart'; unfocused: 'heart-outline' };
  Map: { focused: 'map'; unfocused: 'map-outline' };
  Matches: { focused: 'chatbubbles'; unfocused: 'chatbubbles-outline' };
  Profile: { focused: 'person'; unfocused: 'person-outline' };
  AdoptionManager: { focused: 'list'; unfocused: 'list-outline' };
  Premium: { focused: 'star'; unfocused: 'star-outline' };
};

type RouteName = keyof IconNameMap;

const badgeCount = (route: string): number =>
  route === 'Matches' ? 3 : route === 'Map' ? 1 : route === 'Home' ? 2 : 0;

/**
 * Get icon name for route
 */
function getIcon(routeName: string, focused: boolean): string {
  const iconMap: IconNameMap = {
    Home: { focused: 'home', unfocused: 'home-outline' },
    Swipe: { focused: 'heart', unfocused: 'heart-outline' },
    Map: { focused: 'map', unfocused: 'map-outline' },
    Matches: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
    Profile: { focused: 'person', unfocused: 'person-outline' },
    AdoptionManager: { focused: 'list', unfocused: 'list-outline' },
    Premium: { focused: 'star', unfocused: 'star-outline' },
  };
  
  const icons = iconMap[routeName as RouteName];
  if (!icons) return 'circle';
  return focused ? icons.focused : icons.unfocused;
}

// Separate component for tab items to avoid hook rules violations
function TabComponent({
  route,
  index,
  state,
  colors,
  appTheme,
  onPress,
  onLayout,
}: {
  route: { key: string; name: string };
  index: number;
  state: { descriptors: BottomTabBarProps['descriptors']; index: number };
  colors: ReturnType<typeof useNavigationTheme>['colors'];
  appTheme: AppTheme;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const descriptor = state.descriptors[route.key];
  const opts = descriptor?.options ?? {};
  const label = (opts.tabBarLabel as string) ?? (opts.title as string) ?? route.name;
  const focused = state.index === index;
  const color = focused ? colors.primary : appTheme.colors.onMuted;
  const count = badgeCount(route.name);

  // per-tab animations
  const iconScale = useSharedValue(focused ? 1.1 : 1);
  useEffect(() => {
    iconScale.value = withSpring(focused ? 1.1 : 1, springs.standard);
  }, [focused]);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

  const badgeScale = useSharedValue(count > 0 ? 1 : 0);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));
  const prev = useRef(count);
  useEffect(() => {
    if (count > 0 && prev.current !== count) {
      badgeScale.value = 0.6;
      badgeScale.value = withSpring(1, springs.bouncy);
    } else if (count === 0) {
      badgeScale.value = withTiming(0, { duration: 140 });
    }
    prev.current = count;
  }, [count]);

  const icon = getIcon(route.name, focused);

  return (
    <Pressable
      key={route.key}
      onLayout={onLayout}
      style={styles.tab}
      onPress={onPress}
      android_ripple={{ color: colors.primary + '20', borderless: false }}
      accessibilityLabel={`${label}${count > 0 ? `, ${count} notifications` : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityHint={`Navigate to ${label} screen`}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={[iconStyle, styles.iconContainer]}>
          <Ionicons
            name={icon}
            size={23}
            color={color}
            accessibilityLabel=""
          />
        </Animated.View>
        {count > 0 && (
          <Animated.View 
            style={[badgeStyle, styles.badge, { backgroundColor: appTheme.colors.danger }]}
            accessibilityLabel={`${count} unread notifications`}
            accessibilityRole="text"
          >
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </Animated.View>
        )}
      </View>
      <Text style={[styles.label, { color }]} accessibilityRole="text">{label}</Text>
    </Pressable>
  );
}

const UltraTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useNavigationTheme();
  const appTheme = useAppTheme() as AppTheme;
  const reducedMotion = useReduceMotion();

  // Capability-gated blur intensity
  // Matches polish mandate: blur > 20 requires highPerf && thermalsOk
  const caps = useCapabilities();
  const baseIntensity = Platform.OS === 'ios' ? 88 : 100;
  const blurIntensity = caps.highPerf && caps.thermalsOk 
    ? baseIntensity 
    : Math.min(baseIntensity, 20); // Reduce blur for low-end devices

  const [containerW, setContainerW] = useState(0);
  const tabXs = useRef<number[]>([]);
  const tabWs = useRef<number[]>([]);
  const onContainer = (e: LayoutChangeEvent) => {
    setContainerW(e.nativeEvent.layout.width);
  };
  const onTab = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabXs.current[i] = x;
    tabWs.current[i] = width;
    if (i === state.index) {
      indicatorX.value = withTiming(x, { duration: 180 });
      indicatorW.value = withTiming(width, { duration: 180 });
    }
  };

  // underline breath + spotlight
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [breathe]);

  // Liquid pill indicator (metaball effect simulation)
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  const indicatorMorph = useSharedValue(0); // 0 = normal, 1 = stretched to next tab
  
  useEffect(() => {
    const x = tabXs.current[state.index] ?? (containerW / state.routes.length) * state.index;
    const w = tabWs.current[state.index] ?? containerW / state.routes.length;
    
    if (reducedMotion) {
      // Simple slide for reduced motion
      indicatorX.value = withTiming(x, { duration: 220 });
      indicatorW.value = withTiming(w, { duration: 220 });
      indicatorMorph.value = 0;
    } else {
      // Liquid animation: splat then ease
      indicatorMorph.value = 1;
      indicatorScale.value = 1.15; // Splat effect
      
      // Animate position with spring
      indicatorX.value = withSpring(x, springs.velocity, (finished) => {
        if (finished) {
          // Ease back to normal shape
          indicatorScale.value = withSpring(1, springs.standard);
          indicatorMorph.value = withSpring(0, springs.standard);
        }
      });
      
      indicatorW.value = withSpring(w, springs.velocity);
    }
  }, [state.index, containerW, state.routes.length, reducedMotion]);

  const spotX = useSharedValue(0);
  const spotOpacity = useSharedValue(0);
  const spotScale = useSharedValue(0.5);
  const spotlight = (cx: number) => {
    spotX.value = cx;
    spotOpacity.value = 0.14;
    spotScale.value = 0.6;
    spotScale.value = withTiming(1.25, { duration: 260, easing: Easing.out(Easing.quad) });
    spotOpacity.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) });
  };

  // auto-hide subscription
  const translateY = useSharedValue(0);
  useEffect(() => {
    const unsubscribe = tabBarController.subscribe((hidden) => {
      translateY.value = withTiming(hidden ? 84 : 0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    });
    return () => {
      unsubscribe();
    };
  }, [translateY]);

  // shimmer (parallax linear gradient)
  const shimmerX = useSharedValue(0);
  useEffect(() => {
    shimmerX.value = withRepeat(withTiming(1, { duration: 6000 }), -1, false);
  }, [shimmerX]);

  // GESTURE: magnetic scrub across tabs
  const scrubX = useSharedValue(0);
  const isScrubbing = useSharedValue(0);
  const pan = Gesture.Pan()
    .onBegin(() => {
      isScrubbing.value = 1;
    })
    .onUpdate((e) => {
      scrubX.value = e.x;
      const idx = Math.max(
        0,
        Math.min(
          state.routes.length - 1,
          Math.floor((e.x / Math.max(1, containerW)) * state.routes.length),
        ),
      );
      const x = tabXs.current[idx] ?? 0;
      const w = tabWs.current[idx] ?? containerW / state.routes.length;
      indicatorX.value = withSpring(x, springs.standard);
      indicatorW.value = withSpring(w, springs.standard);
    })
    .onEnd((e) => {
      isScrubbing.value = 0;
      const idx = Math.max(
        0,
        Math.min(
          state.routes.length - 1,
          Math.floor((e.x / Math.max(1, containerW)) * state.routes.length),
        ),
      );
      runOnJS(navigateTo)(idx);
    });

  const navigateTo = (idx: number) => {
    const route = state.routes[idx];
    if (!route) return;
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
    if (state.index !== idx) navigation.navigate(route.name);
  };

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  
  // Liquid pill indicator style with metaball-like morphing
  const indicatorStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      // Simple underline slide for reduced motion
      return {
        transform: [{ translateX: indicatorX.value }],
        width: indicatorW.value,
        opacity: 0.9,
      };
    }
    
    // Liquid effect: rounded pill that morphs
    const morphProgress = indicatorMorph.value;
    const scale = indicatorScale.value;
    
    // Calculate border radius based on morph (pill shape → stretched)
    const baseRadius = 12;
    const morphRadius = interpolate(
      morphProgress,
      [0, 1],
      [baseRadius, baseRadius * 0.6],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        { translateX: indicatorX.value },
        { scaleY: scale * interpolate(breathe.value, [0, 1], [1, 1.08], Extrapolation.CLAMP) },
      ],
      width: indicatorW.value,
      borderRadius: morphRadius,
      opacity: interpolate(breathe.value, [0, 1], [0.9, 1], Extrapolation.CLAMP),
    };
  });
  const spotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: spotX.value - 18 }, { scale: spotScale.value }],
    opacity: spotOpacity.value,
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerX.value, [0, 1], [-120, 120]) }],
    opacity: dark ? 0.07 : 0.09,
  }));

  const dynamicStyles = {
    blurBar: {
      flexDirection: 'row' as const,
      height: 64,
      overflow: 'hidden',
      borderRadius: 18,
      borderWidth: 1,
      shadowColor: appTheme.colors.onSurface,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -6 },
      elevation: 24,
      backgroundColor:
        Platform.OS === 'android'
          ? dark
            ? 'rgba(17,17,17,0.65)'
            : 'rgba(255,255,255,0.65)'
          : 'transparent',
      borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    badgeTxt: { color: appTheme.colors.onPrimary, fontSize: 10, fontWeight: '700' as const },
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.wrapper, { paddingBottom: insets.bottom ? insets.bottom - 6 : 8 }, barStyle]}
        onLayout={onContainer}
      >
        <BlurView
          intensity={blurIntensity}
          tint={dark ? 'dark' : 'light'}
          style={[dynamicStyles.blurBar]}
        >
          {/* Shimmer layer */}
          <Animated.View
            pointerEvents="none"
            style={[styles.shimmer, shimmerStyle]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Spotlight pulse */}
          <Animated.View
            style={[styles.spotlight, { backgroundColor: colors.primary }, spotStyle]}
          />

          {/* Breathing underline */}
          <Animated.View
            style={[styles.underline, { backgroundColor: colors.primary }, indicatorStyle]}
          />

          {state.routes.map((route, i) => {
            const press = () => {
              // Haptic feedback on tab switch
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } else {
                // Android: Use selection haptic for tab switches
                Haptics.selectionAsync().catch(() => {});
              }

              const evt = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (state.index !== i && !evt.defaultPrevented) navigation.navigate(route.name);
              const cx = (tabXs.current[i] ?? 0) + (tabWs.current[i] ?? 0) / 2;
              spotlight(cx);
            };

            return (
              <TabComponent
                key={route.key}
                route={route}
                index={i}
                state={{ ...state, descriptors }}
                colors={colors}
                appTheme={appTheme}
                onPress={press}
                onLayout={onTab(i)}
              />
            );
          })}
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingTop: 8, paddingHorizontal: 10 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, marginTop: 2 },
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  underline: { position: 'absolute', bottom: 8, height: 3, borderRadius: 2, zIndex: 1, left: 0 },
  spotlight: { position: 'absolute', bottom: 32, left: 0, width: 36, height: 36, borderRadius: 18 },
  shimmer: { ...StyleSheet.absoluteFillObject },
});

export default UltraTabBar;
