/**
 * 🎛️ UI Config - Default Embedded Config
 * Fallback config used when remote config is unavailable or invalid
 */

import type { UIConfig } from '@pawfectmatch/core';
import { getLightTheme } from '@/theme/resolve';
import { motionDurations, motionEasing, motionScale, motionOpacity } from '@/theme/motion';

/**
 * Generate default UIConfig from embedded theme
 */
export function getDefaultUIConfig(): UIConfig {
  const theme = getLightTheme();

  return {
    version: '2025.01.27-embedded',
    status: 'prod',
    tokens: {
      colors: {
        bg: theme.colors.bg,
        surface: theme.colors.surface,
        overlay: theme.colors.overlay,
        border: theme.colors.border,
        onBg: theme.colors.onBg,
        onSurface: theme.colors.onSurface,
        onMuted: theme.colors.onMuted,
        primary: theme.colors.primary,
        onPrimary: theme.colors.onPrimary,
        success: theme.colors.success,
        danger: theme.colors.danger,
        warning: theme.colors.warning,
        info: theme.colors.info,
      },
      palette: {
        gradients: {
          primary: theme.palette.gradients.primary as [string, string],
          success: theme.palette.gradients.success as [string, string],
          danger: theme.palette.gradients.danger as [string, string],
          warning: theme.palette.gradients.warning as [string, string],
          info: theme.palette.gradients.info as [string, string],
        },
      },
      spacing: {
        'xs': theme.spacing.xs,
        'sm': theme.spacing.sm,
        'md': theme.spacing.md,
        'lg': theme.spacing.lg,
        'xl': theme.spacing.xl,
        '2xl': theme.spacing['2xl'],
        '3xl': theme.spacing['3xl'] ?? theme.spacing['2xl'] * 1.5,
        '4xl': theme.spacing['4xl'] ?? theme.spacing['2xl'] * 2,
      },
      radii: {
        'none': theme.radii.none,
        'xs': theme.radii.xs,
        'sm': theme.radii.sm,
        'md': theme.radii.md,
        'lg': theme.radii.lg,
        'xl': theme.radii.xl,
        '2xl': theme.radii['2xl'],
        'pill': theme.radii.pill,
        'full': theme.radii.full,
      },
      typography: {
        scale: {
          caption: {
            size: theme.typography.body.size * 0.75,
            lineHeight: theme.typography.body.lineHeight * 0.75,
            weight: '400',
          },
          body: {
            size: theme.typography.body.size,
            lineHeight: theme.typography.body.lineHeight,
            weight: theme.typography.body.weight,
          },
          h4: {
            size: theme.typography.body.size * 1.25,
            lineHeight: theme.typography.body.lineHeight * 1.25,
            weight: '600',
          },
          h3: {
            size: theme.typography.h2.size * 0.8,
            lineHeight: theme.typography.h2.lineHeight * 0.8,
            weight: '600',
          },
          h2: {
            size: theme.typography.h2.size,
            lineHeight: theme.typography.h2.lineHeight,
            weight: theme.typography.h2.weight,
          },
          h1: {
            size: theme.typography.h1.size,
            lineHeight: theme.typography.h1.lineHeight,
            weight: theme.typography.h1.weight,
          },
        },
      },
      motion: {
        duration: {
          xfast: motionDurations.xfast,
          fast: motionDurations.fast,
          base: motionDurations.base,
          slow: motionDurations.slow,
          xslow: motionDurations.xslow,
        },
        easing: {
          standard: motionEasing.standardArray,
          emphasized: motionEasing.emphasizedArray,
          decel: motionEasing.decelArray,
          accel: motionEasing.accelArray,
        },
        scale: {
          pressed: motionScale.pressed,
          lift: motionScale.lift,
        },
        opacity: {
          pressed: motionOpacity.pressed,
          disabled: motionOpacity.disabled,
          shimmer: motionOpacity.shimmer,
        },
      },
      shadow: {
        '1': {
          radius: 4,
          offset: [0, 2],
          opacity: 0.1,
        },
        '2': {
          radius: 8,
          offset: [0, 4],
          opacity: 0.15,
        },
        '3': {
          radius: 12,
          offset: [0, 6],
          opacity: 0.2,
        },
        '4': {
          radius: 16,
          offset: [0, 8],
          opacity: 0.25,
        },
      },
    },
    microInteractions: {
      pressFeedback: {
        enabled: true,
        scale: motionScale.pressed,
        durationMs: motionDurations.fast,
        easing: motionEasing.standardArray,
        haptic: 'light',
      },
      successMorph: {
        enabled: true,
        durationMs: motionDurations.base,
        haptic: 'success',
      },
      elasticPullToRefresh: {
        enabled: true,
        maxStretch: 1.5,
      },
      sharedElement: {
        enabled: true,
        durationMs: motionDurations.slow,
      },
      confettiLite: {
        enabled: true,
        maxParticles: 50,
        cooldownSec: 5,
      },
      shimmer: {
        enabled: true,
        sweepMs: 1500,
        opacity: motionOpacity.shimmer,
      },
      guards: {
        respectReducedMotion: true,
        lowEndDevicePolicy: 'full',
      },
    },
    components: {
      button: {
        variant: 'primary',
        radius: 'md',
        elevation: '2',
      },
      card: {
        radius: 'lg',
        elevation: '1',
        imageFade: 'dominant-color',
      },
      chip: {
        filled: false,
      },
      toast: {
        position: 'top',
        durationMs: 3000,
      },
    },
    screens: {},
    featureFlags: {},
    meta: {
      changelog: 'Embedded default configuration',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    },
  };
}
