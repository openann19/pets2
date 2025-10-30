export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'muted'
  | 'success'
  | 'warning'
  | 'danger'
  | 'text'
  | 'textMuted';

export interface ThemePalette {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly muted: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly text: string;
  readonly textMuted: string;
}

export interface ThemeSpacingScale {
  readonly 'none': number;
  readonly 'xs': number;
  readonly 'sm': number;
  readonly 'md': number;
  readonly 'lg': number;
  readonly 'xl': number;
  readonly '2xl': number;
}

export interface ThemeTypographyScale {
  readonly fontFamily: string;
  readonly heading: {
    readonly h1: string;
    readonly h2: string;
    readonly h3: string;
    readonly h4: string;
  };
  readonly body: {
    readonly lg: string;
    readonly md: string;
    readonly sm: string;
  };
  readonly mono: string;
}

export interface ThemeRadii {
  readonly none: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly pill: number;
}

export interface Theme {
  readonly colors: ThemePalette;
  readonly spacing: ThemeSpacingScale;
  readonly radii: ThemeRadii;
  readonly typography: ThemeTypographyScale;
}

export interface ThemeOverrides {
  readonly colors?: Partial<ThemePalette>;
  readonly spacing?: Partial<ThemeSpacingScale>;
  readonly radii?: Partial<ThemeRadii>;
  readonly typography?: Partial<ThemeTypographyScale> & {
    readonly heading?: Partial<ThemeTypographyScale['heading']>;
    readonly body?: Partial<ThemeTypographyScale['body']>;
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#6C63FF',
    secondary: '#FF6584',
    accent: '#2CB1BC',
    background: '#FFFFFF',
    surface: '#F8F9FC',
    muted: '#E2E8F0',
    success: '#38A169',
    warning: '#DD6B20',
    danger: '#E53E3E',
    text: '#1A202C',
    textMuted: '#4A5568',
  },
  spacing: {
    'none': 0,
    'xs': 4,
    'sm': 8,
    'md': 16,
    'lg': 24,
    'xl': 32,
    '2xl': 48,
  },
  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    pill: 999,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: {
      h1: '700 2.25rem/2.75rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      h2: '700 1.875rem/2.25rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      h3: '600 1.5rem/2rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      h4: '600 1.25rem/1.75rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    },
    body: {
      lg: '500 1.125rem/1.75rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      md: '400 1rem/1.5rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      sm: '400 0.875rem/1.25rem var(--pm-font-family, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    },
    mono: '500 0.875rem/1.25rem "JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

export const createTheme = (overrides?: ThemeOverrides): Theme => {
  if (overrides == null) {
    return defaultTheme;
  }

  return {
    colors: { ...defaultTheme.colors, ...overrides.colors },
    spacing: { ...defaultTheme.spacing, ...overrides.spacing },
    radii: { ...defaultTheme.radii, ...overrides.radii },
    typography: {
      fontFamily: overrides.typography?.fontFamily ?? defaultTheme.typography.fontFamily,
      heading: {
        ...defaultTheme.typography.heading,
        ...overrides.typography?.heading,
      },
      body: {
        ...defaultTheme.typography.body,
        ...overrides.typography?.body,
      },
      mono: overrides.typography?.mono ?? defaultTheme.typography.mono,
    },
  };
};

export const theme = defaultTheme;

// Motion/Transitions Configuration
export const MOTION_CONFIG = {
  fast: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  normal: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slow: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  bounce: {
    duration: 400,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Export transitions alias for backward compatibility
export const transitions = MOTION_CONFIG;
