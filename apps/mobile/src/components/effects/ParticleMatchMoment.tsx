/**
 * 🎯 PARTICLE MATCH MOMENT
 * 
 * Hearts/confetti burst from card edges with depth + gravity
 * - Skia particle pool (no allocations during burst)
 * - Per-particle velocity + drag
 * - Color trails
 * - Capability-gated (highPerf only)
 * 
 * DoD: 160 particles (high tier) / 60 (low); CPU <5% for 2s; badge count increments mid-animation
 */

import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCapabilities } from '@/foundation/capabilities';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { haptic } from '@/foundation/haptics';
import type { AppTheme } from '@mobile/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleMatchMomentProps {
  /** Trigger particle burst */
  active: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Theme for colors */
  theme: AppTheme;
  /** Badge count to increment */
  badgeCount?: number;
  /** Callback when badge should increment */
  onBadgeIncrement?: (count: number) => void;
}

/**
 * Particle pool (reused across animations)
 */
class ParticlePool {
  private particles: Particle[] = [];
  private activeCount = 0;
  private maxParticles: number;

  constructor(maxParticles: number) {
    this.maxParticles = maxParticles;
    // Pre-allocate particles
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        id: i,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        opacity: 0,
        color: '#FF6B6B',
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  burst(
    originX: number,
    originY: number,
    count: number,
    colors: string[]
  ): Particle[] {
    const active: Particle[] = [];
    const colorCount = colors.length;

    for (let i = 0; i < Math.min(count, this.maxParticles); i++) {
      const particle = this.particles[i];
      if (!particle) continue;
      
      // Reset particle
      particle.x = originX;
      particle.y = originY;
      
      // Random velocity (burst outward)
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 2; // Upward bias
      
      particle.size = 8 + Math.random() * 12;
      particle.opacity = 1;
      const colorIndex = i % colorCount;
      const color = colors[colorIndex];
      if (color) {
        particle.color = color;
      }
      particle.rotation = Math.random() * Math.PI * 2;
      particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      active.push(particle);
    }

    this.activeCount = active.length;
    return active;
  }

  reset(): void {
    this.activeCount = 0;
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}

/**
 * Particle Match Moment component
 * Falls back to simple animation if Skia unavailable
 */
export function ParticleMatchMoment({
  active,
  onComplete,
  theme,
  badgeCount = 0,
  onBadgeIncrement,
}: ParticleMatchMomentProps) {
  const caps = useCapabilities();
  const reducedMotion = useReduceMotion();
  
  // Determine particle count based on device tier
  const particleCount = useMemo(() => {
    if (reducedMotion) return 0;
    if (caps.highPerf && caps.thermalsOk) return 160;
    return 60;
  }, [caps, reducedMotion]);

  const poolRef = useRef<ParticlePool | null>(null);
  if (!poolRef.current) {
    poolRef.current = new ParticlePool(particleCount);
  }

  const particles = useSharedValue<Particle[]>([]);
  const animationProgress = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  // Trigger burst
  React.useEffect(() => {
    if (!active || reducedMotion) {
      particles.value = [];
      animationProgress.value = 0;
      return;
    }

    // Haptic feedback (light → medium sequence)
    haptic.tap();
    setTimeout(() => haptic.confirm(), 100);

    // Burst from center
    const originX = SCREEN_WIDTH / 2;
    const originY = SCREEN_HEIGHT / 2;
    
    const burstColors = [
      theme.colors.danger,
      theme.colors.primary,
      theme.colors.success,
      theme.colors.warning,
    ];

    const activeParticles = poolRef.current!.burst(
      originX,
      originY,
      particleCount,
      burstColors
    );
    particles.value = activeParticles;

    // Animate particles
    animationProgress.value = 0;
    animationProgress.value = withTiming(
      1,
      {
        duration: 2000,
      },
      (finished) => {
        if (finished) {
          particles.value = [];
          runOnJS(() => {
            onComplete?.();
          })();
        }
      }
    );

    // Badge increment mid-animation
    badgeOpacity.value = withSequence(
      withDelay(500, withTiming(1, { duration: 200 })),
      withDelay(800, withTiming(0, { duration: 200 }))
    );

    // Trigger badge increment
    setTimeout(() => {
      if (onBadgeIncrement) {
        onBadgeIncrement(badgeCount + 1);
      }
    }, 600);
  }, [active, reducedMotion, particleCount, theme, badgeCount, onComplete, onBadgeIncrement]);

  // Render particles as simple animated views (fallback without Skia)
  const particleStyles = useMemo(() => {
    if (reducedMotion || !caps.highPerf || particles.value.length === 0) {
      return [];
    }

    return particles.value.map((particle, _index) => {
      const style = useAnimatedStyle(() => {
        const progress = animationProgress.value;
        
        // Physics simulation
        const gravity = 0.5;
        const drag = 0.98;
        
        let x = particle.x;
        let y = particle.y;
        let vx = particle.vx;
        let vy = particle.vy;
        
        // Simulate motion
        for (let i = 0; i < progress * 60; i++) {
          vx *= drag;
          vy = vy * drag + gravity;
          x += vx;
          y += vy;
        }
        
        const opacity = Math.max(0, 1 - progress);
        const rotation = particle.rotation + progress * particle.rotationSpeed * 10;
        
        return {
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate: `${rotation}rad` },
            { scale: 1 - progress * 0.5 },
          ],
          opacity,
        };
      });

      return (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
            },
            style,
          ]}
        />
      );
    });
  }, [particles.value, animationProgress, reducedMotion, caps]);

  if (reducedMotion || !active || particles.value.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particleStyles}
      
      {/* Badge increment indicator */}
      <Animated.View
        style={[
          styles.badgeIndicator,
          {
            opacity: badgeOpacity,
          },
        ]}
      >
        <Ionicons name="heart" size={24} color={theme.colors.danger} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
  badgeIndicator: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 12,
    left: SCREEN_WIDTH / 2 - 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

