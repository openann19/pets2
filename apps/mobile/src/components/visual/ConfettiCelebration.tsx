/**
 * 🎨 Confetti Celebration Component
 * Consumes visualEnhancements2025 config for confetti particle effects
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiCelebrationProps {
  /** Trigger celebration */
  active: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Origin point (default: center) */
  origin?: { x: number; y: number };
}

interface ConfettiParticle {
  id: number;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  color: string;
}

export function ConfettiCelebration({
  active,
  onComplete,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
}: ConfettiCelebrationProps) {
  const { canUseParticles, particlesConfig } = useVisualEnhancements();
  const theme = useTheme();

  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationProgress = useSharedValue(0);

  const confettiConfig = particlesConfig?.confetti;
  
  if (!confettiConfig || !canUseParticles) {
    return null;
  }

  const particleCount = confettiConfig.particleCount ?? 50;
  const colors = confettiConfig.colors || [
    theme.colors.primary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.info,
  ];
  const duration = confettiConfig.duration ?? 3000;
  
  // Default spread values (not in schema, but used for physics)
  const spread = { min: 50, max: 70 };
  const velocity = { min: 50, max: 100 };

  useEffect(() => {
    if (!active || !canUseParticles || !confettiConfig.enabled) {
      particlesRef.current = [];
      animationProgress.value = 0;
      return;
    }

    // Create particles
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = spread.min + Math.random() * (spread.max - spread.min);
      const speed = velocity.min + Math.random() * (velocity.max - velocity.min);
      const colorIndex = Math.floor(Math.random() * colors.length);
      const particleColor = colors[colorIndex];

      if (!particleColor) continue;

      newParticles.push({
        id: i,
        x: useSharedValue(origin.x),
        y: useSharedValue(origin.y),
        rotation: useSharedValue(angle),
        scale: useSharedValue(0),
        opacity: useSharedValue(1),
        color: particleColor,
      });

      // Animate particle
      const finalX = origin.x + Math.cos(angle) * distance * 2;
      const finalY = origin.y + Math.sin(angle) * distance * 2 + speed * 2; // Gravity

      const particle = newParticles[newParticles.length - 1];
      if (particle) {
        particle.x.value = withTiming(finalX, { duration });
        particle.y.value = withTiming(finalY, { duration });
        particle.scale.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: duration - 100 }),
        );
        particle.opacity.value = withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(
            duration - 300,
            withTiming(0, { duration: 200 }),
          ),
        );
        particle.rotation.value = withTiming(angle + Math.PI * 6, { duration });
      }
    }

    particlesRef.current = newParticles;

    // Main animation
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, { duration }, (finished) => {
      if (finished) {
        particlesRef.current = [];
        onComplete?.();
      }
    });
  }, [active, canUseParticles, confettiConfig, particleCount, colors, duration, origin, onComplete]);

  if (!canUseParticles || !confettiConfig?.enabled || !active) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <ConfettiParticleView key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

function ConfettiParticleView({ particle }: { particle: ConfettiParticle }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: particle.x.value },
        { translateY: particle.y.value },
        { rotate: `${particle.rotation.value}rad` },
        { scale: particle.scale.value },
      ],
      opacity: particle.opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          width: 8,
          height: 8,
          backgroundColor: particle.color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

