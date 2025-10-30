/**
 * 🎨 PREMIUM COMPONENTS TYPE DEFINITIONS
 * Type-safe definitions for premium mobile components
 */

import React from 'react';
import type { ViewStyle } from 'react-native';

// ====== BASE TYPES ======
export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'gradient' | 'neon' | 'ghost';
export type CardVariant = 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
export type SizeVariant = 'sm' | 'md' | 'lg';
export type PaddingVariant = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type IconPosition = 'left' | 'right';

// ====== VARIANT STYLE TYPES ======
export interface BaseVariantStyle {
  borderRadius: number;
  shadow: ViewStyle;
}

export interface ButtonVariantStyle extends BaseVariantStyle {
  colors: string[];
  textColor: string;
  shadowColor: string;
  border?: boolean;
  borderColor?: string;
  blur?: boolean;
}

export interface CardVariantStyle extends BaseVariantStyle {
  backgroundColor?: string;
  colors?: string[];
  borderWidth?: number;
  borderColor?: string;
  shadowColor?: string;
}

// ====== COMPONENT PROPS ======
export interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: SizeVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  haptic?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

export interface PremiumCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  padding?: PaddingVariant;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
}

// ====== SIZE CONFIGURATIONS ======
export interface SizeConfig {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
}

export interface PaddingConfig {
  padding: number;
}

// ====== ANIMATION TYPES ======
export interface AnimationConfig {
  duration: number;
  easing: string;
}

export interface HapticConfig {
  type: 'light' | 'medium' | 'heavy';
  enabled: boolean;
}

// ====== UTILITY TYPES ======
export interface ResponsiveValue<T> {
  sm?: T;
  md?: T;
  lg?: T;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ====== THEME TYPES ======
export interface ThemeColors {
  primary: string;
  secondary: string;
  neutral: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface ThemeShadows {
  'sm': ViewStyle;
  'md': ViewStyle;
  'lg': ViewStyle;
  'xl': ViewStyle;
  '2xl': ViewStyle;
  'primaryGlow': ViewStyle;
  'secondaryGlow': ViewStyle;
  'glass': ViewStyle;
  'neon': ViewStyle;
}

export interface ThemeTypography {
  fontSizes: Record<string, number>;
  fontWeights: Record<string, string>;
  lineHeights: Record<string, number>;
}

export type ThemeSpacing = Record<number, number>;

export type ThemeRadius = Record<string, number>;

// ====== COMPONENT STATE TYPES ======
export interface ComponentState {
  isPressed: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isLoading: boolean;
}

// ====== ANIMATION STATE TYPES ======
export interface AnimationState {
  scale: number;
  opacity: number;
  rotation: number;
  elevation: number;
}

// ====== EVENT HANDLER TYPES ======
export interface EventHandlers {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// ====== ACCESSIBILITY TYPES ======
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
  };
}

// ====== EXPORT ALL TYPES ======
export type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
