import React, { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useReduceMotion } from "../hooks/useReducedMotion";

type IoniconsName = string;

type RouteName = "Home" | "Swipe" | "Map" | "Matches" | "Profile" | "AdoptionManager" | "Premium";

const getSpringConfig = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return { damping: 1000, stiffness: 1000, mass: 0.9 };
  }
  return { damping: 22, stiffness: 260, mass: 0.9 };
};

const getIcon = (routeName: string, focused: boolean): IoniconsName => {
  const route = routeName as RouteName;
  
  switch (route) {
    case "Home":
      return focused ? "home" : "home-outline";
    case "Swipe":
      return focused ? "heart" : "heart-outline";
    case "Map":
      return focused ? "map" : "map-outline";
    case "Matches":
      return focused ? "chatbubbles" : "chatbubbles-outline";
    case "Profile":
      return focused ? "person" : "person-outline";
    case "AdoptionManager":
      return focused ? "list" : "list-outline";
    case "Premium":
      return focused ? "star" : "star-outline";
    default:
      return "home-outline";
  }
};

export default function ActivePillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReduceMotion();

  // measure each tab
  const layoutsRef = useRef<Record<string, { x: number; w: number }>>({});
  
  // Keep track of last tap times for double-tap detection
  const lastTapRef = useRef<Record<string, number>>({});

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  // icon scale per tab - create stable array of shared values
  const routesLength = state.routes.length;
  const iconScales = useMemo(
    () => {
      // Recreate array only when routes count changes to maintain stable references
      return state.routes.map(() => useSharedValue(1));
    },
    [routesLength],
  );

  useEffect(() => {
    const route = state.routes[state.index];
    if (!route) return;
    const layout = layoutsRef.current[route.key];
    if (!layout) return;

    const springConfig = getSpringConfig(reducedMotion);
    
    indicatorX.value = reducedMotion ? withTiming(layout.x, { duration: 0 }) : withSpring(layout.x, springConfig);
    indicatorW.value = reducedMotion ? withTiming(layout.w, { duration: 0 }) : withSpring(layout.w, springConfig);

    // bounce the focused icon a touch
    const s = iconScales[state.index];
    if (s) {
      if (reducedMotion) {
        s.value = 1;
      } else {
        s.value = 1.15;
        s.value = withSpring(1, { damping: 12, stiffness: 300 });
      }
    }
    // subtle haptic
    if (!reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [state.index, iconScales, indicatorX, indicatorW, state.routes, reducedMotion]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  // mock counts (replace with your store later)
  const getBadgeCount = (routeName: string) => {
    switch (routeName) {
      case "Matches":
        return 3;
      case "Home":
        return 2;
      case "Map":
        return 1;
      default:
        return 0;
    }
  };

  const onTabLayout =
    (key: string) =>
    (e: LayoutChangeEvent): void => {
      const { x, width } = e.nativeEvent.layout;
      layoutsRef.current[key] = { x, w: width };
      // seed initial position on first layout pass
      const currentRoute = state.routes[state.index];
      if (currentRoute && key === currentRoute.key) {
        indicatorX.value = withTiming(x, { duration: 0 });
        indicatorW.value = withTiming(width, { duration: 0 });
      }
    };

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor:
            Platform.OS === "android"
              ? (dark ? "#16181d" : "#ffffff")
              : "transparent",
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint={dark ? "dark" : "light"}
        style={[styles.bar, { borderColor: dark ? "#2a2e36" : "#e5e7eb" }]
      >
        {/* active pill */}
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            },
            pillStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const rawLabel =
            options.tabBarLabel ??
            options.title ??
            route.name;
          
          // Ensure label is always a string
          const label = typeof rawLabel === 'string' ? rawLabel : String(rawLabel);

          const isFocused = state.index === index;
          const badgeCount = getBadgeCount(route.name);
          const showBadge = badgeCount > 0;

          const scale = iconScales[index];
          const iconStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale?.value ?? 1 }],
          }));

          const onPress = () => {
            const now = Date.now();
            const last = lastTapRef.current[route.key] ?? 0;
            const delta = now - last;
            lastTapRef.current[route.key] = now;

            // Bounce animation on icon press
            if (scale && !reducedMotion) {
              scale.value = 0.9;
              scale.value = withSpring(1, { damping: 10, stiffness: 420 });
            }
            
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            // Double-tap detection: if focused and tapped within 300ms, fire custom event
            if (isFocused && delta < 300) {
              // Fire custom event with proper typing
              (navigation as any).emit({ type: "tabDoublePress", target: route.key });
            }

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              onLayout={onTabLayout(route.key)}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || `${label} tab`}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.9}
            >
              <View style={styles.iconWrap} accessibilityRole="button" accessibilityLabel={`${label} icon`}>
                <Animated.View style={iconStyle}>
                  <Ionicons
                    name={getIcon(route.name, isFocused)}
                    size={22}
                    color={isFocused ? colors.primary : colors.onSurface
                  />
                </Animated.View>

                {showBadge ? (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: "#ef4444",
                        borderColor: dark ? "#0b0d11" : "#ffffff",
                      },
                    ]}
                    testID={`${label}.badge`}
                  >
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? "99+" : String(badgeCount)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.primary : colors.onSurface
                    fontWeight: isFocused ? "600" : "400",
                  },
                ]}
                numberOfLines={1}
                accessibilityRole="text"
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
  },
  bar: {
    marginHorizontal: 12,
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: Platform.OS === "ios" ? 0 : 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  pill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});

