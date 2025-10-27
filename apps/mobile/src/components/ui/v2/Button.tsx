import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useReduceMotion } from '../../../hooks/useReducedMotion';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
  fullWidth?: boolean;
  block?: boolean; // alias for fullWidth
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const sizeMap = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 14, gap: 6 },
  md: { height: 44, paddingHorizontal: 20, fontSize: 16, gap: 8 },
  lg: { height: 52, paddingHorizontal: 24, fontSize: 18, gap: 10 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  testID,
  fullWidth = false,
  block = false,
}: ButtonProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const isFullWidth = fullWidth || block;

  // Get color tokens
  const getVariantStyles = () => {
    const { colors } = theme;
    const isDark = theme.scheme === 'dark';
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary || colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          textColor: colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.text,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = sizeMap[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    const target = reduceMotion ? 0.98 : 0.95;
    scale.value = withSpring(
      target,
      {
        damping: 20,
        stiffness: 300,
      },
      (finished) => {
        if (!finished) {
          scale.value = withTiming(1);
        }
      }
    );
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderColor !== 'transparent' ? 1 : 0,
          borderColor: variantStyles.borderColor,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
          width: isFullWidth ? '100%' : undefined,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <View style={StyleSheet.flatten([
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: sizeStyles.gap,
        }
      ])}>
        {leftIcon && !loading && leftIcon}
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variantStyles.textColor} 
          />
        ) : (
          <Text
            style={{
              fontSize: sizeStyles.fontSize,
              fontWeight: '600',
              color: variantStyles.textColor,
            }}
          >
            {title}
          </Text>
        )}
        {rightIcon && !loading && rightIcon}
      </View>
    </AnimatedPressable>
  );
}
