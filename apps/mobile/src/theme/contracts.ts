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

// Ban legacy keys at compile time. Any usage of these becomes a TS error.
export type _LegacyColorBans = {
  /** @deprecated Use theme.colors.bg */ background?: never;
  /** @deprecated Use theme.colors.onSurface */ text?: never;
  /** @deprecated Use theme.colors.onMuted */ textSecondary?: never;
  /** @deprecated Use theme.colors.surface */ card?: never;
  /** @deprecated Use theme.colors.surface */ surfaceElevated?: never;
  /** @deprecated Use theme.colors.success */ status_success?: never;
  /** @deprecated Use theme.colors.warning */ status_warning?: never;
  /** @deprecated Use theme.colors.danger */ status_error?: never;
  /** @deprecated Use theme.palette.neutral[...] */ neutral?: never;
};

// Compose so any legacy property use is a TS error, even if declared elsewhere
export type ThemeColors = SemanticColors & _LegacyColorBans;

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
  colors: ThemeColors;
  spacing: SpacingScale;
  radii: RadiiScale;
  shadows: Elevation;
  blur: BlurScale;
  easing: EasingScale;
  typography: Typography;
  palette: Palette;
};

export type Theme = AppTheme;
