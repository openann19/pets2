# Micro-UX Components

Premium micro-interaction components that make your app feel ultra-responsive and polished.

## Overview

These lightweight components add that "jaw-dropping" factor through:
- **Buttery haptics** on every meaningful interaction
- **Ripple + scale animations** for visual feedback
- **Shimmer loading** for graceful image placeholders
- **Parallax tilt effects** for premium card interactions

## Components

### MicroPressable

A drop-in replacement for `TouchableOpacity` or `Pressable` with ripple effects and haptic feedback.

```tsx
import MicroPressable from '../components/micro/MicroPressable';

<MicroPressable
  onPress={handlePress}
  rippleColor="rgba(236,72,153,0.35)" // Theme.colors.primary[500] with opacity
  haptics={true}
  scaleFrom={0.98}
>
  <YourContent />
</MicroPressable>
```

**Props:**
- `children` - React.ReactNode
- `onPress` - () => void | Promise<void>
- `style?` - ViewStyle | ViewStyle[]
- `disabled?` - boolean
- `rippleColor?` - string (default: `"rgba(236,72,153,0.35)"`)
- `haptics?` - boolean (default: true)
- `scaleFrom?` - number (default: 0.98)

### HapticSwitch

Animated switch with haptic feedback and pulse animation on state change.

```tsx
import HapticSwitch from '../components/micro/HapticSwitch';

<HapticSwitch
  value={enabled}
  onValueChange={setEnabled}
  disabled={false}
/>
```

**Props:**
- `value` - boolean
- `onValueChange` - (v: boolean) => void
- `disabled?` - boolean

### Shimmer

Skeleton loader with animated shimmer effect for loading states.

```tsx
import Shimmer from '../components/micro/Shimmer';

<Shimmer width={200} height={150} radius={12} />
```

**Props:**
- `width?` - number (default: full width if not specified)
- `height?` - number (default: 16)
- `radius?` - number (default: 8)

### SmartImage (Enhanced)

Enhanced image component with optional shimmer loading and graceful fade-in.

```tsx
import { SmartImage } from '../components/common/SmartImage';

// With shimmer loading
<SmartImage
  source={{ uri: imageUrl }}
  useShimmer={true}
  rounded={12}
/>

// Standard with blur placeholder
<SmartImage
  source={{ uri: imageUrl }}
  previewBlurRadius={16}
/>
```

**New Props:**
- `useShimmer?` - boolean (use shimmer instead of blur placeholder)
- `rounded?` - number (border radius, default: 12)
- `onError?` - callback for error handling

### ParallaxCard

Tilting/parallax effect for cards that works seamlessly with swipe gestures.

```tsx
import ParallaxCard from '../components/micro/ParallaxCard';

<ParallaxCard intensity={0.6} glow={true}>
  <YourCardContent />
</ParallaxCard>
```

**Props:**
- `children` - React.ReactNode
- `style?` - ViewStyle | ViewStyle[]
- `intensity?` - number (0-1, default: 0.6)
- `glow?` - boolean (default: true)

## Usage Patterns

### Replace TouchableOpacity

```tsx
// Before
<TouchableOpacity onPress={handlePress}>
  <Text>Button</Text>
</TouchableOpacity>

// After
<MicroPressable onPress={handlePress}>
  <Text>Button</Text>
</MicroPressable>
```

### Replace Native Switch

```tsx
// Before
<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: '#gray', true: '#pink' }}
  thumbColor={enabled ? '#primary' : '#gray'}
/>

// After
<HapticSwitch
  value={enabled}
  onValueChange={setEnabled}
/>
```

### Add Shimmer to Images

```tsx
// Before
<Image source={{ uri }} />

// After
<SmartImage source={{ uri }} useShimmer rounded={12} />
```

## Integration Checklist

✅ Replace `Switch` → `HapticSwitch` for haptic feedback
✅ Replace `TouchableOpacity` → `MicroPressable` for ripple effects
✅ Add `useShimmer` to image loads for graceful loading
✅ Wrap top swipe cards with `ParallaxCard` for premium feel
✅ Fix all Theme string literals (e.g., `"Theme.colors.primary[500]"` → `Theme.colors.primary[500]`)

## Performance

- **Zero impact** on bundle size (uses existing dependencies)
- **60fps animations** via react-native-reanimated
- **Smart haptic cooldowns** to prevent over-triggering
- **Memoized components** for optimal re-renders

## Theming

All components respect the unified Theme system:
- Colors from `Theme.colors`
- Radius from `Theme.borderRadius`
- Haptic intensities tuned for common UX patterns

## Migration Example

See `apps/mobile/src/screens/ProfileScreen.tsx` for a complete integration example:
- Switch replacements
- MicroPressable integration
- Proper haptic timing

## Notes

- **ParallaxCard** doesn't interfere with swipe gestures - it only tilts on press
- **Shimmer** loops continuously - use sparingly for loading states
- **MicroPressable** adds ~2KB per usage - consider memoization for lists
- All haptics respect system preferences automatically
