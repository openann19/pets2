/**
 * 🎯 THREE.JS EFFECTS: TYPE DEFINITIONS
 * 
 * Type definitions for Three.js effects
 */

export interface BaseEffectProps {
  /** Enable or disable the effect */
  enabled?: boolean;
  /** Effect intensity multiplier */
  intensity?: number;
}

export interface ColorEffectProps extends BaseEffectProps {
  /** Primary color (hex string) */
  color1?: string;
  /** Secondary color (hex string) */
  color2?: string;
}

export interface LiquidMorphProps extends ColorEffectProps {
  /** Animation speed multiplier */
  speed?: number;
}

export interface GalaxyParticlesProps extends BaseEffectProps {
  /** Base particle count (will be auto-scaled by quality tier) */
  count?: number;
}

export interface VolumetricPortalProps extends ColorEffectProps {
  /** Whether the portal is active */
  active?: boolean;
}

export interface QualityProfile {
  tier: 'low' | 'mid' | 'high';
  particleMultiplier: number;
  animationScale: number;
  dprCap: number;
}

export interface FeatureFlags {
  'effects.enabled': boolean;
  'effects.galaxy.enabled': boolean;
  'effects.portal.enabled': boolean;
  'effects.morph.enabled': boolean;
  'effects.galaxy.maxCount': number;
  'effects.safeMode': boolean;
}

