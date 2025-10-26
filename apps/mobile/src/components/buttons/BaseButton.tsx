/**
 * PROJECT HYPERION: BASE BUTTON COMPONENT
 *
 * Foundational button component that only handles:
 * - Basic press events and styling
 * - Loading and disabled states
 * - Theme-based styling
 * - Accessibility support
 *
 * This follows the Single Responsibility Principle - no visual effects here.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  type TouchableOpacityProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Theme } from "../../theme/unified-theme";

// === TYPES ===
export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface BaseButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

// === SIZE CONFIGURATIONS ===
const SIZE_CONFIGS = {
  sm: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.sm,
    borderRadius: Theme.borderRadius.md,
    minHeight: 36,
    iconSize: 16,
  },
  md: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    borderRadius: Theme.borderRadius.lg,
    minHeight: 44,
    iconSize: 20,
  },
  lg: {
    paddingHorizontal: Theme.spacing["2xl"],
    paddingVertical: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.lg,
    borderRadius: Theme.borderRadius.xl,
    minHeight: 52,
    iconSize: 24,
  },
  xl: {
    paddingHorizontal: Theme.spacing["3xl"],
    paddingVertical: Theme.spacing.xl,
    fontSize: Theme.typography.fontSize.xl,
    borderRadius: Theme.borderRadius["2xl"],
    minHeight: 60,
    iconSize: 28,
  },
} as const;

// === MAIN COMPONENT ===
const BaseButton = forwardRef<TouchableOpacity, BaseButtonProps>(
  (
    {
      title,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      style,
      textStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const sizeConfig = SIZE_CONFIGS[size];
    const isDisabled = disabled || loading;

    // Get variant styles
    const getVariantStyles = (): ViewStyle => {
      const baseStyles: ViewStyle = {
        borderRadius: sizeConfig.borderRadius,
        minHeight: sizeConfig.minHeight,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        overflow: "hidden",
      };

      switch (variant) {
        case "primary":
          return {
            ...baseStyles,
            backgroundColor: Theme.semantic.interactive.primary,
            ...Theme.shadows.depth.sm,
          };
        case "secondary":
          return {
            ...baseStyles,
            backgroundColor: Theme.semantic.interactive.secondary,
            ...Theme.shadows.depth.sm,
          };
        case "ghost":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
          };
        case "outline":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: Theme.semantic.interactive.primary,
          };
        default:
          return baseStyles;
      }
    };

    // Get text styles
    const getTextStyles = (): TextStyle => {
      const baseTextStyles: TextStyle = {
        fontSize: sizeConfig.fontSize,
        fontWeight: Theme.typography.fontWeight.semibold,
        textAlign: "center",
      };

      switch (variant) {
        case "primary":
        case "secondary":
          return {
            ...baseTextStyles,
            color: Theme.colors.text.primary.inverse,
          };
        case "ghost":
        case "outline":
          return {
            ...baseTextStyles,
            color: Theme.semantic.interactive.primary,
          };
        default:
          return {
            ...baseTextStyles,
            color: Theme.colors.text.primary.primary,
          };
      }
    };

    // Get icon color
    const getIconColor = (): string => {
      switch (variant) {
        case "primary":
        case "secondary":
          return Theme.colors.text.primary.inverse;
        case "ghost":
        case "outline":
          return Theme.semantic.interactive.primary;
        default:
          return Theme.colors.text.primary.primary;
      }
    };

    // Handle press
    const handlePress = () => {
      if (isDisabled) return;
      onPress?.();
    };

    // Render content
    const renderContent = () => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={getIconColor()} />
            <Text style={[getTextStyles(), { marginLeft: Theme.spacing.sm }]}>
              Loading...
            </Text>
          </View>
        );
      }

      return (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeConfig.iconSize}
              color={getIconColor()}
              style={{ marginRight: Theme.spacing.sm }}
            />
          )}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeConfig.iconSize}
              color={getIconColor()}
              style={{ marginLeft: Theme.spacing.sm }}
            />
          )}
        </>
      );
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          getVariantStyles(),
          {
            paddingHorizontal: sizeConfig.paddingHorizontal,
            paddingVertical: sizeConfig.paddingVertical,
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  },
);

// === STYLES ===
const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Display name for debugging
BaseButton.displayName = "BaseButton";

export default BaseButton;
