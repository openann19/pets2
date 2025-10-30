/**
 * Premium Shadow Styles (theme-based)
 * Centralized shadow definitions for elite components with glow effects
 * using semantic theme tokens.
 */
import type { AppTheme } from '@/theme';

export const getPremiumShadows = (theme: AppTheme) => ({
  primaryGlow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  secondaryGlow: {
    shadowColor: theme.colors.info,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  holographicGlow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  neonGlow: {
    shadowColor: theme.colors.info,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 25,
  },
  medium: {
    shadowColor: theme.palette.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
} as const);

export type PremiumShadowKey = keyof ReturnType<typeof getPremiumShadows>;
