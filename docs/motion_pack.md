# Motion Pack — Design System Reference

**Purpose:** Centralized motion patterns, durations, easings, and utilities for PawfectMatch Mobile  
**Last Updated:** 2025-01-27  
**Status:** ✅ Production-ready

---

## Quick Reference

### Durations (ms)

| Token | Duration | Use Case |
|-------|----------|----------|
| `xfast` | 120ms | Micro-interactions (toggle, ripple) |
| `fast` | 180ms | Press feedback, tab switches |
| `base` | 220ms | Standard press/enter animations |
| `slow` | 300ms | Exit animations, morphs |
| `xslow` | 420ms | Complex transitions, page transitions |

**Usage:**
```tsx
import { motionDurations } from '@/theme/motion';
withTiming(value, { duration: motionDurations.base });
```

### Easings

| Token | Curve | Use Case |
|-------|-------|----------|
| `standard` | `[0.2, 0, 0, 1]` | Default transitions, card movements |
| `emphasized` | `[0.05, 0.7, 0.1, 1]` | Springy feel, bouncy feedback |
| `decel` | `[0, 0, 0.2, 1]` | Enter animations, fade-ins |
| `accel` | `[0.3, 0, 1, 1]` | Exit animations, fade-outs |

**Usage:**
```tsx
import { motionEasing } from '@/theme/motion';
withTiming(value, { 
  duration: motionDurations.base,
  easing: motionEasing.emphasizedArray,
});
```

### Scale Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| `pressed` | 0.98 | Press feedback (all buttons/cards) |
| `lift` | 1.02 | Hover elevation, subtle lift |

**Usage:**
```tsx
import { motionScale } from '@/theme/motion';
scale.value = motionScale.pressed; // On pressIn
scale.value = motionScale.lift; // On hover
```

### Spring Presets

| Preset | Config | Use Case |
|--------|--------|----------|
| `gentle` | `{ tension: 100, friction: 8 }` | Smooth, subtle returns |
| `standard` | `{ tension: 200, friction: 10 }` | Default spring feel |
| `bouncy` | `{ tension: 300, friction: 10 }` | Playful feedback |
| `snappy` | `{ tension: 400, friction: 15 }` | Quick, tight response |

**Usage:**
```tsx
import { motionSpring } from '@/theme/motion';
withSpring(value, motionSpring.bouncy);
```

---

## Motion Patterns

### 1. Press Feedback

**Pattern:** Scale down on pressIn, spring back on pressOut

```tsx
import { Interactive } from '@/components/primitives/Interactive';

// Variants: 'subtle' (default), 'lift', 'ghost'
<Interactive variant="lift" haptic="medium" onPress={handlePress}>
  <Card>...</Card>
</Interactive>
```

**Timing:**
- PressIn: `motionDurations.fast` (180ms) with `motionEasing.decel`
- PressOut: Spring (`motionSpring.standard`)
- Scale: `motionScale.pressed` (0.98)

**Haptic Mapping:**
- `light`: Tabs, cards, secondary actions
- `medium`: Primary confirm buttons
- `success`: Success morph transitions
- `false`: Navigation-only (no haptic)

### 2. Enter/Exit Animations

**Enter (Fade + Slide Up):**
```tsx
const enterAnim = useAnimatedStyle(() => ({
  opacity: withTiming(1, { duration: motionDurations.base }),
  transform: [{ translateY: withTiming(0, { duration: motionDurations.base, easing: motionEasing.decelArray }) }],
}));
```

**Exit (Fade + Slide Down):**
```tsx
const exitAnim = useAnimatedStyle(() => ({
  opacity: withTiming(0, { duration: motionDurations.fast, easing: motionEasing.accelArray }),
  transform: [{ translateY: withTiming(16, { duration: motionDurations.fast }) }],
}));
```

### 3. List Reorder

**Pattern:** Staggered fade-in with slight lift

```tsx
const itemAnim = useAnimatedStyle(() => ({
  opacity: withDelay(index * 50, withTiming(1, { duration: motionDurations.base })),
  transform: [{ translateY: withDelay(index * 50, withSpring(0, motionSpring.gentle)) }],
}));
```

**Stagger Delay:** 50ms per item (max 300ms)

---

## Micro-Interactions Catalog

### Available Components & Hooks

