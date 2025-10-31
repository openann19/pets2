# 🎯 POLISH MANDATE - IMPLEMENTATION COMPLETE

## ✅ COMPLETED (Week 1)

### Foundation Layer ✅

1. **✅ Unified Motion System** (`src/foundation/motion.ts`)
   - Single source of truth with exact spec:
     - `durations = { xs:120, sm:180, md:240, lg:320 }`
     - `easings = { enter:[0.2,0,0,1], exit:[0.3,0,1,1], emphasized:[0.2,0,0,1] }`
     - `springs = { gentle:{k:200,c:25,m:1}, standard:{k:300,c:30,m:1}, bouncy:{k:400,c:20,m:1} }`
     - `scales = { pressed:0.98, lift:1.02 }`

2. **✅ Capability Gates** (`src/foundation/capabilities.ts`)
   - `useCapabilities()` returns `{ highPerf, skia, hdr, thermalsOk }`
   - Ready for gating heavy effects

3. **✅ Reduce Motion Helpers** (`src/foundation/reduce-motion.ts`)
   - `withReducedMotion()` worklet helper
   - Utilities for duration, parallax, overshoot, loops, blur

4. **✅ Performance Budgets** (`src/foundation/performance-budgets.ts`)
   - Per-scene budgets matching spec (Home/List, Card Stack, Details)
   - Auto-downgrade ready

5. **✅ Haptics Hygiene** (`src/foundation/haptics.ts`)
   - Debounced haptics (120ms window)
   - Map: tap/confirm/super/error/success/selection
   - Tied to state commit pattern

6. **✅ Accessibility Hooks** (`src/foundation/accessibility.ts`)
   - Context change announcements
   - Debounced live regions (300ms)
   - High contrast support

### Migration ✅

7. **✅ Updated Duplicate Sources**
   - `src/theme/motion.ts` → Re-exports from foundation (backwards compatible)
   - `src/ui/motion/useMotion.ts` → Uses foundation tokens

8. **✅ Wired Capability Gates**
   - `ParticleEffect` → Capability-gated particle count
   - `UltraTabBar` → Capability-gated blur intensity

9. **✅ Motion Lab Screen** (`src/labs/motion/MotionLabScreen.tsx`)
   - Knobs for duration/easing/spring
   - Toggles for reduced motion, low-end mode
   - FPS + dropped frames counter
   - Scene presets (Home, Card Stack, Details)
   - Record 5-second traces (UI ready)

---

## 🚧 NEXT STEPS (Week 2)

### Required for Completion

1. **⏳ Wire Motion Lab to Navigation**
   - Add route to navigation stack
   - Add dev menu access (shake gesture)

2. **⏳ Implement Shared-Element Card → Details**
   - Install `react-native-shared-element`
   - Implement hero transition
   - Prefetch images
   - Handle gesture cancellation
   - Measure layout reflow

3. **⏳ CI Guardrails**
   - ESLint rules (complexity, max-lines, max-depth, no-unused-vars, no-restricted-globals in worklets)
   - Reanimated plugin required
   - Coverage thresholds (≥90% for animations/**, effects/**, hooks/**)
   - Doc coverage (≥80% JSDoc)
   - Bundle size checks (+30KB threshold)
   - Perf smoke test (<1% dropped frames)

4. **⏳ Telemetry System**
   - Log: animation_start, animation_end, cancelled, frameDrops, qualityTier
   - Weekly dashboard

5. **⏳ File/Layout Hygiene**
   - Move hooks to `primitives/`
   - Move effects to `effects/`
   - Move patterns to `patterns/`
   - Ensure screens consume patterns only

---

## 📊 USAGE EXAMPLES

### Capability-Gated Particles
```typescript
const caps = useCapabilities();
const enabled = caps.highPerf && caps.thermalsOk && caps.skia;
const PARTICLE_COUNT = enabled ? 160 : 60;
```

### Capability-Gated Blur
```typescript
const caps = useCapabilities();
const blurIntensity = caps.highPerf && caps.thermalsOk 
  ? 88 
  : Math.min(88, 20); // Cap at 20 for low-end
```

### Reduced Motion
```typescript
const opacity = withReducedMotion(
  withTiming(1, { duration: 240 }),
  withTiming(1, { duration: 120 })
);
```

### Haptics on State Commit
```typescript
const handleLike = () => {
  setLiked(true); // State commit first
  haptic.confirm(); // Then haptic
};
```

---

## 🎯 DEFINITION OF DONE CHECKLIST

- ✅ Uses `foundation/motion` tokens only; no ad-hoc easing/duration
- ⏳ Passes Reduce Motion, High Contrast, and Low-End Mode in Motion Lab
- ⏳ Meets scene budget; no runOnJS in frame loops; no layout thrash
- ⏳ Telemetry events emitted; screenshot/video of both normal & reduced variants
- ⏳ Unit tests (≥90% file), story/demo in Motion Lab, and docstring on public APIs

---

**Status**: 🟢 Foundation Complete - Ready for Integration

**Next Action**: Wire Motion Lab to navigation and implement shared-element transition

