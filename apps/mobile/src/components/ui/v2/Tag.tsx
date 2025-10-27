import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from ../../../theme
import { Text } from './Text';

export type TagVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps {
  label: string;
  onPress?: () => void;
  onClose?: () => void;
  variant?: TagVariant;
  size?: TagSize;
  closable?: boolean;
  disabled?: boolean;
}

const sizeMap = {
  sm: { padding: 4, fontSize: 12 },
  md: { padding: 6, fontSize: 14 },
  lg: { padding: 8, fontSize: 16 },
};

export function Tag({
  label,
  onPress,
  onClose,
  variant = 'primary',
  size = 'md',
  closable = false,
  disabled = false,
}: TagProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];
  const paddingValue = theme.spacing[sizeStyles.padding];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderColor: 'transparent',
          textColor: theme.colors.primaryText,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary || theme.colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
          textColor: theme.colors.text,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: theme.colors.bgAlt,
          borderColor: 'transparent',
          textColor: theme.colors.text,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isPressable = !!onPress;

  const TagContent = () => (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderColor !== 'transparent' ? 1 : 0,
          borderColor: variantStyles.borderColor,
          borderRadius: theme.radius.full,
          paddingHorizontal: paddingValue,
          paddingVertical: paddingValue / 2,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      accessibilityRole={isPressable ? 'button' : 'text'}
      accessibilityState={{ disabled }}
    >
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '500',
          color: variantStyles.textColor,
        }}
      >
        {label}
      </Text>
      {closable && onClose && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={disabled}
          hitSlop={4}
        >
          <Text style={{ color: variantStyles.textColor }}>×</Text>
        </Pressable>
      )}
    </View>
  );

  if (isPressable) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        <TagContent />
      </Pressable>
    );
  }

  return <TagContent />;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});