| Component/Hook | File | Use Case |
|----------------|------|----------|
| `Interactive` v2 | `components/primitives/Interactive.tsx` | Unified press feedback |
| `useToggleMorph` | `components/micro/ToggleMorph.tsx` | Icon fill animation (favorite, like) |
| `usePullToRefresh` | `components/micro/PullToRefresh.tsx` | Elastic pull indicator |
| `useSuccessMorph` | `components/micro/SuccessMorph.tsx` | Button → checkmark morph |
| `useShimmer` | `components/micro/PremiumShimmer.tsx` | Premium badge shimmer |
| `useTabChange` | `components/micro/TabChange.tsx` | Tab switch feedback |
| `useDominantColorFade` | `components/micro/DominantColorFade.tsx` | Image fade-in from placeholder |
| `useCardLift` | `components/micro/CardLift.tsx` | Scroll-tied card elevation |

**Export:**
```tsx
import { 
  Interactive,
  useToggleMorph,
  usePullToRefresh,
  useSuccessMorph,
  PremiumShimmer,
  useTabChange,
  DominantColorFadeImage,
  useCardLift,
} from '@/components/micro';
```

---

## Guards & Accessibility

### Reduced Motion

**Hook:**
```tsx
import { usePrefersReducedMotion } from '@/utils/motionGuards';

const prefersReducedMotion = usePrefersReducedMotion();

// Disable animations when reduced motion enabled
const duration = prefersReducedMotion ? 0 : motionDurations.base;
```

**Pattern:**
- Reduced motion → Instant transitions (duration: 0)
- States still visible (opacity changes, no scale/transform)

### Low-End Device Guards

**Hook:**
```tsx
import { isLowEndDevice, useMotionGuards } from '@/utils/motionGuards';

const { isLowEnd, prefersReducedMotion } = useMotionGuards();

// Adaptive duration (30% faster on low-end)
const duration = isLowEnd 
  ? motionDurations.base * 0.7 
  : motionDurations.base;

// Disable heavy effects
const shouldShowShimmer = !isLowEnd && !prefersReducedMotion;
```

---

## Best Practices

### ✅ Do

- Use token durations (`motionDurations.base`) instead of magic numbers
- Apply `Interactive` v2 wrapper for consistent press feedback
- Respect reduced motion preferences
- Use `useSharedValue` + `useAnimatedStyle` for UI thread performance
- Apply haptic feedback only on primary actions

### ❌ Don't

- Hard-code durations (e.g., `duration: 200`)
- Use scale animations when reduced motion is enabled
- Animate on UI thread (use `useAnimatedStyle`)
- Overuse haptics (can cause fatigue)

---

## Examples

### Press Feedback (Card)
```tsx
import { Interactive } from '@/components/primitives/Interactive';

<Interactive variant="lift" haptic="light" onPress={handleCardPress}>
  <Card>
    <Text>Card Content</Text>
  </Card>
</Interactive>
```

### Toggle Animation
```tsx
import { useToggleMorph } from '@/components/micro';

const { animatedStyle, trigger } = useToggleMorph(isFavorite);

<Animated.View style={animatedStyle}>
  <Ionicons name="heart" onPress={trigger} />
</Animated.View>
```

### Success Morph Button
```tsx
import { SuccessMorphButton } from '@/components/micro';

<SuccessMorphButton onPress={handleSubscribe}>
  <Text>Subscribe</Text>
</SuccessMorphButton>
```

### Image Fade-In
```tsx
import { DominantColorFadeImage } from '@/components/micro';

<DominantColorFadeImage
  source={{ uri: imageUrl }}
  dominantColor="#E5E7EB"
  style={styles.image}
/>
```

---

## Performance Targets

- **60fps**: All animations use UI thread (`useAnimatedStyle`)
- **Press latency**: < 16ms (no blocking operations)
- **Adaptive duration**: Low-end devices get 30% faster animations
- **Reduced motion**: Instant transitions when OS preference enabled

---

## Related Files

- `apps/mobile/src/theme/motion.ts` - Motion tokens (source of truth)
- `apps/mobile/src/utils/motionGuards.ts` - Guard utilities
- `apps/mobile/src/components/micro/` - Micro-interaction components
- `apps/mobile/src/components/primitives/Interactive.tsx` - Press feedback wrapper
- `MOTION_IMPLEMENTATION_SUMMARY.md` - Detailed implementation notes

---

**Last Updated:** 2025-01-27  
**Phase:** Phase-3 UI Polish (Component Cohesion)

