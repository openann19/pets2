/**
 * 🎨 Visual Enhancements 2025 Hook (Web)
 * Consumes visualEnhancements2025 config from UIConfig
 */

import { useEffect, useState } from 'react';
import type { VisualEnhancements2025 } from '@pawfectmatch/core';
import { isBrowser, getSafeWindow, getSafeNavigator, safeMatchMedia } from '@pawfectmatch/core/utils/env';
import { logger } from '@pawfectmatch/core';

// Mock UIConfig hook - replace with actual implementation
function useUIConfig() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch config from API
    fetch('/api/ui-config/current')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.config) {
          setConfig(data.data.config);
        }
      })
      .catch((error) => {
        logger.error('Failed to load UI config:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { config, isLoading };
}

/**
 * Check if user prefers reduced motion
 */
function useReducedMotion(): boolean {
  if (!isBrowser()) return false;
  const mediaQuery = safeMatchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery?.matches ?? false;
}

/**
 * Detect device capabilities (web)
 */
function useDeviceCapabilities() {
  if (!isBrowser()) {
    return {
      highPerf: true,
      hdr: false,
      deviceMemory: 8,
      hardwareConcurrency: 8,
    };
  }

  const nav = getSafeNavigator();
  const win = getSafeWindow();
  const mediaQuery = safeMatchMedia('(color-gamut: p3)');
  return {
    highPerf: (nav?.deviceMemory ?? 8) >= 4 && (nav?.hardwareConcurrency ?? 4) >= 4,
    hdr: mediaQuery?.matches ?? false,
    deviceMemory: nav?.deviceMemory ?? 8,
    hardwareConcurrency: nav?.hardwareConcurrency ?? 4,
  };
}

/**
 * Hook to get visual enhancements config with capability gating (Web)
 */
export function useVisualEnhancements() {
  const { config, isLoading } = useUIConfig();
  const capabilities = useDeviceCapabilities();
  const reduceMotion = useReducedMotion();

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
      canUseThreeJs: false,
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
    if (reduceMotion) return false;

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
      true,
    ),
    threeDCardsConfig: enhancements.effects?.threeDCards,

    // Particles
    canUseParticles: getGated(
      enhancements.effects?.particles?.enabled ?? false,
      true,
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
      false,
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

    // Three.js Effects
    canUseThreeJs: getGated(
      enhancements.effects?.threeJsEffects?.enabled ?? false,
      true, // Very heavy effect
    ),
    threeJsConfig: enhancements.effects?.threeJsEffects,

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
 * Hook to get animation preset configuration (Web)
 */
export function useAnimationPreset(presetId?: string) {
  const { enhancements } = useVisualEnhancements();

  if (!enhancements?.animations) {
    return null;
  }

  const preset = presetId
    ? enhancements.animations.presets?.find((p) => p.id === presetId)
    : enhancements.animations.customPreset;

  if (!preset) {
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

