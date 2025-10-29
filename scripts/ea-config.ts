// scripts/ea-config.ts
export const COLOR_MAP: Record<string, string> = {
  'theme.colors.text': 'theme.colors.onSurface',
  'theme.colors.textMuted': 'theme.colors.onMuted',
  'theme.colors.background': 'theme.colors.bg',
  'theme.colors.bgAlt': 'theme.colors.surface',
  'theme.colors.bgElevated': 'theme.colors.surface',
  'theme.colors.surfaceAlt': 'theme.colors.overlay',
  'theme.colors.border.light': 'theme.colors.border',
  'theme.colors.borderDark': 'theme.colors.border',
  'theme.colors.neutral': 'theme.palette.neutral',
  'theme.colors.neutral[0]': 'theme.colors.bg',
  'theme.colors.neutral[50]': 'theme.palette.neutral[50]',
  'theme.colors.neutral[100]': 'theme.palette.neutral[100]',
  'theme.colors.neutral[200]': 'theme.palette.neutral[200]',
  'theme.colors.neutral[300]': 'theme.palette.neutral[300]',
  'theme.colors.neutral[400]': 'theme.palette.neutral[400]',
  'theme.colors.neutral[500]': 'theme.palette.neutral[500]',
  'theme.colors.neutral[600]': 'theme.palette.neutral[600]',
  'theme.colors.neutral[700]': 'theme.palette.neutral[700]',
  'theme.colors.neutral[800]': 'theme.palette.neutral[800]',
  'theme.colors.neutral[900]': 'theme.palette.neutral[900]',
  'theme.colors.secondary': 'theme.colors.primary',
  'theme.colors.secondaryText': 'theme.colors.onPrimary',
  'theme.colors.secondary[500]': 'theme.colors.primary',
  'theme.colors.status.success': 'theme.colors.success',
  'theme.colors.status.warning': 'theme.colors.warning',
  'theme.colors.status.error': 'theme.colors.danger',
  'colors.bgAlt': 'theme.colors.surface',
  'colors.surfaceAlt': 'theme.colors.overlay',
};

export const SPACING_MAP: Record<string, string> = {
  "spacing['4xl']": 'theme.spacing["4xl"]',
  'spacing.none': 'theme.spacing.xs * 0',
  'spacing.xxl': 'theme.spacing["4xl"]',
  'Spacing["5xl"]': 'theme.spacing["4xl"]',
  'Spacing["6xl"]': 'theme.spacing["4xl"]',
  'Spacing["7xl"]': 'theme.spacing["4xl"]',
  'Spacing["8xl"]': 'theme.spacing["4xl"]',
  'spacing.lg * 2': 'theme.spacing["4xl"]',
  'spacing.xl * 1.5': 'theme.spacing["4xl"]',
};

export const RADII_MAP: Record<string, string> = {
  'theme.radius.none': 'theme.radii.none',
  'theme.radius.xs': 'theme.radii.xs',
  'theme.radius.sm': 'theme.radii.sm',
  'theme.radius.md': 'theme.radii.md',
  'theme.radius.lg': 'theme.radii.lg',
  'theme.radius.xl': 'theme.radii.xl',
  'theme.radius["2xl"]': 'theme.radii["2xl"]',
  'theme.radius.xxxl': 'theme.radii.full',
  'theme.radius.full': 'theme.radii.full',
  'theme.radius.pill': 'theme.radii.pill',
  'theme.radius["4xl"]': 'theme.radii.full',
};

export const IMPORT_ALIAS_MAP: Record<string, string> = {
  '@/components': '@mobile/src/components',
  '@/theme': '@mobile/src/theme',
  '@mobile/theme': '@mobile/src/theme',
};

// Scope defaults (safe hotspots)
export const DEFAULT_SCOPES = [
  'apps/mobile/src/screens/admin/**/*.{ts,tsx}',
  'apps/mobile/src/screens/adoption/**/*.{ts,tsx}',
  'apps/mobile/src/screens/ai/**/*.{ts,tsx}',
  'apps/mobile/src/screens/onboarding/**/*.{ts,tsx}',
  'apps/mobile/src/screens/**/Premium*.{ts,tsx}',
  'apps/mobile/src/components/widgets/**/*.{ts,tsx}',
];

// Boundaries to avoid
export const IGNORE = [
  '**/node_modules/**',
  '**/__generated__/**',
  '_archive/**',
  'apps/mobile/src/theme/**',
  '**/*.stories.tsx',
  '**/stories/**',
  '**/web-only/**',
  '**/image-ultra/**',
];

