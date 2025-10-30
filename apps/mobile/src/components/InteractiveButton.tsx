import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, forwardRef } from 'react';
import type { ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';

import { useMagneticEffect, useRippleEffect, useGlowEffect } from '../hooks/useMotionSystem';
import { useTheme } from '@/theme';

export type InteractiveButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'holographic'
  | 'glass'
  | 'outline';

export type InteractiveButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface InteractiveButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: InteractiveButtonVariant;
  size?: InteractiveButtonSize;
  loading?: boolean;
  disabled?: boolean;
  magneticEffect?: boolean;
  glowEffect?: boolean;
  hapticFeedback?: boolean;
  soundEffect?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradientName?: string; // Gradient color key
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

// Size configurations
const sizeConfigs = {
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 8,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 18,
    borderRadius: 16,
    minHeight: 52,
  },
  xl: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    fontSize: 20,
    borderRadius: 20,
    minHeight: 60,
  },
};

const InteractiveButton = forwardRef<TouchableOpacity, InteractiveButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      magneticEffect = true,
      glowEffect = false,
      hapticFeedback = true,
      soundEffect = false,
      leftIcon,
      rightIcon,
      gradientName,
      style,
      textStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const buttonRef = useRef<View>(null);
    const theme = useTheme();

    // Animation hooks
    const magnetic = useMagneticEffect(0.2, 30);
    const ripple = useRippleEffect();
    // Glow effect hook available but not used - reserved for future implementation
    useGlowEffect(glowEffect ? 1 : 0);

    // Get size config
    const sizeConfig = sizeConfigs[size];

    // Get variant styles
    const getVariantStyles = () => {
      const baseStyles: ViewStyle = {
        borderRadius: sizeConfig.borderRadius,
        minHeight: sizeConfig.minHeight,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        // Shadow effect removed - using theme shadows instead
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.primary,
          };

        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.info,
          };

        case 'ghost':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.border,
          };

        case 'holographic':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            position: 'relative' as const,
          };

        case 'glass':
          return {
            ...baseStyles,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          };

        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.colors.primary,
          };

        default:
          return baseStyles;
      }
    };

    // Get text styles
    const getTextStyles = (): TextStyle => {
      const baseTextStyles: TextStyle = {
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        textAlign: 'center',
      };

      switch (variant) {
        case 'primary':
        case 'holographic':
        case 'glass':
          return {
            ...baseTextStyles,
            color: theme.colors.onPrimary,
          };

        case 'secondary':
          return {
            ...baseTextStyles,
            color: theme.colors.onSurface,
          };

        case 'ghost':
        case 'outline':
          return {
            ...baseTextStyles,
            color: theme.colors.primary,
          };

        default:
          return {
            ...baseTextStyles,
            color: theme.colors.onSurface,
          };
      }
    };

    // Handle press events
    const handlePressIn = () => {
      setIsPressed(true);
      ripple.startRipple();

      // Haptic feedback (would integrate with react-native-haptic-feedback)
      if (hapticFeedback && !disabled) {
        // HapticFeedback.trigger('impactLight');
      }
    };

    const handlePressOut = () => {
      setIsPressed(false);
    };

    const handlePress = () => {
      if (loading || disabled) return;

      // Sound effect (would integrate with react-native-sound)
      if (soundEffect) {
        // Play sound effect
      }

      onPress?.();
    };

    // Magnetic effect handlers (reserved for future implementation)
    // These handlers are defined but not currently attached to the TouchableOpacity
    // as the magnetic effect is handled internally by the useMagneticEffect hook
    // const handleTouchStart = (event: { nativeEvent: { pageX: number; pageY: number } }) => { ... };
    // const handleTouchMove = (event: { nativeEvent: { pageX: number; pageY: number } }) => { ... };
    // const handleTouchEnd = () => { ... };

    // Render content
    const renderContent = () => {
      if (loading) {
        return (
          <ActivityIndicator
            size="small"
            color={
              variant === 'primary' || variant === 'secondary' || variant === 'holographic'
                ? theme.colors.onPrimary
                : theme.colors.primary
            }
          />
        );
      }

      return (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text style={StyleSheet.flatten([getTextStyles(), textStyle])}>{title}</Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      );
    };

    // Render button with appropriate wrapper
    const renderButton = () => {
      const buttonContent = (
        <Animated.View
          style={[
            getVariantStyles(),
            {
              paddingHorizontal: sizeConfig.paddingHorizontal,
              paddingVertical: sizeConfig.paddingVertical,
              opacity: disabled ? 0.5 : 1,
              transform: [{ translateX: magnetic.position.x }, { translateY: magnetic.position.y }],
            },
            style,
          ]}
        >
          <TouchableOpacity
            ref={ref}
            style={[{ flex: 1 }]}
            // Glow effect is applied separately via Animated wrapper if needed
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={1}
            {...(Object.fromEntries(
              Object.entries(props).filter(([key]) => key !== 'onTouchMove'),
            ) as TouchableOpacityProps)}
          >
            {/* Ripple effect overlay */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: sizeConfig.borderRadius,
                },
                ripple.rippleStyle,
                isPressed && { opacity: 0.5 },
              ]}
            />

            {/* Main content */}
            <View
              ref={buttonRef}
              style={{ zIndex: 1 }}
            >
              {renderContent()}
            </View>
          </TouchableOpacity>
        </Animated.View>
      );

      // Wrap with gradient for holographic variant
      if (variant === 'holographic') {
        return (
          <View
            style={{
              borderRadius: sizeConfig.borderRadius,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: sizeConfig.borderRadius }}
            >
              {buttonContent}
            </LinearGradient>
          </View>
        );
      }

      return buttonContent;
    };

    return renderButton();
  },
);

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;
