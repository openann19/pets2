# 🎯 POLISH MANDATE IMPLEMENTATION STATUS

## ✅ COMPLETED (Week 1)

### 1. ✅ Unified Motion System (`src/foundation/motion.ts`)

**Created**: Single source of truth for all motion tokens

**Exports**:
- `durations = { xs:120, sm:180, md:240, lg:320 }`
- `easings = { enter:[0.2,0,0,1], exit:[0.3,0,1,1], emphasized:[0.2,0,0,1] }`
- `springs = { gentle:{k:200,c:25,m:1}, standard:{k:300,c:30,m:1}, bouncy:{k:400,c:20,m:1} }`
- `scales = { pressed:0.98, lift:1.02 }`

**Status**: ✅ Complete - All hooks/components must import from `foundation/motion` only

**Next Steps**: 
- [ ] Delete duplicate token sources (`src/theme/motion.ts`, `src/ui/motion/useMotion.ts`, etc.)
- [ ] Update all imports to use `foundation/motion`
- [ ] Add ESLint rule to prevent token redefinition

---

### 2. ✅ Capability Gates (`src/foundation/capabilities.ts`)

**Created**: `useCapabilities()` hook returning:

```typescript
type Caps = {
  highPerf: boolean;      // >=120Hz or recent A/B-series / Snapdragon 8+
  skia: boolean;          // react-native-skia available
  hdr: boolean;           // HDR/P3 color support
  thermalsOk: boolean;    // Starts true, flips off on sustained frame drops
};
```

**Status**: ✅ Complete

**Next Steps**:
- [ ] Wire capability gates to particles/blur/shaders
- [ ] Integrate frame drop monitoring for `thermalsOk`
- [ ] Add device tier detection using `react-native-device-info`

---

### 3. ✅ Reduce Motion Helpers (`src/foundation/reduce-motion.ts`)

**Created**: `withReducedMotion()` helper and utilities

**Features**:
- ✅ Cut durations by 50%
- ✅ Remove parallax/overshoot/loops
- ✅ Replace blur>10 with opacity
- ✅ Worklet-safe implementation

**Status**: ✅ Complete

**Next Steps**:
- [ ] Apply to all animations/components
- [ ] Create reduced demo clips for each feature (DoD requirement)

---

### 4. ✅ Performance Budgets (`src/foundation/performance-budgets.ts`)

**Created**: Per-scene budgets matching spec exactly

**Budgets**:
- **Home/List**: ≤ 1 blur (≤10), ≤ 150 particles, ≤ 2 shadows per item
- **Card Stack**: ≤ 2 overlapping blurs, ≤ 60ms transition setup, 0 runOnJS in hot path
- **Details**: textures ≤ 2048px on mid-tier Android

**Status**: ✅ Complete

**Next Steps**:
- [ ] Auto-downgrade via capability gates when budgets exceeded
- [ ] Add runtime budget validation

---

### 5. ✅ Haptics Hygiene (`src/foundation/haptics.ts`)

**Created**: Haptic system with debouncing

**Features**:
- ✅ Map: tap=light, confirm=medium, super=heavy, error=error, success=success, selection=selection
- ✅ Never fire haptics > 1 per 120ms window
- ✅ Tie to state commit, not gesture start

**Status**: ✅ Complete

**Next Steps**:
- [ ] Replace all existing haptic calls
- [ ] Ensure haptics fire on state commit

---

### 6. ✅ Accessibility Hooks (`src/foundation/accessibility.ts`)

**Created**: Accessibility utilities

**Features**:
- ✅ Announce context changes (screen transitions, modal open/close)
- ✅ Progress components: live region updates every ≥300ms (debounced)
- ✅ High contrast mode variant for shimmer/placeholder

**Status**: ✅ Complete

**Next Steps**:
- [ ] Wire to screen transitions
- [ ] Apply to progress components
- [ ] Implement high contrast color variants

---

## 🚧 IN PROGRESS (Week 1-2)

### 7. ⏳ Shared-Element Playbook

**Status**: ⏳ Not Started

**Requirements**:
- ✅ Implement one hero: Card → Details
- ✅ Rules: prefetch destination image; cancel transition cleanly on back swipe; no list virtualization pop-in; measure success as "no layout reflow" (+/- 1px)
- ✅ Add regression demo in "Motion Lab"

**Next Steps**:
- [ ] Install `react-native-shared-element`
- [ ] Implement Card → Details transition
- [ ] Add image prefetching
- [ ] Handle gesture cancellation
- [ ] Measure layout reflow

---

### 8. ⏳ Motion Lab (`src/labs/motion/`)

**Status**: ⏳ Not Started

