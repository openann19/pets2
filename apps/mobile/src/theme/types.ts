/**
 * 🎨 UNIFIED THEME TYPES
 * Single source of truth for theme types across the mobile app
 */

export type ColorScheme = "light" | "dark";

export interface SemanticColors {
  bg: string;
  bgElevated: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  // Additional properties used in components
  background?: string;
  card?: string;
  textSecondary?: string;
  error?: string;
  white?: string;
  gray50?: string;
  gray100?: string;
  gray200?: string;
  gray300?: string;
  gray400?: string;
  gray500?: string;
  gray600?: string;
  gray700?: string;
  gray800?: string;
  gray900?: string;
  gray950?: string;
  interactive?: string;
  feedback?: string;
  surface?: string;
  surfaceElevated?: string;
  info?: string;
  accent?: string;
  inverse?: string;
  gradientPrimary?: string[];
  gradientSecondary?: string[];
  gradientAccent?: string[];
  gradientSuccess?: string[];
  gradientWarning?: string[];
  gradientError?: string[];
}

export interface Spacing {
  readonly 0: string;
  readonly 1: string;
  readonly 2: string;
  readonly 3: string;
  readonly 4: string;
  readonly 5: string;
  readonly 6: string;
  readonly 7: string;
  readonly 8: string;
  readonly 9: string;
  readonly 10: string;
  readonly 11: string;
  readonly 12: string;
  readonly 14: string;
  readonly 16: string;
  readonly 20: string;
  readonly 24: string;
  readonly 28: string;
  readonly 32: string;
  readonly 36: string;
  readonly 40: string;
  readonly 44: string;
  readonly 48: string;
  readonly 52: string;
  readonly 56: string;
  readonly 60: string;
  readonly 64: string;
  readonly 72: string;
  readonly 80: string;
  readonly 96: string;
  // Named spacing helpers
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
}

export interface Radius {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  full: number;
  pill: number;
}

export interface Motion {
  duration: { fast: number; normal: number; slow: number };
  easing: { standard: (t: number) => number };
  spring: { stiff: { stiffness: number; damping: number; mass: number } };
}

export interface Theme {
  scheme: ColorScheme;
  colors: SemanticColors;
  spacing: Spacing;
  radius: Radius;
  motion: Motion;
  
  // Backward compatibility helpers
  isDark?: boolean; // Use scheme === 'dark' instead
  styles?: Record<string, unknown>; // For legacy component support
  shadows?: Record<string, unknown>; // For legacy component support
}
