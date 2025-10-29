// navigation/UltraTabBar.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, type LayoutChangeEvent, type NativeScrollEvent } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue,
  withRepeat, withSpring, withTiming, runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme as useNavigationTheme } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { tabBarController } from "./tabbarController";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  wrapper: { paddingTop: 8, paddingHorizontal: 10 },
  blurBar: {
    flexDirection: "row", height: 64, overflow: "hidden", borderRadius: 18, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: -6 }, elevation: 24,
  },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, marginTop: 2 },
  iconWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute", top: -6, right: -12, minWidth: 20, height: 20, paddingHorizontal: 6,
    borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "700" },
  underline: { position: "absolute", bottom: 8, height: 3, borderRadius: 2, zIndex: 1, left: 0 },
  spotlight: { position: "absolute", bottom: 32, left: 0, width: 36, height: 36, borderRadius: 18 },
  shimmer: { ...StyleSheet.absoluteFillObject },
});
}


type IoniconsName = string;

type IconNameMap = {
  Home: { focused: "home"; unfocused: "home-outline" };
  Swipe: { focused: "heart"; unfocused: "heart-outline" };
  Map: { focused: "map"; unfocused: "map-outline" };
  Matches: { focused: "chatbubbles"; unfocused: "chatbubbles-outline" };
  Profile: { focused: "person"; unfocused: "person-outline" };
  AdoptionManager: { focused: "list"; unfocused: "list-outline" };
  Premium: { focused: "star"; unfocused: "star-outline" };
};

type RouteName = keyof IconNameMap;

const iconFor = (route: string, focused: boolean): IoniconsName => {
  const routeName = route as RouteName;
  
  switch (routeName) {
    case "Home": return focused ? "home" : "home-outline";
    case "Swipe": return focused ? "heart" : "heart-outline";
    case "Map": return focused ? "map" : "map-outline";
    case "Matches": return focused ? "chatbubbles" : "chatbubbles-outline";
    case "Profile": return focused ? "person" : "person-outline";
    case "AdoptionManager": return focused ? "list" : "list-outline";
    case "Premium": return focused ? "star" : "star-outline";
    default: return "home-outline";
  }
};

const badgeCount = (route: string): number => (route === "Matches" ? 3 : route === "Map" ? 1 : route === "Home" ? 2 : 0);

const UltraTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { colors, dark } = useNavigationTheme();

  const [containerW, setContainerW] = useState(0);
  const tabXs = useRef<number[]>([]);
  const tabWs = useRef<number[]>([]);
  const onContainer = (e: LayoutChangeEvent) => { setContainerW(e.nativeEvent.layout.width); };
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
    breathe.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [breathe]);

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  useEffect(() => {
    const x = tabXs.current[state.index] ?? (containerW / state.routes.length) * state.index;
    const w = tabWs.current[state.index] ?? containerW / state.routes.length;
    indicatorX.value = withSpring(x, { damping: 18, stiffness: 220 });
    indicatorW.value = withSpring(w, { damping: 18, stiffness: 220 });
  }, [state.index, containerW]);

  const spotX = useSharedValue(0);
  const spotOpacity = useSharedValue(0);
  const spotScale = useSharedValue(0.5);
  const spotlight = (cx: number) => {
    spotX.value = cx; spotOpacity.value = 0.14; spotScale.value = 0.6;
    spotScale.value = withTiming(1.25, { duration: 260, easing: Easing.out(Easing.quad) });
    spotOpacity.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) });
  };

  // auto-hide subscription
  const translateY = useSharedValue(0);
  useEffect(() => {
    const unsubscribe = tabBarController.subscribe((hidden) => {
      translateY.value = withTiming(hidden ? 84 : 0, { duration: 280, easing: Easing.out(Easing.cubic) });
    });
    return () => { unsubscribe(); };
  }, [translateY]);

  // shimmer (parallax linear gradient)
  const shimmerX = useSharedValue(0);
  useEffect(() => {
    shimmerX.value = withRepeat(withTiming(1, { duration: 6000 }), -1, false);
  }, []);

  // GESTURE: magnetic scrub across tabs
  const scrubX = useSharedValue(0);
  const isScrubbing = useSharedValue(0);
  const pan = Gesture.Pan()
    .onBegin(() => { isScrubbing.value = 1; })
    .onUpdate((e) => {
      scrubX.value = e.x;
      const idx = Math.max(0, Math.min(state.routes.length - 1, Math.floor((e.x / Math.max(1, containerW)) * state.routes.length)));
      const x = tabXs.current[idx] ?? 0;
      const w = tabWs.current[idx] ?? containerW / state.routes.length;
      indicatorX.value = withSpring(x, { damping: 18, stiffness: 320 });
      indicatorW.value = withSpring(w, { damping: 18, stiffness: 320 });
    })
    .onEnd((e) => {
      isScrubbing.value = 0;
      const idx = Math.max(0, Math.min(state.routes.length - 1, Math.floor((e.x / Math.max(1, containerW)) * state.routes.length)));
      runOnJS(navigateTo)(idx);
    });

  const navigateTo = (idx: number) => {
    const route = state.routes[idx];
    if (!route) return;
    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (state.index !== idx) navigation.navigate(route.name);
  };

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }, { scaleY: interpolate(breathe.value, [0, 1], [1, 1.08], Extrapolation.CLAMP) }],
    width: indicatorW.value,
    opacity: interpolate(breathe.value, [0, 1], [0.9, 1], Extrapolation.CLAMP),
  }));
  const spotStyle = useAnimatedStyle(() => ({ transform: [{ translateX: spotX.value - 18 }, { scale: spotScale.value }], opacity: spotOpacity.value }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerX.value, [0, 1], [-120, 120]) }],
    opacity: dark ? 0.07 : 0.09,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrapper, { paddingBottom: insets.bottom ? insets.bottom - 6 : 8 }, barStyle]} onLayout={onContainer}>
        <BlurView
          intensity={Platform.OS === "ios" ? 88 : 100}
          tint={dark ? "dark" : "light"}
          style={[
            styles.blurBar,
            { backgroundColor: Platform.OS === "android" ? (dark ? "rgba(17,17,17,0.65)" : "rgba(255,255,255,0.65)") : "transparent",
              borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }
          ]}
        >
          {/* Shimmer layer */}
          <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient colors={["transparent", "rgba(255,255,255,0.7)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>

          {/* Spotlight pulse */}
          <Animated.View style={[styles.spotlight, { backgroundColor: colors.primary }, spotStyle]} />

          {/* Breathing underline */}
          <Animated.View style={[styles.underline, { backgroundColor: colors.primary }, indicatorStyle]} />

          {state.routes.map((route, i) => {
            const d = descriptors[route.key]; const opts = d?.options ?? {};
            const label = (opts.tabBarLabel as string) ?? (opts.title as string) ?? route.name;
            const focused = state.index === i; const color = focused ? colors.primary : colors.onSurface;
            const count = badgeCount(route.name);

            // per-tab animations
            const iconScale = useSharedValue(focused ? 1.1 : 1);
            useEffect(() => { iconScale.value = withSpring(focused ? 1.1 : 1, { damping: 15, stiffness: 240 }); }, [focused]);
            const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

            const badgeScale = useSharedValue(count > 0 ? 1 : 0);
            const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }], opacity: badgeScale.value }));
            const prev = useRef(count);
            useEffect(() => {
              if (count > 0 && prev.current !== count) { badgeScale.value = 0.6; badgeScale.value = withSpring(1, { damping: 12, stiffness: 280 }); }
              else if (count === 0) { badgeScale.value = withTiming(0, { duration: 140 }); }
              prev.current = count;
            }, [count]);

            const press = () => {
              if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const evt = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !evt.defaultPrevented) navigation.navigate(route.name);
              const cx = (tabXs.current[i] ?? 0) + (tabWs.current[i] ?? 0) / 2;
              spotlight(cx);
            };

            return (
              <TouchableOpacity key={route.key} onLayout={onTab(i)} onPress={press} onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })} style={styles.tabBtn} activeOpacity={0.92}
                accessibilityRole="tab" accessibilityState={focused ? { selected: true } : {}} accessibilityLabel={opts.tabBarAccessibilityLabel || `${label} tab`} testID={opts.tabBarTestID}>
                <View style={styles.iconWrap}>
                  <Animated.View style={iconStyle}>
                    <Ionicons name={iconFor(route.name, focused)} size={24} color={color} />
                  </Animated.View>
                  {count > 0 && (
                    <Animated.View style={[styles.badge, { borderColor: dark ? "#111" : "#fff", backgroundColor: colors.primary }, badgeStyle]}>
                      <Text style={styles.badgeTxt}>{count > 99 ? "99+" : String(count)}</Text>
                    </Animated.View>
                  )}
                </View>
                <Text style={[styles.label, { color, fontWeight: focused ? "600" : "400" }]} numberOfLines={1}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
};
export default UltraTabBar;
