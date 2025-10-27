import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from ../../../theme

export type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body' | 'bodyMuted' | 'caption'
  | 'button' | 'label';

export type TextTone = 
  | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger'
  | 'text' | 'textMuted' | 'textInverse';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const variantMap: Record<TextVariant, { fontSize: number; lineHeight: number; fontWeight: string }> = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  h4: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  h5: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  h6: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMuted: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
};

export const Text = React.forwardRef<RNText, TextProps>(
  function TextComponent(
    {
      style,
      variant = 'body',
      tone = 'text',
      align = 'auto',
      fontWeight,
      ...rest
    }: TextProps,
    ref
  ) {
    const theme = useTheme();
  const variantStyles = variantMap[variant];

  const getToneColor = () => {
    const { colors } = theme;
    switch (tone) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary || colors.primary;
      case 'muted':
        return colors.textMuted;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'textMuted':
        return colors.textMuted;
      case 'textInverse':
        return theme.scheme === 'dark' ? '#FFFFFF' : '#000000';
      case 'text':
      default:
        return colors.text;
    }
  };

    const textStyle = StyleSheet.flatten([
      {
        fontSize: variantStyles.fontSize,
        lineHeight: variantStyles.lineHeight,
        fontWeight: fontWeight || variantStyles.fontWeight,
        color: getToneColor(),
        textAlign: align,
      },
      style,
    ]);

    return <RNText ref={ref} style={textStyle} {...rest} />;
  }
);
