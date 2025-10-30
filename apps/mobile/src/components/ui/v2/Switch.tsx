import React, { useEffect } from 'react';
import { Switch as RNSwitch, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useEnhancedVariants } from '@/hooks/animations';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
  premium?: boolean;
  glow?: boolean;
}

export function Switch({
  value,
  onValueChange,
  disabled = false,
  testID,
  premium = true,
  glow = false,
}: SwitchProps) {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const pulse = useSharedValue(0);

  // Enhanced glow effect
  const glowEffect = useEnhancedVariants({
    variant: 'glow',
    enabled: premium && glow && value,
    duration: 2000,
    color: theme.colors.primary,
    intensity: 0.6,
  });

  // Pulse effect on value change
  useEffect(() => {
    if (!premium || reducedMotion) return;

    pulse.value = 0;
    pulse.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 300 }),
    );
  }, [value, premium, reducedMotion]);

  // Scale animation on press
  const handleValueChange = (newValue: boolean) => {
    if (disabled) return;

    if (premium && !reducedMotion) {
      // Scale animation
      scale.value = 0.95;
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });

      // Glow pulse
      if (glow) {
        glowOpacity.value = withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0, { duration: 200 }),
        );
      }

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onValueChange(newValue);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = glow
      ? interpolate(
          glowOpacity.value,
          [0, 1],
          [0.1, 0.4],
          Extrapolate.CLAMP,
        )
      : 0.1;

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      shadowRadius: glowOpacity.value * 10 + 4,
      shadowColor: theme.colors.primary,
      elevation: glowOpacity.value * 6 + 2,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pulse.value,
      [0, 1],
      [0, 0.3],
      Extrapolate.CLAMP,
    );
    const scale = 1 + pulse.value * 0.2;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const Container = premium ? Animated.View : View;

  return (
    <View style={styles.wrapper}>
      {/* Pulse ring */}
      {premium && !reducedMotion && (
        <Animated.View
          style={[
            styles.pulseRing,
            { borderColor: theme.colors.primary },
            pulseStyle,
          ]}
          pointerEvents="none"
        />
      )}
      
      <Container style={premium ? [animatedStyle, glow ? glowEffect.animatedStyle : undefined] : undefined}>
        <RNSwitch
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.colors.bgAlt,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.bg}
          ios_backgroundColor={theme.colors.bgAlt}
          testID={testID}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
  },
});
