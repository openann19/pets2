import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/src/theme';
import { Text } from './Text';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
}

const sizeMap = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
  md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  lg: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
};

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  children,
}: BadgeProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, text: theme.colors.onPrimary };
      case 'secondary':
        return { bg: theme.colors.primary, text: '#FFFFFF' };
      case 'success':
        return { bg: theme.colors.success, text: '#FFFFFF' };
      case 'warning':
        return { bg: theme.colors.warning, text: '#FFFFFF' };
      case 'danger':
        return { bg: theme.colors.danger, text: '#FFFFFF' };
      case 'muted':
      default:
        return { bg: theme.colors.onMuted, text: '#FFFFFF' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: theme.radii.full,
          alignSelf: 'flex-start',
        },
      ]}
    >
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
          color: colors.text,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
