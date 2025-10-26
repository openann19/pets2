import React, { type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { GlassContainer } from "./GlassContainer";
import { BLUR_CONFIGS, TRANSPARENCY_CONFIGS, BORDER_CONFIGS, SHADOW_CONFIGS } from "./configs";
import { BorderRadius, Spacing } from "../../styles/GlobalStyles";

/**
 * GlassCard Component
 * Glass morphism card with preset variants (default, premium, frosted, crystal)
 */

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  variant?: "default" | "premium" | "frosted" | "crystal";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  hover?: boolean;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "default",
  size = "md",
  animated = true,
  hover = true,
  style,
  ...props
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "premium":
        return {
          intensity: "heavy" as const,
          transparency: "heavy" as const,
          border: "heavy" as const,
          shadow: "heavy" as const,
        };
      case "frosted":
        return {
          intensity: "ultra" as const,
          transparency: "ultra" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
      case "crystal":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      default:
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "light" as const,
          shadow: "medium" as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { padding: Spacing.md };
      case "lg":
        return { padding: Spacing.xl };
      case "xl":
        return { padding: Spacing["2xl"] };
      default:
        return { padding: Spacing.lg };
    }
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  return (
    <GlassContainer
      intensity={config.intensity}
      transparency={config.transparency}
      border={config.border}
      shadow={config.shadow}
      animated={animated}
      hover={hover}
      style={[{ ...sizeConfig }, style]}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

export default GlassCard;

