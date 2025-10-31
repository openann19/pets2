/**
 * 🎬 UNIFIED ANIMATION API
 * Single source of truth for all animation constants and utilities
 *
 * Also provides backward-compatible re-exports for design tokens
 */

import { Easing } from 'react-native';
import { SPACING, RADIUS, COLORS, SHADOWS, TYPOGRAPHY } from '@pawfectmatch/design-tokens';

// Animation constants
export const DUR = { fast: 150, normal: 250, slow: 400 } as const;

export const EASE = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  out: Easing.bezier(0, 0, 0.2, 1),
  in: Easing.bezier(0.4, 0, 1, 1),
} as const;

export const SPRING = {
  stiff: { stiffness: 300, damping: 30, mass: 0.9 },
  soft: { stiffness: 180, damping: 22, mass: 1.0 },
} as const;

// Backward compatibility - re-export design tokens
// TODO: Components should import these from @pawfectmatch/design-tokens directly
export const Spacing = {
  ...SPACING,
  'xs': 4,
  'sm': 8,
  'md': 16,
  'lg': 24,
  'xl': 32,
  '2xl': 64,
  '3xl': 96,
  '4xl': 128,
};
export const BorderRadius = RADIUS;
export const Colors = COLORS; // Re-export Colors for backward compatibility
export const Typography = TYPOGRAPHY; // Re-export Typography for backward compatibility
export const Shadows = SHADOWS; // Re-export Shadows for backward compatibility
// GlobalStyles placeholder - should be imported from styles/GlobalStyles but keeping for backward compatibility
export const GlobalStyles: Record<string, any> = {
  container: {},
  tabContainer: {},
  // Add common style keys that tests might access
  screen: {},
  content: {},
  header: {},
  card: {},
  button: {},
  text: {},
};
