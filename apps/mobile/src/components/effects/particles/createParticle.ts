/**
 * 🎯 PARTICLE FACTORY
 * 
 * Creates particles with randomized properties
 */

import type { Particle } from './ParticlePool';

export interface ParticleConfig {
  colors: string[];
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  ttl: number; // Time to live in ms
}

const DEFAULT_CONFIG: ParticleConfig = {
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  minSize: 8,
  maxSize: 20,
  minSpeed: 2,
  maxSpeed: 6,
  ttl: 2000,
};

/**
 * Create a particle with randomized properties
 */
export function createParticle(
  id: number,
  config: Partial<ParticleConfig> = {}
): Particle {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const colorIndex = id % merged.colors.length;
  const angle = (Math.PI * 2 * id) / 100 + Math.random() * 0.5;
  const speed = merged.minSpeed + Math.random() * (merged.maxSpeed - merged.minSpeed);
  const color = merged.colors[colorIndex];
  
  if (!color) {
    throw new Error('Color array is empty');
  }
  
  return {
    id,
    x: 0,
    y: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2, // Upward bias
    size: merged.minSize + Math.random() * (merged.maxSize - merged.minSize),
    opacity: 1,
    color,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    ttl: merged.ttl,
    age: 0,
  };
}

