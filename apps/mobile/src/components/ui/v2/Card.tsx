import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme';

export type CardVariant = 'surface' | 'elevated' | 'outlined' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const AnimatedCard = Animated.createAnimatedComponent(View);

const paddingMap = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function Card({
  style,
  children,
  variant = 'surface',
  padding = 'md',
  radius = 'md',
  shadow = 'md',
  ...rest
}: CardProps): React.ReactElement {
  const theme = useTheme();
  const paddingValue = paddingMap[padding];
  const radiusValue = theme.radius[radius];
  
  const getBackgroundColor = () => {
    const { colors } = theme;
    switch (variant) {
      case 'elevated':
        return colors.bgElevated || colors.background || colors.bg;
      case 'glass':
        return 'rgba(255, 255, 255, 0.1)';
      case 'outlined':
        return colors.bg;
      case 'surface':
      default:
        return colors.bg;
    }
  };

  const getShadowStyle = () => {
    if (shadow === 'none') return {};
    return theme.shadows[shadow];
  };

  const cardStyle = StyleSheet.flatten([
    styles.base,
    {
      backgroundColor: getBackgroundColor(),
      borderRadius: radiusValue,
      padding: paddingValue,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: theme.colors.border,
      ...getShadowStyle(),
    },
    style,
  ]);

  return (
    <AnimatedCard style={cardStyle} {...rest}>
      {children}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