**Requirements**:
- ✅ `/labs/motion`: knobs for duration/easing/spring
- ✅ Toggles for reduced motion, low-end mode
- ✅ FPS + dropped frames counter
- ✅ Record 5-second traces
- ✅ Include presets to load real UI scenes (Home, Card Stack, Details)

**Next Steps**:
- [ ] Create Motion Lab screen
- [ ] Add performance monitoring
- [ ] Add FPS counter
- [ ] Add scene presets
- [ ] Add trace recording

---

### 9. ⏳ CI Guardrails

**Status**: ⏳ Not Started

**Requirements**:
- ✅ ESLint rules (complexity, max-lines, max-depth, no-unused-vars, no-restricted-globals in worklets)
- ✅ Reanimated plugin required
- ✅ Unit/integration coverage: ≥90% for animations/**, effects/**, hooks/**
- ✅ Doc coverage: ≥80% JSDoc on exported symbols
- ✅ Bundle check: fail if animated bundles > +30KB from baseline
- ✅ Perf smoke test: <1% dropped frames on iPhone 12 / Pixel 6

**Next Steps**:
- [ ] Configure ESLint rules
- [ ] Set up coverage thresholds
- [ ] Add bundle size checks
- [ ] Create perf smoke test script

---

### 10. ⏳ Telemetry

**Status**: ⏳ Not Started

**Requirements**:
- ✅ Log: animation_start, animation_end, cancelled, frameDrops, qualityTier
- ✅ Weekly dashboard: 99th percentile frame time, cancel rate, time-to-interactive for Card→Details

**Next Steps**:
- [ ] Create telemetry system
- [ ] Add animation tracking
- [ ] Create dashboard

---

## 📋 PENDING (Week 2+)

### 11. File/Layout Hygiene

**Status**: ⏳ Structure Created

**Required Structure**:
```
src/
  foundation/        // ✅ tokens, capabilities, a11y helpers
  primitives/        // ⏳ low-level hooks: useSpring, useStaggered, useTransform
  effects/           // ⏳ skia: particles, shaders, glass
  patterns/          // ⏳ FadeInView, TiltCard, ParallaxScroll
  features/          // ⏳ screen-level usage; no raw reanimated here
  labs/motion/       // ⏳ Motion Lab screen + fixtures
```

**Next Steps**:
- [ ] Move existing hooks to `primitives/`
- [ ] Move effects to `effects/`
- [ ] Move patterns to `patterns/`
- [ ] Ensure screens consume patterns only

---

### 12. Micro-Polish Checklists

**Status**: ⏳ Not Started

**Requirements**:
- ✅ Entrance ≤ 240ms; exit ≤ 180ms; only one emphasized curve per transition
- ✅ Press states: scale to 0.98 within 60–90ms, opacity to 0.92; release spring to 1.0 (standard)
- ✅ Shadows: max 2 "glow" layers; clamp shadow radius on Android to avoid jank
- ✅ Shimmer: opacity 0.14–0.22, 1200–1600ms sweep; disable in reduced motion
- ✅ Particles: fade-out before removal; never allocate in render; pull from pool

**Next Steps**:
- [ ] Audit all components against checklists
- [ ] Fix violations
- [ ] Add automated checks

---

## 🎯 DEFINITION OF DONE (per PR)

**Every motion PR must include**:

- ✅ Uses `foundation/motion` tokens only; no ad-hoc easing/duration
- ✅ Passes Reduce Motion, High Contrast, and Low-End Mode in Motion Lab
- ✅ Meets scene budget; no runOnJS in frame loops; no layout thrash
- ✅ Telemetry events emitted; screenshot/video of both normal & reduced variants
- ✅ Unit tests (≥90% file), story/demo in Motion Lab, and docstring on public APIs

---

## 📝 MIGRATION CHECKLIST

### Phase 1: Foundation (Week 1)
- [x] Create `foundation/motion.ts` with unified tokens
- [x] Create `foundation/capabilities.ts`
- [x] Create `foundation/performance-budgets.ts`
- [x] Create `foundation/reduce-motion.ts`
- [x] Create `foundation/haptics.ts`
- [x] Create `foundation/accessibility.ts`
- [ ] Delete duplicate token sources
- [ ] Update all imports

### Phase 2: Implementation (Week 2)
- [ ] Wire capability gates to effects
- [ ] Apply reduce motion everywhere
- [ ] Implement shared-element Card → Details
- [ ] Create Motion Lab
- [ ] Set up CI guardrails

### Phase 3: Polish (Week 3+)
- [ ] Micro-polish checklists
- [ ] Telemetry integration
- [ ] File/layout hygiene
- [ ] Documentation

---

**Status**: 🟢 Foundation Complete - Ready for Migration

**Next Action**: Delete duplicate token sources and update imports

