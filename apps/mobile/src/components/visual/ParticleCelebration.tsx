/**
 * 🎨 Particle Celebration Component
 * Consumes visualEnhancements2025 config for particle effects
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleCelebrationProps {
  /** Trigger celebration */
  active: boolean;
  /** Type of celebration */
  type?: 'confetti' | 'hearts' | 'stars';
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Origin point (default: center) */
  origin?: { x: number; y: number };
}

interface Particle {
  id: number;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  color: string;
}

export function ParticleCelebration({
  active,
  type = 'confetti',
  onComplete,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
}: ParticleCelebrationProps) {
  const { canUseParticles, particlesConfig } = useVisualEnhancements();
  const theme = useTheme();

  const particlesRef = useRef<Particle[]>([]);
  const animationProgress = useSharedValue(0);

  // Get particle config based on type
  const getParticleConfig = () => {
    if (!particlesConfig) return null;

    switch (type) {
      case 'confetti':
        return particlesConfig.confetti;
      case 'hearts':
        return particlesConfig.hearts;
      case 'stars':
        return particlesConfig.stars;
      default:
        return particlesConfig.confetti;
    }
  };

  const particleConfig = getParticleConfig();
  const particleCount = particleConfig?.particleCount ?? 50;
  const colors = particleConfig?.colors || [
    theme.colors.primary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.info,
  ];

  useEffect(() => {
    if (!active || !canUseParticles || !particleConfig?.enabled) {
      particlesRef.current = [];
      animationProgress.value = 0;
      return;
    }

    // Create particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const spread = particleConfig.spread || { min: 30, max: 70 };
      const distance = spread.min + Math.random() * (spread.max - spread.min);

      newParticles.push({
        id: i,
        x: useSharedValue(origin.x),
        y: useSharedValue(origin.y),
        rotation: useSharedValue(angle),
        scale: useSharedValue(0),
        opacity: useSharedValue(1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });

      // Animate particle
      const finalX = origin.x + Math.cos(angle) * distance;
      const finalY = origin.y + Math.sin(angle) * distance - 100; // Gravity effect

      newParticles[i].x.value = withTiming(finalX, { duration: 2000 });
      newParticles[i].y.value = withTiming(finalY, { duration: 2000 });
      newParticles[i].scale.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 1800 }),
      );
      newParticles[i].opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 1800 }),
      );
      newParticles[i].rotation.value = withRepeat(
        withTiming(angle + Math.PI * 4, { duration: 2000 }),
        1,
        false,
      );
    }

    particlesRef.current = newParticles;

    // Main animation
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, { duration: 2000 }, (finished) => {
      if (finished) {
        particlesRef.current = [];
        onComplete?.();
      }
    });
  }, [active, canUseParticles, particleConfig, particleCount, colors, origin, onComplete]);

  if (!canUseParticles || !particleConfig?.enabled || !active) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <ParticleView key={particle.id} particle={particle} type={type} />
      ))}
    </View>
  );
}

function ParticleView({ particle, type }: { particle: Particle; type: string }) {
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

  const renderParticle = () => {
    const size = 8;
    const style = { width: size, height: size, backgroundColor: particle.color };

    switch (type) {
      case 'hearts':
        // Use heart icon or shape
        return <View style={[style, { borderRadius: size / 2 }]} />;
      case 'stars':
        // Use star icon or shape
        return <View style={[style, { borderRadius: 2 }]} />;
      default:
        // Confetti - rectangular
        return <View style={style} />;
    }
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      {renderParticle()}
    </Animated.View>
  );
}

