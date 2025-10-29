import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { ColorPalette, TypographyScale } from '../../theme/theme';

type TextVariant = keyof TypographyScale;

type ColorToken = keyof ColorPalette;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: ColorToken;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text = React.forwardRef<RNText, TextProps>(function Text(
  { style, variant = 'body', tone = 'text', align = 'auto', ...rest }: TextProps,
  ref,
) {
  const { typography, colors } = useTheme();
  const token = typography[variant];

  const textStyle = StyleSheet.compose(token, [{ color: colors[tone], textAlign: align }, style]);

  return (
    <RNText
      ref={ref}
      style={textStyle}
      {...rest}
    />
  );
});
