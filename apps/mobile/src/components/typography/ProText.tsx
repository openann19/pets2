// apps/mobile/src/components/typography/ProText.tsx
/**
 * ProText - Pro-grade GPU-accelerated typography wrapper
 * 
 * Curated presets for jaw-dropping text effects using Skia shaders.
 * All effects run on GPU via @shopify/react-native-skia for zero jank.
 * 
 * Usage:
 * ```tsx
 * import ProText from "@/components/typography/ProText";
 * 
 * // Hero title with all effects
 * <ProText
 *   fontSrc={require("@/assets/fonts/Inter-Black.ttf")}
 *   variant="display"
 *   effects={["gradient","neon","aberration","shimmer","glass"]}
 *   gradientColors={["#00E1FF","#7C4DFF","#FF00E5"]}
 *   glowColor="#B388FF"
 *   split
 *   animated
 *   animationType="reveal"
 * >
 *   Pawfect Match
 * </ProText>
 * 
 * // Clean premium title
 * <ProText
 *   fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}
 *   variant="h2"
 *   effects={["gradient"]}
 *   gradientColors={["#ff7a7a","#ffd36e"]}
 * >
 *   Premium Title
 * </ProText>
 * 
 * // Subtle body with soft shadow
 * <ProText
 *   fontSrc={require("@/assets/fonts/Inter-Medium.ttf")}
 *   variant="body"
 *   color="#E5E7EB"
 *   effects={["shadow"]}
 *   animated
 *   animationType="fadeInUp"
 *   animationDelay={80}
 * >
 *   Find loving homes for every pet.
 * </ProText>
 * ```
 */

import React, { memo, useMemo } from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { Text as RNText, type TextStyle } from "react-native";

import { useTheme } from "../../theme/useTheme";
import HyperTextSkia, {
  type HyperTextSkiaProps,
} from "./HyperTextSkia";

export interface ProTextProps extends Omit<HyperTextSkiaProps, "children"> {
  children: string;
  /** Pull color from theme palette (overrides `color` prop) */
  tone?: "primary" | "secondary" | "text" | "textMuted" | "success" | "warning" | "danger";
  /** Enable performance optimizations (skip re-renders when props unchanged) */
  optimized?: boolean;
}

/**
 * Pro-grade typography with GPU acceleration.
 * Wraps HyperTextSkia with fallback to MaskedView if Skia/fonts unavailable.
 * 
 * Enhanced features:
 * - Theme integration via `tone` prop
 * - Performance memoization with `optimized` flag
 * - Graceful multi-tier fallback chain
 * - Reduce-motion aware animations
 */
export const ProText = memo<ProTextProps>((props) => {
  const { fontSrc, children, tone, color, ...rest } = props;
  const { colors } = useTheme();

  // Derive color from theme if tone specified
  const resolvedColor = useMemo(
    () => (tone ? colors[tone] : color),
    [tone, color, colors],
  );

  // Pre-compute fallback style (before any early returns)
  const fallbackStyle: TextStyle = useMemo(
    () => ({
      fontSize: 16,
      fontWeight: "400",
      color: resolvedColor || "#111827",
    }),
    [resolvedColor],
  );

  // Attempt Skia render if font provided
  if (fontSrc) {
    return (
      <HyperTextSkia fontSrc={fontSrc} color={resolvedColor} {...rest}>
        {children}
      </HyperTextSkia>
    );
  }

  // Fallback: render with MaskedView for gradient support
  // (This maintains visual consistency when fontSrc is missing)
  const hasGradient = rest.effects?.includes("gradient");
  
  if (hasGradient && rest.gradientColors) {
    // Simple MaskedView gradient fallback
    return (
      <MaskedView
        maskElement={
          <RNText style={fallbackStyle}>
            {children}
          </RNText>
        }
      >
        {/* Simplified fallback - just show first gradient color */}
        <RNText
          style={{
            fontSize: 16,
            fontWeight: "400",
            color: rest.gradientColors[0],
          }}
        >
          {children}
        </RNText>
      </MaskedView>
    );
  }

  // Final fallback: plain text
  return <RNText style={fallbackStyle}>{children}</RNText>;
}, (prevProps, nextProps) => {
  // Custom comparison for optimized mode
  if (!nextProps.optimized) return false;
  return (
    prevProps.children === nextProps.children &&
    prevProps.fontSrc === nextProps.fontSrc &&
    prevProps.tone === nextProps.tone &&
    prevProps.color === nextProps.color &&
    prevProps.variant === nextProps.variant &&
    JSON.stringify(prevProps.effects) === JSON.stringify(nextProps.effects)
  );
});

ProText.displayName = "ProText";

// === CURATED PRESETS ===

/**
 * Hero preset: jaw-dropping entrance with all effects
 */
export const ProTextHero = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="display"
      effects={["gradient", "neon", "aberration", "shimmer", "glass"]}
      gradientColors={["#00E1FF", "#7C4DFF", "#FF00E5"]}
      glowColor="#B388FF"
      split
      animated
      animationType="reveal"
      {...props}
    />
  ),
);
ProTextHero.displayName = "ProTextHero";

/**
 * Premium preset: clean gradient title
 */
export const ProTextPremium = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient"]}
      gradientColors={["#ff7a7a", "#ffd36e"]}
      animated
      animationType="fadeInUp"
      {...props}
    />
  ),
);
ProTextPremium.displayName = "ProTextPremium";

/**
 * Neon preset: bright glow effect
 */
export const ProTextNeon = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h3"
      effects={["neon", "gradient"]}
      gradientColors={["#00f5ff", "#ff00ff", "#ffff00"]}
      glowColor="#00f5ff"
      animated
      animationType="scaleIn"
      {...props}
    />
  ),
);
ProTextNeon.displayName = "ProTextNeon";

/**
 * Holographic preset: rainbow shimmer
 */
export const ProTextHolographic = memo<
  Omit<ProTextProps, "variant" | "effects">
>((props) => (
  <ProText
    variant="h2"
    effects={["gradient", "shimmer", "glass"]}
    gradientColors={["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"]}
    shimmerIntensity={0.4}
    animated
    animationType="slideInLeft"
    {...props}
  />
));
ProTextHolographic.displayName = "ProTextHolographic";

/**
 * Subtle preset: soft shadow for body text
 */
export const ProTextSubtle = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="body"
      color="#E5E7EB"
      effects={["shadow"]}
      animated
      animationType="fadeInUp"
      animationDelay={80}
      {...props}
    />
  ),
);
ProTextSubtle.displayName = "ProTextSubtle";

/**
 * Glitch preset: RGB aberration effect
 */
export const ProTextGlitch = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h3"
      effects={["aberration", "gradient"]}
      gradientColors={["#00f5ff", "#ff0080", "#8000ff"]}
      split
      animated
      animationType="reveal"
      {...props}
    />
  ),
);
ProTextGlitch.displayName = "ProTextGlitch";

/**
 * Gold preset: luxury metallic gradient
 */
export const ProTextGold = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer"]}
      gradientColors={["#ffd700", "#ffed4e", "#f39c12"]}
      shimmerIntensity={0.35}
      animated
      animationType="scaleIn"
      {...props}
    />
  ),
);
ProTextGold.displayName = "ProTextGold";

export default ProText;
