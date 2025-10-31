# 🎯 Three.js Effects - Quick Setup Guide

## ✅ Already Done

- ✅ All Three.js effect components created
- ✅ Foundation hooks (useReducedMotion, useVsyncRate, useQualityTier)
- ✅ Feature flags system integrated
- ✅ `@react-three/fiber` added to package.json
- ✅ FeatureFlagsProvider added to app providers
- ✅ Demo pages created

## 📦 Installation

```bash
# Install dependencies
pnpm install
```

The `@react-three/fiber` package is already added to `package.json`.

## 🚀 Usage

### 1. Demo Page

Visit the effects demo page:
- URL: `/premium/effects-demo`
- Shows all effects with quality tiers and feature flags

### 2. Use in Your Components

```tsx
import { PremiumScene } from '@/scenes/PremiumScene';
import { FeatureFlagsProvider } from '@/foundation/flags/FeatureFlagsProvider';

// Already wrapped in app/providers.tsx, but you can wrap individual pages:
export default function MyPage() {
  return (
    <FeatureFlagsProvider>
      <PremiumScene />
    </FeatureFlagsProvider>
  );
}
```

### 3. Individual Effects

```tsx
import { Canvas } from '@react-three/fiber';
import { LiquidMorph, GalaxyParticles, VolumetricPortal } from '@/effects/three';
import { useFlags } from '@/foundation/flags/FeatureFlagsProvider';
import { useQualityTier } from '@/foundation/quality/useQualityTier';

function MyScene() {
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
      
      <ambientLight intensity={0.2} />
    </Canvas>
  );
}
```

## 🎛️ Configuration

### Feature Flags

Edit `public/flags.json`:

```json
{
  "effects.enabled": true,
  "effects.galaxy.enabled": true,
  "effects.portal.enabled": true,
  "effects.morph.enabled": true,
  "effects.galaxy.maxCount": 60000,
  "effects.safeMode": false
}
```

### Query Parameters

- `?safeMode=1` - Enable minimal visuals
- `?quality=low|mid|high` - Force quality tier

## 🧪 Testing

### Play Pre-launch Safe Scene

Visit: `/diagnostics/plr`

This renders a minimal scene suitable for automated testing.

### Quality Tier Testing

- `?quality=low` - Low-end device simulation
- `?quality=mid` - Mid-range device simulation
- `?quality=high` - High-end device simulation

## 📊 Available Routes

- `/premium/effects-demo` - Full effects demo
- `/diagnostics/plr` - Safe scene for Play Pre-launch

## 🐛 Troubleshooting

### Effects not rendering?

1. Check browser console for errors
2. Verify `@react-three/fiber` is installed: `pnpm list @react-three/fiber`
3. Ensure FeatureFlagsProvider wraps your component
4. Check `flags.json` - `effects.enabled` should be `true`

### Performance issues?

1. Enable safe mode: `?safeMode=1`
2. Force low quality: `?quality=low`
3. Reduce particle count in `flags.json`: `"effects.galaxy.maxCount": 30000`

### Type errors?

Run type checking:
```bash
pnpm typecheck
```

## 📚 Documentation

- Full docs: `src/effects/three/README.md`
- Implementation details: `THREE_JS_EFFECTS_IMPLEMENTATION.md`

## ✨ Next Steps

1. **Test the demo**: Visit `/premium/effects-demo`
2. **Integrate**: Add effects to your premium pages
3. **Configure**: Adjust flags in `public/flags.json`
4. **Monitor**: Check performance on different devices

Enjoy your premium Three.js effects! 🎨

