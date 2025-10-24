import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, forwardRef } from 'react';
import type {
  ViewStyle,
  TextStyle,
  TouchableOpacityProps} from 'react-native';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';

import {
  useMagneticEffect,
  useRippleEffect,
  useGlowEffect,
} from '../hooks/useMotionSystem';
import {
  DynamicColors,
  EnhancedShadows,
  SemanticColors,
  MotionSystem,
} from '../styles/EnhancedDesignTokens';

// === PROJECT HYPERION: INTERACTIVE BUTTON COMPONENT ===

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
  gradientName?: keyof typeof DynamicColors.gradients;
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
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const buttonRef = useRef<View>(null);

    // Animation hooks
    const magnetic = useMagneticEffect(0.2, 30);
    const ripple = useRippleEffect();
    const glow = useGlowEffect(glowEffect ? 1 : 0);

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
        ...EnhancedShadows.depth.md,
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: SemanticColors.interactive.primary,
            ...EnhancedShadows.glow.primary,
          };

        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: SemanticColors.interactive.secondary,
            ...EnhancedShadows.glow.secondary,
          };

        case 'ghost':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: SemanticColors.border.default,
          };

        case 'holographic':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            position: 'relative',
          };

        case 'glass':
          return {
            ...baseStyles,
            ...DynamicColors.glass.medium,
          };

        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: SemanticColors.interactive.primary,
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
            color: SemanticColors.text.inverse,
          };

        case 'secondary':
          return {
            ...baseTextStyles,
            color: SemanticColors.text.inverse,
          };

        case 'ghost':
        case 'outline':
          return {
            ...baseTextStyles,
            color: SemanticColors.interactive.primary,
          };

        default:
          return {
            ...baseTextStyles,
            color: SemanticColors.text.primary,
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

    // Magnetic effect handlers
    const handleTouchStart = (event: { nativeEvent: { pageX: number; pageY: number } }) => {
      if (!magneticEffect || disabled) return;

      const { pageX, pageY } = event.nativeEvent;
      buttonRef.current?.measure((x, y, width, height, pageX_offset, pageY_offset) => {
        const centerX = pageX_offset + width / 2;
        const centerY = pageY_offset + height / 2;
        magnetic.handlers.onTouchStart(pageX, pageY, centerX, centerY);
      });
    };

    const handleTouchMove = (event: { nativeEvent: { pageX: number; pageY: number } }) => {
      if (!magneticEffect || disabled) return;

      const { pageX, pageY } = event.nativeEvent;
      buttonRef.current?.measure((x, y, width, height, pageX_offset, pageY_offset) => {
        const centerX = pageX_offset + width / 2;
        const centerY = pageY_offset + height / 2;
        magnetic.handlers.onTouchMove(pageX, pageY, centerX, centerY);
      });
    };

    const handleTouchEnd = () => {
      magnetic.handlers.onTouchEnd();
    };

    // Render content
    const renderContent = () => {
      if (loading) {
        return (
          <ActivityIndicator
            size="small"
            color={
              variant === 'primary' || variant === 'secondary' || variant === 'holographic'
                ? SemanticColors.text.inverse
                : SemanticColors.interactive.primary
            }
          />
        );
      }

      return (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      );
    };

    // Render button with appropriate wrapper
    const renderButton = () => {
      const buttonContent = (
        <TouchableOpacity
          ref={ref}
          style={[
            getVariantStyles(),
            {
              paddingHorizontal: sizeConfig.paddingHorizontal,
              paddingVertical: sizeConfig.paddingVertical,
              opacity: disabled ? 0.5 : 1,
              transform: [
                { translateX: magnetic.position.x },
                { translateY: magnetic.position.y },
              ],
            },
            glowEffect && glow.glowStyle,
            style,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || loading}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          activeOpacity={1}
          {...props}
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
          <View ref={buttonRef} style={{ zIndex: 1 }}>
            {renderContent()}
          </View>
        </TouchableOpacity>
      );

      // Wrap with gradient for holographic variant
      if (variant === 'holographic' && gradientName) {
        const gradient = DynamicColors.gradients[gradientName];
        return (
          <View style={{ borderRadius: sizeConfig.borderRadius, overflow: 'hidden' }}>
            <LinearGradient
              colors={gradient.colors as any}
              locations={gradient.locations}
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
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;
