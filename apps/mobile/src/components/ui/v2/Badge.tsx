import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { PremiumShimmer } from '../micro/PremiumShimmer';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'premium';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  shimmer?: boolean;
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
  shimmer = variant === 'premium',
}: BadgeProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, text: theme.colors.onPrimary };
      case 'secondary':
        return { bg: theme.colors.surface, text: theme.colors.onSurface, border: theme.colors.border };
      case 'success':
        return { bg: theme.colors.success, text: theme.colors.onPrimary };
      case 'warning':
        return { bg: theme.colors.warning, text: theme.colors.onPrimary };
      case 'danger':
        return { bg: theme.colors.danger, text: theme.colors.onPrimary };
      case 'premium':
        return { bg: theme.colors.primary, text: theme.colors.onPrimary };
      case 'muted':
      default:
        return { bg: theme.colors.border, text: theme.colors.onSurface };
    }
  };

  const { bg, text, border } = getColors();

  const badgeContent = (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: theme.radii.full,
          alignSelf: 'flex-start',
          borderWidth: border ? 1 : 0,
          borderColor: border,
        },
      ]}
    >
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
          color: text,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );

  // Wrap with shimmer if premium variant
  if (shimmer && variant === 'premium') {
    return (
      <PremiumShimmer
        gradient={theme.palette.gradients.primary}
        onViewDidAppear={() => {}}
      >
        {badgeContent}
      </PremiumShimmer>
    );
  }

  return badgeContent;
}
