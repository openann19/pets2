// apps/mobile/src/theme/resolve.ts
import type { AppTheme } from './contracts';
import { Theme as BaseLight, DarkTheme as BaseDark } from './base-theme';

/** Contrast helper for readable text on colored backgrounds */
function getContrastText(hex: string): string {
  try {
    // Normalize #RGB/#RRGGBB
    const normalized = hex.replace('#', '');
    const expanded =
      normalized.length === 3
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

// AppTheme type is imported from contracts.ts above

export function resolveTheme(base: typeof BaseLight | typeof BaseDark): AppTheme {
  const primary = base.colors.primary[500];

  // Map old structure to new semantic tokens + backward compat
  const textPrimary = base.colors.text.primary;
  const textSecondary = base.colors.text.secondary;
  const textInverse = base.colors.text.inverse;
  const bgPrimary = base.colors.background.primary;
  const bgSecondary = base.colors.background.secondary;
  const bgElevated = base.colors.background.tertiary;

  const isDark = base === BaseDark;

  return {
    scheme: isDark ? 'dark' : 'light',
    isDark,
    colors: {
      bg: bgPrimary,
      surface: bgElevated ?? bgSecondary,
      overlay: `${bgPrimary}80`, // semi-transparent overlay
      border: base.colors.border.medium,
      onBg: textInverse,
      onSurface: textPrimary,
      onMuted: textSecondary,
      primary: primary,
      onPrimary: getContrastText(primary),
      success: base.colors.status.success,
      danger: base.colors.status.error,
      warning: base.colors.status.warning,
      info: base.colors.status.info,
    },
    radii: {
      'none': base.borderRadius.none,
      'xs': base.borderRadius.xs,
      'sm': base.borderRadius.sm,
      'md': base.borderRadius.md,
      'lg': base.borderRadius.lg,
      'xl': base.borderRadius.xl,
      '2xl': base.borderRadius['2xl'],
      'pill': base.borderRadius.pill,
      'full': base.borderRadius.full,
    },
    spacing: {
      'xs': base.spacing.xs,
      'sm': base.spacing.sm,
      'md': base.spacing.md,
      'lg': base.spacing.lg,
      'xl': base.spacing.xl,
      '2xl': base.spacing['2xl'] ?? base.spacing.xl * 1.5,
      '3xl': base.spacing['3xl'] ?? base.spacing.xl * 2,
      '4xl': base.spacing['4xl'] ?? base.spacing.xl * 3,
    },
    shadows: {
      elevation1: base.shadows.depth.sm,
      elevation2: base.shadows.depth.md,
      glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
      },
    },
    blur: {
      sm: 8,
      md: 16,
      lg: 24,
    },
    easing: {
      standard: base.motion?.easing?.standard?.toString() ?? 'cubic-bezier(0.4, 0, 0.2, 1)',
      decel: 'cubic-bezier(0, 0, 0.2, 1)',
      accel: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    typography: {
      body: {
        size: base.typography.body.fontSize,
        lineHeight: base.typography.body.lineHeight,
        weight: base.typography.body.fontWeight as '400',
      },
      h1: {
        size: base.typography.heading.fontSize,
        lineHeight: base.typography.heading.lineHeight,
        weight: '700' as const,
      },
      h2: {
        size: base.typography.heading.fontSize * 0.875,
        lineHeight: base.typography.heading.lineHeight * 0.875,
        weight: '600' as const,
      },
    },
    palette: {
      neutral: base.colors.neutral,
      brand: base.colors.primary,
      gradients: {
        primary: [base.colors.primary[500], base.colors.primary[600]],
        success: [base.colors.status.success, base.colors.status.success],
        danger: [base.colors.status.error, base.colors.status.error],
        warning: [base.colors.status.warning, base.colors.status.warning],
        info: [base.colors.status.info, base.colors.status.info],
      },
    },
    utils: {
      alpha: (color: string, opacity: number): string => {
        if (color.startsWith('#')) {
          const hex = color.slice(1);
          if (hex.length === 3) {
          const r = parseInt((hex[0] ?? '0') + (hex[0] ?? '0'), 16);
          const g = parseInt((hex[1] ?? '0') + (hex[1] ?? '0'), 16);
          const b = parseInt((hex[2] ?? '0') + (hex[2] ?? '0'), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          } else if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }
        }
        // If color is already rgba or contains alpha, just append opacity
        if (color.startsWith('rgba')) {
          return color.replace(/[\d.]+\)$/, `${opacity})`);
        }
        return color;
      },
    },
  };
}

export const getLightTheme = (): AppTheme => resolveTheme(BaseLight);
export const getDarkTheme = (): AppTheme => resolveTheme(BaseDark);
export type { AppTheme, AppTheme as ThemeLike };
