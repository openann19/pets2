/**
 * Premium Gradient Colors
 * Centralized gradient color definitions for elite components
 */

import { useTheme } from '@mobile/src/theme';

export const getPremiumGradients = (theme: ReturnType<typeof useTheme>) =>
  ({
    primary: [theme.colors.danger, theme.colors.danger, theme.colors.danger],
    secondary: [theme.colors.success, theme.colors.success, theme.colors.success],
    premium: [theme.colors.primary, theme.colors.primary, theme.colors.primary],
    sunset: [theme.colors.warning, theme.colors.warning, theme.colors.warning],
    ocean: [theme.colors.success, theme.colors.success, theme.colors.success],
    holographic: [
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.danger,
      theme.colors.danger,
      theme.colors.success,
    ],
    neon: [theme.colors.info, theme.colors.primary, theme.colors.warning],
    glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
  }) as const;

export type PremiumGradientKey = keyof ReturnType<typeof getPremiumGradients>;
