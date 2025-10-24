/**
 * 🎨 REACT NATIVE ADAPTER FOR DESIGN TOKENS
 * Converts web design tokens to React Native-compatible format
 * Adds mobile-specific properties like elevation, Platform-specific values
 */

import { Platform } from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  TRANSITIONS,
  Z_INDEX,
} from './index';

// ====== HELPER FUNCTIONS ======
const remToPx = (rem: string): number => {
  const num = parseFloat(rem.replace('rem', ''));
  return num * 16; // 1rem = 16px
};

const pxToNumber = (px: string): number => {
  return parseFloat(px.replace('px', ''));
};

// ====== REACT NATIVE COLORS ======
export const RN_COLORS = {
  ...COLORS,
  // Add mobile-specific color utilities
  get: (colorPath: string, shade?: string): string => {
    const [category, ...rest] = colorPath.split('.');
    const colorCategory = COLORS[category as keyof typeof COLORS];
    if (typeof colorCategory === 'object' && shade) {
      return colorCategory[shade as keyof typeof colorCategory] || '';
    }
    return '';
  },
};

// ====== REACT NATIVE SPACING ======
export const RN_SPACING = {
  ...SPACING,
  // Convert all spacing values to numbers
  get: (size: keyof typeof SPACING): number => {
    const value = SPACING[size];
    if (typeof value === 'string') {
      return remToPx(value);
    }
    return 0;
  },
  // Platform-specific spacing
  safeAreaTop: Platform.OS === 'ios' ? 44 : 24,
  safeAreaBottom: Platform.OS === 'ios' ? 34 : 24,
  tabBar: 60,
  statusBar: Platform.OS === 'ios' ? 44 : 24,
};

// ====== REACT NATIVE RADIUS ======
export const RN_RADIUS = {
  ...RADIUS,
  // Convert all radius values to numbers
  get: (size: keyof typeof RADIUS): number => {
    const value = RADIUS[size];
    if (typeof value === 'string') {
      return pxToNumber(value);
    }
    return 0;
  },
};

// ====== REACT NATIVE TYPOGRAPHY ======
export const RN_TYPOGRAPHY = {
  fontSizes: {
    xs: remToPx(TYPOGRAPHY.fontSizes.xs),
    sm: remToPx(TYPOGRAPHY.fontSizes.sm),
    base: remToPx(TYPOGRAPHY.fontSizes.base),
    lg: remToPx(TYPOGRAPHY.fontSizes.lg),
    xl: remToPx(TYPOGRAPHY.fontSizes.xl),
    '2xl': remToPx(TYPOGRAPHY.fontSizes['2xl']),
    '3xl': remToPx(TYPOGRAPHY.fontSizes['3xl']),
    '4xl': remToPx(TYPOGRAPHY.fontSizes['4xl']),
    '5xl': remToPx(TYPOGRAPHY.fontSizes['5xl']),
    '6xl': remToPx(TYPOGRAPHY.fontSizes['6xl']),
  },
  fontWeights: {
    ...TYPOGRAPHY.fontWeights,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};

// ====== REACT NATIVE TRANSITIONS ======
export const RN_TRANSITIONS = {
  micro: {
    duration: TRANSITIONS.micro.duration,
    easing: TRANSITIONS.micro.easing,
  },
  smooth: {
    duration: TRANSITIONS.smooth.duration,
    easing: TRANSITIONS.smooth.easing,
  },
  bouncy: {
    duration: TRANSITIONS.bouncy.duration,
    easing: TRANSITIONS.bouncy.easing,
  },
  gentle: {
    duration: TRANSITIONS.gentle.duration,
    easing: TRANSITIONS.gentle.easing,
  },
  // Mobile-specific transitions
  mobile: {
    tap: {
      duration: 100,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slide: {
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    swipe: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// ====== REACT NATIVE SHADOWS ======
export const RN_SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
};

// ====== REACT NATIVE Z-INDEX ======
export const RN_Z_INDEX = {
  ...Z_INDEX,
};

// ====== EXPORTS ======
export {
  RN_COLORS as COLORS,
  RN_SPACING as SPACING,
  RN_RADIUS as RADIUS,
  RN_TYPOGRAPHY as TYPOGRAPHY,
  RN_TRANSITIONS as TRANSITIONS,
  RN_SHADOWS as SHADOWS,
  RN_Z_INDEX as Z_INDEX,
};

// Default export
export default {
  COLORS: RN_COLORS,
  SPACING: RN_SPACING,
  RADIUS: RN_RADIUS,
  TYPOGRAPHY: RN_TYPOGRAPHY,
  TRANSITIONS: RN_TRANSITIONS,
  SHADOWS: RN_SHADOWS,
  Z_INDEX: RN_Z_INDEX,
};

