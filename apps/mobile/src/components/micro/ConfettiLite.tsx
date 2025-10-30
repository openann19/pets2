/**
 * 🎉 CONFETTI-LITE SUCCESS
 * Lightweight particle burst (3–8 particles) for success actions
 * Guarded by low-end device & reduced motion (skip or reduce count)
 * Duration: ~800ms; token-driven colors
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface Particle {
  id: number;
  translateX: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  color: string;
}

interface ConfettiLiteProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
}

/**
 * Confetti-Lite Success Animation
 * Lightweight particle burst for success actions
 */
export function ConfettiLite({
  trigger,
  onComplete,
  particleCount: customCount,
  colors: customColors,
}: ConfettiLiteProps): React.JSX.Element {
  const theme = useTheme();
  const guards = useMotionGuards();
  
  const particlesRef = React.useRef<Particle[]>([]);
  const [visible, setVisible] = React.useState(false);

  // Adaptive particle count
  const baseCount = customCount || 6;
  const particleCount = guards.getAdaptiveParticleCount(baseCount);
  
  // Default colors from theme
  const colors = customColors || [
    theme.colors.primary,
    theme.colors.success,
    theme.palette?.gradients?.primary?.[0] || '#EC4899',
    theme.palette?.gradients?.primary?.[1] || '#8B5CF6',
  ];

  // Initialize particles
  React.useEffect(() => {
    if (guards.shouldSkipHeavy) {
      return; // Skip on low-end or reduced motion
    }

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      return {
        id: i,
        translateX: useSharedValue(0),
        translateY: useSharedValue(0),
        rotation: useSharedValue(0),
        scale: useSharedValue(0),
        opacity: useSharedValue(0),
        color: colors[i % colors.length],
      };
    });
  }, [particleCount]);

  // Trigger animation
  React.useEffect(() => {
    if (!trigger || guards.shouldSkipHeavy) {
      if (trigger && onComplete) {
        // Reduced motion: instant callback
        setTimeout(() => onComplete(), 100);
      }
      return;
    }

    setVisible(true);

    particlesRef.current.forEach((particle, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 20;

      // Launch sequence
      particle.scale.value = withSequence(
        withTiming(1.2, {
          duration: motion.duration.fast,
          easing: getEasingArray('standard'),
        }),
        withTiming(1, {
          duration: motion.duration.base,
          easing: getEasingArray('emphasized'),
        })
      );

      particle.opacity.value = withSequence(
        withTiming(1, {
          duration: motion.duration.fast,
        }),
        withDelay(
          motion.duration.base,
          withTiming(0, {
            duration: motion.duration.base,
          })
        )
      );

      particle.translateX.value = withTiming(endX, {
        duration: motion.duration.slow,
        easing: getEasingArray('decel'),
      });

      particle.translateY.value = withTiming(endY, {
        duration: motion.duration.slow,
        easing: getEasingArray('decel'),
      });

      particle.rotation.value = withTiming(
        (Math.random() > 0.5 ? 1 : -1) * 360,
        {
          duration: motion.duration.slow,
        }
      );
    });

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Cleanup and callback
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, motion.duration.slow + motion.duration.base);

    return () => clearTimeout(timer);
  }, [trigger, guards.shouldSkipHeavy]);

  if (!visible || guards.shouldSkipHeavy) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <ParticleView key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

/**
 * Individual Particle Component
 */
function ParticleView({ particle }: { particle: Particle }): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: particle.translateX.value },
        { translateY: particle.translateY.value },
        { rotate: `${particle.rotation.value}deg` },
        { scale: particle.scale.value },
      ],
      opacity: particle.opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
});

