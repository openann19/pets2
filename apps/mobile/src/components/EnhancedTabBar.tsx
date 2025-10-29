import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@mobile/src/theme";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";


interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
  showBadge?: boolean;
  impulse?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  routeName,
  focused,
  color,
  size,
  badgeCount = 0,
  showBadge = false,
  impulse = 0,
}) => {
  const appTheme = useTheme();
  const tColors = appTheme.colors;
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);
  const badgeOpacity = useSharedValue(showBadge ? 1 : 0);
  const badgeScale = useSharedValue(showBadge ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [focused, scale]);

  // react to 'impulse' ticks (double tap or reselect)
  useEffect(() => {
    // quick pulse
    scale.value = withSpring(1.18, { damping: 18, stiffness: 420 });
    // ripple out
    ripple.value = 0;
    ripple.value = withTiming(1, { duration: 450 });
    const t = setTimeout(() => {
      scale.value = withSpring(focused ? 1.1 : 1, { damping: 15, stiffness: 200 });
    }, 180);
    return () => { clearTimeout(t); };
  }, [impulse, scale, ripple, focused]);

  useEffect(() => {
    if (showBadge && badgeCount > 0) {
      badgeOpacity.value = withTiming(1, { duration: 300 });
      badgeScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    } else {
      badgeOpacity.value = withTiming(0, { duration: 200 });
      badgeScale.value = withTiming(0, { duration: 200 });
    }
  }, [showBadge, badgeCount, badgeOpacity, badgeScale]);

  const getIconName = () => {
    switch (routeName) {
      case "Home":
        return focused ? ("home" as const) : ("home-outline" as const);
      case "Swipe":
        return focused ? ("heart" as const) : ("heart-outline" as const);
      case "Map":
        return focused ? ("map" as const) : ("map-outline" as const);
      case "Matches":
        return focused ? ("chatbubbles" as const) : ("chatbubbles-outline" as const);
      case "Profile":
        return focused ? ("person" as const) : ("person-outline" as const);
      case "AdoptionManager":
        return focused ? ("list" as const) : ("list-outline" as const);
      case "Premium":
        return focused ? ("star" as const) : ("star-outline" as const);
      default:
        return "home-outline" as const;
    }
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 1 - ripple.value,
    transform: [{ scale: interpolate(ripple.value, [0, 1], [0.4, 2]) }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[styles.ripple, rippleStyle]} />
      <Animated.View style={animatedIconStyle}>
        <Ionicons name={getIconName()} size={size} color={color} />
      </Animated.View>

      {showBadge && badgeCount > 0 ? (
        <Animated.View
          style={StyleSheet.flatten([
            styles.badge,
            { backgroundColor: tColors.danger, borderColor: tColors.bg },
            animatedBadgeStyle,
          ])}
        >
          <Text style={StyleSheet.flatten([styles.badgeText, { color: tColors.onPrimary }])}>
            {badgeCount > 99 ? "99+" : badgeCount.toString()}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

interface TabRoute {
  key: string;
  name: string;
}

interface TabBarState {
  index: number;
  routes: TabRoute[];
}

interface EnhancedTabBarProps {
  state: TabBarState;
  descriptors: any; // React Navigation bottom tab descriptors
  navigation: any; // React Navigation navigation helper
}

export const EnhancedTabBar: React.FC<EnhancedTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const tabBarPosition = useSharedValue(0);
  const lastTapRef = useRef<Record<string, number>>({});
  const [impulses, setImpulses] = useState<Record<string, number>>({});
  const bump = (key: string) =>
    { setImpulses(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 })); };

  // Animate tab bar based on interactions
  useEffect(() => {
    tabBarPosition.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
  }, [tabBarPosition]);

  // Mock notification counts - in real app, these would come from state/context
  const getBadgeCount = (routeName: string): number => {
    switch (routeName) {
      case "Matches":
        return 3; // Mock: 3 new matches
      case "Swipe":
        return 0; // No notifications
      case "Map":
        return 1; // Mock: 1 nearby pet
      case "Profile":
        return 0; // No notifications
      case "Home":
        return 2; // Mock: 2 updates
      case "AdoptionManager":
        return 0; // No notifications
      case "Premium":
        return 0; // No notifications
      default:
        return 0;
    }
  };

  const getBadgeVisibility = (routeName: string): boolean => {
    const count = getBadgeCount(routeName);
    return count > 0;
  };

  const animatedTabBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      tabBarPosition.value,
      [0, 1],
      [80, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  // Active tab indicator animation  
  const indicatorOffset = useSharedValue(state.index);
  
  useEffect(() => {
    indicatorOffset.value = withSpring(state.index, {
      damping: 20,
      stiffness: 300,
    });
  }, [state.index, indicatorOffset]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabCount = state.routes.length;
    const percentPerTab = 100 / tabCount;
    const position = indicatorOffset.value * percentPerTab;
    
    return {
      left: `${position}%`,
      width: `${percentPerTab}%`,
    } as any; // Type assertion for percentage strings
  });

  // Animated pill opacity
  const pillOpacity = useSharedValue(0);
  useEffect(() => {
    pillOpacity.value = withTiming(1, { duration: 200 });
  }, [state.index, pillOpacity]);

  const animatedPillStyle = useAnimatedStyle(() => {
    const tabCount = state.routes.length;
    const percentPerTab = 100 / tabCount;
    const position = indicatorOffset.value * percentPerTab;
    
    return {
      left: `${position}%`,
      width: `${percentPerTab}%`,
      opacity: pillOpacity.value,
    } as any;
  });

  return (
    <Animated.View
      style={[
        animatedTabBarStyle,
        {
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint={theme.scheme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            backgroundColor:
              Platform.OS === 'android'
                ? colors.bg
                : 'transparent',
          },
        ]}
      >
        {/* Active tab pill */}
        <Animated.View
          style={[
            styles.activePill,
            animatedPillStyle,
          ]}
        />
        
        {/* Active tab indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            animatedIndicatorStyle,
          ]}
        />
        
        {state.routes.map((route: TabRoute, index: number) => {
        const descriptor = descriptors[route.key];
        const options = descriptor?.options ?? {};
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = (): void => {
          // Haptic feedback on tab press
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          // double-tap detection (300ms window)
          const now = Date.now();
          const last = lastTapRef.current[route.key] ?? 0;
          lastTapRef.current[route.key] = now;
          const isDouble = now - last < 300;

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          // if active and single reselect
          if (isFocused && !isDouble) {
            navigation.emit({ type: "tabReselect", target: route.key });
            bump(route.key); // visual impulse (near-top refresh will also listen)
          }

          if (isFocused && isDouble) {
            // visual impulse + emit the custom event
            bump(route.key);
            navigation.emit({ type: "tabDoublePress", target: route.key });
            return;
          }

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = (): void => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const badgeCount = getBadgeCount(route.name);
        const showBadge = getBadgeVisibility(route.name);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              options.tabBarAccessibilityLabel || `${label} tab`
            }
            accessibilityHint={
              isFocused
                ? `Currently selected ${label} tab`
                : `Navigate to ${label} tab`
            }
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <TabBarIcon
              routeName={route.name}
              focused={isFocused}
              color={isFocused ? colors.primary : colors.onSurface}
              size={24}
              badgeCount={badgeCount}
              showBadge={showBadge}
              impulse={impulses[route.key] ?? 0}
            />
            <Text
              style={StyleSheet.flatten([
                styles.tabLabel,
                {
                  color: isFocused ? colors.primary : colors.onSurface,
                  fontWeight: isFocused ? "600" : "400",
                },
              ])}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
        {/* Active indicator color override */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            animatedIndicatorStyle,
            { backgroundColor: colors.primary },
          ]}
        />
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 64,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
    overflow: "hidden",
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(236,72,153,0.35)", // primary glow-ish
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  activePill: {
    position: "absolute",
    top: 8,
    bottom: 40,
    borderRadius: 12,
    zIndex: 0,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  activeIndicator: {
    position: "absolute",
    bottom: 8,
    height: 3,
    borderRadius: 2,
    zIndex: 1,
  },
});

export default EnhancedTabBar;
