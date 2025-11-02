/**
 * Type definitions for @pawfectmatch/design-tokens
 * Adds missing properties to fix TypeScript errors
 */

declare module "@pawfectmatch/design-tokens" {
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
    shadows: Record<
      string,
      {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation?: number;
      }
    >;
    transitions: Record<
      string,
      {
        duration: number;
        easing: string;
        properties?: string[];
      }
    >;
    zIndex: Record<string, number | string>;
    utils: {
      withOpacity: (color: string, opacity: number) => string;
      getResponsiveValue: <T>(
        values: { sm?: T; md?: T; lg?: T },
        screenWidth: number,
      ) => T | undefined;
      getRandomGradient: () => string;
      hexToRgb: (hex: string) => { r: number; g: number; b: number } | null;
      getContrastColor: (hexColor: string) => string;
    };
  };

  export const VARIANTS: {
    button: Record<
      string,
      {
        backgroundColor: string;
        textColor: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number | string;
        padding?: Record<string, number | string>;
        states?: {
          hover?: Record<string, string | number>;
          active?: Record<string, string | number>;
          disabled?: Record<string, string | number>;
        };
      }
    >;
    card: Record<
      string,
      {
        backgroundColor: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number | string;
        padding?: Record<string, number | string>;
        shadow?: Record<string, string | number>;
      }
    >;
    input: Record<
      string,
      {
        backgroundColor: string;
        textColor: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number | string;
        padding?: Record<string, number | string>;
        states?: {
          focus?: Record<string, string | number>;
          error?: Record<string, string | number>;
          disabled?: Record<string, string | number>;
        };
      }
    >;
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
