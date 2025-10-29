import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/src/theme';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

export interface AvatarProps {
  source?: { uri: string } | number;
  initials?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  fallbackColor?: string;
  testID?: string;
}

const sizeMap = {
  xs: { width: 24, height: 24, fontSize: 10 },
  sm: { width: 32, height: 32, fontSize: 12 },
  md: { width: 48, height: 48, fontSize: 16 },
  lg: { width: 64, height: 64, fontSize: 20 },
  xl: { width: 96, height: 96, fontSize: 32 },
};

export function Avatar({
  source,
  initials,
  size = 'md',
  variant = 'circle',
  fallbackColor,
  testID,
}: AvatarProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];
  const radius = variant === 'circle' ? sizeStyles.width / 2 : theme.radii.md;

  const bgColor = fallbackColor || theme.colors.primary;

  if (source) {
    return (
      <View
        style={[
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: radius,
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
          },
        ]}
        testID={testID}
        accessibilityRole="image"
      >
        <Image
          source={source}
          style={{ width: sizeStyles.width, height: sizeStyles.height }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: radius,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
      testID={testID}
      accessibilityRole="image"
    >
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
          color: theme.colors.onPrimary,
        }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
