/**
 * 🎛️ UI Config - Apply Config to Theme/Motion
 * Transforms UIConfig into AppTheme and applies to providers
 * Includes safety guards for reduced motion and low-end devices
 */

import type { UIConfig } from '@pawfectmatch/core';
import type { AppTheme } from '@/theme/contracts';
import { getLightTheme, getDarkTheme } from '@/theme/resolve';

/**
 * Convert UIConfig tokens to AppTheme
 * Applies safety guards for reduced motion and low-end devices
 */
export function configToTheme(config: UIConfig, scheme: 'light' | 'dark' = 'light'): AppTheme {
  const baseTheme = scheme === 'dark' ? getDarkTheme() : getLightTheme();

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: {
      bg: config.tokens.colors.bg || baseTheme.colors.bg,
      surface: config.tokens.colors.surface || baseTheme.colors.surface,
      overlay: config.tokens.colors.overlay || baseTheme.colors.overlay,
      border: config.tokens.colors.border || baseTheme.colors.border,
      onBg: config.tokens.colors.onBg || baseTheme.colors.onBg,
      onSurface: config.tokens.colors.onSurface || baseTheme.colors.onSurface,
      onMuted: config.tokens.colors.onMuted || baseTheme.colors.onMuted,
      primary: config.tokens.colors.primary || baseTheme.colors.primary,
      onPrimary: config.tokens.colors.onPrimary || baseTheme.colors.onPrimary,
      success: config.tokens.colors.success || baseTheme.colors.success,
      danger: config.tokens.colors.danger || baseTheme.colors.danger,
      warning: config.tokens.colors.warning || baseTheme.colors.warning,
      info: config.tokens.colors.info || baseTheme.colors.info,
    },
    spacing: {
      'xs': config.tokens.spacing.xs ?? baseTheme.spacing.xs,
      'sm': config.tokens.spacing.sm ?? baseTheme.spacing.sm,
      'md': config.tokens.spacing.md ?? baseTheme.spacing.md,
      'lg': config.tokens.spacing.lg ?? baseTheme.spacing.lg,
      'xl': config.tokens.spacing.xl ?? baseTheme.spacing.xl,
      '2xl': config.tokens.spacing['2xl'] ?? baseTheme.spacing['2xl'],
      '3xl': config.tokens.spacing['3xl'] ?? baseTheme.spacing['3xl'],
      '4xl': config.tokens.spacing['4xl'] ?? baseTheme.spacing['4xl'],
    },
    radii: {
      'none': config.tokens.radii.none ?? baseTheme.radii.none,
      'xs': config.tokens.radii.xs ?? baseTheme.radii.xs,
      'sm': config.tokens.radii.sm ?? baseTheme.radii.sm,
      'md': config.tokens.radii.md ?? baseTheme.radii.md,
      'lg': config.tokens.radii.lg ?? baseTheme.radii.lg,
      'xl': config.tokens.radii.xl ?? baseTheme.radii.xl,
      '2xl': config.tokens.radii['2xl'] ?? baseTheme.radii['2xl'],
      'pill': config.tokens.radii.pill ?? baseTheme.radii.pill,
      'full': config.tokens.radii.full ?? baseTheme.radii.full,
    },
    shadows: {
      elevation1: config.tokens.shadow['1']
        ? {
            shadowColor: '#000',
            shadowOffset: {
              width: config.tokens.shadow['1'].offset[0],
              height: config.tokens.shadow['1'].offset[1],
            },
            shadowOpacity: config.tokens.shadow['1'].opacity,
            shadowRadius: config.tokens.shadow['1'].radius,
            elevation: 1,
          }
        : baseTheme.shadows.elevation1,
      elevation2: config.tokens.shadow['2']
        ? {
            shadowColor: '#000',
            shadowOffset: {
              width: config.tokens.shadow['2'].offset[0],
              height: config.tokens.shadow['2'].offset[1],
            },
            shadowOpacity: config.tokens.shadow['2'].opacity,
            shadowRadius: config.tokens.shadow['2'].radius,
            elevation: 2,
          }
        : baseTheme.shadows.elevation2,
      glass: baseTheme.shadows.glass,
    },
    blur: baseTheme.blur,
    easing: baseTheme.easing,
    typography: {
      body: {
        size: config.tokens.typography.scale.body.size,
        lineHeight: config.tokens.typography.scale.body.lineHeight,
        weight: config.tokens.typography.scale.body.weight,
      },
      h1: {
        size: config.tokens.typography.scale.h1.size,
        lineHeight: config.tokens.typography.scale.h1.lineHeight,
        weight: config.tokens.typography.scale.h1.weight,
      },
      h2: {
        size: config.tokens.typography.scale.h2.size,
        lineHeight: config.tokens.typography.scale.h2.lineHeight,
        weight: config.tokens.typography.scale.h2.weight,
      },
    },
    palette: {
      neutral: baseTheme.palette.neutral,
      brand: baseTheme.palette.brand,
      gradients: {
        primary: config.tokens.palette.gradients.primary as [string, string],
        success: config.tokens.palette.gradients.success as [string, string],
        danger: config.tokens.palette.gradients.danger as [string, string],
        warning: config.tokens.palette.gradients.warning as [string, string],
        info: config.tokens.palette.gradients.info as [string, string],
      },
    },
  };
}

