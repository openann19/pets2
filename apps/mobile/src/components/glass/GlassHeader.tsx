import React, { type ReactNode } from "react";
import { type ViewProps, type ViewStyle } from "react-native";
import { GlassContainer } from "./GlassContainer";
import { BLUR_CONFIGS, TRANSPARENCY_CONFIGS, BORDER_CONFIGS, SHADOW_CONFIGS } from "./configs";

/**
 * GlassHeader Component
 * Glass morphism header with high blur intensity
 */

interface GlassHeaderProps extends ViewProps {
  children: ReactNode;
  intensity?: keyof typeof BLUR_CONFIGS;
  style?: ViewStyle;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  intensity = "heavy",
  style,
  ...props
}) => {
  return (
    <GlassContainer
      intensity={intensity}
      transparency="light"
      border="light"
      shadow="light"
      borderRadius="none"
      style={[
        {
          position: "absolute" as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

export default GlassHeader;

