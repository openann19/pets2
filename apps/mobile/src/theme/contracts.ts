export type ColorScheme = 'light' | 'dark';

export type SemanticColors = {
  bg: string; // page bg
  surface: string; // cards/modals
  overlay: string; // glass overlay
  border: string;

  onBg: string; // text on bg
  onSurface: string; // text on surface
  onMuted: string;

  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
};

export type NeutralStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type Palette = {
  readonly neutral: Readonly<Record<NeutralStep, string>>;
  readonly brand: Readonly<Record<NeutralStep, string>>;
  readonly gradients: {
    primary: readonly [string, string];
    success: readonly [string, string];
    danger: readonly [string, string];
  };
};

export type SpacingScale = {
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
};

export type RadiiScale = {
  'none': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
  'pill': number;
  'full': number;
};

export type Elevation = {
  elevation1: object;
  elevation2: object;
  glass: object;
};

export type BlurScale = {
  sm: number;
  md: number;
  lg: number;
};

export type EasingScale = {
  standard: string;
  decel: string;
  accel: string;
};

export type Typography = {
  body: {
    size: number;
    lineHeight: number;
    weight: '400' | '500' | '600' | '700';
  };
  h1: {
    size: number;
    lineHeight: number;
    weight: '700';
  };
  h2: {
    size: number;
    lineHeight: number;
    weight: '600';
  };
};

export type AppTheme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: SemanticColors;
  spacing: SpacingScale;
  radii: RadiiScale;
  shadows: Elevation;
  blur: BlurScale;
  easing: EasingScale;
  typography: Typography;
  palette: Palette;
};

export type Theme = AppTheme;
