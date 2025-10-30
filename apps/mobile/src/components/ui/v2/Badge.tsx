import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { PremiumShimmer } from '../../micro/PremiumShimmer';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useEnhancedVariants } from '@/hooks/animations';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'premium';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  shimmer?: boolean;
  premium?: boolean;
  pulse?: boolean;
  glow?: boolean;
  bounce?: boolean;
  entranceDelay?: number;
}

const sizeMap = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
  md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  lg: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
};

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  children,
  shimmer = variant === 'premium',
  premium = true,
  pulse = false,
  glow = variant === 'premium' || variant === 'danger',
  bounce = false,
  entranceDelay = 0,
}: BadgeProps) {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const sizeStyles = sizeMap[size];
  const scale = useSharedValue(entranceDelay > 0 ? 0 : 1);
  const opacity = useSharedValue(entranceDelay > 0 ? 0 : 1);
  const glowOpacity = useSharedValue(0);

  // Enhanced glow effect for danger/premium variants
  const glowEffect = useEnhancedVariants({
    variant: 'glow',
    enabled: premium && glow && !reducedMotion,
    duration: 2000,
    color: variant === 'danger' ? theme.colors.danger : theme.colors.primary,
    intensity: 0.5,
  });

  // Pulse effect
  const pulseEffect = useEnhancedVariants({
    variant: 'pulse',
    enabled: premium && pulse && !reducedMotion,
    duration: 1500,
    intensity: 0.15,
  });

  // Entrance animation
  useEffect(() => {
    if (!premium || reducedMotion || entranceDelay === 0) return;

    opacity.value = withDelay(entranceDelay, withTiming(1, { duration: 300 }));
    scale.value = withDelay(
      entranceDelay,
      withSpring(1, {
        damping: 15,
        stiffness: 300,
      }),
    );
  }, [premium, reducedMotion, entranceDelay]);

  // Bounce animation on mount
  useEffect(() => {
    if (!premium || reducedMotion || !bounce) return;

    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 400 }),
      withSpring(0.95, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 350 }),
    );
  }, [premium, reducedMotion, bounce]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = glow
      ? interpolate(
          glowOpacity.value,
          [0, 1],
          [0.2, 0.5],
          Extrapolate.CLAMP,
        )
      : 0.2;

    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
      shadowOpacity,
      shadowRadius: glowOpacity.value * 6 + 2,
      shadowColor:
        variant === 'danger'
          ? theme.colors.danger
          : variant === 'premium'
            ? theme.colors.primary
            : theme.colors.border,
      elevation: glowOpacity.value * 4 + 1,
    };
  });

  // Trigger glow pulse on mount if enabled
  useEffect(() => {
    if (!premium || !glow || reducedMotion) return;

    glowOpacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 600 }),
    );
  }, [premium, glow, reducedMotion]);

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
      case 'premium':
        return { bg: theme.colors.primary, text: theme.colors.onPrimary };
      case 'muted':
      default:
        return { bg: theme.colors.border, text: theme.colors.onSurface };
    }
  };

  const { bg, text, border } = getColors();

  const Container = premium ? Animated.View : View;

  const badgeContent = (
    <Container
      style={[
        premium ? animatedStyle : undefined,
        glow && glowEffect.animatedStyle,
        pulse && pulseEffect.animatedStyle,
        {
          backgroundColor: bg,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: theme.radii.full,
          alignSelf: 'flex-start',
          borderWidth: border ? 1 : 0,
          borderColor: border,
        },
      ]}
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
      {children}
    </Container>
  );

  // Wrap with shimmer if premium variant
  if (shimmer && variant === 'premium') {
    return (
      <PremiumShimmer
        gradient={theme.palette.gradients.primary}
        onViewDidAppear={() => {}}
      >
        {badgeContent}
      </PremiumShimmer>
    );
  }

  return badgeContent;
}
