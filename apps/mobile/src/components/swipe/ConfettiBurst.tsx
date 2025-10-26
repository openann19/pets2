/**
 * ConfettiBurst - Match celebration effect
 * Production-grade confetti animation for matches
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import type { ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ConfettiBurstProps {
  show?: boolean;
  onComplete?: () => void;
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  colors?: string[];
}

interface Particle {
  id: number;
  left: Animated.Value;
  top: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
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
        const rotation = Math.random() * 720 - 360;

        newParticles.push({
          id: i,
          left: new Animated.Value(startX),
          top: new Animated.Value(startY),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(1),
          opacity: new Animated.Value(1),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: particleSize + Math.random() * 4,
        });
      }

      setParticles(newParticles);

      // Animate particles
      const animations = newParticles.map((particle, index) => {
        const delay = (index / particleCount) * 100;
        const endX = particle.left._value + (Math.random() - 0.5) * 400;
        const endY = SCREEN_HEIGHT + 200;
        const rotation = (Math.random() * 720 - 360) * 2;

        return Animated.parallel([
          Animated.timing(particle.left, {
            toValue: endX,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.top, {
            toValue: endY,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: rotation,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: duration + Math.random() * 500,
            delay: duration * 0.7,
            useNativeDriver: true,
          }),
        ]);
      });

      // Run all animations
      Animated.parallel(animations).start(() => {
        isPlayingRef.current = false;
        onComplete?.();
      });

      // Periodic additional bursts
      animationRef.current = setInterval(() => {
        const extraParticles = Math.floor(currentConfig.count * 0.2);
        const burstParticles: Particle[] = [];

        for (let i = 0; i < extraParticles; i++) {
          const startX = Math.random() * SCREEN_WIDTH;
          const startY = SCREEN_HEIGHT * 0.3;
          const endX = startX + (Math.random() - 0.5) * 300;
          const endY = SCREEN_HEIGHT + 200;

          burstParticles.push({
            id: Date.now() + i,
            left: new Animated.Value(startX),
            top: new Animated.Value(startY),
            rotation: new Animated.Value(0),
            scale: new Animated.Value(0),
            opacity: new Animated.Value(1),
            color: colors[Math.floor(Math.random() * colors.length)],
            size: particleSize + Math.random() * 4,
          });
        }

        setParticles(prev => [...prev, ...burstParticles]);

        // Animate new burst particles
        burstParticles.forEach(particle => {
          const endX = particle.left._value + (Math.random() - 0.5) * 300;
          Animated.parallel([
            Animated.timing(particle.left, {
              toValue: endX,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.top, {
              toValue: SCREEN_HEIGHT + 200,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 350);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [show, particleCount, duration, colors, particleSize, currentConfig.count, onComplete]);

  if (!show) return <View />;

  return (
    <View style={styles.container} pointerEvents="none" testID="confetti-container">
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transform: [
                { rotate: particle.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }) },
                { scale: particle.scale },
              ],
            },
          ]}
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
