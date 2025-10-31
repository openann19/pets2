# Reanimated 3 Worklets Optimization Guide

## Current Status: ✅ Mostly Optimized

After reviewing the codebase, most Reanimated animations are already well-optimized. The `runOnJS` calls found are necessary and in appropriate places.

---

## Optimization Principles

### ✅ Good: runOnJS in Event Handlers
**Location**: `DoubleTapLike.tsx`, `ReactionBarMagnetic.tsx`, `useSwipeGesture.ts`

```typescript
// ✅ GOOD: runOnJS for callbacks in gesture handlers
.onEnd(() => {
  'worklet';
  if (chosen) runOnJS(onSelect)(chosen.emoji);
})

// ✅ GOOD: runOnJS for haptics
runOnJS(triggerHaptic)();
```

**Why**: These are event-driven, not in continuous animation loops. The overhead is acceptable.

---

### ✅ Good: Pure Worklets for Animations
**Location**: Most animation hooks use pure worklets

```typescript
// ✅ GOOD: Pure worklet, no runOnJS
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

---

## Optimization Opportunities

### 1. **Scroll Handlers** (If any exist with runOnJS)
```typescript
// ❌ BAD: runOnJS in scroll handler (called frequently)
onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  {
    listener: (e) => {
      runOnJS(updateState)(e); // Avoid in scroll!
    },
  },
)}

// ✅ GOOD: Use shared values, update state separately
const scrollX = useSharedValue(0);
onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  { useNativeDriver: true },
)}

useAnimatedReaction(
  () => scrollX.value,
  (value) => {
    // This runs on UI thread
    // Update derived values here
  },
);

// Update JS state separately, less frequently
useEffect(() => {
  const interval = setInterval(() => {
    updateState(scrollX.value);
  }, 100); // Throttle updates
}, []);
```

### 2. **Gesture Handlers During Drag** (Already Optimized)
Most gesture handlers correctly use pure worklets for calculations:

```typescript
// ✅ GOOD: Calculation in worklet
.onChange((e) => {
  'worklet';
  x.value += e.changeX; // Pure worklet
  y.value += e.changeY;
})
```

### 3. **Batch runOnJS Calls**
```typescript
// ❌ BAD: Multiple runOnJS calls
.onEnd(() => {
  runOnJS(callback1)();
  runOnJS(callback2)();
  runOnJS(callback3)();
})

// ✅ GOOD: Batch into single call
.onEnd(() => {
  runOnJS(() => {
    callback1();
    callback2();
    callback3();
  })();
})
```

---

## Current Code Analysis

### ✅ Already Optimized Files:
- `DoubleTapLike.tsx` - Uses runOnJS only for callbacks (acceptable)
- `ReactionBarMagnetic.tsx` - Minimal runOnJS usage
- `useSwipeGesture.ts` - Pure worklets for calculations
- Most animation hooks - Pure worklets

### ⚠️ Review Recommended (Low Priority):
- Any scroll-based animations with runOnJS in listeners
- Continuous animations with frequent runOnJS calls

---

## Best Practices

1. **Keep calculations in worklets** ✅ Already doing
2. **Use shared values for state** ✅ Already doing
3. **Minimize runOnJS in hot paths** ✅ Already doing
4. **Batch runOnJS calls** ✅ Can be improved where needed

---

## Conclusion

**Status**: ✅ **Mostly Optimized**

The Reanimated animations are already well-optimized. The `runOnJS` calls found are:
- Necessary for callbacks
- In event handlers (not hot paths)
- Acceptable performance impact

**Recommendation**: No immediate changes needed. Monitor performance metrics, and optimize specific animations if frame drops occur.

---

**Last Updated**: 2025-01-27
