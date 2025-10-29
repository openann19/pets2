/**
 * ConfettiBurst - Match celebration effect
 * Production-grade confetti animation for matches
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  left: Animated.SharedValue<number>;
  top: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  color: string;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Particle component to properly use useAnimatedStyle
function AnimatedParticle({ particle }: { particle: Particle }) {
  const animatedStyle = useAnimatedStyle(() => ({
    left: particle.left.value,
    top: particle.top.value,
    opacity: particle.opacity.value,
    transform: [{ rotate: `${particle.rotation.value}deg` }, { scale: particle.scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export interface ConfettiBurstProps {
  show?: boolean;
  onComplete?: () => void;
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  colors?: string[];
}

export function ConfettiBurst({
  show = false,
  onComplete,
  intensity = 'medium',
  duration = 3000,
  colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#9C27B0', '#3A86FF', '#06FFA5'],
}: ConfettiBurstProps): React.JSX.Element {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  // Configuration based on intensity
  const config = {
    light: { count: 40, particleSize: 6 },
    medium: { count: 80, particleSize: 8 },
    heavy: { count: 150, particleSize: 10 },
  };

  const currentConfig = config[intensity];
  const particleCount = currentConfig.count;
  const particleSize = currentConfig.particleSize;

  // Haptic feedback on match
  useEffect(() => {
    if (show) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
    }
  }, [show]);

  // Create and animate particles
  useEffect(() => {
    if (show && !isPlayingRef.current) {
      isPlayingRef.current = true;
      const newParticles: Particle[] = [];

      // Create particles
      for (let i = 0; i < particleCount; i++) {
        const startX = Math.random() * SCREEN_WIDTH;
        const startY = SCREEN_HEIGHT * 0.5;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = startY + Math.random() * SCREEN_HEIGHT;

        // Create shared values properly - not using hooks inside loop
        const leftSV: Animated.SharedValue<number> = {
          value: startX,
        } as Animated.SharedValue<number>;
        const topSV: Animated.SharedValue<number> = {
          value: startY,
        } as Animated.SharedValue<number>;
        const rotationSV: Animated.SharedValue<number> = {
          value: 0,
        } as Animated.SharedValue<number>;
        const scaleSV: Animated.SharedValue<number> = { value: 1 } as Animated.SharedValue<number>;
        const opacitySV: Animated.SharedValue<number> = {
          value: 1,
        } as Animated.SharedValue<number>;

        const animationDelay = (i / particleCount) * 100;
        const rotationTarget = (Math.random() * 720 - 360) * 2;

        // Animate left
        leftSV.value = withDelay(
          animationDelay,
          withTiming(endX, { duration: duration + Math.random() * 1000 }),
        );

        // Animate top
        topSV.value = withDelay(
          animationDelay,
          withTiming(SCREEN_HEIGHT + 200, { duration: duration + Math.random() * 1000 }),
        );

        // Animate rotation
        rotationSV.value = withDelay(
          animationDelay,
          withTiming(rotationTarget, { duration: duration + Math.random() * 1000 }),
        );

        // Animate opacity
        opacitySV.value = withDelay(
          animationDelay + duration * 0.7,
          withTiming(0, { duration: duration + Math.random() * 500 }),
        );

        newParticles.push({
          id: i,
          left: leftSV,
          top: topSV,
          rotation: rotationSV,
          scale: scaleSV,
          opacity: opacitySV,
          color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? '#FF6B6B',
          size: particleSize + Math.random() * 4,
          startX,
          startY,
          endX,
          endY,
        });
      }

      setParticles(newParticles);

      // Periodic additional bursts
      animationRef.current = setInterval(() => {
        const extraParticles = Math.floor(currentConfig.count * 0.2);
        const burstParticles: Particle[] = [];

        for (let i = 0; i < extraParticles; i++) {
          const startX = Math.random() * SCREEN_WIDTH;
          const startY = SCREEN_HEIGHT * 0.3;
          const endX = startX + (Math.random() - 0.5) * 300;

          const leftSV: Animated.SharedValue<number> = {
            value: startX,
          } as Animated.SharedValue<number>;
          const topSV: Animated.SharedValue<number> = {
            value: startY,
          } as Animated.SharedValue<number>;
          const rotationSV: Animated.SharedValue<number> = {
            value: 0,
          } as Animated.SharedValue<number>;
          const scaleSV: Animated.SharedValue<number> = {
            value: 0,
          } as Animated.SharedValue<number>;
          const opacitySV: Animated.SharedValue<number> = {
            value: 1,
          } as Animated.SharedValue<number>;

          leftSV.value = withTiming(endX, { duration: 2000 });
          topSV.value = withTiming(SCREEN_HEIGHT + 200, { duration: 2000 });
          opacitySV.value = withTiming(0, { duration: 1800 });

          burstParticles.push({
            id: Date.now() + i,
            left: leftSV,
            top: topSV,
            rotation: rotationSV,
            scale: scaleSV,
            opacity: opacitySV,
            color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? '#FF6B6B',
            size: particleSize + Math.random() * 4,
            startX,
            startY,
            endX,
            endY: SCREEN_HEIGHT + 200,
          });
        }

        setParticles((prev) => [...prev, ...burstParticles]);
      }, 350);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }

    if (!show) {
      isPlayingRef.current = false;
      setParticles([]);
    }
  }, [show, particleCount, duration, colors, particleSize, currentConfig.count, onComplete]);

  if (!show) return <View />;

  return (
    <View
      style={styles.container}
      pointerEvents="none"
      testID="confetti-container"
    >
      {particles.map((particle) => (
        <AnimatedParticle
          key={particle.id}
          particle={particle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
