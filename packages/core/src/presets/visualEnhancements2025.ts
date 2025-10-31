/**
 * 🎨 Visual Enhancements 2025 - Preset Configurations
 * Pre-defined presets for quick setup in admin console
 */

import type { VisualEnhancements2025 } from '../schemas/ui-config';

/**
 * Minimal preset - Performance-focused, subtle animations
 */
export const MINIMAL_PRESET: VisualEnhancements2025 = {
  preset: 'minimal',
  animations: { enabled: true },
  effects: {
    threeDCards: { enabled: false },
    particles: { 
      enabled: false, 
      maxCount: 0,
      confetti: {
        enabled: false,
        particleCount: 50,
        colors: ['#ec4899', '#a855f7', '#3b82f6'],
        duration: 2000,
      },
      hearts: {
        enabled: false,
        particleCount: 20,
        spread: { min: 30, max: 70 },
      },
      stars: {
        enabled: false,
        particleCount: 15,
      },
    },
    glassMorphism: { 
      enabled: false,
      blurIntensity: 10,
      opacity: 0.7,
    },
    isometric: { enabled: false },
    texturedRealism: { enabled: false },
    threeJsEffects: undefined,
  },
  typography: {
    gradientText: { enabled: false, animationSpeed: 1, variants: [] },
    kinetic: { enabled: false, variants: [] },
    scrollReveal: { enabled: false },
    morphing: { enabled: false },
  },
  colors: {
    dynamicColors: { enabled: false },
    hdr: { enabled: false },
    neonAccents: { enabled: false, intensity: 0 },
    gradientMeshes: { enabled: false },
  },
  scroll: {
    parallax: { enabled: false },
    scrollTriggers: { enabled: false },
    momentum: { enabled: false },
    sticky: { enabled: false },
  },
  performance: {
    capabilityGating: true,
    lowEndDevicePolicy: 'skip',
    maxParticles: 0,
    maxBlurRadius: 0,
  },
};

/**
 * Standard preset - Balanced animations, good performance
 */
export const STANDARD_PRESET: VisualEnhancements2025 = {
  preset: 'standard',
  animations: { enabled: true },
  effects: {
    threeDCards: { enabled: true, tiltDegrees: 5 },
    particles: {
      enabled: true,
      maxCount: 30,
      confetti: {
        enabled: true,
        particleCount: 50,
        colors: ['#ec4899', '#a855f7', '#3b82f6'],
        duration: 2000,
      },
      hearts: {
        enabled: true,
        particleCount: 20,
        spread: { min: 30, max: 70 },
      },
      stars: {
        enabled: true,
        particleCount: 15,
      },
    },
    glassMorphism: {
      enabled: true,
      blurIntensity: 10,
      opacity: 0.7,
      reflection: false,
      animated: false,
    },
    isometric: { enabled: false },
    texturedRealism: {
      enabled: true,
      softShadows: true,
      claymorphicShapes: false,
      gradientMeshes: false,
    },
    threeJsEffects: {
      enabled: false,
      liquidMorph: { enabled: false },
      galaxyParticles: { enabled: false },
      volumetricPortal: { enabled: false },
    },
  },
  typography: {
    gradientText: {
      enabled: true,
      animationSpeed: 1.5,
      variants: ['primary', 'secondary'],
    },
    kinetic: {
      enabled: true,
      variants: ['bounce'],
      intensity: 'subtle',
    },
    scrollReveal: {
      enabled: true,
      offset: 100,
      direction: 'up',
    },
    morphing: { enabled: false },
  },
  colors: {
    dynamicColors: { enabled: false },
    hdr: { enabled: false },
    neonAccents: { enabled: false, intensity: 0 },
    gradientMeshes: {
      enabled: true,
      animated: false,
      rotationSpeed: 0,
    },
  },
  scroll: {
    parallax: {
      enabled: true,
      layers: 2,
      intensity: 0.5,
    },
    scrollTriggers: {
      enabled: true,
      offset: 100,
      threshold: 0.3,
    },
    momentum: { enabled: false },
    sticky: {
      enabled: true,
      transformOnStick: false,
    },
  },
  performance: {
    capabilityGating: true,
    lowEndDevicePolicy: 'simplify',
    maxParticles: 50,
    maxBlurRadius: 15,
  },
};

/**
 * Premium preset - Rich animations, smooth experience
 */
