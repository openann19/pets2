import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { getExtendedColors } from '../../../theme/adapters';
import type { ExtendedColors } from '../../../theme/adapters';
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

type SizeConfig = {
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
};

const sizeMap: Record<TagSize, SizeConfig> = {
  sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  md: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
  lg: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 },
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
  const colors = useMemo<ExtendedColors>(() => getExtendedColors(theme), [theme]);
  const sizeStyles = sizeMap[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          textColor: colors.onPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary ?? colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          textColor: colors.onSurface,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: colors.surface ?? colors.bg,
          borderColor: 'transparent',
          textColor: colors.onSurface,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isPressable = !!onPress;
  const spacingXSRaw = theme.spacing?.xs;
  const spacingXS =
    typeof spacingXSRaw === 'number' ? spacingXSRaw : parseFloat(String(spacingXSRaw ?? 8)) || 8;
  const pillRadiusRaw = theme.radius?.pill;
  const pillRadius =
    typeof pillRadiusRaw === 'number'
      ? pillRadiusRaw
      : parseFloat(String(pillRadiusRaw ?? 999)) || 999;

  const TagContent = () => (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderColor !== 'transparent' ? 1 : 0,
          borderColor: variantStyles.borderColor,
          borderRadius: pillRadius,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
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
          style={{ marginLeft: spacingXS }}
        >
          <Text style={{ color: variantStyles.textColor }}>×</Text>
        </Pressable>
      )}
    </View>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
      >
        <TagContent />
      </Pressable>
    );
  }

  return <TagContent />;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
