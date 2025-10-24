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
import { Theme } from "../../theme/unified-theme";

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

export type TextWeight = keyof typeof Theme.typography.fontWeight;
export type TextColor = keyof typeof Theme.semantic.text;

export interface ModernTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  gradient?: keyof typeof Theme.gradients;
  gradientColors?: string[];
  animated?: boolean;
  animationType?: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
  children: ReactNode;
}

// === VARIANT CONFIGURATIONS ===
const VARIANT_CONFIGS = {
  h1: {
    fontSize: Theme.typography.fontSize["4xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    lineHeight:
      Theme.typography.fontSize["4xl"] * Theme.typography.lineHeight.tight,
    letterSpacing: Theme.typography.letterSpacing.tight,
  },
  h2: {
    fontSize: Theme.typography.fontSize["3xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    lineHeight:
      Theme.typography.fontSize["3xl"] * Theme.typography.lineHeight.tight,
    letterSpacing: Theme.typography.letterSpacing.tight,
  },
  h3: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight:
      Theme.typography.fontSize["2xl"] * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  h4: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight:
      Theme.typography.fontSize.xl * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  h5: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight:
      Theme.typography.fontSize.lg * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  h6: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight:
      Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  body: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.normal,
    lineHeight:
      Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.normal,
    lineHeight:
      Theme.typography.fontSize.lg * Theme.typography.lineHeight.relaxed,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  bodySmall: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.normal,
    lineHeight:
      Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  caption: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight:
      Theme.typography.fontSize.xs * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.wide,
  },
  overline: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight:
      Theme.typography.fontSize.xs * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.wide,
    textTransform: "uppercase" as const,
  },
  button: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight:
      Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight:
      Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
    letterSpacing: Theme.typography.letterSpacing.normal,
  },
} as const;

// === MAIN COMPONENT ===
function ModernText({
  variant = "body",
  weight,
  color = "primary",
  gradient,
  gradientColors,
  animated = false,
  animationType = "fadeInUp",
  style,
  children,
  ...props
}: ModernTextProps): React.JSX.Element {
  const variantConfig = VARIANT_CONFIGS[variant];

  // Get text color
  const textColor = Theme.colors.text.primary[color];

  // Build text style
  const textStyle: TextStyle = {
    ...variantConfig,
    color: textColor,
    ...(weight && { fontWeight: Theme.typography.fontWeight[weight] }),
  };

  // Entrance animation
  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation(animationType, 0, "gentle");

  // Start entrance animation if enabled
  React.useEffect(() => {
    if (animated) {
      startEntrance();
    }
  }, [animated, startEntrance]);

  // Render gradient text
  if (gradient || gradientColors) {
    const gradientConfig = gradient ? Theme.gradients[gradient] : null;
    const colors = gradientColors ||
      gradientConfig?.colors || [
        Theme.colors.primary[500],
        Theme.colors.primary[400],
      ];

    const GradientText = () => (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <Text style={[textStyle, styles.gradientText, style]} {...props}>
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
      <Animated.Text style={[textStyle, entranceStyle, style]} {...props}>
        {children}
      </Animated.Text>
    );
  }

  return (
    <Text style={[textStyle, style]} {...props}>
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
) => <ModernText variant="h1" gradient="primary" {...props} />;

export const GradientText: React.FC<Omit<ModernTextProps, "gradient">> = (
  props,
) => <ModernText gradient="primary" {...props} />;

export const HolographicText: React.FC<Omit<ModernTextProps, "gradient">> = (
  props,
) => <ModernText gradient="holographic" {...props} />;

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
