/**
 * PROJECT HYPERION: MODERN TYPOGRAPHY SYSTEM
 *
 * Unified typography components that consume design tokens from the theme system.
 * Replaces scattered typography components with a consistent, scalable system.
 *
 * Features:
 * - Semantic typography components
 * - Gradient text effects
 * - Animated text components
 * - Accessibility support
 * - Responsive design
 */

import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import React from "react";
import { Text, StyleSheet, type TextStyle, type TextProps } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useEntranceAnimation } from "../../hooks/useUnifiedAnimations";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

// === TYPES ===
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "caption"
  | "overline"
  | "button"
  | "label";

export type TextWeight = '400' | '500' | '600' | '700';
export type TextColor = keyof AppTheme['colors'];

export interface ModernTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  gradient?: keyof AppTheme['palette']['gradients'];
  gradientColors?: string[];
  animated?: boolean;
  animationType?: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn";
  children: ReactNode;
}

// === VARIANT CONFIGURATIONS (theme-based) ===
function getVariantConfig(theme: AppTheme, variant: TextVariant): TextStyle {
  switch (variant) {
    case 'h1':
      return { fontSize: theme.typography.h1.size, fontWeight: '700', lineHeight: theme.typography.h1.lineHeight } as TextStyle;
    case 'h2':
      return { fontSize: theme.typography.h2.size, fontWeight: '600', lineHeight: theme.typography.h2.lineHeight } as TextStyle;
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return { fontSize: theme.typography.body.size, fontWeight: '600', lineHeight: theme.typography.body.lineHeight } as TextStyle;
    case 'body':
    case 'bodyLarge':
    case 'bodySmall':
      return { fontSize: theme.typography.body.size, fontWeight: theme.typography.body.weight, lineHeight: theme.typography.body.lineHeight } as TextStyle;
    case 'caption':
    case 'overline':
    case 'button':
    case 'label':
      return { fontSize: theme.typography.body.size, fontWeight: '600', textTransform: variant === 'overline' ? 'uppercase' : undefined } as TextStyle;
    default:
      return { fontSize: theme.typography.body.size } as TextStyle;
  }
}

// === MAIN COMPONENT ===
function ModernText({
  variant = "body",
  weight,
  color = "primary",
  gradient,
  gradientColors,
  animated = false,
  animationType = "slideIn",
  style,
  children,
  ...props
}: ModernTextProps): React.JSX.Element {
  const theme = useTheme();
  const variantConfig = getVariantConfig(theme, variant);

  // Get text color
  const textColor = (color && theme.colors[color as keyof AppTheme['colors']]) || theme.colors.onSurface;

  // Build text style
  const textStyle: TextStyle = {
    ...variantConfig,
    color: textColor,
    ...(weight && { fontWeight: weight }),
  };

  // Entrance animation
  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation(animationType);

  // Start entrance animation if enabled
  React.useEffect(() => {
    if (animated) {
      startEntrance();
    }
  }, [animated, startEntrance]);

  // Render gradient text
  if (gradient || gradientColors) {
    const gradientMap: Record<string, readonly [string, string]> = {
      primary: theme.palette.gradients.primary,
      success: theme.palette.gradients.success,
      danger: theme.palette.gradients.danger,
    } as const;
    const colors = gradientColors || (gradient ? gradientMap[gradient] : undefined) || theme.palette.gradients.primary;

    const GradientText = () => (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <Text
          style={StyleSheet.flatten([textStyle, styles.gradientText, style])}
          {...props}
        >
          {children}
        </Text>
      </LinearGradient>
    );

    if (animated) {
      return (
        <Animated.View style={entranceStyle}>
          <GradientText />
        </Animated.View>
      );
    }

    return <GradientText />;
  }

  // Render regular text
  if (animated) {
    return (
      <Animated.Text
        style={StyleSheet.flatten([textStyle, entranceStyle, style])}
        {...props}
      >
        {children}
      </Animated.Text>
    );
  }

  return (
    <Text style={StyleSheet.flatten([textStyle, style])} {...props}>
      {children}
    </Text>
  );
}

// === SEMANTIC COMPONENTS ===
export function Heading1(
  props: Omit<ModernTextProps, "variant">,
): React.JSX.Element {
  return <ModernText variant="h1" {...props} />;
}

export const Heading2: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="h6" {...props} />
);

export const Body: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="body" {...props} />
);

export const BodyLarge: React.FC<Omit<ModernTextProps, "variant">> = (
  props,
) => <ModernText variant="bodyLarge" {...props} />;

export const BodySmall: React.FC<Omit<ModernTextProps, "variant">> = (
  props,
) => <ModernText variant="bodySmall" {...props} />;

export const Caption: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="caption" {...props} />
);

export const Overline: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="overline" {...props} />
);

export const ButtonText: React.FC<Omit<ModernTextProps, "variant">> = (
  props,
) => <ModernText variant="button" {...props} />;

export const Label: React.FC<Omit<ModernTextProps, "variant">> = (props) => (
  <ModernText variant="label" {...props} />
);

// === GRADIENT TEXT COMPONENTS ===
export const GradientHeading: React.FC<Omit<ModernTextProps, "gradient">> = (
  props,
) => <ModernText variant="h1" gradient={("primary" as any)} {...props} />;

export const GradientText: React.FC<Omit<ModernTextProps, "gradient">> = (
  props,
) => <ModernText gradient={("primary" as any)} {...props} />;

export const HolographicText: React.FC<Omit<ModernTextProps, "gradient">> = (
  props,
) => <ModernText gradient={("holographic" as any)} {...props} />;

// === ANIMATED TEXT COMPONENTS ===
export const AnimatedHeading: React.FC<Omit<ModernTextProps, "animated">> = (
  props,
) => <ModernText variant="h1" animated={true} {...props} />;

export const AnimatedText: React.FC<Omit<ModernTextProps, "animated">> = (
  props,
) => <ModernText animated={true} {...props} />;

// === STYLES ===
const styles = StyleSheet.create({
  gradientContainer: {
    // Container for gradient text
  },
  gradientText: {
    // Gradient text will be handled by LinearGradient
  },
});

export default ModernText;
