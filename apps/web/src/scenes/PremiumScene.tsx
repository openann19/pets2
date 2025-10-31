/**
 * 🎯 PREMIUM SCENE: THREE.JS EFFECTS DEMO
 * 
 * Example scene showing all effects integrated with quality tiers and feature flags
 */

'use client';

import React from 'react';
import { logger } from '@pawfectmatch/core';
import { LiquidMorph, GalaxyParticles, VolumetricPortal } from '@/effects/three';
import { useFlags } from '@/foundation/flags/FeatureFlagsProvider';
import { useQualityTier } from '@/foundation/quality/useQualityTier';

/**
 * Premium scene component demonstrating Three.js effects integration
 * 
 * Note: This component requires @react-three/fiber to be installed.
 * Install with: pnpm add @react-three/fiber
 * 
 * For plain Three.js usage, see PrelaunchSafeScene.tsx
 */
import { useVisualEnhancements } from '@/hooks/useVisualEnhancements';

export function PremiumScene() {
  const flags = useFlags();
  const visual = useVisualEnhancements();
  const q = useQualityTier();

  if (!flags['effects.enabled']) return null; // global kill

  // Respect safeMode for review & pre-launch
  const safe = flags['effects.safeMode'];

  // Cap DPR to save battery/overdraw on mobile
  const dpr = safe ? [1, 1.5] : [1, q.dprCap];

  const maxParticles = Math.floor(
    (flags['effects.galaxy.maxCount'] || 60000) * 
    q.particleMultiplier * 
    (safe ? 0.5 : 1)
  );

  // Dynamic import for Canvas to handle missing @react-three/fiber gracefully
  const [Canvas, setCanvas] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    // Try to load @react-three/fiber
    import('@react-three/fiber')
      .then((mod) => setCanvas(() => mod.Canvas))
      .catch(() => {
        // @react-three/fiber not installed
        logger.warn('@react-three/fiber not found. Install with: pnpm add @react-three/fiber');
      });
  }, []);

  if (!Canvas) {
    // Fallback: render info message if react-three/fiber not available
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        backgroundColor: '#0f0f15',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Premium Scene</h2>
        <p>Install @react-three/fiber to enable Three.js effects</p>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          Run: <code style={{ backgroundColor: '#1a1a1a', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>pnpm add @react-three/fiber</code>
        </p>
        <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '1rem' }}>
          <p>Quality Tier: {q.tier}</p>
          <p>Effects Enabled: {flags['effects.enabled'] ? 'Yes' : 'No'}</p>
          <p>Safe Mode: {safe ? 'Yes' : 'No'}</p>
          <p>Max Particles: {maxParticles}</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas dpr={dpr} gl={{ alpha: true, antialias: true }}>
      <color attach="background" args={['#0f0f15']} />

      {/* Use visualEnhancements2025 config if available, fallback to feature flags */}
      {(visual.canUseThreeJs && visual.threeJsConfig?.galaxyParticles?.enabled) || flags['effects.galaxy.enabled'] && !safe && (
        <GalaxyParticles 
          count={visual.threeJsConfig?.galaxyParticles?.baseCount ?? maxParticles} 
          enabled={visual.canUseThreeJs || flags['effects.galaxy.enabled']} 
        />
      )}

      {(visual.canUseThreeJs && visual.threeJsConfig?.liquidMorph?.enabled) || flags['effects.morph.enabled'] && (
        <LiquidMorph 
          intensity={visual.threeJsConfig?.liquidMorph?.intensity ?? (safe ? 0.8 * q.animationScale : 1.2 * q.animationScale)}
          speed={visual.threeJsConfig?.liquidMorph?.speed ?? (safe ? 1.0 : 1.8 * q.animationScale)}
          color1={visual.threeJsConfig?.liquidMorph?.color1}
          color2={visual.threeJsConfig?.liquidMorph?.color2}
        />
      )}

      {(visual.canUseThreeJs && visual.threeJsConfig?.volumetricPortal?.enabled) || flags['effects.portal.enabled'] && !safe && (
        <VolumetricPortal 
          active={visual.threeJsConfig?.volumetricPortal?.active ?? true}
          intensity={visual.threeJsConfig?.volumetricPortal?.intensity ?? 1.5 * q.animationScale}
        />
      )}

      <ambientLight intensity={0.2} />
    </Canvas>
  );
}

