# Performance Guards Reference

**Purpose:** Utilities for respecting reduced motion and low-end device constraints  
**Location:** `apps/mobile/src/utils/motionGuards.ts`  
**Last Updated:** 2025-01-27

---

## Overview

Performance guards ensure that animations and heavy effects respect:
1. **Reduced Motion** - User's OS preference for reduced motion
2. **Low-End Devices** - Automatic detection and adaptive performance

---

## Available Utilities

### Hooks

#### `usePrefersReducedMotion(): boolean`
Checks if user has reduced motion enabled in system settings.

```tsx
import { usePrefersReducedMotion } from '@/utils/motionGuards';

const prefersReducedMotion = usePrefersReducedMotion();
if (prefersReducedMotion) {
  // Skip animations or use instant transitions
}
```

#### `useIsLowEndDevice(): boolean`
Checks if current device is low-end (uses PerfManager singleton).

```tsx
import { useIsLowEndDevice } from '@/utils/motionGuards';

const isLowEnd = useIsLowEndDevice();
if (isLowEnd) {
  // Reduce particle count, disable heavy effects
}
```

#### `useMotionGuards()`
Combined hook returning all guard states and adaptive helpers.

```tsx
import { useMotionGuards } from '@/utils/motionGuards';

const { 
  reducedMotion, 
  lowEnd, 
  shouldAnimate, 
  shouldSkipHeavy,
  getAdaptiveDuration,
  getAdaptiveParticleCount 
} = useMotionGuards();

// Adaptive duration (30% faster on low-end, instant if reduced motion)
const duration = getAdaptiveDuration(motionDurations.base);

// Adaptive particle count (30% on low-end)
const particles = getAdaptiveParticleCount(20);
```

### Functions

#### `shouldSkipHeavyEffects(reducedMotion: boolean, lowEnd: boolean): boolean`
Returns `true` if heavy effects should be skipped (confetti, complex blur, particles).

```tsx
import { shouldSkipHeavyEffects, usePrefersReducedMotion, useIsLowEndDevice } from '@/utils/motionGuards';

const reducedMotion = usePrefersReducedMotion();
const lowEnd = useIsLowEndDevice();

if (shouldSkipHeavyEffects(reducedMotion, lowEnd)) {
  // Skip heavy effects
  return <SimpleView />;
}
```

#### `getAdaptiveParticleCount(maxCount: number, lowEnd: boolean): number`
Reduces particle count on low-end devices (30% of max, minimum 3).

```tsx
const particles = getAdaptiveParticleCount(20, isLowEnd);
// Returns: 20 on normal devices, 6 on low-end (20 * 0.3)
```

---

## Usage Examples

### Example 1: Conditional Animation

```tsx
import { useMotionGuards } from '@/utils/motionGuards';
import { motionDurations } from '@/theme/motion';

function MyComponent() {
  const { shouldAnimate, getAdaptiveDuration } = useMotionGuards();
  
  const duration = shouldAnimate 
    ? getAdaptiveDuration(motionDurations.base) 
    : 0; // Instant if reduced motion
  
  return (
    <Animated.View
      style={withTiming(animatedStyle, { duration })}
    >
      {/* Content */}
    </Animated.View>
  );
}
```

### Example 2: Heavy Effects Guard

```tsx
import { useMotionGuards } from '@/utils/motionGuards';

function ConfettiButton() {
  const { shouldSkipHeavy } = useMotionGuards();
  
  const handlePress = () => {
    if (shouldSkipHeavy) {
      // Simple color change instead
      return;
    }
    
    // Full confetti effect
    triggerConfetti();
  };
  
  return <Button onPress={handlePress} />;
}
```

### Example 3: Adaptive Particle Count

```tsx
import { useMotionGuards } from '@/utils/motionGuards';

function ParticleEffect() {
  const { getAdaptiveParticleCount, lowEnd } = useMotionGuards();
  
  const particleCount = getAdaptiveParticleCount(30);
  // Returns: 30 on normal, 9 on low-end (30 * 0.3)
  
  return <ParticleSystem count={particleCount} />;
}
```

---

## Device Detection

**PerfManager** (`apps/mobile/src/utils/PerfManager.ts`) detects low-end devices using:

### iOS
- Device model (iPhone 8 and below)
- Total memory (< 2GB)

### Android
- Total memory (< 3GB)
- Device brand/model (Moto, Galaxy A/J, Redmi, POCO)

### Web
- Navigator.deviceMemory (< 4GB)
- Navigator.hardwareConcurrency (< 4 cores)

---

## Best Practices

### ✅ Do

- Always check `shouldSkipHeavy` before heavy effects
- Use `getAdaptiveDuration` for animation durations
- Use `getAdaptiveParticleCount` for particle effects
- Respect `reducedMotion` for all animations

### ❌ Don't

- Hard-code animation durations
- Ignore reduced motion preference
- Use heavy effects without guards
- Assume all devices can handle high particle counts

---

## Integration with Motion Tokens

Performance guards work seamlessly with motion tokens:

```tsx
import { motionDurations } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

const { getAdaptiveDuration } = useMotionGuards();

// Base duration from tokens
const baseDuration = motionDurations.base; // 220ms

// Adaptive duration (respects guards)
const duration = getAdaptiveDuration(baseDuration);
// Returns: 220ms (normal), 154ms (low-end), 0ms (reduced motion)
```

---

## Related Files

- `apps/mobile/src/utils/PerfManager.ts` - Device detection
- `apps/mobile/src/hooks/useReducedMotion.ts` - Reduced motion hook
- `apps/mobile/src/theme/motion.ts` - Motion tokens
- `apps/mobile/src/components/primitives/Interactive.tsx` - Uses guards internally

---

**Last Updated:** 2025-01-27  
**Phase:** Phase-3 UI Polish (Performance Guards)

