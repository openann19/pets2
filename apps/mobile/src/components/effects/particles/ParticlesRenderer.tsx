/**
 * 🎯 PARTICLE RENDERER COMPONENT
 * 
 * Separate component for rendering individual particles
 * Uses Reanimated for smooth updates
 * 
 * Note: For production with many particles (>100), use Skia Canvas
 */

import { useMemo, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
} from 'react-native-reanimated';
import type { Particle } from './ParticlePool';

interface ParticleRendererProps {
  particle: Particle;
  particles: Animated.SharedValue<Particle[]>;
}

/**
 * Single particle renderer component
 */
function ParticleRenderer({ particle, particles }: ParticleRendererProps) {
  const style = useAnimatedStyle(() => {
    const p = particles.value.find(p => p.id === particle.id);
    if (!p || p.opacity === 0) {
      return { opacity: 0 };
    }
    
    return {
      transform: [
        { translateX: p.x },
        { translateY: p.y },
        { rotate: `${p.rotation}rad` },
      ],
      opacity: p.opacity,
    };
  });

  return (
    <Animated.View
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
}

interface ParticlesRendererProps {
  particles: Animated.SharedValue<Particle[]>;
}

/**
 * Renders all particles from pool
 * Updates when particles array changes
 */
export function ParticlesRenderer({ particles }: ParticlesRendererProps) {
  const [particleIds, setParticleIds] = useState<number[]>([]);
  
  // Update particle IDs when shared value changes
  useAnimatedReaction(
    () => particles.value.map(p => p.id),
    (_ids) => {
      // Trigger React re-render by updating state
      // This is safe because we're reading from shared value
      // In production with Skia, this wouldn't be needed
    }
  );

  // Extract particle IDs on mount and when particles change
  useEffect(() => {
    const updateIds = () => {
      const aliveParticles = particles.value.filter(p => p.opacity > 0);
      setParticleIds(aliveParticles.map(p => p.id));
    };
    
    updateIds();
    
    // Update periodically (particles update via requestAnimationFrame)
    const interval = setInterval(updateIds, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [particles]);

  if (particleIds.length === 0) {
    return null;
  }

  // Create particle objects from IDs
  const particleObjects = useMemo(() => {
    return particleIds.map(id => {
      const p = particles.value.find(p => p.id === id);
      return p!;
    }).filter(Boolean);
  }, [particleIds, particles]);

  return (
    <>
      {particleObjects.map((particle) => (
        <ParticleRenderer
          key={particle.id}
          particle={particle}
          particles={particles}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

