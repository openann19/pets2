import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
  showBadge?: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  routeName,
  focused,
  color,
  size,
  badgeCount = 0,
  showBadge = false,
}) => {
  const scale = useSharedValue(1);
  const badgeOpacity = useSharedValue(showBadge ? 1 : 0);
  const badgeScale = useSharedValue(showBadge ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  useEffect(() => {
    if (showBadge && badgeCount > 0) {
      badgeOpacity.value = withTiming(1, { duration: 300 });
      badgeScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    } else {
      badgeOpacity.value = withTiming(0, { duration: 200 });
      badgeScale.value = withTiming(0, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBadge, badgeCount]);

  const getIconName = (): string => {
    switch (routeName) {
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

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={animatedIconStyle}>
        <Ionicons name={getIconName()} size={size} color={color} />
      </Animated.View>

      {showBadge && badgeCount > 0 ? (
        <Animated.View style={[styles.badge, animatedBadgeStyle]}>
          <Text style={styles.badgeText}>
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
  const { colors } = useTheme();

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

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
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
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

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
              color={isFocused ? colors.primary : colors.text}
              size={24}
              badgeCount={badgeCount}
              showBadge={showBadge}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.primary : colors.text,
                  fontWeight: isFocused ? "600" : "400",
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingBottom: 5,
    paddingTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
});

export default EnhancedTabBar;
