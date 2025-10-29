import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { ShadowScale, SpacingScale } from '../../theme/theme';

type SpacingKey = keyof SpacingScale;

type ShadowKey = keyof ShadowScale;

export interface CardProps extends ViewProps {
  padding?: SpacingKey;
  radius?: 'sm' | 'md' | 'lg';
  shadow?: ShadowKey;
  tone?: 'surface' | 'surfaceMuted' | 'background';
}

export function Card({
  style,
  children,
  padding = 'lg',
  radius = 'md',
  shadow = 'soft',
  tone = 'surface',
  ...rest
}: CardProps): React.ReactElement {
  const { colors, spacing, radii, shadows } = useTheme();

  const resolvedPadding = spacing[padding];
  const resolvedRadius = radii[radius];
  const shadowToken = shadows[shadow];

  const cardStyle = StyleSheet.compose(styles.base, [
    {
      backgroundColor: colors[tone],
      borderRadius: resolvedRadius,
      padding: resolvedPadding,
      ...(shadowToken
        ? {
            shadowColor: shadowToken.color,
            shadowOffset: shadowToken.offset,
            shadowOpacity: shadowToken.opacity,
            shadowRadius: shadowToken.radius,
            elevation: shadowToken.radius / 2,
          }
        : {}),
    },
    style,
  ]);

  return (
    <View
      style={cardStyle}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
});
