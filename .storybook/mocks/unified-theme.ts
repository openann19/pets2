import React, { type ReactNode } from 'react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@pawfectmatch/design-tokens';

type Scheme = 'light' | 'dark';

const createBaseTheme = (scheme: Scheme) => {
  const isDark = scheme === 'dark';

  return {
    colors: {
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      text: {
        primary: isDark ? COLORS.neutral[0] : COLORS.neutral[900],
        secondary: isDark ? COLORS.neutral[400] : COLORS.neutral[600],
        inverse: isDark ? COLORS.neutral[900] : COLORS.neutral[0],
      },
      background: {
        primary: isDark ? COLORS.neutral[950] : COLORS.neutral[0],
        secondary: isDark ? COLORS.neutral[900] : COLORS.neutral[50],
        tertiary: isDark ? COLORS.neutral[800] : COLORS.neutral[100],
      },
      border: {
        medium: isDark ? COLORS.neutral[800] : COLORS.neutral[200],
      },
      status: {
        success: COLORS.success[500],
        warning: COLORS.warning[500],
        error: COLORS.error[500],
        info: COLORS.info[500],
      },
      neutral: COLORS.neutral,
    },
    borderRadius: {
      xs: RADIUS.xs,
      sm: RADIUS.sm,
      md: RADIUS.md,
      lg: RADIUS.lg,
      xl: RADIUS.xl,
      '2xl': RADIUS['2xl'],
    },
    typography: TYPOGRAPHY,
    spacing: SPACING,
    shadows: {
      depth: SHADOWS.depth,
    },
    motion: {
      springs: {
        snappy: { stiffness: 520, damping: 22 },
        firm: { stiffness: 380, damping: 24 },
        soft: { stiffness: 260, damping: 22 },
      },
    },
  } as const;
};

export const Theme = createBaseTheme('light');
export const DarkTheme = createBaseTheme('dark');

export type ThemeType = typeof Theme;

export const ThemeProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export const useTheme = () => Theme;

export default Theme;

