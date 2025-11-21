// apps/mobile/src/components/typography/AdvancedProTextPresets.tsx
/**
 * Advanced ProText Presets - Extended Effect Combinations
 * 
 * Additional curated presets with sophisticated effect stacks
 * for specialized use cases: aurora, plasma, crystal, fire, etc.
 */

import React, { memo } from "react";

import ProText, { type ProTextProps } from "./ProText";

// === ADVANCED EFFECT PRESETS ===

/**
 * Aurora preset: animated rainbow shimmer with glass effect
 * Perfect for premium features, VIP badges
 */
export const ProTextAurora = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer", "glass"]}
      gradientColors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"]}
      shimmerIntensity={0.45}
      animated
      animationType="scaleIn"
      optimized
      {...props}
    />
  ),
);
ProTextAurora.displayName = "ProTextAurora";

/**
 * Plasma preset: vibrant cyber gradient with aberration
 * Ideal for tech/futuristic themes, live status
 */
export const ProTextPlasma = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h3"
      effects={["gradient", "aberration", "neon"]}
      gradientColors={["#00f5ff", "#ff0080", "#8000ff"]}
      glowColor="#ff0080"
      split
      animated
      animationType="reveal"
      maxSplit={100}
      optimized
      {...props}
    />
  ),
);
ProTextPlasma.displayName = "ProTextPlasma";

/**
 * Crystal preset: subtle shimmer with soft glow
 * Great for elegant titles, premium content
 */
export const ProTextCrystal = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer", "shadow"]}
      gradientColors={["#e0e7ff", "#c7d2fe", "#a5b4fc"]}
      shimmerIntensity={0.2}
      animated
      animationType="fadeInUp"
      animationDelay={100}
      optimized
      {...props}
    />
  ),
);
ProTextCrystal.displayName = "ProTextCrystal";

/**
 * Fire preset: warm gradient with intense glow
 * Perfect for urgent notifications, special events
 */
export const ProTextFire = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h3"
      effects={["gradient", "neon"]}
      gradientColors={["#ff0000", "#ff7f00", "#ffff00"]}
      glowColor="#ff0000"
      animated
      animationType="scaleIn"
      optimized
      {...props}
    />
  ),
);
ProTextFire.displayName = "ProTextFire";

/**
 * Ocean preset: cool blue gradient with subtle wave shimmer
 * Ideal for calm, trust-building UI elements
 */
export const ProTextOcean = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer"]}
      gradientColors={["#0ea5e9", "#06b6d4", "#22d3ee"]}
      shimmerIntensity={0.25}
      animated
      animationType="fadeInUp"
      animationDuration={600}
      optimized
      {...props}
    />
  ),
);
ProTextOcean.displayName = "ProTextOcean";

/**
 * Midnight preset: dark gradient with soft glow
 * Perfect for dark mode, mystery/exclusive content
 */
export const ProTextMidnight = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "neon", "glass"]}
      gradientColors={["#1e293b", "#334155", "#475569"]}
      glowColor="#64748b"
      animated
      animationType="fadeInUp"
      optimized
      {...props}
    />
  ),
);
ProTextMidnight.displayName = "ProTextMidnight";

/**
 * Emerald preset: luxury green gradient with shimmer
 * Great for success states, growth metrics
 */
export const ProTextEmerald = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer"]}
      gradientColors={["#10b981", "#34d399", "#6ee7b7"]}
      shimmerIntensity={0.3}
      animated
      animationType="scaleIn"
      optimized
      {...props}
    />
  ),
);
ProTextEmerald.displayName = "ProTextEmerald";

/**
 * Ruby preset: rich red gradient with glass effect
 * Ideal for alerts, premium exclusive offers
 */
export const ProTextRuby = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "glass", "shadow"]}
      gradientColors={["#dc2626", "#ef4444", "#f87171"]}
      animated
      animationType="slideInRight"
      optimized
      {...props}
    />
  ),
);
ProTextRuby.displayName = "ProTextRuby";

/**
 * Cosmic preset: deep space gradient with aberration
 * Perfect for sci-fi themes, special launches
 */
export const ProTextCosmic = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h1"
      effects={["gradient", "aberration", "neon", "shimmer"]}
      gradientColors={["#1e1b4b", "#4c1d95", "#7c3aed", "#a78bfa"]}
      glowColor="#a78bfa"
      shimmerIntensity={0.35}
      split
      animated
      animationType="reveal"
      maxSplit={120}
      optimized
      {...props}
    />
  ),
);
ProTextCosmic.displayName = "ProTextCosmic";

/**
 * Pastel preset: soft multi-color gradient
 * Great for playful, friendly UI elements
 */
export const ProTextPastel = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer"]}
      gradientColors={["#fecaca", "#fed7aa", "#fef3c7", "#d9f99d", "#bfdbfe"]}
      shimmerIntensity={0.2}
      animated
      animationType="fadeInUp"
      animationDelay={120}
      optimized
      {...props}
    />
  ),
);
ProTextPastel.displayName = "ProTextPastel";

// === SPECIALTY COMBINATIONS ===

/**
 * HeroMax preset: maximum impact with all effects
 * Reserve for absolute top-level hero sections
 */
export const ProTextHeroMax = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="display"
      effects={["gradient", "neon", "aberration", "shimmer", "glass", "shadow"]}
      gradientColors={["#00E1FF", "#7C4DFF", "#FF00E5", "#FFD700"]}
      glowColor="#B388FF"
      shimmerIntensity={0.4}
      glassOpacity={0.2}
      split
      animated
      animationType="reveal"
      maxSplit={140}
      optimized
      {...props}
    />
  ),
);
ProTextHeroMax.displayName = "ProTextHeroMax";

/**
 * ThemeAware preset: adapts to theme colors automatically
 * Uses theme `primary` color via `tone` prop
 */
export const ProTextThemeAware = memo<Omit<ProTextProps, "variant" | "effects" | "tone">>(
  (props) => (
    <ProText
      variant="h2"
      effects={["gradient", "shimmer"]}
      tone="primary"
      shimmerIntensity={0.25}
      animated
      animationType="fadeInUp"
      optimized
      {...props}
    />
  ),
);
ProTextThemeAware.displayName = "ProTextThemeAware";

/**
 * Minimal preset: performance-optimized, single effect
 * Best for lists, repeated elements
 */
export const ProTextMinimal = memo<Omit<ProTextProps, "variant" | "effects">>(
  (props) => (
    <ProText
      variant="body"
      effects={["shadow"]}
      animated={false}
      optimized
      {...props}
    />
  ),
);
ProTextMinimal.displayName = "ProTextMinimal";

export default {
  ProTextAurora,
  ProTextPlasma,
  ProTextCrystal,
  ProTextFire,
  ProTextOcean,
  ProTextMidnight,
  ProTextEmerald,
  ProTextRuby,
  ProTextCosmic,
  ProTextPastel,
  ProTextHeroMax,
  ProTextThemeAware,
  ProTextMinimal,
};
