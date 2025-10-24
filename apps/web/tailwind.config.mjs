import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  Z_INDEX,
} from '@pawfectmatch/design-tokens';

const config = {
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      // Color palette from design tokens
      colors: {
        ...COLORS,
        // Backwards compatibility mappings
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        neutral: COLORS.neutral,
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
        info: COLORS.info,
      },

      // Spacing from design tokens
      spacing: SPACING,

      // Typography from design tokens
      fontSize: TYPOGRAPHY.fontSizes,
      fontWeight: TYPOGRAPHY.fontWeights,
      lineHeight: TYPOGRAPHY.lineHeights,
      letterSpacing: TYPOGRAPHY.letterSpacing,

      // Shadows from design tokens
      boxShadow: SHADOWS,

      // Border radius from design tokens
      borderRadius: RADIUS,

      // Z-index from design tokens
      zIndex: Z_INDEX,
    },
  },

  plugins: [],
};

export default config;
