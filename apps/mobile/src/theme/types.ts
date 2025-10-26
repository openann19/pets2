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
}

export interface Spacing {
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
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  full: number;
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
