/**
 * 🎨 Visual Enhancements 2025 Hook
 * Consumes visualEnhancements2025 config from UIConfig
 */

import { useUIConfig } from '../services/uiConfig/hooks';
import type { VisualEnhancements2025 } from '@pawfectmatch/core';
import { useCapabilities } from '../foundation/capabilities';
import { useReduceMotion } from '../hooks/useReducedMotion';

/**
 * Hook to get visual enhancements config with capability gating
 */
export function useVisualEnhancements() {
  const { config, isLoading } = useUIConfig();
  const capabilities = useCapabilities();
  const reduceMotion = useReduceMotion();

  const enhancements = config?.visualEnhancements2025;

  if (!enhancements || isLoading) {
    return {
      enhancements: null,
      isLoading,
      canUse3DCards: false,
      canUseParticles: false,
      canUseGlassMorphism: false,
      canUseIsometric: false,
      canUseTypography: false,
      canUseDynamicColors: false,
      canUseHDR: false,
      canUseParallax: false,
    };
  }

  // Apply capability gating
  const shouldGate = enhancements.performance?.capabilityGating ?? true;
  const lowEndPolicy = enhancements.performance?.lowEndDevicePolicy ?? 'simplify';

  // Check if device is low-end
  const isLowEnd = !capabilities.highPerf;

  // Apply gating rules
  const getGated = (enabled: boolean, heavy: boolean = false): boolean => {
    if (!enabled) return false;
    if (!shouldGate) return true;
    if (reduceMotion) return false; // Always respect reduce motion

    if (isLowEnd && heavy) {
      if (lowEndPolicy === 'skip') return false;
      if (lowEndPolicy === 'simplify' && heavy) return false;
    }

    return true;
  };

  return {
    enhancements,
    isLoading: false,

    // 3D Cards
    canUse3DCards: getGated(
      enhancements.effects?.threeDCards?.enabled ?? false,
      true, // Heavy effect
    ),
    threeDCardsConfig: enhancements.effects?.threeDCards,

    // Particles
    canUseParticles: getGated(
      enhancements.effects?.particles?.enabled ?? false,
      true, // Heavy effect
    ),
    particlesConfig: {
      ...enhancements.effects?.particles,
      maxCount: isLowEnd && lowEndPolicy === 'simplify'
        ? Math.min(
            enhancements.effects?.particles?.maxCount ?? 50,
            enhancements.performance?.maxParticles ?? 50,
          )
        : enhancements.effects?.particles?.maxCount ?? 50,
    },

    // Glass Morphism
    canUseGlassMorphism: getGated(
      enhancements.effects?.glassMorphism?.enabled ?? false,
      false, // Medium effect
    ),
    glassMorphismConfig: {
      ...enhancements.effects?.glassMorphism,
      blurIntensity: isLowEnd
        ? Math.min(
            enhancements.effects?.glassMorphism?.blurIntensity ?? 20,
            enhancements.performance?.maxBlurRadius ?? 20,
          )
        : enhancements.effects?.glassMorphism?.blurIntensity ?? 20,
    },

    // Isometric
    canUseIsometric: getGated(
      enhancements.effects?.isometric?.enabled ?? false,
      false,
    ),
    isometricConfig: enhancements.effects?.isometric,

    // Typography
    canUseTypography: !reduceMotion && (enhancements.typography?.gradientText?.enabled ?? false),
    typographyConfig: enhancements.typography,

    // Colors
    canUseDynamicColors: enhancements.colors?.dynamicColors?.enabled ?? false,
    canUseHDR: enhancements.colors?.hdr?.enabled ?? false && capabilities.hdr,
    colorsConfig: enhancements.colors,

    // Scroll
    canUseParallax: !reduceMotion && (enhancements.scroll?.parallax?.enabled ?? false),
    scrollConfig: enhancements.scroll,

    // Performance
    performanceConfig: enhancements.performance,

    // Preset
    preset: enhancements.preset,
  };
}

/**
 * Hook to get animation preset configuration
 */
export function useAnimationPreset(presetId?: string) {
  const { enhancements } = useVisualEnhancements();

  if (!enhancements?.animations) {
    return null;
  }

  // Find preset by ID or use custom preset
  const preset = presetId
    ? enhancements.animations.presets?.find((p) => p.id === presetId)
    : enhancements.animations.customPreset;

  if (!preset) {
    // Return default spring config
    return {
      spring: {
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
      timing: {
        duration: 300,
        easing: [0.2, 0, 0, 1] as const,
      },
    };
  }

  return preset;
}

/**
 * Hook to check if specific visual effect is enabled and allowed
 */
export function useCanUseEffect(effect: keyof VisualEnhancements2025['effects']) {
  const visual = useVisualEnhancements();

  switch (effect) {
    case 'threeDCards':
      return visual.canUse3DCards;
    case 'particles':
      return visual.canUseParticles;
    case 'glassMorphism':
      return visual.canUseGlassMorphism;
    case 'isometric':
      return visual.canUseIsometric;
    default:
      return false;
  }
}

