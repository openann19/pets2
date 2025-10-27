import React, { forwardRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from ../../../theme
import { Text } from './Text';

export type InputVariant = 'outlined' | 'filled' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'md',
  style,
  fullWidth = false,
  ...rest
}, ref) => {
  const theme = useTheme();
  const hasError = !!error;

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: 12, fontSize: 14 },
    md: { height: 44, paddingHorizontal: 16, fontSize: 16 },
    lg: { height: 52, paddingHorizontal: 20, fontSize: 18 },
  };

  const sizeStyle = sizeStyles[size];
  const radius = theme.radius.md;

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      fontSize: sizeStyle.fontSize,
      color: theme.colors.text,
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: hasError ? theme.colors.danger : theme.colors.border,
      borderRadius: radius,
      flex: fullWidth ? 1 : undefined,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.bgAlt,
        };
      case 'underlined':
        return {
          ...baseStyle,
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: 0,
          paddingHorizontal: 0,
          backgroundColor: 'transparent',
        };
      case 'outlined':
      default:
        return baseStyle;
    }
  };

  const containerStyle = StyleSheet.flatten([
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    style,
  ]);

  return (
    <View style={{ width: fullWidth ? '100%' : undefined }}>
      {label && (
        <Text 
          variant="label" 
          tone="text" 
          style={{ marginBottom: theme.spacing.xs }}
        >
          {label}
        </Text>
      )}
      <View style={containerStyle}>
        {leftIcon && (
          <View style={{ marginRight: theme.spacing.xs }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={theme.colors.textMuted}
          {...rest}
        />
        {rightIcon && (
          <View style={{ marginLeft: theme.spacing.xs }}>
            {rightIcon}
          </View>
        )}
      </View>
      {(error || helperText) && (
        <Text 
          variant="caption" 
          tone={hasError ? 'danger' : 'muted'}
          style={{ marginTop: theme.spacing.xs }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
