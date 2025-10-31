import React, { type ReactNode } from 'react';
import { type ViewProps, type ViewStyle, StyleSheet } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { BLUR_CONFIGS, TRANSPARENCY_CONFIGS, BORDER_CONFIGS, SHADOW_CONFIGS } from './configs';
import { Spacing } from '../../animation';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';

/**
 * GlassCard Component
 * Glass morphism card with preset variants (default, premium, frosted, crystal)
 * Enhanced to use visualEnhancements2025 config when available
 */

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'premium' | 'frosted' | 'crystal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  hover?: boolean;
  style?: ViewStyle;
  /** Force use of config (ignore variant presets) */
  useConfig?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  animated = true,
  hover = true,
  style,
  useConfig = false,
  ...props
}) => {
  const { canUseGlassMorphism, glassMorphismConfig } = useVisualEnhancements();

  // If config is enabled and useConfig is true, use config values
  const shouldUseConfig = useConfig && canUseGlassMorphism && glassMorphismConfig;

  const getVariantConfig = () => {
    if (shouldUseConfig) {
      // Use config values
      const blurIntensity = glassMorphismConfig.blurIntensity ?? 20;
      const opacity = glassMorphismConfig.opacity ?? 0.5;

      // Map to intensity levels based on blur
      let intensity: 'light' | 'medium' | 'heavy' | 'ultra' = 'medium';
      if (blurIntensity < 10) intensity = 'light';
      else if (blurIntensity < 20) intensity = 'medium';
      else if (blurIntensity < 30) intensity = 'heavy';
      else intensity = 'ultra';

      // Map opacity to transparency
      let transparency: 'light' | 'medium' | 'heavy' | 'ultra' = 'medium';
      if (opacity > 0.8) transparency = 'light';
      else if (opacity > 0.5) transparency = 'medium';
      else if (opacity > 0.3) transparency = 'heavy';
      else transparency = 'ultra';

      return {
        intensity,
        transparency,
        border: glassMorphismConfig.reflection ? ('heavy' as const) : ('medium' as const),
        shadow: 'medium' as const,
      };
    }

    // Use variant presets (original behavior)
    switch (variant) {
      case 'premium':
        return {
          intensity: 'heavy' as const,
          transparency: 'heavy' as const,
          border: 'heavy' as const,
          shadow: 'heavy' as const,
        };
      case 'frosted':
        return {
          intensity: 'ultra' as const,
          transparency: 'ultra' as const,
          border: 'medium' as const,
          shadow: 'medium' as const,
        };
      case 'crystal':
        return {
          intensity: 'light' as const,
          transparency: 'light' as const,
          border: 'light' as const,
          shadow: 'light' as const,
        };
      default:
        return {
          intensity: 'medium' as const,
          transparency: 'medium' as const,
          border: 'light' as const,
          shadow: 'medium' as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { padding: Spacing.md };
      case 'lg':
        return { padding: Spacing.xl };
      case 'xl':
        return { padding: Spacing['2xl'] };
      default:
        return { padding: Spacing.lg };
    }
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  // Use config animated setting if available
  const finalAnimated = shouldUseConfig
    ? glassMorphismConfig.animated ?? animated
    : animated;

  return (
    <GlassContainer
      intensity={config.intensity}
      transparency={config.transparency}
      border={config.border}
      shadow={config.shadow}
      animated={finalAnimated}
      hover={hover}
      style={StyleSheet.flatten([{ ...sizeConfig }, style])}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

export default GlassCard;
