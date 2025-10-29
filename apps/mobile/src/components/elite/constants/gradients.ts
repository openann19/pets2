/**
 * Premium Gradient Colors
 * Centralized gradient color definitions for elite components
 */

import { useTheme } from "@/theme";

export const getPremiumGradients = (theme: ReturnType<typeof useTheme>) => ({
  primary: [theme.colors.danger, theme.colors.danger, theme.colors.danger],
  secondary: [theme.colors.status.success, theme.colors.status.success, theme.colors.status.success],
  premium: [theme.colors.primary[600], theme.colors.primary[600], theme.colors.primary[600]],
  sunset: [theme.colors.status.warning, theme.colors.status.warning, theme.colors.status.warning],
  ocean: [theme.colors.status.success, theme.colors.status.success, theme.colors.status.success],
  holographic: [theme.colors.primary[500], theme.colors.primary[600], theme.colors.danger, theme.colors.danger, theme.colors.status.success],
  neon: [theme.colors.status.info, theme.colors.primary[600], theme.colors.status.warning],
  glass: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"],
} as const);

export type PremiumGradientKey = keyof ReturnType<typeof getPremiumGradients>;
