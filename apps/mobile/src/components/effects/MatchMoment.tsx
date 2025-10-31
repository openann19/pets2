/**
 * 🎯 MATCH MOMENT - Particle burst effect
 * 
 * Hearts/confetti burst from card edges with depth + gravity
 * - Pooled particles (no allocations during burst)
 * - Per-particle velocity + drag
 * - Color trails
 * - Capability-gated
 * 
 * DoD: 160 particles (high tier) / 60 (low); CPU <5% for 2s; badge count increments mid-animation
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCapabilities } from '@/foundation/capabilities';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { haptic } from '@/foundation/haptics';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { makePool, spawn, step, reset, type ParticlePool, type Particle } from './particles/ParticlePool';
import { createParticle } from './particles/createParticle';
import { ParticlesRenderer } from './particles/ParticlesRenderer';
import { useAnimationTelemetry } from '@/foundation/telemetry';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatchMomentProps {
  /** Trigger particle burst */
  active: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Badge count to increment */
  badgeCount?: number;
  /** Callback when badge should increment */
  onBadgeIncrement?: (count: number) => void;
}

/**
 * Match Moment particle burst component
 */
export function MatchMoment({
  active,
  onComplete,
  badgeCount = 0,
  onBadgeIncrement,
}: MatchMomentProps) {
  const caps = useCapabilities();
  const reducedMotion = useReduceMotion();
  const theme = useTheme() as AppTheme;
  const telemetry = useAnimationTelemetry('match-moment', 'MatchMoment');
  
  // Determine particle count based on device tier
  const particleCount = caps.highPerf && caps.thermalsOk ? 160 : 60;
  
  const poolRef = useRef<ParticlePool | null>(null);
  if (!poolRef.current) {
    poolRef.current = makePool(particleCount);
  }

  const particles = useSharedValue<Particle[]>([]);
  const animationProgress = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const lastFrameTime = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Trigger burst
  useEffect(() => {
    if (!active || reducedMotion) {
      reset(poolRef.current!);
      particles.value = [];
      animationProgress.value = 0;
      return;
    }

    // Track animation start
    startTimeRef.current = Date.now();
    telemetry.start();
    
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

    reset(poolRef.current!);
    spawn(
      poolRef.current!,
      originX,
      originY,
      particleCount,
      (id) => createParticle(id, { colors: burstColors, ttl: 2000 })
    );
    
    particles.value = poolRef.current!.particles.slice(0, poolRef.current!.alive);

    // Animate particles
    animationProgress.value = 0;
    animationProgress.value = withTiming(
      1,
      {
        duration: 2000,
      },
      (finished) => {
        if (finished) {
          const duration = Date.now() - startTimeRef.current;
          telemetry.end(duration, false);
          
          reset(poolRef.current!);
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

    // Animation loop
    let animationFrame: number;
    let frameDropCount = 0;
    const animate = (timestamp: number) => {
      if (!poolRef.current) return;
      
      const deltaTime = timestamp - (lastFrameTime.current || timestamp);
      lastFrameTime.current = timestamp;
      
      // Track frame drops (>16.7ms = dropped frame)
      if (deltaTime > 20) {
        frameDropCount++;
      }
      
      step(poolRef.current, deltaTime);
      particles.value = poolRef.current.particles.slice(0, poolRef.current.alive);
      
      if (poolRef.current.alive > 0 && animationProgress.value < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Log frame drops at end
        if (frameDropCount > 0) {
          const qualityTier = caps.highPerf && caps.thermalsOk ? 'high' : 'medium';
          telemetry.logFrameDrops(frameDropCount, qualityTier);
        }
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      // Track cancellation if animation was interrupted
      if (animationProgress.value < 1) {
        const duration = Date.now() - startTimeRef.current;
        telemetry.end(duration, true);
      }
    };
  }, [active, reducedMotion, particleCount, theme, badgeCount, onComplete, onBadgeIncrement, caps, telemetry]);

  if (reducedMotion || !active || !particles.value || particles.value.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Particle renderer */}
      <ParticlesRenderer particles={particles} />
      
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

