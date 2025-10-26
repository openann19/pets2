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
import { Spacing, BorderRadius, Typography } from "../styles/GlobalStyles";

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
    small: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
    medium: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    large: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  };

  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.warning, colors.primary],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray100, colors.gray800],
  });

  if (variant === "icon") {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          themeStyles.iconContainer,
          buttonSizes[size],
          { backgroundColor: colors.glassWhiteLight },
          style,
        ]}
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
          <Text style={[themeStyles.label, { color: colors.gray600 }]}>
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
        style={[
          themeStyles.buttonContainer,
          buttonSizes[size],
          styles.buttonSecondary,
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
          <Text style={[themeStyles.buttonText, { color: colors.primary }]}>
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
        style={[
          themeStyles.selectorContainer,
          buttonSizes[size],
          {
            backgroundColor: colors.glassWhiteLight,
            borderColor: colors.gray300,
          },
          style,
        ]}
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
            <Text style={[themeStyles.selectorText, { color: colors.gray700 }]}>
              Theme: {themeLabels[themeMode]}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.gray500} />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

const themeStyles = StyleSheet.create({
  iconContainer: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.xs,
  },

  buttonContainer: {
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },

  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },

  selectorContainer: {
    borderRadius: BorderRadius.lg,
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
    gap: Spacing.sm,
  },

  selectorText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },

  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});

export default ThemeToggle;
