/**
 * 🎨 CARD VARIANTS
 * Defines card variants and their styling
 */

import type { ViewStyle } from 'react-native';

export type CardVariant =
  | 'default'
  | 'glass'
  | 'gradient'
  | 'premium'
  | 'minimal'
  | 'neon'
  | 'holographic'
  | 'floating';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GetCardStylesOptions {
  variant: CardVariant;
  glowColor?: string;
}

interface GetSizeStylesOptions {
  size: CardSize;
}

interface GetPaddingValueOptions {
  padding: CardSize;
}

interface GetMarginValueOptions {
  margin: CardSize;
}

export function getCardStyles({ variant, glowColor = '#ec4899' }: GetCardStylesOptions): ViewStyle {
  const baseStyles: ViewStyle = {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  };

  switch (variant) {
    case 'glass':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      };
    case 'gradient':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
      };
    case 'premium':
      return {
        ...baseStyles,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
      };
    case 'minimal':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e5e7eb',
      };
    case 'neon':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: glowColor,
      };
    case 'holographic':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
      };
    case 'floating':
      return {
        ...baseStyles,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      };
    default:
      return {
        ...baseStyles,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
  }
}

export function getSizeStyles({ size }: GetSizeStylesOptions): ViewStyle {
  switch (size) {
    case 'xs':
      return { minHeight: 80 };
    case 'sm':
      return { minHeight: 120 };
    case 'md':
      return { minHeight: 160 };
    case 'lg':
      return { minHeight: 200 };
    case 'xl':
      return { minHeight: 240 };
    default:
      return { minHeight: 160 };
  }
}

export function getPaddingValue({ padding }: GetPaddingValueOptions): number {
  switch (padding) {
    case 'xs':
      return 8;
    case 'sm':
      return 12;
    case 'md':
      return 16;
    case 'lg':
      return 20;
    case 'xl':
      return 24;
    default:
      return 16;
  }
}

export function getMarginValue({ margin }: GetMarginValueOptions): number {
  switch (margin) {
    case 'xs':
      return 4;
    case 'sm':
      return 8;
    case 'md':
      return 12;
    case 'lg':
      return 16;
    case 'xl':
      return 20;
    default:
      return 8;
  }
}
