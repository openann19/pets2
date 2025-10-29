import type { TextStyle } from 'react-native';

export interface ColorPalette {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
}

export interface TypographyVariant extends Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface TypographyScale {
  heading1: TypographyVariant;
  heading2: TypographyVariant;
  heading3: TypographyVariant;
  subtitle: TypographyVariant;
  body: TypographyVariant;
  callout: TypographyVariant;
  caption: TypographyVariant;
  button: TypographyVariant;
}

export interface SpacingScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface RadiusScale {
  none: number;
  sm: number;
  md: number;
  lg: number;
  pill: number;
  full: number;
}

export interface ShadowToken {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
}

export interface ShadowScale {
  'none': ShadowToken;
  'soft': ShadowToken;
  'medium': ShadowToken;
  'strong': ShadowToken;
  'xs'?: ShadowToken;
  'sm'?: ShadowToken;
  'md'?: ShadowToken;
  'lg'?: ShadowToken;
  'xl'?: ShadowToken;
  '2xl'?: ShadowToken;
}

export interface Theme {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radii: RadiusScale;
  shadows: ShadowScale;
}

export interface ThemeOverrides {
  colors?: Partial<ColorPalette>;
  typography?: Partial<TypographyScale>;
  spacing?: Partial<SpacingScale>;
  radii?: Partial<RadiusScale>;
  shadows?: Partial<ShadowScale>;
}

const baseColors: ColorPalette = {
  primary: '#4C6EF5',
  primaryForeground: '#FFFFFF',
  secondary: '#22B8CF',
  secondaryForeground: '#081C24',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F5',
  border: '#E2E8F0',
  text: '#0B172A',
  textMuted: '#4A5568',
  success: '#38B27A',
  warning: '#F59F00',
  danger: '#E03131',
};

const baseTypography: TypographyScale = {
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  heading3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  callout: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
};

const baseSpacing: SpacingScale = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const baseRadii: RadiusScale = {
  none: 0,
  sm: 4,
  md: 12,
  lg: 20,
  pill: 999,
  full: 9999,
};

const transparent = 'rgba(0, 0, 0, 0)';

const baseShadows: ShadowScale = {
  none: {
    color: transparent,
    offset: { width: 0, height: 0 },
    opacity: 0,
    radius: 0,
  },
  soft: {
    color: 'rgba(15, 23, 42, 0.08)',
    offset: { width: 0, height: 6 },
    opacity: 0.8,
    radius: 12,
  },
  medium: {
    color: 'rgba(15, 23, 42, 0.12)',
    offset: { width: 0, height: 12 },
    opacity: 0.9,
    radius: 24,
  },
  strong: {
    color: 'rgba(15, 23, 42, 0.16)',
    offset: { width: 0, height: 18 },
    opacity: 1,
    radius: 30,
  },
};

export const baseTheme: Theme = {
  colors: baseColors,
  typography: baseTypography,
  spacing: baseSpacing,
  radii: baseRadii,
  shadows: baseShadows,
};

export const darkThemeOverrides: ThemeOverrides = {
  colors: {
    background: '#050C1A',
    surface: '#0B172A',
    surfaceMuted: '#101F35',
    border: '#1D2B45',
    text: '#F8FAFC',
    textMuted: '#CBD5F5',
    primaryForeground: '#F8FAFC',
    secondaryForeground: '#F8FAFC',
  },
  shadows: {
    soft: {
      color: 'rgba(15, 23, 42, 0.32)',
      offset: { width: 0, height: 12 },
      opacity: 1,
      radius: 20,
    },
    medium: {
      color: 'rgba(15, 23, 42, 0.36)',
      offset: { width: 0, height: 18 },
      opacity: 1,
      radius: 28,
    },
    strong: {
      color: 'rgba(15, 23, 42, 0.42)',
      offset: { width: 0, height: 24 },
      opacity: 1,
      radius: 36,
    },
  },
};

export const createTheme = (overrides?: ThemeOverrides): Theme => ({
  colors: { ...baseTheme.colors, ...overrides?.colors },
  typography: { ...baseTheme.typography, ...overrides?.typography },
  spacing: { ...baseTheme.spacing, ...overrides?.spacing },
  radii: { ...baseTheme.radii, ...overrides?.radii },
  shadows: { ...baseTheme.shadows, ...overrides?.shadows },
});

export const lightTheme = baseTheme;
export const darkTheme = createTheme(darkThemeOverrides);

export type ThemeName = 'light' | 'dark';
