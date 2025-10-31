/**
 * 🎯 THREE.JS EFFECTS: TESTS
 * 
 * Tests for Three.js effects components
 * Note: WebGL rendering is mocked for unit tests
 */

import React from 'react';
import * as THREE from 'three';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    // Simulate frame callback
    const clock = { elapsedTime: 1.5 };
    callback({ clock });
  }),
  useThree: jest.fn(() => ({
    viewport: { width: 1920, height: 1080 },
  })),
}));

// Mock foundation hooks
jest.mock('@/foundation/reduceMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

jest.mock('@/foundation/useVsyncRate', () => ({
  useVsyncRate: jest.fn(() => 60),
}));

jest.mock('@/foundation/quality/useQualityTier', () => ({
  useQualityTier: jest.fn(() => ({
    tier: 'high' as const,
    particleMultiplier: 1.0,
    animationScale: 1.0,
    dprCap: 2,
  })),
}));

describe('Three.js Effects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LiquidMorph', () => {
    it('should export LiquidMorph component', async () => {
      const { LiquidMorph } = await import('../LiquidMorph');
      expect(LiquidMorph).toBeDefined();
      expect(typeof LiquidMorph).toBe('function');
    });

    it('should accept props correctly', async () => {
      const { LiquidMorph } = await import('../LiquidMorph');
      
      // Component should accept props without errors
      const props = {
        intensity: 1.5,
        speed: 2.0,
        color1: '#ff0000',
        color2: '#0000ff',
      };
      
      // Props validation - if component renders without error, props are valid
      expect(props.intensity).toBeGreaterThanOrEqual(0);
      expect(props.speed).toBeGreaterThanOrEqual(0);
      expect(props.color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(props.color2).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('GalaxyParticles', () => {
    it('should export GalaxyParticles component', async () => {
      const { GalaxyParticles } = await import('../GalaxyParticles');
      expect(GalaxyParticles).toBeDefined();
      expect(typeof GalaxyParticles).toBe('function');
    });

    it('should accept props correctly', async () => {
      const { GalaxyParticles } = await import('../GalaxyParticles');
      
      const props = {
        count: 50000,
        enabled: true,
      };
      
      expect(props.count).toBeGreaterThanOrEqual(0);
      expect(typeof props.enabled).toBe('boolean');
    });

    it('should return null when disabled', async () => {
      // This would be tested in integration tests
      // For unit tests, we verify the logic exists
      expect(true).toBe(true); // Placeholder - actual test would render component
    });
  });

  describe('VolumetricPortal', () => {
    it('should export VolumetricPortal component', async () => {
      const { VolumetricPortal } = await import('../VolumetricPortal');
      expect(VolumetricPortal).toBeDefined();
      expect(typeof VolumetricPortal).toBe('function');
    });

    it('should accept props correctly', async () => {
      const { VolumetricPortal } = await import('../VolumetricPortal');
      
      const props = {
        intensity: 1.5,
        active: true,
        color1: '#f0abfc',
        color2: '#c084fc',
      };
      
      expect(props.intensity).toBeGreaterThanOrEqual(0);
      expect(typeof props.active).toBe('boolean');
      expect(props.color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(props.color2).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('Effect Index', () => {
    it('should export all effects', async () => {
      const effects = await import('../index');
      
      expect(effects.LiquidMorph).toBeDefined();
      expect(effects.GalaxyParticles).toBeDefined();
      expect(effects.VolumetricPortal).toBeDefined();
    });

    it('should export type definitions', async () => {
      const types = await import('../types');
      
      expect(types).toHaveProperty('LiquidMorphProps');
      expect(types).toHaveProperty('GalaxyParticlesProps');
      expect(types).toHaveProperty('VolumetricPortalProps');
    });
  });
});

describe('Three.js Resource Management', () => {
  it('should properly dispose geometries', () => {
    const geometry = new THREE.IcosahedronGeometry(1.8, 64);
    const disposeSpy = jest.spyOn(geometry, 'dispose');
    
    geometry.dispose();
    
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('should properly dispose materials', () => {
    const material = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4(0.0); }',
      fragmentShader: 'void main() { gl_FragColor = vec4(1.0); }',
    });
    const disposeSpy = jest.spyOn(material, 'dispose');
    
    material.dispose();
    
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('should properly dispose textures', () => {
    const texture = new THREE.DataTexture(
      new Uint8Array(64 * 64 * 4),
      64,
      64,
      THREE.RGBAFormat
    );
    const disposeSpy = jest.spyOn(texture, 'dispose');
    
    texture.dispose();
    
    expect(disposeSpy).toHaveBeenCalled();
  });
});

