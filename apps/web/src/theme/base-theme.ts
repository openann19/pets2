/**
 * 🎨 BASE THEME CONSTANTS
 * Legacy theme structure with nested colors, used by resolve.ts
 * This maintains compatibility with the resolve layer structure
 * Matches mobile app base-theme.ts structure
 */

// Import COLORS from design-system which has the full color palette
import { COLORS } from '../design-system';

// Helper to convert rem/px strings to numbers
const toPx = (v: number | string): number => {
  if (typeof v === 'string') {
    const match = v.match(/^([\d.]+)(px|rem)$/);
    if (match) {
      const value = parseFloat(match[1] ?? '0');
      return match[2] === 'rem' ? value * 16 : value;
    }
    return 0;
  }
  return v;
};

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
      950: COLORS.primary[950] ?? '#500724',
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

  // Spacing system (matching mobile: xs=4px, sm=8px, md=16px, lg=24px, xl=32px)
  spacing: {
    'xs': toPx('0.25rem'), // 4px
    'sm': toPx('0.5rem'), // 8px
    'md': toPx('1rem'), // 16px
    'lg': toPx('1.5rem'), // 24px
    'xl': toPx('2rem'), // 32px
    '2xl': toPx('2.5rem'), // 40px
    '3xl': toPx('3rem'), // 48px
    '4xl': toPx('4rem'), // 64px
  },

  // Border radius system
  borderRadius: {
    'none': 0,
    'xs': toPx('0.125rem'), // 2px
    'sm': toPx('0.25rem'), // 4px
    'md': toPx('0.375rem'), // 6px
    'lg': toPx('0.5rem'), // 8px
    'xl': toPx('0.75rem'), // 12px
    '2xl': toPx('1rem'), // 16px
    'full': 9999,
    'pill': 999,
  },

  // Shadow system (web uses CSS strings instead of RN objects)
  shadows: {
    depth: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },

  // Motion system
  motion: {
    duration: { fast: 150, normal: 250, slow: 400 },
    easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)' },
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

