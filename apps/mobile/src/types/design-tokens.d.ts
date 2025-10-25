/**
 * Type definitions for @pawfectmatch/design-tokens
 * Adds missing properties to fix TypeScript errors
 */

declare module '@pawfectmatch/design-tokens' {
  export const tokens: {
    colors: {
      primary: Record<string | number, string>;
      secondary: Record<string | number, string>;
      neutral: Record<string | number, string>;
      success: Record<string | number, string>;
      error: Record<string | number, string>;
      warning: Record<string | number, string>;
      info: Record<string | number, string>;
    };
    typography: {
      fontSizes: Record<string, string>;
      fontWeights: Record<string, string>;
      lineHeights: Record<string, string | number>;
      letterSpacing: Record<string, string>;
      // Add missing body property
      body: {
        fontSize: number;
        lineHeight: number;
      };
    };
    spacing: Record<string, number>;
    borderRadius: Record<string, number>;
    shadows: Record<string, any>;
    transitions: Record<string, any>;
    zIndex: Record<string, number | string>;
    utils: {
      withOpacity: (color: string, opacity: number) => string;
      getResponsiveValue: <T>(values: { sm?: T; md?: T; lg?: T }, screenWidth: number) => T | undefined;
      getRandomGradient: () => string;
      hexToRgb: (hex: string) => { r: number; g: number; b: number } | null;
      getContrastColor: (hexColor: string) => string;
    };
  };

  export const VARIANTS: {
    button: Record<string, any>;
    card: Record<string, any>;
    input: Record<string, any>;
  };

  export type ColorScale = string;
  export type ColorShade = string | number;
  export type GradientName = string;
  export type ShadowSize = string;
  export type RadiusSize = string;
  export type SpacingSize = string;
  export type FontSize = string;
  export type FontWeight = string;
  export type LineHeight = string;
  export type TransitionType = string;
  export type ZIndexLevel = string;
  export type ButtonVariant = string;
  export type CardVariant = string;
  export type InputVariant = string;
}
