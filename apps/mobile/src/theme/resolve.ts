// apps/mobile/src/theme/resolve.ts
import { Theme as BaseLight, DarkTheme as BaseDark } from './unified-theme';

/** Contrast helper for readable text on colored backgrounds */
function getContrastText(hex: string): string {
  try {
    // Normalize #RGB/#RRGGBB
    const normalized = hex.replace('#', '');
    const expanded = normalized.length === 3 
      ? `${normalized[0]}${normalized[0]}${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}`
      : normalized;
    
    if (expanded.length < 6) return '#FFFFFF'; // fallback
    
    const r = parseInt(expanded.slice(0, 2), 16);
    const g = parseInt(expanded.slice(2, 4), 16);
    const b = parseInt(expanded.slice(4, 6), 16);
    
    // WCAG relative luminance
    const getLuminance = (val: number) => {
      const s = val / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    
    const L = 0.2126 * getLuminance(r) + 0.7152 * getLuminance(g) + 0.0722 * getLuminance(b);
    return L > 0.55 ? '#111827' : '#FFFFFF';
  } catch {
    return '#FFFFFF'; // fallback for invalid colors
  }
}

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: {
    /** single values used by components */
    primary: string;
    primaryText: string; // contrast text for primary
    secondary: string;

    text: string;
    textMuted: string;
    textInverse: string;

    bg: string;
    bgAlt: string;
    bgElevated?: string; // for backward compat
    border: string;

    success: string;
    warning: string;
    danger: string;
    info: string;

    /** keep access to scales */
    primaryScale: typeof BaseLight.colors.primary;
    neutral: typeof BaseLight.colors.neutral;
    
    // Additional properties for extended colors compatibility
    [key: string]: any; // allows any additional color properties
  };
  /** alias expected by refactored screens */
  radius: typeof BaseLight.borderRadius;
  /** passthrough systems */
  typography: typeof BaseLight.typography;
  spacing: typeof BaseLight.spacing;
  shadows: typeof BaseLight.shadows.depth;
  motion: NonNullable<typeof BaseLight.motion>;
  /** RN-safe numeric z-index */
  zIndex: {
    hide: number; base: number; docked: number; dropdown: number; sticky: number;
    banner: number; overlay: number; modal: number; popover: number;
    skipLink: number; toast: number; tooltip: number;
  };
  
  // Backward compatibility flags
  isDark?: boolean;
};

export function resolveTheme(base: typeof BaseLight | typeof BaseDark): AppTheme {
  const primary = base.colors.primary[500];
  
  return {
    scheme: base === BaseDark ? 'dark' : 'light',
    colors: {
      primary: primary,
      primaryText: getContrastText(primary),
      secondary: base.colors?.secondary?.[500] ?? base.colors.primary[600],

      text: base.colors.text.primary,
      textMuted: base.colors.text.secondary,
      textInverse: base.colors.text.inverse,

      bg: base.colors.background.primary,
      bgAlt: base.colors.background.secondary,
      bgElevated: base.colors.background.tertiary, // for backward compat
      border: base.colors.border.medium,

      success: base.colors.status.success,
      warning: base.colors.status.warning,
      danger: base.colors.status.error,
      info: base.colors.status.info,

      primaryScale: base.colors.primary,
      neutral: base.colors.neutral,
    },
    radius: base.borderRadius,
    typography: base.typography,
    spacing: base.spacing,
    shadows: base.shadows.depth,
    motion: base.motion!,
    zIndex: {
      hide: -1, base: 0, docked: 10, dropdown: 1000, sticky: 1100,
      banner: 1200, overlay: 1300, modal: 1400, popover: 1500,
      skipLink: 1600, toast: 1700, tooltip: 1800,
    },
    isDark: base === BaseDark,
  };
}

export const getLightTheme = (): AppTheme => resolveTheme(BaseLight);
export const getDarkTheme  = (): AppTheme => resolveTheme(BaseDark);
export type { AppTheme as ThemeLike };
