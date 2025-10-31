import { TOKENS, type Tokens } from './tokens';

// Extend TOKENS with additional theme properties for backward compatibility
export interface Theme extends Tokens {
  readonly colors: Tokens['COLORS'] & {
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
  };
  readonly spacing: {
    readonly none: number;
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
    readonly '2xl': number;
  };
  readonly radii: {
    readonly none: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly pill: number;
  };
  readonly typography: {
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
  };
}

// Create the default theme that extends TOKENS
export const defaultTheme: Theme = {
  ...TOKENS,
  colors: {
    ...TOKENS.COLORS,
    // Map TOKENS colors to theme colors for backward compatibility
    primary: TOKENS.COLORS.brand,
    secondary: TOKENS.COLORS.accent,
    accent: TOKENS.COLORS.accent,
    background: TOKENS.COLORS.bg,
    surface: TOKENS.COLORS.card,
    muted: TOKENS.COLORS.card,
    success: '#38A169',
    warning: '#DD6B20',
    danger: '#E53E3E',
    text: TOKENS.COLORS.text,
    textMuted: '#4A5568',
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  radii: {
    none: 0,
    sm: TOKENS.RADIUS.sm,
    md: TOKENS.RADIUS.md,
    lg: TOKENS.RADIUS.lg,
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
}

export interface ThemeOverrides {
  readonly colors?: Partial<Theme['colors']>;
  readonly spacing?: Partial<Theme['spacing']>;
  readonly radii?: Partial<Theme['radii']>;
  readonly typography?: Partial<Theme['typography']> & {
    readonly heading?: Partial<Theme['typography']['heading']>;
    readonly body?: Partial<Theme['typography']['body']>;
  };
}

export const createTheme = (overrides?: ThemeOverrides): Theme => {
  if (overrides == null) {
    return defaultTheme;
  }

  return {
    ...defaultTheme,
    ...overrides,
    colors: { ...defaultTheme.colors, ...overrides.colors },
    spacing: { ...defaultTheme.spacing, ...overrides.spacing },
    radii: { ...defaultTheme.radii, ...overrides.radii },
    typography: {
      ...defaultTheme.typography,
      ...overrides.typography,
      heading: {
        ...defaultTheme.typography.heading,
        ...overrides.typography?.heading,
      },
      body: {
        ...defaultTheme.typography.body,
        ...overrides.typography?.body,
      },
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
