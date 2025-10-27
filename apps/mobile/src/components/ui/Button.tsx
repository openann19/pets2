import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import type { ColorPalette } from "../../theme/theme";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  testID?: string;
}

const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number; gap: number }
> = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, gap: 8 },
  md: { paddingVertical: 14, paddingHorizontal: 20, gap: 12 },
  lg: { paddingVertical: 18, paddingHorizontal: 24, gap: 16 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  testID,
}: ButtonProps): React.ReactElement {
  const { colors, radii } = useTheme();

  const { paddingVertical, paddingHorizontal, gap } = sizeStyles[size];

  let backgroundColor = "transparent";
  let borderColor = "transparent";
  let contentTone: keyof ColorPalette = "text";

  switch (variant) {
    case "primary":
      backgroundColor = colors.primary;
      contentTone = "primaryForeground";
      break;
    case "secondary":
      backgroundColor = colors.secondary;
      contentTone = "secondaryForeground";
      break;
    case "outline":
      borderColor = colors.border;
      contentTone = "primary";
      break;
    case "ghost":
    default:
      backgroundColor = "transparent";
      contentTone = "text";
      break;
  }

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            pressed && !disabled ? colors.surfaceMuted : backgroundColor,
          borderColor,
          borderRadius: radii.md,
          opacity: disabled ? 0.6 : 1,
          paddingHorizontal,
          paddingVertical,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <View style={StyleSheet.flatten([styles.content, { gap }])}>
        {icon != null && iconPosition === "left" ? icon : null}
        {loading ? (
          <ActivityIndicator color={colors[contentTone]} />
        ) : (
          <Text variant="button" tone={contentTone}>
            {title}
          </Text>
        )}
        {icon != null && iconPosition === "right" ? icon : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
});
