/**
 * 🎨 TOGGLE MORPH
 * Elastic scale animation for favorite/like buttons
 *
 * Icon fills with elastic scale (1 → 1.15 → 1), optional tiny burst (3–5 dots)
 * Takes ≤ 220ms; respects reduced motion
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { motion, getEasingArray, getSpringConfig } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseToggleMorphReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  trigger: () => void;
  burstParticles: React.JSX.Element[];
}

/**
 * Hook for toggle morph animation
 * Returns animated style and trigger function
 */
export function useToggleMorph(isActive: boolean): UseToggleMorphReturn {
  const guards = useMotionGuards();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Burst particles (3-5 dots)
  const burstCount = guards.lowEnd ? 0 : 3; // Skip on low-end
  const particles = React.useMemo(
    () =>
      Array.from({ length: burstCount }, (_, i) => ({
        id: i,
        x: useSharedValue(0),
        y: useSharedValue(0),
        opacity: useSharedValue(0),
        scale: useSharedValue(0),
      })),
    [burstCount],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const burstParticles = particles.map((particle) => (
    <Animated.View
      key={particle.id}
      style={[
        {
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#FFD700', // Gold color
        },
        useAnimatedStyle(() => ({
          transform: [
            { translateX: particle.x.value },
            { translateY: particle.y.value },
            { scale: particle.scale.value },
          ],
          opacity: particle.opacity.value,
        })),
      ]}
    />
  ));

  const trigger = React.useCallback(() => {
    if (!guards.shouldAnimate) {
      return; // Skip animation if reduced motion
    }

    // Elastic scale: 1 → 1.15 → 1
    scale.value = withSequence(
      withSpring(1.15, {
        ...getSpringConfig('bouncy'),
        damping: 15, // Extra bouncy
      }),
      withSpring(1, {
        ...getSpringConfig('standard'),
      }),
    );

    // Burst particles animation
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * 2 * Math.PI;
      const distance = 20 + Math.random() * 10;

      particle.x.value = withSequence(
        withTiming(Math.cos(angle) * distance, { duration: 200 }),
        withTiming(0, { duration: 200, delay: 300 }),
      );
      particle.y.value = withSequence(
        withTiming(Math.sin(angle) * distance, { duration: 200 }),
        withTiming(0, { duration: 200, delay: 300 }),
      );
      particle.scale.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250, delay: 200 }),
      );
      particle.opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250, delay: 200 }),
      );
    });

    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [guards.shouldAnimate, particles]);

  // Update scale when active state changes
  React.useEffect(() => {
    if (isActive && guards.shouldAnimate) {
      scale.value = withSpring(1.05, getSpringConfig('gentle'));
    } else {
      scale.value = withSpring(1, getSpringConfig('gentle'));
    }
  }, [isActive, guards.shouldAnimate]);

  return { animatedStyle, trigger, burstParticles };
}

/**
 * Toggle Morph Component
 * Wraps a toggle/icon with elastic morph animation
 */
interface ToggleMorphProps {
  children: React.ReactNode;
  isActive: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ToggleMorph({
  children,
  isActive,
  onPress,
  style,
}: ToggleMorphProps): React.JSX.Element {
  const { animatedStyle, trigger, burstParticles } = useToggleMorph(isActive);

  const handlePress = () => {
    trigger();
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style] as any}>
      {React.cloneElement(children as React.ReactElement, {
        onPress: handlePress,
      })}
      {burstParticles}
    </Animated.View>
  );
}
