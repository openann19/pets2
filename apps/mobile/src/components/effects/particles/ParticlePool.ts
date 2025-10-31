/**
 * 🎯 PARTICLE POOL - Object pool for particle effects
 * 
 * Pre-allocated pool to avoid allocations during bursts
 * Matches polish mandate: no allocations during animation
 */

export interface Particle {
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
  ttl: number; // Time to live in ms
  age: number; // Current age in ms
}

export interface ParticlePool {
  particles: Particle[];
  maxSize: number;
  alive: number;
}

export interface ParticleFactory {
  (id: number): Particle;
}

/**
 * Create a particle pool
 */
export function makePool(maxSize: number): ParticlePool {
  return {
    particles: Array.from({ length: maxSize }, (_, i) => ({
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
      ttl: 0,
      age: 0,
    })),
    maxSize,
    alive: 0,
  };
}

/**
 * Spawn particles from origin
 */
export function spawn(
  pool: ParticlePool,
  x: number,
  y: number,
  count: number,
  factory: ParticleFactory
): void {
  const spawnCount = Math.min(count, pool.maxSize - pool.alive);
  
  for (let i = 0; i < spawnCount; i++) {
    const particle = pool.particles[pool.alive + i];
    if (!particle) continue;
    
    const newParticle = factory(particle.id);
    Object.assign(particle, {
      ...newParticle,
      x,
      y,
      age: 0,
    });
  }
  
  pool.alive += spawnCount;
}

/**
 * Step particle simulation
 */
export function step(pool: ParticlePool, deltaTime: number): void {
  const gravity = 0.5;
  const drag = 0.98;
  let aliveCount = 0;
  
  for (let i = 0; i < pool.alive; i++) {
    const p = pool.particles[i];
    if (!p) continue;
    if (p.age >= p.ttl) {
      // Particle expired, reset
      p.opacity = 0;
      continue;
    }
    
    // Update age
    p.age += deltaTime;
    
    // Physics: velocity + drag + gravity
    p.vx *= drag;
    p.vy = p.vy * drag + gravity;
    
    // Position
    p.x += p.vx;
    p.y += p.vy;
    
    // Rotation
    p.rotation += p.rotationSpeed;
    
    // Opacity fade
    p.opacity = Math.max(0, 1 - (p.age / p.ttl));
    
    aliveCount++;
  }
  
  pool.alive = aliveCount;
}

/**
 * Reset pool
 */
export function reset(pool: ParticlePool): void {
  pool.alive = 0;
  for (const p of pool.particles) {
    p.opacity = 0;
    p.age = 0;
  }
}

