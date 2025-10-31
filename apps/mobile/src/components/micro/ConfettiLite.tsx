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
  const colors = React.useMemo(
    () =>
      customColors || [
        theme.colors.primary,
        theme.colors.success,
        theme.palette?.gradients?.primary?.[0] || theme.colors.primary,
        theme.palette?.gradients?.primary?.[1] || theme.colors.success,
      ],
    [customColors, theme.colors.primary, theme.colors.success, theme.palette?.gradients?.primary],
  );

  // Initialize particles with shared values created at component level
  // Pre-create 10 shared value pools directly (not in callbacks) to satisfy React hooks rules
  const maxParticles = 10;
  const pool0_tx = useSharedValue(0);
  const pool0_ty = useSharedValue(0);
  const pool0_rot = useSharedValue(0);
  const pool0_scale = useSharedValue(0);
  const pool0_op = useSharedValue(0);
  const pool1_tx = useSharedValue(0);
  const pool1_ty = useSharedValue(0);
  const pool1_rot = useSharedValue(0);
  const pool1_scale = useSharedValue(0);
  const pool1_op = useSharedValue(0);
  const pool2_tx = useSharedValue(0);
  const pool2_ty = useSharedValue(0);
  const pool2_rot = useSharedValue(0);
  const pool2_scale = useSharedValue(0);
  const pool2_op = useSharedValue(0);
  const pool3_tx = useSharedValue(0);
  const pool3_ty = useSharedValue(0);
  const pool3_rot = useSharedValue(0);
  const pool3_scale = useSharedValue(0);
  const pool3_op = useSharedValue(0);
  const pool4_tx = useSharedValue(0);
  const pool4_ty = useSharedValue(0);
  const pool4_rot = useSharedValue(0);
  const pool4_scale = useSharedValue(0);
  const pool4_op = useSharedValue(0);
  const pool5_tx = useSharedValue(0);
  const pool5_ty = useSharedValue(0);
  const pool5_rot = useSharedValue(0);
  const pool5_scale = useSharedValue(0);
  const pool5_op = useSharedValue(0);
  const pool6_tx = useSharedValue(0);
  const pool6_ty = useSharedValue(0);
  const pool6_rot = useSharedValue(0);
  const pool6_scale = useSharedValue(0);
  const pool6_op = useSharedValue(0);
  const pool7_tx = useSharedValue(0);
  const pool7_ty = useSharedValue(0);
  const pool7_rot = useSharedValue(0);
  const pool7_scale = useSharedValue(0);
  const pool7_op = useSharedValue(0);
  const pool8_tx = useSharedValue(0);
  const pool8_ty = useSharedValue(0);
  const pool8_rot = useSharedValue(0);
  const pool8_scale = useSharedValue(0);
  const pool8_op = useSharedValue(0);
  const pool9_tx = useSharedValue(0);
  const pool9_ty = useSharedValue(0);
  const pool9_rot = useSharedValue(0);
  const pool9_scale = useSharedValue(0);
  const pool9_op = useSharedValue(0);
  const sharedValuesPool = [
    { translateX: pool0_tx, translateY: pool0_ty, rotation: pool0_rot, scale: pool0_scale, opacity: pool0_op },
    { translateX: pool1_tx, translateY: pool1_ty, rotation: pool1_rot, scale: pool1_scale, opacity: pool1_op },
    { translateX: pool2_tx, translateY: pool2_ty, rotation: pool2_rot, scale: pool2_scale, opacity: pool2_op },
    { translateX: pool3_tx, translateY: pool3_ty, rotation: pool3_rot, scale: pool3_scale, opacity: pool3_op },
    { translateX: pool4_tx, translateY: pool4_ty, rotation: pool4_rot, scale: pool4_scale, opacity: pool4_op },
    { translateX: pool5_tx, translateY: pool5_ty, rotation: pool5_rot, scale: pool5_scale, opacity: pool5_op },
    { translateX: pool6_tx, translateY: pool6_ty, rotation: pool6_rot, scale: pool6_scale, opacity: pool6_op },
    { translateX: pool7_tx, translateY: pool7_ty, rotation: pool7_rot, scale: pool7_scale, opacity: pool7_op },
    { translateX: pool8_tx, translateY: pool8_ty, rotation: pool8_rot, scale: pool8_scale, opacity: pool8_op },
    { translateX: pool9_tx, translateY: pool9_ty, rotation: pool9_rot, scale: pool9_scale, opacity: pool9_op },
  ];

  // Initialize particles
  React.useEffect(() => {
    if (guards.shouldSkipHeavy) {
      return; // Skip on low-end or reduced motion
    }

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const poolIndex = i % maxParticles;
      return {
        id: i,
        translateX: sharedValuesPool[poolIndex]!.translateX,
        translateY: sharedValuesPool[poolIndex]!.translateY,
        rotation: sharedValuesPool[poolIndex]!.rotation,
        scale: sharedValuesPool[poolIndex]!.scale,
        opacity: sharedValuesPool[poolIndex]!.opacity,
        color: colors[i % colors.length]!,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount, colors, guards.shouldSkipHeavy]);

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
      // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-unsafe-assignment
      particle.scale.value = withSequence(
        withTiming(1.2, {
          duration: motion.timing.fast,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          easing: getEasingArray('enter') as never,
        }) as never,
        withTiming(1, {
          duration: motion.timing.normal,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          easing: getEasingArray('emphasized') as never,
        }) as never,
      ) as typeof particle.scale.value;

      // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-unsafe-assignment
      particle.opacity.value = withSequence(
        withTiming(1, {
          duration: motion.timing.fast,
        }),
        withDelay(
          Number(motion.timing.normal),
          withTiming(0, {
            duration: motion.timing.normal,
          }),
        ),
      ) as typeof particle.opacity.value;

      // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-unsafe-assignment
      particle.translateX.value = withTiming(endX, {
        duration: motion.timing.slow,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        easing: getEasingArray('enter') as never,
      }) as typeof particle.translateX.value;

      // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-unsafe-assignment
      particle.translateY.value = withTiming(endY, {
        duration: motion.timing.slow,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        easing: getEasingArray('enter') as never,
      }) as typeof particle.translateY.value;

      // eslint-disable-next-line react-hooks/immutability, @typescript-eslint/no-unsafe-assignment
      particle.rotation.value = withTiming((Math.random() > 0.5 ? 1 : -1) * 360, {
        duration: motion.timing.slow,
      }) as typeof particle.rotation.value;
    });

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Cleanup and callback
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, (motion.timing.slow + motion.timing.normal) as number);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, guards.shouldSkipHeavy]);

  if (!visible || guards.shouldSkipHeavy) {
    return <></>;
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {particlesRef.current.map((particle) => (
        <ParticleView
          key={particle.id}
          particle={particle}
        />
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