export const PREMIUM_PRESET: VisualEnhancements2025 = {
  preset: 'premium',
  animations: { enabled: true },
  effects: {
    threeDCards: {
      enabled: true,
      tiltDegrees: 10,
      depthShadow: true,
      gyroscopeTilt: false,
      maxCards: 3,
    },
    particles: {
      enabled: true,
      maxCount: 60,
      confetti: {
        enabled: true,
        particleCount: 80,
        colors: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
        duration: 3000,
      },
      hearts: {
        enabled: true,
        particleCount: 30,
        spread: { min: 40, max: 80 },
      },
      stars: {
        enabled: true,
        particleCount: 25,
      },
    },
    glassMorphism: {
      enabled: true,
      blurIntensity: 20,
      opacity: 0.5,
      reflection: true,
      animated: true,
    },
    isometric: {
      enabled: true,
      angle: 30,
      depth: 50,
    },
    texturedRealism: {
      enabled: true,
      softShadows: true,
      claymorphicShapes: true,
      gradientMeshes: true,
    },
    threeJsEffects: {
      enabled: true,
      liquidMorph: {
        enabled: true,
        intensity: 1.2,
        speed: 1.8,
        color1: '#ec4899',
        color2: '#a855f7',
      },
      galaxyParticles: {
        enabled: true,
        baseCount: 30000,
        maxCount: 60000,
        autoScale: true,
        qualityMultiplier: 0.7,
      },
      volumetricPortal: {
        enabled: false,
        active: false,
        intensity: 1.5,
      },
      global: {
        safeMode: false,
        qualityTier: 'auto',
        dprCap: 2,
        respectReducedMotion: true,
      },
    },
  },
  typography: {
    gradientText: {
      enabled: true,
      animationSpeed: 2,
      variants: ['primary', 'secondary', 'premium', 'neon'],
    },
    kinetic: {
      enabled: true,
      variants: ['bounce', 'wave', 'pulse'],
      intensity: 'medium',
    },
    scrollReveal: {
      enabled: true,
      offset: 150,
      direction: 'up',
    },
    morphing: {
      enabled: true,
      duration: 800,
    },
  },
  colors: {
    dynamicColors: {
      enabled: true,
      timeOfDayShift: true,
      ambientLightAdaptation: false,
    },
    hdr: {
      enabled: true,
      detectCapability: true,
      fallbackToSRGB: true,
    },
    neonAccents: {
      enabled: true,
      intensity: 0.7,
      colors: ['#ec4899', '#a855f7', '#3b82f6'],
    },
    gradientMeshes: {
      enabled: true,
      animated: true,
      rotationSpeed: 2,
    },
  },
  scroll: {
    parallax: {
      enabled: true,
      layers: 3,
      intensity: 1,
    },
    scrollTriggers: {
      enabled: true,
      offset: 150,
      threshold: 0.2,
    },
    momentum: {
      enabled: true,
      bounce: true,
      friction: 0.85,
    },
    sticky: {
      enabled: true,
      transformOnStick: true,
    },
  },
  performance: {
    capabilityGating: true,
    lowEndDevicePolicy: 'simplify',
    maxParticles: 100,
    maxBlurRadius: 25,
  },
};

/**
 * Ultra preset - Maximum visual impact, flagship devices only
 */
export const ULTRA_PRESET: VisualEnhancements2025 = {
  preset: 'ultra',
  animations: { enabled: true },
  effects: {
    threeDCards: {
      enabled: true,
      tiltDegrees: 15,
      depthShadow: true,
      gyroscopeTilt: true,
      maxCards: 5,
    },
    particles: {
      enabled: true,
      maxCount: 150,
      confetti: {
        enabled: true,
        particleCount: 150,
        colors: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        duration: 4000,
      },
      hearts: {
        enabled: true,
        particleCount: 50,
        spread: { min: 50, max: 90 },
      },
      stars: {
        enabled: true,
        particleCount: 40,
      },
    },
    glassMorphism: {
      enabled: true,
      blurIntensity: 30,
      opacity: 0.3,
      reflection: true,
      animated: true,
    },
    isometric: {
      enabled: true,
      angle: 45,
      depth: 80,
    },
    texturedRealism: {
      enabled: true,
      softShadows: true,
      claymorphicShapes: true,
      gradientMeshes: true,
    },
    threeJsEffects: {
      enabled: true,
      liquidMorph: {
        enabled: true,
        intensity: 1.5,
        speed: 2.5,
        color1: '#ec4899',
        color2: '#8b5cf6',
      },
      galaxyParticles: {
        enabled: true,
        baseCount: 50000,
        maxCount: 100000,
        autoScale: true,
        qualityMultiplier: 1,
      },
      volumetricPortal: {
        enabled: true,
        active: true,
        intensity: 2,
        color1: '#667eea',
        color2: '#764ba2',
      },
      global: {
        safeMode: false,
        qualityTier: 'high',
        dprCap: 3,
        respectReducedMotion: true,
      },
    },
  },
  typography: {
    gradientText: {
      enabled: true,
      animationSpeed: 3,
      variants: ['primary', 'secondary', 'premium', 'neon', 'rainbow', 'holographic'],
    },
    kinetic: {
      enabled: true,
      variants: ['bounce', 'wave', 'pulse', 'slide'],
      intensity: 'bold',
    },
    scrollReveal: {
      enabled: true,
      offset: 200,
      direction: 'up',
    },
    morphing: {
      enabled: true,
      duration: 500,
    },
  },
  colors: {
    dynamicColors: {
      enabled: true,
      timeOfDayShift: true,
      ambientLightAdaptation: true,
    },
    hdr: {
      enabled: true,
      detectCapability: true,
      fallbackToSRGB: true,
    },
    neonAccents: {
      enabled: true,
      intensity: 1,
      colors: ['#ec4899', '#a855f7', '#3b82f6', '#10b981'],
    },
    gradientMeshes: {
      enabled: true,
      animated: true,
      rotationSpeed: 5,
    },
  },
  scroll: {
    parallax: {
      enabled: true,
      layers: 5,
      intensity: 1.5,
    },
    scrollTriggers: {
      enabled: true,
      offset: 200,
      threshold: 0.15,
    },
    momentum: {
      enabled: true,
      bounce: true,
      friction: 0.8,
    },
    sticky: {
      enabled: true,
      transformOnStick: true,
    },
  },
  performance: {
    capabilityGating: true,
    lowEndDevicePolicy: 'full',
    maxParticles: 200,
    maxBlurRadius: 40,
  },
};

/**
 * Preset map for easy access
 */
export const VISUAL_ENHANCEMENT_PRESETS = {
  minimal: MINIMAL_PRESET,
  standard: STANDARD_PRESET,
  premium: PREMIUM_PRESET,
  ultra: ULTRA_PRESET,
} as const;

/**
 * Get preset by key
 */
export function getVisualEnhancementPreset(
  preset: 'minimal' | 'standard' | 'premium' | 'ultra',
): VisualEnhancements2025 {
  return VISUAL_ENHANCEMENT_PRESETS[preset];
}

