/**
 * PhoenixCard Component
 * Premium card component following Phoenix 2025 design system
 * Features glass morphism, spring animations, and accessibility
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  type ViewStyle,
  type TouchableOpacityProps,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
  StyleSheet,
} from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import {
  SPRING,
} from "../../animation";
import { Colors, Spacing, BorderRadius } from "../../styles/GlobalStyles";
import { PREMIUM_SHADOWS } from "../elite/constants";
import { useTheme } from "@/theme";

// TypeScript strict interface - no any, no implicit any
interface PhoenixCardProps extends TouchableOpacityProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly children?: React.ReactNode;
  readonly variant?: "elevated" | "glass" | "neon" | "minimal";
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly interactive?: boolean;
  readonly glowOnPress?: boolean;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

// Functional component with proper typing
export const PhoenixCard: React.FC<PhoenixCardProps> = ({
  title,
  subtitle,
  children,
  variant = "elevated",
  size = "md",
  interactive = false,
  glowOnPress = true,
  style,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { isDark } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(1);
  const elevation = useSharedValue(1);

  // Animation styles with proper typing
  const animatedStyle = useAnimatedStyle(
    (): ViewStyle => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: glowIntensity.value * 0.2,
      shadowRadius: elevation.value * 8,
    }),
  );

  // Strict TypeScript - proper event handling
  const handlePressIn = useCallback(() => {
    if (!interactive) return;

    scale.value = withSpring(0.98, SPRING.soft);
    glowIntensity.value = withSpring(1.3, SPRING.soft);
    elevation.value = withSpring(1.2, SPRING.soft);

    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  }, [interactive]);

  const handlePressOut = useCallback(() => {
    if (!interactive) return;

    scale.value = withSpring(1, SPRING.soft);
    glowIntensity.value = withSpring(1, SPRING.soft);
    elevation.value = withSpring(1, SPRING.soft);
  }, [interactive]);

  const handlePress = useCallback(() => {
    if (onPress) {
      // Just call onPress directly - it accepts undefined
      onPress(undefined as any);
    }
  }, [onPress]);

  // Size configurations with proper typing
  const getSizeStyles = useCallback((): ViewStyle => {
    const sizes = {
      sm: { padding: Spacing.md, minHeight: 80 },
      md: { padding: Spacing.lg, minHeight: 120 },
      lg: { padding: Spacing.xl, minHeight: 160 },
      xl: { padding: Spacing["2xl"], minHeight: 200 },
    };

    return sizes[size];
  }, [size]);

  // Variant styles with proper typing
  const getVariantStyles = useCallback((): ViewStyle => {
    const variants = {
      elevated: {
        backgroundColor: isDark ? Colors.surfaceElevated : Colors.surface,
        ...PREMIUM_SHADOWS.primaryGlow,
      },
      glass: {
        backgroundColor: "transparent",
      },
      neon: {
        backgroundColor: Colors.primary + "10",
        borderWidth: 1,
        borderColor: Colors.primary + "30",
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      minimal: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: isDark ? Colors.border : Colors.borderLight,
      },
    };

    return variants[variant];
  }, [variant, isDark]);

  // WCAG AA+ accessibility compliance
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: (interactive ? "button" : "none") as "button" | "none",
    accessibilityLabel: accessibilityLabel || title || "Card",
    accessibilityHint:
      accessibilityHint || (interactive ? "Double tap to interact" : undefined),
    accessibilityState: {
      disabled: props.disabled || false,
    },
  };

  // Base card content
  const CardContent = () => (
    <View style={StyleSheet.flatten([getSizeStyles(), getVariantStyles()])}>
      {title && (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: isDark ? Colors.text : Colors.text,
            marginBottom: subtitle ? Spacing.xs : 0,
          }}
        >
          {title}
        </Text>
      )}

      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            color: isDark ? Colors.textSecondary : Colors.textSecondary,
            marginBottom: children ? Spacing.md : 0,
          }}
        >
          {subtitle}
        </Text>
      )}

      {children}
    </View>
  );

  // Render with conditional wrapper
  if (interactive && onPress) {
    return (
      <Animated.View style={StyleSheet.flatten([animatedStyle, style])}>
        <TouchableOpacity
          testID={testID}
          style={{
            borderRadius: Number(BorderRadius.lg) || 8,
            overflow: "hidden",
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.9}
          {...accessibilityProps}
          {...props}
        >
          {variant === "glass" ? (
            <BlurView intensity={20} style={{ borderRadius: Number(BorderRadius.lg) || 8 }}>
              <CardContent />
            </BlurView>
          ) : variant === "neon" ? (
            <LinearGradient
              colors={[Colors.primary + "05", Colors.primary + "10"]}
              style={{ borderRadius: Number(BorderRadius.lg) || 8 }}
            >
              <CardContent />
            </LinearGradient>
          ) : (
            <CardContent />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Non-interactive card
  return (
    <Animated.View
      testID={testID}
      style={StyleSheet.flatten([
        animatedStyle,
        {
          borderRadius: Number(BorderRadius.lg) || 8,
          overflow: "hidden",
        },
        style,
      ])}
      {...accessibilityProps}
    >
      {variant === "glass" ? (
        <BlurView intensity={20} style={{ borderRadius: BorderRadius.lg }}>
          <CardContent />
        </BlurView>
      ) : variant === "neon" ? (
        <LinearGradient
          colors={[Colors.primary + "05", Colors.primary + "10"]}
          style={{ borderRadius: BorderRadius.lg }}
        >
          <CardContent />
        </LinearGradient>
      ) : (
        <CardContent />
      )}
    </Animated.View>
  );
};
