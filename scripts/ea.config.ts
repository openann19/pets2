export const EAConfig = {
  // Which files to touch
  globs: ["apps/mobile/src/**/*.{ts,tsx}"],

  // Semantic → tokens mapping (aligned with unified-theme.ts structure)
  themeMap: {
    // Primary colors
    primary: "colors.primary[500]",
    secondary: "colors.secondary[500]",
    
    // Text colors
    text: "colors.text.primary",
    textPrimary: "colors.text.primary",
    textSecondary: "colors.text.secondary",
    textMuted: "colors.text.secondary",
    textInverse: "colors.neutral[0]",
    inverseText: "colors.neutral[0]",
    
    // Status colors
    success: "colors.status.success",
    warning: "colors.status.warning",
    error: "colors.status.error",
    info: "colors.status.info",
    
    // Background colors
    surface: "colors.background.primary",
    surfaceSecondary: "colors.background.secondary",
    background: "colors.background.primary",
    
    // Border colors
    border: "colors.border.light",
    borderLight: "colors.border.light",
    borderMedium: "colors.border.medium",
    borderDark: "colors.border.dark",
  },
  
  // Skip Animated import addition (too risky)
  skipAnimatedImport: true,
} as const;
