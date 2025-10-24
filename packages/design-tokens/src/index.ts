/**
 * 🎨 PAWFECTMATCH UNIFIED DESIGN TOKENS
 * Single source of truth for all design tokens across web, mobile, and UI packages
 * Production-ready, consistent, and fully documented
 */

// Re-export all constants
export * from './constants';

// Import for local use in VARIANTS
import { COLORS, GRADIENTS, SHADOWS, BLUR } from './constants';

// ====== COMPONENT VARIANTS ======
export const VARIANTS = {
  // Button variants
  button: {
    primary: {
      background: GRADIENTS.primary,
      color: COLORS.neutral[0],
      shadow: SHADOWS.primaryGlow,
      hover: {
        transform: 'translateY(-2px)',
        shadow: SHADOWS.primaryGlow,
      },
    },
    secondary: {
      background: GRADIENTS.secondary,
      color: COLORS.neutral[0],
      shadow: SHADOWS.secondaryGlow,
      hover: {
        transform: 'translateY(-2px)',
        shadow: SHADOWS.secondaryGlow,
      },
    },
    ghost: {
      background: 'transparent',
      color: COLORS.neutral[700],
      border: `1px solid ${COLORS.neutral[300]}`,
      hover: {
        background: COLORS.neutral[50],
        transform: 'translateY(-1px)',
      },
    },
    glass: {
      background: GRADIENTS.glass.light,
      backdropFilter: `${BLUR.lg} saturate(180%)`,
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      color: COLORS.neutral[800],
      shadow: SHADOWS.glass,
    },
    neon: {
      background: COLORS.neutral[900],
      color: COLORS.primary[500],
      border: `2px solid ${COLORS.primary[500]}`,
      shadow: SHADOWS.neonPrimary,
    },
  },

  // Card variants
  card: {
    default: {
      background: COLORS.neutral[0],
      shadow: SHADOWS.lg,
      border: `1px solid ${COLORS.neutral[200]}`,
      borderRadius: '1rem',
    },
    glass: {
      background: GRADIENTS.glass.light,
      backdropFilter: `${BLUR.lg} saturate(180%)`,
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      shadow: SHADOWS.glass,
      borderRadius: '1rem',
    },
    elevated: {
      background: COLORS.neutral[0],
      shadow: SHADOWS['2xl'],
      borderRadius: '1rem',
      transform: 'translateY(-4px)',
    },
    gradient: {
      background: GRADIENTS.mesh.cool,
      shadow: SHADOWS.xl,
      borderRadius: '1rem',
    },
    holographic: {
      background: GRADIENTS.holographic,
      shadow: SHADOWS.neon,
      borderRadius: '1rem',
    },
  },

  // Input variants
  input: {
    default: {
      background: COLORS.neutral[0],
      border: `1px solid ${COLORS.neutral[300]}`,
      borderRadius: '0.375rem',
      shadow: SHADOWS.sm,
    },
    glass: {
      background: GRADIENTS.glass.light,
      backdropFilter: `${BLUR.md} saturate(180%)`,
      border: `1px solid rgba(255, 255, 255, 0.3)`,
      borderRadius: '0.375rem',
      shadow: SHADOWS.glass,
    },
    neon: {
      background: COLORS.neutral[900],
      border: `2px solid ${COLORS.primary[500]}`,
      borderRadius: '0.375rem',
      shadow: SHADOWS.neonPrimary,
      color: COLORS.neutral[0],
    },
  },
} as const;

// ====== UTILITY FUNCTIONS ======
export const utils = {
  // Get color with opacity
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

  // Get responsive value
  getResponsiveValue: <T>(values: { sm?: T; md?: T; lg?: T }, screenWidth: number): T | undefined => {
    if (screenWidth < 640) {
      if (values.sm !== undefined) return values.sm;
      if (values.md !== undefined) return values.md;
      return values.lg;
    }
    if (screenWidth < 1024) {
      if (values.md !== undefined) return values.md;
      return values.lg;
    }
    return values.lg;
  },

  // Generate random gradient
  getRandomGradient: (): string => {
    const gradients = Object.values(GRADIENTS.mesh).filter(Boolean);
    if (gradients.length === 0) return GRADIENTS.primary;
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    return gradient ?? GRADIENTS.primary;
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result == null || result.length < 4) return null;
    const rHex = result[1];
    const gHex = result[2];
    const bHex = result[3];
    if (rHex === undefined || gHex === undefined || bHex === undefined) return null;
    return {
      r: parseInt(rHex, 16),
      g: parseInt(gHex, 16),
      b: parseInt(bHex, 16),
    };
  },

  // Get contrast color
  getContrastColor: (hexColor: string): string => {
    const rgb = utils.hexToRgb(hexColor);
    if (rgb == null) return COLORS.neutral[900];

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? COLORS.neutral[900] : COLORS.neutral[0];
  },
} as const;

// ====== EXPORTS ======

// Export tokens from separate file
export * from './tokens';

// ====== TYPE DEFINITIONS ======
export type ColorScale = keyof typeof COLORS;
export type ColorShade = keyof typeof COLORS.primary;
export type GradientName = keyof typeof GRADIENTS;
export type ShadowSize = keyof typeof SHADOWS;
export type RadiusSize = keyof typeof import('./constants').RADIUS;
export type SpacingSize = keyof typeof import('./constants').SPACING;
export type FontSize = keyof typeof import('./constants').TYPOGRAPHY.fontSizes;
export type FontWeight = keyof typeof import('./constants').TYPOGRAPHY.fontWeights;
export type LineHeight = keyof typeof import('./constants').TYPOGRAPHY.lineHeights;
export type TransitionType = keyof typeof import('./constants').TRANSITIONS;
export type ZIndexLevel = keyof typeof import('./constants').Z_INDEX;
export type ButtonVariant = keyof typeof VARIANTS.button;
export type CardVariant = keyof typeof VARIANTS.card;
export type InputVariant = keyof typeof VARIANTS.input;