/**
 * 💎 PREMIUM BUTTON - MOBILE
 * Advanced button component for React Native with haptics and animations
 * Matches web premium experience with native mobile optimizations
 */

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  type TextStyle,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'neon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: 'light' | 'medium' | 'heavy';
  glow?: boolean;
  style?: ViewStyle;
}

// Variant style interface
interface VariantStyle {
  colors: string[];
  textColor: string;
  shadowColor: string;
  blur?: boolean;
  border?: boolean;
  borderColor?: string;
}

function PremiumButtonComponent({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = 'medium',
  glow = false,
  style,
}: PremiumButtonProps): React.JSX.Element {
  const [isPressed, setIsPressed] = useState(false);
  const [animatedScale] = useState(() => new Animated.Value(1));
  const [animatedGlow] = useState(() => new Animated.Value(0));

  // Enhanced haptic feedback with optimized patterns
  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!haptic) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          // Enhanced heavy haptic with pattern
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 100);
          break;
      }
    } catch (error) {
      logger.debug('Haptic feedback not available');
    }
  };

  // Enhanced press animations with optimized spring physics
  const handlePressIn = () => {
    setIsPressed(true);

    const animations = [
      Animated.spring(animatedScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 400, // Increased for more responsive feel
        friction: 8, // Reduced for smoother animation
      }),
    ];

    if (glow) {
      animations.push(
        Animated.timing(animatedGlow, {
          toValue: 1,
          duration: 120, // Faster response
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
    triggerHaptic('light');
  };

  const handlePressOut = () => {
    setIsPressed(false);

    const animations = [
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400, // Increased for more responsive feel
        friction: 6, // Reduced for smoother animation
      }),
    ];

    if (glow) {
      animations.push(
        Animated.timing(animatedGlow, {
          toValue: 0,
          duration: 180, // Faster response
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;

    triggerHaptic('medium');
    onPress();
  };

  // Get variant styles
  const getVariantStyles = (): VariantStyle => {
    const variants: Record<NonNullable<typeof variant>, VariantStyle> = {
      primary: {
        colors: ['Theme.colors.primary[500]', 'Theme.colors.primary[400]'],
        textColor: 'Theme.colors.neutral[0]',
        shadowColor: 'Theme.colors.primary[500]',
      },
      secondary: {
        colors: ['Theme.colors.secondary[500]', '#38bdf8'],
        textColor: 'Theme.colors.neutral[0]',
        shadowColor: 'Theme.colors.secondary[500]',
      },
      glass: {
        colors: ['transparent', 'transparent'],
        textColor: 'Theme.colors.neutral[700]',
        shadowColor: 'Theme.colors.neutral[950]',
        blur: true,
      },
      gradient: {
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
        textColor: 'Theme.colors.neutral[0]',
        shadowColor: '#667eea',
      },
      neon: {
        colors: ['#1a1a1a', '#1a1a1a'],
        textColor: 'Theme.colors.primary[500]',
        shadowColor: 'Theme.colors.primary[500]',
        border: true,
        borderColor: 'Theme.colors.primary[500]',
      },
      ghost: {
        colors: ['transparent', 'transparent'],
        textColor: 'Theme.colors.neutral[500]',
        shadowColor: 'transparent',
        border: true,
        borderColor: 'Theme.colors.neutral[300]',
      },
    };

    return variants[variant] ?? variants.primary;
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      sm: { height: 36, paddingHorizontal: 16, fontSize: 14 },
      md: { height: 44, paddingHorizontal: 24, fontSize: 16 },
      lg: { height: 52, paddingHorizontal: 32, fontSize: 18 },
    };

    return sizes[size] || sizes.md;
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  // Icon rendering helper
  const renderIcon = () => {
    if (!icon) return null;

    return (
      <Ionicons
        name={icon}
        size={sizeStyle.fontSize + 2}
        color={loading ? 'transparent' : variantStyle.textColor}
        style={{
          marginRight: iconPosition === 'left' ? 8 : 0,
          marginLeft: iconPosition === 'right' ? 8 : 0,
        }}
      />
    );
  };

  const buttonStyle: ViewStyle = {
    width: fullWidth ? '100%' : 'auto',
    minWidth: fullWidth ? undefined : 120,
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: sizeStyle.height / 2,
    opacity: disabled ? 0.5 : 1,
    ...(variantStyle.border && {
      borderWidth: 2,
      borderColor: variantStyle.borderColor || variantStyle.shadowColor,
    }),
    ...style,
  };

  // Glass morphism variant
  if (variant === 'glass') {
    return (
      <Animated.View
        style={StyleSheet.flatten([
          buttonStyle,
          {
            transform: [{ scale: animatedScale }],
          },
        ])}
      >
        <BlurView
          intensity={80}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          ])}
        />

        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.buttonContent}
          activeOpacity={0.9}
        >
          {iconPosition === 'left' && renderIcon()}
          <Text
            style={StyleSheet.flatten([
              styles.buttonText,
              { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
            ])}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}

          {loading && (
            <View style={styles.loadingContainer}>
              <View
                style={StyleSheet.flatten([
                  styles.loadingDot,
                  { backgroundColor: variantStyle.textColor },
                ])}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Gradient variant
  if (variant === 'gradient') {
    return (
      <Animated.View
        style={StyleSheet.flatten([
          buttonStyle,
          {
            transform: [{ scale: animatedScale }],
          },
        ])}
      >
        <LinearGradient
          colors={variantStyle.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.buttonContent}
          activeOpacity={0.9}
        >
          {iconPosition === 'left' && renderIcon()}
          <Text
            style={StyleSheet.flatten([
              styles.buttonText,
              { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
            ])}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}

          {loading && (
            <View style={styles.loadingContainer}>
              <View
                style={StyleSheet.flatten([
                  styles.loadingDot,
                  { backgroundColor: variantStyle.textColor },
                ])}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Standard variants (primary, secondary, neon, ghost)
  return (
    <Animated.View
      style={StyleSheet.flatten([
        buttonStyle,
        {
          backgroundColor: variantStyle.colors[0],
          transform: [{ scale: animatedScale }],
        },
        glow && {
          shadowColor: variantStyle.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: animatedGlow,
          shadowRadius: 12,
          elevation: 8,
        },
      ])}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.buttonContent}
        activeOpacity={0.95}
      >
        {iconPosition === 'left' && renderIcon()}
        <Text
          style={StyleSheet.flatten([
            styles.buttonText,
            { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
          ])}
        >
          {title}
        </Text>
        {iconPosition === 'right' && renderIcon()}

        {loading && (
          <View style={styles.loadingContainer}>
            <View
              style={StyleSheet.flatten([
                styles.loadingDot,
                { backgroundColor: variantStyle.textColor },
              ])}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export const PremiumButton = PremiumButtonComponent;

const styles = StyleSheet.create({
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PremiumButton;
