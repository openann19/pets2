/**
 * 🎨 RN-SAFE TOKENS WRAPPER
 * Wraps @pawfectmatch/design-tokens for React Native compatibility
 */

import { COLORS, SPACING, RADIUS } from '@pawfectmatch/design-tokens';
import type { ColorScheme, Theme } from './types';
import { Easing } from 'react-native';

const toPx = (v: number | string): number =>
  typeof v === 'string' ? Number.parseFloat(v.replace('rem', '')) * 16 : v;

export const createTheme = (scheme: ColorScheme): Theme => {
  const c = COLORS;
  const s = SPACING;
  const r = RADIUS;

  const isDark = scheme === 'dark';

  return {
    scheme,
    colors: {
      // Core semantic colors
      bg: isDark ? c.neutral[950] : c.neutral[0],
      bgElevated: isDark ? c.neutral[900] : c.neutral[50],
      text: isDark ? c.neutral[50] : c.neutral[950],
      textMuted: isDark ? c.neutral[400] : c.neutral[600],
      primary: c.primary[600],
      primaryText: c.neutral[0],
      border: isDark ? c.neutral[800] : c.neutral[200],
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',

      // Extended semantic colors for backward compatibility
      background: isDark ? c.neutral[950] : c.neutral[0],
      surface: isDark ? c.neutral[950] : c.neutral[0],
      surfaceElevated: isDark ? c.neutral[900] : c.neutral[50],
      card: isDark ? c.neutral[900] : c.neutral[50],
      textSecondary: isDark ? c.neutral[400] : c.neutral[600],

      // Monochrome palette
      white: '#ffffff',
      black: '#000000',
      gray50: '#fafafa',
      gray100: '#f5f5f5',
      gray200: '#e5e5e5',
      gray300: '#d4d4d4',
      gray400: '#a3a3a3',
      gray500: '#737373',
      gray600: '#525252',
      gray700: '#404040',
      gray800: '#262626',
      gray900: '#171717',
      gray950: '#0a0a0a',

      // Primary variants
      primaryLight: isDark ? '#fce7f3' : '#ec4899',
      primaryDark: isDark ? '#831843' : '#be185d',

      // Secondary variants
      secondary: '#a855f7',
      secondaryLight: isDark ? '#f3e8ff' : '#9333ea',
      secondaryDark: isDark ? '#581c87' : '#7e22ce',

      // Accent variants
      accent: '#10b981',
      accentLight: isDark ? '#dcfce7' : '#059669',
      accentDark: isDark ? '#064e3b' : '#047857',

      // Glass effects
      glass: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
      glassLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
      glassWhite: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
      glassWhiteLight: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
      glassWhiteDark: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.98)',
      glassDark: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.9)',
      glassDarkMedium: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.7)',
      glassDarkStrong: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.5)',

      // Status colors
      info: '#3b82f6',
      error: '#ef4444',

      // Additional properties
      tertiary: '#f59e0b',
      inverse: isDark ? '#ffffff' : '#000000',
      shadow: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      interactive: c.primary[600],
      feedback: '#10b981',
    },
    spacing: {
      // Required numeric string properties
      '0': '0px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '32': '128px',
      '36': '144px',
      '40': '160px',
      '44': '176px',
      '48': '192px',
      '52': '208px',
      '56': '224px',
      '60': '240px',
      '64': '256px',
      '72': '288px',
      '80': '320px',
      '96': '384px',
      // Named spacing helpers
      'xs': toPx(s[1]),
      'sm': toPx(s[2]),
      'md': toPx(s[4]),
      'lg': toPx(s[6]),
      'xl': toPx(s[8]),
      '2xl': toPx(s[10]),
      '3xl': toPx(s[12]),
      '4xl': toPx(s[16]),
    },
    radius: {
      'none': 0,
      'xs': toPx(r.sm) * 0.5,
      'sm': toPx(r.sm),
      'md': toPx(r.md),
      'lg': toPx(r.lg),
      'xl': toPx(r.xl),
      '2xl': toPx(r.xl) * 1.5,
      'full': 9999,
      'pill': 999,
    },
    motion: {
      duration: { fast: 150, normal: 250, slow: 400 },
      easing: { standard: Easing.bezier(0.4, 0, 0.2, 1) },
      spring: { stiff: { stiffness: 300, damping: 30, mass: 0.9 } },
    },
    // Backward compatibility
    isDark,
    styles: {},
    shadows: {},
  };
};
