/**
 * 🧪 COMPREHENSIVE TESTS FOR FOUNDATION MOTION
 * 
 * Tests for motion.ts utilities and helpers
 * Coverage: ≥75% target
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  durations,
  easings,
  motionEasing,
  springs,
  fromVelocity,
  getEasingArray,
  getSpringConfig,
  clamp,
  lerp,
  scales,
  motionOpacity,
  motionTokens,
  motionScale,
  motionDurations,
  springsLegacy,
  motionSpring,
  type SpringConfig,
  type MotionEasing,
  type MotionSpring,
  type MotionDuration,
  type MotionScale,
  type MotionOpacity,
} from '@/foundation/motion';

describe('Foundation Motion - Duration Tokens', () => {
  describe('durations', () => {
    it('should export all duration tokens', () => {
      expect(durations.xs).toBe(120);
      expect(durations.sm).toBe(180);
      expect(durations.md).toBe(240);
      expect(durations.lg).toBe(320);
    });

    it('should maintain legacy export compatibility', () => {
      // motionDurations should be available for backward compatibility
      expect(durations).toBeDefined();
    });

    it('should have durations in ascending order', () => {
      expect(durations.xs).toBeLessThan(durations.sm);
      expect(durations.sm).toBeLessThan(durations.md);
      expect(durations.md).toBeLessThan(durations.lg);
    });
  });
});

describe('Foundation Motion - Easing Curves', () => {
  describe('easings', () => {
    it('should export all easing arrays', () => {
      expect(easings.enter).toEqual([0.2, 0, 0, 1]);
      expect(easings.exit).toEqual([0.3, 0, 1, 1]);
      expect(easings.emphasized).toEqual([0.2, 0, 0, 1]);
    });

    it('should export Reanimated-compatible easing functions', () => {
      expect(motionEasing.enter).toBeDefined();
      expect(motionEasing.exit).toBeDefined();
      expect(motionEasing.emphasized).toBeDefined();
    });

    it('should maintain legacy array exports', () => {
      expect(motionEasing.enterArray).toEqual(easings.enter);
      expect(motionEasing.exitArray).toEqual(easings.exit);
      expect(motionEasing.emphasizedArray).toEqual(easings.emphasized);
    });
  });

  describe('getEasingArray', () => {
    it('should return correct easing array for valid keys', () => {
      expect(getEasingArray('enter')).toEqual([0.2, 0, 0, 1]);
      expect(getEasingArray('exit')).toEqual([0.3, 0, 1, 1]);
      expect(getEasingArray('emphasized')).toEqual([0.2, 0, 0, 1]);
    });

    it('should default to enter easing for invalid keys', () => {
      expect(getEasingArray('invalid' as MotionEasing)).toEqual([0.2, 0, 0, 1]);
    });
  });
});

describe('Foundation Motion - Spring Presets', () => {
  describe('springs', () => {
    it('should export all spring presets', () => {
      expect(springs.gentle).toBeDefined();
      expect(springs.standard).toBeDefined();
      expect(springs.bouncy).toBeDefined();
      expect(springs.overshoot).toBeDefined();
      expect(springs.velocity).toBeDefined();
      expect(springs.heavy).toBeDefined();
      expect(springs.light).toBeDefined();
      expect(springs.snappy).toBeDefined();
      expect(springs.wobbly).toBeDefined();
      expect(springs.stiff).toBeDefined();
    });

    it('should have correct structure for each preset', () => {
      const preset = springs.standard;
      expect(preset).toHaveProperty('stiffness');
      expect(preset).toHaveProperty('damping');
      expect(preset).toHaveProperty('mass');
      expect(typeof preset.stiffness).toBe('number');
      expect(typeof preset.damping).toBe('number');
      expect(typeof preset.mass).toBe('number');
    });

    it('should have presets with different characteristics', () => {
      // Bouncy should have lower damping than standard
      expect(springs.bouncy.damping).toBeLessThan(springs.standard.damping);
      
      // Snappy should have higher stiffness than standard
      expect(springs.snappy.stiffness).toBeGreaterThan(springs.standard.stiffness);
      
      // Gentle should have lower stiffness than standard
      expect(springs.gentle.stiffness).toBeLessThan(springs.standard.stiffness);
    });

    it('should have overshoot preset with overshootClamping disabled', () => {
      expect(springs.overshoot.overshootClamping).toBe(false);
      expect(springs.overshoot.damping).toBeLessThan(springs.standard.damping);
    });
  });

  describe('getSpringConfig', () => {
    it('should return correct spring config for valid keys', () => {
      expect(getSpringConfig('gentle')).toEqual(springs.gentle);
      expect(getSpringConfig('standard')).toEqual(springs.standard);
      expect(getSpringConfig('bouncy')).toEqual(springs.bouncy);
    });

    it('should return all presets correctly', () => {
      const presets: MotionSpring[] = ['gentle', 'standard', 'bouncy', 'overshoot', 'velocity', 'heavy', 'light', 'snappy', 'wobbly', 'stiff'];
      
      presets.forEach((preset) => {
        expect(getSpringConfig(preset)).toBeDefined();
        expect(getSpringConfig(preset)).toHaveProperty('stiffness');
        expect(getSpringConfig(preset)).toHaveProperty('damping');
      });
    });
  });
});

describe('Foundation Motion - fromVelocity Helper', () => {
  describe('fromVelocity', () => {
    it('should return snappy config for high velocity (>1000)', () => {
      const config = fromVelocity(1500);
      expect(config).toEqual(springs.snappy);
    });

    it('should return snappy config for negative high velocity', () => {
      const config = fromVelocity(-1500);
      expect(config).toEqual(springs.snappy);
    });

    it('should return velocity config for medium-high velocity (500-1000)', () => {
      const config = fromVelocity(750);
      expect(config).toEqual(springs.velocity);
    });

    it('should return standard config for medium velocity (200-500)', () => {
      const config = fromVelocity(350);
      expect(config).toEqual(springs.standard);
    });

    it('should return gentle config for low velocity (<200)', () => {
      const config = fromVelocity(100);
      expect(config).toEqual(springs.gentle);
    });

    it('should return gentle config for zero velocity', () => {
      const config = fromVelocity(0);
      expect(config).toEqual(springs.gentle);
    });

    it('should handle edge cases correctly', () => {
      expect(fromVelocity(1000)).toEqual(springs.snappy);
      expect(fromVelocity(999)).toEqual(springs.velocity);
      expect(fromVelocity(500)).toEqual(springs.velocity);
      expect(fromVelocity(499)).toEqual(springs.standard);
      expect(fromVelocity(200)).toEqual(springs.standard);
      expect(fromVelocity(199)).toEqual(springs.gentle);
    });
  });
});

describe('Foundation Motion - Utility Functions', () => {
  describe('clamp', () => {
    it('should clamp values within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
      expect(clamp(5, 5, 5)).toBe(5);
    });

    it('should handle reversed bounds', () => {
      expect(clamp(5, 10, 0)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
    });

    it('should handle t values outside 0-1', () => {
      expect(lerp(0, 10, -0.5)).toBe(-5);
      expect(lerp(0, 10, 1.5)).toBe(15);
    });

    it('should handle negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
      expect(lerp(10, -10, 0.5)).toBe(0);
    });
  });
});

describe('Foundation Motion - Type Exports', () => {
  it('should export all type definitions', () => {
    // These should compile without errors
    const duration: typeof durations.xs = 120;
    const easing: MotionEasing = 'enter';
    const spring: MotionSpring = 'standard';
    const springConfig: SpringConfig = springs.standard;

    expect(duration).toBe(120);
    expect(easing).toBe('enter');
    expect(spring).toBe('standard');
    expect(springConfig).toBeDefined();
  });
});

describe('Foundation Motion - Scale Tokens', () => {
  describe('scales', () => {
    it('should export all scale tokens', () => {
      expect(scales.pressed).toBe(0.98);
      expect(scales.lift).toBe(1.02);
    });

    it('should maintain legacy export compatibility', () => {
      expect(motionScale).toBeDefined();
      expect(motionScale).toEqual(scales);
    });

    it('should have valid scale values', () => {
      expect(scales.pressed).toBeGreaterThan(0);
      expect(scales.pressed).toBeLessThan(1);
      expect(scales.lift).toBeGreaterThan(1);
      expect(scales.lift).toBeLessThan(2);
    });
  });
});

describe('Foundation Motion - Opacity Tokens', () => {
  describe('motionOpacity', () => {
    it('should export all opacity tokens', () => {
      expect(motionOpacity.pressed).toBe(0.92);
      expect(motionOpacity.disabled).toBe(0.5);
      expect(motionOpacity.shimmer).toBe(0.18);
    });

    it('should have opacity values in valid range', () => {
      Object.values(motionOpacity).forEach((opacity) => {
        expect(opacity).toBeGreaterThanOrEqual(0);
        expect(opacity).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe('Foundation Motion - Motion Tokens Object', () => {
  describe('motionTokens', () => {
    it('should export complete motion tokens object', () => {
      expect(motionTokens).toBeDefined();
      expect(motionTokens.duration).toBeDefined();
      expect(motionTokens.easing).toBeDefined();
      expect(motionTokens.scale).toBeDefined();
      expect(motionTokens.opacity).toBeDefined();
      expect(motionTokens.spring).toBeDefined();
    });

    it('should match individual exports', () => {
      expect(motionTokens.duration).toEqual(durations);
      expect(motionTokens.easing).toEqual(easings);
      expect(motionTokens.scale).toEqual(scales);
      expect(motionTokens.opacity).toEqual(motionOpacity);
      expect(motionTokens.spring).toEqual(springs);
    });
  });

  describe('Legacy exports', () => {
    it('should maintain motionDurations legacy export', () => {
      expect(motionDurations).toEqual(durations);
    });

    it('should maintain motionScale legacy export', () => {
      expect(motionScale).toEqual(scales);
    });

    it('should maintain springsLegacy format', () => {
      expect(springsLegacy.gentle).toHaveProperty('k');
      expect(springsLegacy.gentle).toHaveProperty('c');
      expect(springsLegacy.gentle).toHaveProperty('m');
      expect(springsLegacy.gentle.k).toBe(springs.gentle.stiffness);
      expect(springsLegacy.gentle.c).toBe(springs.gentle.damping);
      expect(springsLegacy.gentle.m).toBe(springs.gentle.mass);
    });

    it('should maintain motionSpring compatibility', () => {
      expect(motionSpring.gentle).toEqual(springs.gentle);
      expect(motionSpring.standard).toEqual(springs.standard);
      expect(motionSpring.bouncy).toEqual(springs.bouncy);
      expect(motionSpring.snappy).toBeDefined();
    });
  });
});

describe('Foundation Motion - springs.fromVelocity Helper', () => {
  describe('springs.fromVelocity', () => {
    it('should be attached to springs object', () => {
      expect(typeof (springs as any).fromVelocity).toBe('function');
    });

    it('should return same results as standalone fromVelocity', () => {
      const velocities = [0, 100, 350, 750, 1500];
      velocities.forEach((velocity) => {
        const standalone = fromVelocity(velocity);
        const attached = (springs as any).fromVelocity(velocity);
        expect(attached).toEqual(standalone);
      });
    });
  });
});

describe('Foundation Motion - Edge Cases', () => {
  it('should handle spring config with optional properties', () => {
    const config: SpringConfig = {
      damping: 25,
      stiffness: 200,
      mass: 1,
      overshootClamping: false,
      restDelta: 0.01,
      restSpeed: 0.01,
      velocity: 0,
    };

    expect(config.overshootClamping).toBe(false);
    expect(config.mass).toBe(1);
    expect(config.restDelta).toBe(0.01);
    expect(config.restSpeed).toBe(0.01);
    expect(config.velocity).toBe(0);
  });

  it('should handle extremely high velocities', () => {
    const config1 = fromVelocity(10000);
    const config2 = fromVelocity(100000);
    expect(config1).toEqual(springs.snappy);
    expect(config2).toEqual(springs.snappy);
  });

  it('should handle extremely low velocities', () => {
    const config1 = fromVelocity(0.1);
    const config2 = fromVelocity(0.0001);
    expect(config1).toEqual(springs.gentle);
    expect(config2).toEqual(springs.gentle);
  });

  it('should handle negative velocities correctly', () => {
    expect(fromVelocity(-1000)).toEqual(springs.snappy);
    expect(fromVelocity(-500)).toEqual(springs.velocity);
    expect(fromVelocity(-100)).toEqual(springs.gentle);
  });
});

describe('Foundation Motion - Type System', () => {
  it('should export correct types for type checking', () => {
    const duration: MotionDuration = durations.md;
    const easing: MotionEasing = 'enter';
    const spring: MotionSpring = 'standard';
    const scale: MotionScale = scales.pressed;
    const opacity: MotionOpacity = motionOpacity.pressed;
    const springConfig: SpringConfig = springs.standard;

    expect(duration).toBe(240);
    expect(easing).toBe('enter');
    expect(spring).toBe('standard');
    expect(scale).toBe(0.98);
    expect(opacity).toBe(0.92);
    expect(springConfig).toBeDefined();
  });
});

describe('Foundation Motion - Default Export', () => {
  it('should export default as motionTokens', () => {
    const defaultExport = require('@/foundation/motion').default;
    expect(defaultExport).toEqual(motionTokens);
  });
});

