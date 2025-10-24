/**
 * Unified tokens export for convenient importing
 */

import { 
  COLORS, 
  GRADIENTS, 
  SHADOWS, 
  BLUR, 
  RADIUS, 
  SPACING, 
  TYPOGRAPHY, 
  TRANSITIONS, 
  Z_INDEX 
} from './constants';

// Simple utils for tokens (avoid circular dependency)
const utils = {
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    const normalized = hex.length === 3
      ? hex.slice(0, 1) + hex.slice(0, 1) + hex.slice(1, 2) + hex.slice(1, 2) + hex.slice(2, 3) + hex.slice(2, 3)
      : hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return 'rgba(' + String(r) + ', ' + String(g) + ', ' + String(b) + ', ' + String(opacity) + ')';
  },
};

export const tokens = {
  colors: COLORS,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  blur: BLUR,
  radius: RADIUS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  utils,
} as const;

export type Tokens = typeof tokens;