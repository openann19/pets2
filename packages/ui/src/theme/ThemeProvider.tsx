import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createTheme, defaultTheme, type Theme, type ThemeOverrides } from './theme';

export interface ThemeContextValue {
  readonly theme: Theme;
  readonly setTheme: (
    next: Theme | ThemeOverrides | ((previous: Theme) => Theme | ThemeOverrides),
  ) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: Theme | ThemeOverrides | null | undefined): value is Theme => {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  return 'colors' in value && 'spacing' in value && 'radii' in value && 'typography' in value;
};

const resolveTheme = (value?: Theme | ThemeOverrides): Theme => {
  if (value == null) {
    return defaultTheme;
  }

  if (isTheme(value)) {
    return value;
  }

  return createTheme(value);
};

const px = (value: number): string => `${value.toString()}px`;

const themeVarsFromTheme = (theme: Theme): Record<string, string> => ({
  '--pm-color-primary': theme.colors.primary,
  '--pm-color-secondary': theme.colors.secondary,
  '--pm-color-accent': theme.colors.accent,
  '--pm-color-background': theme.colors.background,
  '--pm-color-surface': theme.colors.surface,
  '--pm-color-muted': theme.colors.muted,
  '--pm-color-success': theme.colors.success,
  '--pm-color-warning': theme.colors.warning,
  '--pm-color-danger': theme.colors.danger,
  '--pm-color-text': theme.colors.text,
  '--pm-color-text-muted': theme.colors.textMuted,
  '--pm-spacing-none': px(theme.spacing.none),
  '--pm-spacing-xs': px(theme.spacing.xs),
  '--pm-spacing-sm': px(theme.spacing.sm),
  '--pm-spacing-md': px(theme.spacing.md),
  '--pm-spacing-lg': px(theme.spacing.lg),
  '--pm-spacing-xl': px(theme.spacing.xl),
  '--pm-spacing-2xl': px(theme.spacing['2xl']),
  '--pm-radius-none': px(theme.radii.none),
  '--pm-radius-sm': px(theme.radii.sm),
  '--pm-radius-md': px(theme.radii.md),
  '--pm-radius-lg': px(theme.radii.lg),
  '--pm-radius-pill': px(theme.radii.pill),
  '--pm-font-family': theme.typography.fontFamily,
});

export interface ThemeProviderProps {
  readonly value?: Theme | ThemeOverrides;
  readonly children: ReactNode;
}

export function ThemeProvider({ value, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(value));

  useEffect(() => {
    setThemeState(resolveTheme(value));
  }, [value]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const previousValues = new Map<string, string>();
    const entries = Object.entries(themeVarsFromTheme(theme));

    entries.forEach(([cssVar, cssValue]) => {
      previousValues.set(cssVar, root.style.getPropertyValue(cssVar));
      root.style.setProperty(cssVar, cssValue);
    });

    return () => {
      entries.forEach(([cssVar]) => {
        const previous = previousValues.get(cssVar);
        if (previous == null || previous.trim() === '') {
          root.style.removeProperty(cssVar);
          return;
        }
        root.style.setProperty(cssVar, previous);
      });
    };
  }, [theme]);

  const setTheme = (
    next: Theme | ThemeOverrides | ((previous: Theme) => Theme | ThemeOverrides),
  ) => {
    setThemeState((previous) => {
      const resolvedNext = typeof next === 'function' ? next(previous) : next;
      return resolveTheme(resolvedNext);
    });
  };

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
