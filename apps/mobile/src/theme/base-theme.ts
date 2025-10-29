/**
 * 🎨 BASE THEME CONSTANTS
 * Legacy theme structure with nested colors, used by resolve.ts
 * This maintains backward compatibility for the resolve layer
 */

import { COLORS, SPACING, RADIUS } from '@pawfectmatch/design-tokens';
import { Easing } from 'react-native';

const toPx = (v: number | string): number =>
  typeof v === 'string' ? Number.parseFloat(v.replace('rem', '')) * 16 : v;

// Base theme structure that resolve.ts expects (with nested colors)
export const Theme = {
  colors: {
    // Primary brand colors (scale)
    primary: {
      50: COLORS.primary[50],
      100: COLORS.primary[100],
      200: COLORS.primary[200],
      300: COLORS.primary[300],
      400: COLORS.primary[400],
      500: COLORS.primary[500],
      600: COLORS.primary[600],
      700: COLORS.primary[700],
      800: COLORS.primary[800],
      900: COLORS.primary[900],
      950: COLORS.primary[950],
    },

    // Secondary colors (scale)
    secondary: {
      50: COLORS.secondary[50],
      100: COLORS.secondary[100],
      200: COLORS.secondary[200],
      300: COLORS.secondary[300],
      400: COLORS.secondary[400],
      500: COLORS.secondary[500],
      600: COLORS.secondary[600],
      700: COLORS.secondary[700],
      800: COLORS.secondary[800],
      900: COLORS.secondary[900],
    },

    // Neutral colors (scale)
    neutral: {
      0: COLORS.neutral[0],
      50: COLORS.neutral[50],
      100: COLORS.neutral[100],
      200: COLORS.neutral[200],
      300: COLORS.neutral[300],
      400: COLORS.neutral[400],
      500: COLORS.neutral[500],
      600: COLORS.neutral[600],
      700: COLORS.neutral[700],
      800: COLORS.neutral[800],
      900: COLORS.neutral[900],
      950: COLORS.neutral[950],
    },

    // Status colors
    status: {
      success: COLORS.success[500],
      warning: COLORS.warning[500],
      error: COLORS.error[500],
      info: COLORS.info[500],
    },

    // Semantic colors (nested structure)
    text: {
      primary: COLORS.neutral[900],
      secondary: COLORS.neutral[600],
      tertiary: COLORS.neutral[400],
      inverse: COLORS.neutral[0],
    },

    background: {
      primary: COLORS.neutral[0],
      secondary: COLORS.neutral[50],
      tertiary: COLORS.neutral[100],
      inverse: COLORS.neutral[950],
    },

    border: {
      light: COLORS.neutral[200],
      medium: COLORS.neutral[300],
      dark: COLORS.neutral[400],
    },
  },

  // Typography system
  typography: {
    fontSize: {
      'xs': 12,
      'sm': 14,
      'base': 16,
      'lg': 18,
      'xl': 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      thin: '100' as const,
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
    heading: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
    },
  },

  // Spacing system
  spacing: {
    'xs': toPx(SPACING[1]),
    'sm': toPx(SPACING[2]),
    'md': toPx(SPACING[4]),
    'lg': toPx(SPACING[6]),
    'xl': toPx(SPACING[8]),
    '2xl': toPx(SPACING[10]),
    '3xl': toPx(SPACING[12]),
    '4xl': toPx(SPACING[16]),
  },

  // Border radius system
  borderRadius: {
    'none': 0,
    'xs': toPx(RADIUS.sm) * 0.5,
    'sm': toPx(RADIUS.sm),
    'md': toPx(RADIUS.md),
    'lg': toPx(RADIUS.lg),
    'xl': toPx(RADIUS.xl),
    '2xl': toPx(RADIUS.xl) * 1.5,
    'full': 9999,
    'pill': 999,
  },

  // Shadow system
  shadows: {
    depth: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 8,
      },
    },
  },

  // Motion system
  motion: {
    duration: { fast: 150, normal: 250, slow: 400 },
    easing: { standard: Easing.bezier(0.4, 0, 0.2, 1) },
    spring: { stiff: { stiffness: 300, damping: 30, mass: 0.9 } },
  },
} as const;

// Dark theme variant
export const DarkTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,
    text: {
      primary: COLORS.neutral[0],
      secondary: COLORS.neutral[400],
      tertiary: COLORS.neutral[500],
      inverse: COLORS.neutral[950],
    },
    background: {
      primary: COLORS.neutral[950],
      secondary: COLORS.neutral[900],
      tertiary: COLORS.neutral[800],
      inverse: COLORS.neutral[0],
    },
    border: {
      light: COLORS.neutral[800],
      medium: COLORS.neutral[700],
      dark: COLORS.neutral[600],
    },
  },
} as const;
