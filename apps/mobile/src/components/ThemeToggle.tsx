import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useThemeToggle } from "../hooks/useThemeToggle";
import { MOBILE_SPACING } from "../constants/design-tokens";

interface ThemeToggleProps {
  variant?: "icon" | "button" | "selector";
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  size = "medium",
  showLabel = false,
  style,
}) => {
  const { isDark, themeMode, colors, styles, toggleTheme, showThemeSelector } =
    useThemeToggle();

  const animatedValue = React.useRef(
    new Animated.Value(isDark ? 1 : 0),
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark, animatedValue]);

  // Icon sizes
  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28,
  };

  // Button sizes
  const buttonSizes = {
    small: { paddingHorizontal: MOBILE_SPACING[16] || 16, paddingVertical: MOBILE_SPACING[8] || 8 },
    medium: { paddingHorizontal: MOBILE_SPACING[24] || 24, paddingVertical: MOBILE_SPACING[16] || 16 },
    large: { paddingHorizontal: MOBILE_SPACING[32] || 32, paddingVertical: MOBILE_SPACING[24] || 24 },
  };

  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.warning, colors.primary],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.palette.neutral[100], theme.palette.neutral[800]],
  });

  if (variant === "icon") {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
        accessibilityHint="Toggles between light and dark theme"
        style={StyleSheet.flatten([
          themeStyles.iconContainer,
          buttonSizes[size],
          { backgroundColor: colors.glassWhiteLight },
          style,
        ])}
        activeOpacity={0.7}
      >
        <Animated.View>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={iconSizes[size]}
            color={isDark ? colors.primary : colors.warning}
          />
        </Animated.View>
        {showLabel && (
          <Text
            style={StyleSheet.flatten([
              themeStyles.label,
              { color: theme.palette.neutral[600] },
            ])}
          >
            {isDark ? "Dark" : "Light"}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === "button") {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
        accessibilityHint="Toggles between light and dark theme"
        style={[
          themeStyles.buttonContainer,
          buttonSizes[size],
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={themeStyles.buttonContent}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={iconSizes[size]}
            color={colors.primary}
          />
          <Text
            style={StyleSheet.flatten([
              themeStyles.buttonText,
              { color: colors.primary },
            ])}
          >
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "selector") {
    const themeLabels = {
      light: "Light",
      dark: "Dark",
      system: "Auto",
    };

    return (
      <TouchableOpacity
        onPress={showThemeSelector}
        style={StyleSheet.flatten([
          themeStyles.selectorContainer,
          buttonSizes[size],
          {
            backgroundColor: colors.glassWhiteLight,
            borderColor: theme.palette.neutral[300],
          },
          style,
        ])}
        activeOpacity={0.8}
      >
        <View style={themeStyles.selectorContent}>
          <View style={themeStyles.selectorLeft}>
            <Ionicons
              name={
                themeMode === "system"
                  ? "phone-portrait"
                  : isDark
                    ? "moon"
                    : "sunny"
              }
              size={iconSizes[size]}
              color={colors.primary}
            />
            <Text
              style={StyleSheet.flatten([
                themeStyles.selectorText,
                { color: theme.palette.neutral[700] },
              ])}
            >
              Theme: {themeLabels[themeMode]}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={theme.palette.neutral[500]} />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

const themeStyles = StyleSheet.create({
  iconContainer: {
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },

  buttonContainer: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  selectorContainer: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  selectorText: {
    fontSize: 16,
    fontWeight: "500",
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ThemeToggle;
