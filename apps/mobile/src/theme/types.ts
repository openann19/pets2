/**
 * 🎨 UNIFIED THEME TYPES
 * Single source of truth for theme types across the mobile app
 */

export type ColorScheme = 'light' | 'dark';

export interface SemanticColors {
  // Core semantic colors (matches AppTheme contract)
  bg: string;
  surface: string;
  overlay: string;
  border: string;
  onBg: string;
  onSurface: string;
  onMuted: string;
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
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
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface Radius {
  'none': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  'full': number;
  'pill': number;
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

// Additional types for theme providers
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Color Palette type for backward compatibility
export interface ColorPalette {
  [key: string]: string;
}

// Typography Scale type for backward compatibility
export interface TypographyScale {
  [key: string]: {
    fontSize: number;
    lineHeight: number;
    fontWeight: string | number;
    letterSpacing?: number;
  };
}

// Spacing Scale type for backward compatibility
export interface SpacingScale {
  [key: string]: number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

// Shadow Scale type for backward compatibility
export interface ShadowScale {
  [key: string]: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

// Radius Scale type for backward compatibility
export interface RadiusScale {
  [key: string]: number;
  'none': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  'full': number;
  'pill': number;
}

// Opacity Scale type
export interface OpacityScale {
  [key: string]: number;
  transparent: number;
  invisible: number;
  disabled: number;
  hover: number;
  focus: number;
  pressed: number;
  selected: number;
}

// Border Width Scale type
export interface BorderWidthScale {
  [key: string]: number;
  none: number;
  thin: number;
  medium: number;
  thick: number;
}

// Icon Size Scale type
export interface IconSizeScale {
  [key: string]: number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
}

// Animation Scale type
export interface AnimationScale {
  [key: string]: {
    duration: number;
    easing: string;
  };
  instant: { duration: number; easing: string };
  fast: { duration: number; easing: string };
  normal: { duration: number; easing: string };
  slow: { duration: number; easing: string };
  slower: { duration: number; easing: string };
}

// Z-Index Scale type
export interface ZIndexScale {
  [key: string]: number;
  hide: number;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}
