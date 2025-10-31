/**
 * 💎 PREMIUM CARD - MOBILE
 * Advanced card component for React Native with glass morphism and animations
 * Cross-platform consistency with web premium experience
 */

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';


interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  hover: _hover = true,
  tilt = false,
  glow = false,
  padding = 'md',
  style,
  onPress,
  disabled = false,
  haptic = true,
}) => {
  const theme = useTheme();
  const isDark = theme.scheme === 'dark';

  // Animation values (useState pattern to avoid refs during render)
  const [animatedScale] = useState(() => new Animated.Value(1));
  const [animatedRotateX] = useState(() => new Animated.Value(0));
  const [animatedRotateY] = useState(() => new Animated.Value(0));
  const [animatedElevation] = useState(() => new Animated.Value(4));
  const [animatedGlow] = useState(() => new Animated.Value(0));

  // Enhanced 3D tilt effect with PanResponder
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => tilt && !disabled,
      onPanResponderGrant: () => {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (!tilt) return;

        const { dx, dy } = gestureState;
        const maxTilt = 15;

        // Calculate tilt based on gesture
        const tiltX = Math.max(-maxTilt, Math.min(maxTilt, (dy / 100) * maxTilt));
        const tiltY = Math.max(-maxTilt, Math.min(maxTilt, -(dx / 100) * maxTilt));

        animatedRotateX.setValue(tiltX);
        animatedRotateY.setValue(tiltY);

        // Enhance elevation on interaction
        Animated.timing(animatedElevation, {
          toValue: 8,
          duration: 150,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderRelease: () => {
        // Return to center
        Animated.parallel([
          Animated.spring(animatedRotateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.spring(animatedRotateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.timing(animatedElevation, {
            toValue: 4,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      },
    }),
  );

  // Enhanced press handling
  const handlePressIn = () => {
    if (disabled) return;

    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const animations = [
      Animated.spring(animatedScale, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ];

    if (glow) {
      animations.push(
        Animated.timing(animatedGlow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    const animations = [
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ];

    if (glow) {
      animations.push(
        Animated.timing(animatedGlow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePress = () => {
    if (disabled) return;

    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress?.();
  };

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      default: {
        colors: isDark
          ? [theme.colors.onSurface, theme.colors.onSurface + '80']
          : [theme.colors.bg, theme.colors.surface],
        shadowColor: theme.colors.onSurface,
      },
      glass: {
        colors: ['transparent', 'transparent'],
        shadowColor: theme.colors.onSurface,
      },
      elevated: {
        colors: isDark
          ? [theme.colors.onSurface, theme.colors.onSurface + '80']
          : [theme.colors.bg, theme.colors.surface],
        shadowColor: theme.colors.onSurface,
      },
      gradient: {
        colors: [theme.colors.primary, theme.colors.primary],
        shadowColor: theme.colors.primary,
      },
      neon: {
        colors: [theme.colors.onSurface, theme.colors.onSurface],
        shadowColor: theme.colors.primary,
      },
      holographic: {
        colors: [
          theme.colors.danger,
          theme.colors.success,
          theme.colors.success,
          theme.colors.success,
          theme.colors.warning,
        ],
        shadowColor: theme.colors.danger,
      },
    };

    return variants[variant] || variants.default;
  };

  // Entrance animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.9,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
  }, [animatedScale]);

  // Get variant styles
  const getVariantContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      overflow: 'hidden',
    };

    const paddingValues = {
      none: 0,
      sm: 12,
      md: 20,
      lg: 28,
      xl: 36,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: isDark ? theme.colors.onSurface : theme.colors.bg,
          shadowColor: theme.colors.onSurface,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
          padding: paddingValues[padding],
        };

      case 'neon':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.onSurface,
          borderWidth: 2,
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
          padding: paddingValues[padding],
        };

      case 'gradient':
        return {
          ...baseStyle,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
          padding: paddingValues[padding],
        };

      default:
        return {
          ...baseStyle,
          backgroundColor: isDark ? theme.colors.onSurface : theme.colors.bg,
          shadowColor: theme.colors.onSurface,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          padding: paddingValues[padding],
        };
    }
  };

  const containerStyle = getVariantContainerStyle();

  // Glass morphism implementation
  if (variant === 'glass') {
    return (
      <Animated.View
        style={StyleSheet.flatten([
          containerStyle,
          {
            transform: [
              { scale: animatedScale },
              {
                rotateX: animatedRotateX.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                }),
              },
              {
                rotateY: animatedRotateY.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                }),
              },
            ],
          },
          style,
        ])}
        {...(tilt ? panResponder.panHandlers : {})}
      >
        <BlurView
          intensity={30}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          ])}
        />

        {onPress ? (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={styles.touchableCard}
            activeOpacity={0.9}
          >
            {children}
          </TouchableOpacity>
        ) : (
          <View style={styles.cardContent}>{children}</View>
        )}
      </Animated.View>
    );
  }

  // Gradient implementation
  if (variant === 'gradient' || variant === 'holographic') {
    const gradientColors =
      variant === 'holographic'
        ? [
            theme.colors.danger,
            theme.colors.success,
            theme.colors.success,
            theme.colors.success,
            theme.colors.warning,
          ]
        : getVariantStyles().colors;

    return (
      <Animated.View
        style={StyleSheet.flatten([
          containerStyle,
          {
            transform: [
              { scale: animatedScale },
              {
                rotateX: animatedRotateX.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                }),
              },
              {
                rotateY: animatedRotateY.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                }),
              },
            ],
          },
          style,
        ])}
        {...(tilt ? panResponder.panHandlers : {})}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            { borderRadius: containerStyle.borderRadius },
          ])}
        />

        {onPress ? (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={styles.touchableCard}
            activeOpacity={0.9}
          >
            {children}
          </TouchableOpacity>
        ) : (
          <View style={styles.cardContent}>{children}</View>
        )}

        {/* Glow overlay */}
        {glow && (
          <Animated.View
            style={StyleSheet.flatten([
              StyleSheet.absoluteFillObject,
              {
                borderRadius: containerStyle.borderRadius,
                backgroundColor: getVariantStyles().shadowColor,
                opacity: animatedGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
              },
            ])}
            pointerEvents="none"
          />
        )}
      </Animated.View>
    );
  }

  // Default implementation
  return (
    <Animated.View
      style={StyleSheet.flatten([
        containerStyle,
        {
          transform: [
            { scale: animatedScale },
            {
              rotateX: animatedRotateX.interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              }),
            },
            {
              rotateY: animatedRotateY.interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              }),
            },
          ],
        },
        style,
      ])}
      {...(tilt ? panResponder.panHandlers : {})}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.touchableCard}
          activeOpacity={0.95}
        >
          {children}
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContent}>{children}</View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchableCard: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
});

export default PremiumCard;