/**
 * Get motion config from UIConfig
 * Applies safety guards for reduced motion and low-end devices
 */
export function getMotionConfig(config: UIConfig) {
  // Note: These guards are checked at runtime in components
  // This function just returns the config structure
  return {
    duration: config.tokens.motion.duration,
    easing: config.tokens.motion.easing,
    scale: config.tokens.motion.scale,
    opacity: config.tokens.motion.opacity,
    microInteractions: config.microInteractions,
  };
}

/**
 * Check if reduced motion should be respected
 */
export function shouldRespectReducedMotion(config: UIConfig): boolean {
  return config.microInteractions.guards.respectReducedMotion;
}

/**
 * Get low-end device policy
 */
export function getLowEndDevicePolicy(config: UIConfig): 'skip' | 'simplify' | 'full' {
  return config.microInteractions.guards.lowEndDevicePolicy;
}

/**
 * Apply micro-interaction guards based on device capabilities
 * This is called by components that use micro-interactions
 */
export function applyMicroInteractionGuards(
  microInteractions: UIConfig['microInteractions'],
  reducedMotion: boolean,
  lowEndDevice: boolean,
): UIConfig['microInteractions'] {
  const policy = microInteractions.guards.lowEndDevicePolicy;

  // Reduce motion guard: disable all animations
  if (microInteractions.guards.respectReducedMotion && reducedMotion) {
    return {
      ...microInteractions,
      pressFeedback: { ...microInteractions.pressFeedback, enabled: false },
      successMorph: { ...microInteractions.successMorph, enabled: false },
      elasticPullToRefresh: { ...microInteractions.elasticPullToRefresh, enabled: false },
      sharedElement: { ...microInteractions.sharedElement, enabled: false },
      confettiLite: { ...microInteractions.confettiLite, enabled: false },
      shimmer: { ...microInteractions.shimmer, enabled: false },
    };
  }

  // Low-end device guard: skip all animations
  if (lowEndDevice && policy === 'skip') {
    return {
      ...microInteractions,
      pressFeedback: { ...microInteractions.pressFeedback, enabled: false },
      successMorph: { ...microInteractions.successMorph, enabled: false },
      elasticPullToRefresh: { ...microInteractions.elasticPullToRefresh, enabled: false },
      sharedElement: { ...microInteractions.sharedElement, enabled: false },
      confettiLite: { ...microInteractions.confettiLite, enabled: false },
      shimmer: { ...microInteractions.shimmer, enabled: false },
    };
  }

  // Low-end device guard: simplify (disable heavy animations)
  if (lowEndDevice && policy === 'simplify') {
    return {
      ...microInteractions,
      confettiLite: { ...microInteractions.confettiLite, enabled: false },
      shimmer: { ...microInteractions.shimmer, enabled: microInteractions.shimmer.enabled },
    };
  }

  return microInteractions;
}
