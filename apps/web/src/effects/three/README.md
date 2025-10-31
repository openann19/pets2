# 🎯 Three.js Effects System

Production-grade Three.js effects with quality tiers, feature flags, and reduced motion support.

## Quick Start

### 1. Install Dependencies

```bash
pnpm add @react-three/fiber
```

The `three` package is already installed.

### 2. Wrap Your App with Feature Flags Provider

```tsx
// app/layout.tsx or App.tsx
import { FeatureFlagsProvider } from '@/foundation/flags/FeatureFlagsProvider';

export default function RootLayout({ children }) {
  return (
    <FeatureFlagsProvider>
      {children}
    </FeatureFlagsProvider>
  );
}
```

### 3. Use the Effects

```tsx
import { Canvas } from '@react-three/fiber';
import { LiquidMorph, GalaxyParticles, VolumetricPortal } from '@/effects/three';
import { useFlags } from '@/foundation/flags/FeatureFlagsProvider';
import { useQualityTier } from '@/foundation/quality/useQualityTier';

export function PremiumScene() {
  const flags = useFlags();
  const q = useQualityTier();

  return (
    <Canvas dpr={[1, q.dprCap]}>
      <color attach="background" args={['#0f0f15']} />
      
      {flags['effects.galaxy.enabled'] && (
        <GalaxyParticles count={60000} enabled />
      )}
      
      {flags['effects.morph.enabled'] && (
        <LiquidMorph intensity={1.2} speed={1.8} />
      )}
      
      {flags['effects.portal.enabled'] && (
        <VolumetricPortal active intensity={1.5} />
      )}
      
      <ambientLight intensity={0.2} />
    </Canvas>
  );
}
```

## Effects

### LiquidMorph

Procedural 3D morphing geometry with Fresnel shading. No external textures required.

**Props:**
- `intensity` (default: 1) - Displacement intensity
- `speed` (default: 1.5) - Animation speed
- `color1` (default: '#ec4899') - Primary color
- `color2` (default: '#8b5cf6') - Secondary color

### GalaxyParticles

Adaptive particle system that scales based on device capabilities and vsync rate.

**Props:**
- `count` (default: 50000) - Base particle count (auto-scaled by quality tier)
- `enabled` (default: true) - Enable/disable the effect

### VolumetricPortal

Volumetric light portal with deterministic seeded noise.

**Props:**
- `intensity` (default: 1) - Portal intensity
- `active` (default: true) - Enable/disable the effect
- `color1` (default: '#f0abfc') - Primary color
- `color2` (default: '#c084fc') - Secondary color

## Quality Tiers

The system automatically detects device capabilities and adjusts:

- **High Tier**: Full quality, 1.0x multipliers
- **Mid Tier**: 0.75x particles, 0.85x animation scale
- **Low Tier**: 0.5x particles, 0.7x animation scale, DPR capped at 1.5

Force quality for testing: `?quality=low|mid|high`

## Feature Flags

Control effects remotely via `/public/flags.json` or query parameters:

**Flags:**
- `effects.enabled` - Global kill switch
- `effects.galaxy.enabled` - Galaxy particles
- `effects.portal.enabled` - Volumetric portal
- `effects.morph.enabled` - Liquid morph
- `effects.galaxy.maxCount` - Max particle count (default: 60000)
- `effects.safeMode` - Minimal visuals for Play Pre-launch

**Query Parameters:**
- `?safeMode=1` - Enable safe mode
- `?quality=low|mid|high` - Force quality tier

## Reduced Motion

All effects automatically respect `prefers-reduced-motion`:
- Particle counts reduced to 60%
- Animation speeds clamped near-idle
- Sparkle effects minimized

## Performance Tips

1. **Cap DPR**: Use quality tier's `dprCap` to limit overdraw on high-DPI devices
2. **Safe Mode**: Use for Play Pre-launch testing or review scenarios
3. **Remote Kill**: Set `effects.enabled: false` in flags.json to disable all effects
4. **Particle Scaling**: GalaxyParticles auto-scales based on vsync rate and quality tier

## Play Pre-launch Safe Scene

For Google Play Pre-launch testing, use the minimal safe scene:

```tsx
import PrelaunchSafeScene from '@/app/routes/Diagnostics/PrelaunchSafeScene';

// Expose at /diagnostics/plr or via ?safeMode=1
<PrelaunchSafeScene />
```

## Troubleshooting

### "@react-three/fiber not found"

Install the dependency:
```bash
pnpm add @react-three/fiber
```

### Effects not rendering

1. Check that `FeatureFlagsProvider` wraps your app
2. Verify `effects.enabled` is `true` in flags.json
3. Check browser console for errors
4. Ensure Canvas is within viewport

### Performance issues

1. Enable safe mode: `?safeMode=1`
2. Force low quality: `?quality=low`
3. Reduce particle counts in flags.json
4. Check device tier detection (console.log `useQualityTier()`)

