import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { motionDurations, motionEasing, motionScale, motionSpring } from '@/theme/motion';
import { usePrefersReducedMotion } from '@/utils/motionGuards';
import { Interactive } from '@/components/primitives/Interactive';
import { Text } from './Text';

export type ChipVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  onPress?: () => void;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  testID?: string;
}

const sizeMap = {
  sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, iconSize: 14, gap: 4 },
  md: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, iconSize: 16, gap: 6 },
  lg: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16, iconSize: 18, gap: 8 },
};

export function Chip({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  trailingIcon,
  disabled = false,
  testID,
}: ChipProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];
  const prefersReducedMotion = usePrefersReducedMotion();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, text: theme.colors.onPrimary };
      case 'secondary':
        return {
          bg: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.border,
        };
      case 'success':
        return { bg: theme.colors.success, text: theme.colors.onPrimary };
      case 'warning':
        return { bg: theme.colors.warning, text: theme.colors.onPrimary };
      case 'danger':
        return { bg: theme.colors.danger, text: theme.colors.onPrimary };
      case 'info':
        return { bg: theme.colors.info, text: theme.colors.onPrimary };
      case 'muted':
      default:
        return { bg: theme.colors.border, text: theme.colors.onSurface };
    }
  };

  const { bg, text, border } = getColors();
  const isInteractive = Boolean(onPress && !disabled);

  const chipContent = (
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
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizeStyles.gap,
        },
        disabled && { opacity: 0.5 },
      ]}
      testID={testID}
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
      {trailingIcon && (
        <Ionicons
          name={trailingIcon}
          size={sizeStyles.iconSize}
          color={text}
        />
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <Interactive
        variant="subtle"
        haptic="light"
        disabled={disabled}
        disabledMotion={prefersReducedMotion}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        {chipContent}
      </Interactive>
    );
  }

  return chipContent;
}
