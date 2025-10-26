/**
 * 🎨 PREMIUM MOBILE DESIGN TOKENS
 * Central design system for React Native with colors, gradients, shadows, and effects
 * Uses unified design tokens from @pawfectmatch/design-tokens package
 */

// TODO: Re-export from unified design tokens package once built
// export { COLORS, GRADIENTS, SHADOWS, BLUR, RADIUS, SPACING, TYPOGRAPHY, TRANSITIONS, Z_INDEX, VARIANTS, utils } from '@pawfectmatch/design-tokens';

// ====== COLOR PALETTE ======
export const COLORS = {
  // Brand Primary (Pink/Rose)
  primary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
    950: "#500724",
  },

  // Brand Secondary (Purple/Violet)
  secondary: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
    950: "#3b0764",
  },

  // Neutral Grays
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Success
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  // Error/Danger
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },

  // Warning
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },

  // Info
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
};

// ====== MOBILE-SPECIFIC ADAPTATIONS ======
// Convert web gradients to React Native gradient arrays
export const MOBILE_GRADIENTS = {
  // Primary brand gradients
  primary: ["#ec4899", "#db2777"],
  secondary: ["#a855f7", "#9333ea"],

  // Premium mesh gradients
  mesh: {
    warm: ["#ff6b6b", "#ee5a6f", "#c44569", "#a8385d", "#7f2c53"],
    cool: ["#667eea", "#764ba2", "#f093fb"],
    sunset: ["#fa709a", "#fee140"],
    ocean: ["#4facfe", "#00f2fe"],
    royal: ["#a8edea", "#fed6e3"],
    cosmic: ["#667eea", "#764ba2"],
  },

  // Glass morphism
  glass: {
    light: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    medium: ["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"],
    dark: ["rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.05)"],
  },

  // Special effects
  holographic: ["#ff6b6b", "#4ecdc4", "#45b7b8", "#96ceb4", "#ffeaa7"],
  neon: ["#f093fb", "#f5576c"],
  aurora: ["#667eea", "#764ba2", "#f093fb", "#f5576c"],
};

// Convert web shadows to React Native shadow objects
export const MOBILE_SHADOWS = {
  // Standard shadows
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  "2xl": {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  // Premium color glows
  primaryGlow: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  secondaryGlow: {
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  neon: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Convert web blur values to React Native blur intensity
export const MOBILE_BLUR = {
  sm: 5,
  md: 10,
  lg: 20,
  xl: 30,
  "2xl": 50,
  premium: 40,
};

// Convert web radius values to React Native numbers
export const MOBILE_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
  pill: 999,
};

// Convert web spacing values to React Native numbers
export const MOBILE_SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  48: 192,
};

// Convert web typography to React Native numbers
export const MOBILE_TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },
  fontWeights: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Mobile-specific component variants
export const MOBILE_VARIANTS = {
  // Button variants
  button: {
    primary: {
      colors: MOBILE_GRADIENTS.primary,
      textColor: "#ffffff",
      shadowColor: "#ec4899",
      border: false,
      borderColor: "#ec4899",
    },
    secondary: {
      colors: MOBILE_GRADIENTS.secondary,
      textColor: "#ffffff",
      shadowColor: "#a855f7",
      border: false,
      borderColor: "#a855f7",
    },
    ghost: {
      colors: ["transparent", "transparent"],
      textColor: "#404040",
      shadowColor: "transparent",
      border: true,
      borderColor: "#d4d4d4",
    },
    glass: {
      colors: MOBILE_GRADIENTS.glass.light,
      textColor: "#262626",
      shadowColor: "#000000",
      blur: true,
      border: false,
      borderColor: "#000000",
    },
    gradient: {
      colors: MOBILE_GRADIENTS.mesh.cool,
      textColor: "#ffffff",
      shadowColor: "#667eea",
      border: false,
      borderColor: "#667eea",
    },
    neon: {
      colors: ["#171717", "#171717"],
      textColor: "#ec4899",
      shadowColor: "#ec4899",
      border: true,
      borderColor: "#ec4899",
    },
  },

  // Card variants
  card: {
    default: {
      backgroundColor: "#ffffff",
      shadow: MOBILE_SHADOWS.lg,
      borderColor: "#e5e5e5",
      borderRadius: MOBILE_RADIUS["2xl"],
    },
    glass: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      shadow: MOBILE_SHADOWS.glass,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: MOBILE_RADIUS["2xl"],
    },
    elevated: {
      backgroundColor: "#ffffff",
      shadow: MOBILE_SHADOWS["2xl"],
      borderRadius: MOBILE_RADIUS["2xl"],
    },
    gradient: {
      colors: MOBILE_GRADIENTS.mesh.cool,
      shadow: MOBILE_SHADOWS.xl,
      borderRadius: MOBILE_RADIUS["2xl"],
    },
    holographic: {
      colors: MOBILE_GRADIENTS.holographic,
      shadow: MOBILE_SHADOWS.neon,
      borderRadius: MOBILE_RADIUS["2xl"],
    },
    neon: {
      backgroundColor: "#171717",
      borderWidth: 2,
      borderColor: "#ec4899",
      shadow: MOBILE_SHADOWS.neon,
      borderRadius: MOBILE_RADIUS["2xl"],
    },
  },
};

// Mobile-specific utility functions
export const mobileUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${opacity.toString()})`;
  },

  // Get responsive value
  getResponsiveValue: <T>(
    values: { sm?: T; md?: T; lg?: T },
    screenWidth: number,
  ): T | undefined => {
    if (screenWidth < 640) return values.sm ?? values.md ?? values.lg;
    if (screenWidth < 1024) return values.md ?? values.lg;
    return values.lg;
  },

  // Generate random gradient
  getRandomGradient: (): string[] => {
    const gradients = Object.values(MOBILE_GRADIENTS.mesh);
    return (
      gradients[Math.floor(Math.random() * gradients.length)] ??
      MOBILE_GRADIENTS.mesh.cool
    );
  },
};

// Add missing exports for compatibility
export const TRANSITIONS = {
  micro: { duration: 150, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  smooth: { duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  bouncy: { duration: 400, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  gentle: { duration: 500, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
};

export const Z_INDEX = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ====== EXPORTS ======
export default {
  COLORS,
  MOBILE_GRADIENTS,
  MOBILE_SHADOWS,
  MOBILE_BLUR,
  MOBILE_RADIUS,
  MOBILE_SPACING,
  MOBILE_TYPOGRAPHY,
  TRANSITIONS,
  Z_INDEX,
  MOBILE_VARIANTS,
  mobileUtils,
};
