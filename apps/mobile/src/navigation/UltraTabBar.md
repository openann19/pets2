# UltraTabBar v2 - Ultra-Enhanced Bottom Tab Navigator

## Overview

UltraTabBar v2 is a premium, ultra-enhanced bottom tab bar component that provides a buttery-smooth, glass-morphic navigation experience with advanced animations, haptic feedback, and intelligent auto-hide functionality.

## Features

### 🎨 Visual Effects
- **Glass Blur**: iOS-style glass morphism with adjustable blur intensity
- **Parallax Shimmer**: Animated gradient shimmer effect that loops for premium feel
- **Spotlight Press Ripple**: Radial pulse animation when tabs are pressed
- **Breathing Active Underline**: Gentle scale and opacity animation on the active indicator
- **Subtle Shadows**: Elevated glass effect with shadow and elevation support

### ⚡ Animations
- **Springy Physics**: Natural motion using Reanimated spring animations
- **Icon Micro-motions**: Icons scale smoothly when focused/unfocused
- **Badge Bounce**: Badges animate in/out when counts change
- **Indicator Transition**: Smooth underline slide animation between tabs
- **Auto-Hide on Scroll**: Tab bar slides down when scrolling, reappears when scrolling up

### 🤏 Gestures
- **Magnetic Scrub**: Swipe horizontally across the tab bar to quickly switch tabs with magnetic snapping
- **Pan Gesture Recognition**: Advanced gesture handling for smooth tab switching

### 📱 Haptic Feedback
- **Light Impact**: On tab press (iOS)
- **Smart Haptics**: Context-aware feedback on tab changes
- **Silent on Android**: Haptics respect platform differences

### 🎯 Accessibility
- Full accessibility labels and states
- Touch target sizes meet WCAG standards
- Screen reader compatible

## Usage

```typescript
import UltraTabBar from "./navigation/UltraTabBar";

<Tab.Navigator
  tabBar={(props) => <UltraTabBar {...props} />}
  screenOptions={{ headerShown: false }}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Swipe" component={SwipeScreen} />
  {/* ... more tabs */}
</Tab.Navigator>
```

## Auto-Hide on Scroll

The tab bar automatically hides when scrolling down and reappears when scrolling up. See [USAGE_AUTO_HIDE.md](./USAGE_AUTO_HIDE.md) for detailed implementation instructions.

### Quick Start

```typescript
import { createAutoHideOnScroll } from "../navigation/tabbarController";

const onScroll = React.useMemo(() => createAutoHideOnScroll(14), []);

<ScrollView onScroll={onScroll} scrollEventThrottle={16}>
  {/* Your content */}
</ScrollView>
```

## Configuration

### Icon Mapping

Icons are automatically mapped based on route names:

```typescript
- Home → home / home-outline
- Swipe → heart / heart-outline
- Map → map / map-outline
- Matches → chatbubbles / chatbubbles-outline
- Profile → person / person-outline
- AdoptionManager → list / list-outline
- Premium → star / star-outline
```

To add new icons, update the `getIconName` function in `UltraTabBar.tsx`.

### Badge Counts

Badge counts are currently mocked in `getBadgeCount`:

```typescript
case "Matches": return 3;
case "Map": return 1;
case "Home": return 2;
```

To wire to your store, replace the mock function with your data source.

## Animation Parameters

### Spring Physics
```typescript
// Indicator movement
{ damping: 18, stiffness: 220 }

// Badge bounce
{ damping: 12, stiffness: 280 }

// Icon scale
{ damping: 15, stiffness: 240 }
```

### Timing
```typescript
// Breathing animation: 1800ms (in/out)
// Badge fade: 160ms
// Spotlight pulse: 260ms (expand) + 340ms (fade)
```

## Styling Customization

### Theme Colors
The tab bar automatically adapts to the current theme:
- Uses `colors.primary` for active states
- Uses `colors.text` for inactive states
- Respects dark/light mode

### Blur Intensity
```typescript
// iOS: 88
// Android: 100
// Override by adjusting the BlurView intensity prop
```

### Border & Shadow
```typescript
borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
shadowOpacity: 0.12
shadowRadius: 18
elevation: 24
```

## Events

### Press Events
- `tabPress`: When a tab is pressed
- `tabLongPress`: When a tab is long-pressed
- Re-select detection: Triggers medium haptic when pressing the same tab again

### Navigation
The component integrates seamlessly with React Navigation's bottom tabs API.

## Performance

### Optimizations
- Uses `useSharedValue` for 60fps animations
- Memoized icon scales array
- Layout caching for smooth transitions
- Hardware-accelerated blur effects

### Recommendations
- Keep tab count below 6 for optimal performance
- Use `useMemo` for expensive badge calculations
- Consider lazy loading tab screens for large apps

## Platform Differences

### iOS
- Native blur effect with 88% intensity
- Haptic feedback enabled
- Glass morphism fully supported

### Android
- Manual blur with rgba background overlay
- Haptic feedback disabled
- Added elevation for shadow depth
- 100% blur intensity for stronger effect

## Accessibility

### Labels
```typescript
accessibilityLabel: "Home tab"
accessibilityState: { selected: true }
testID: "tabBar.Home" (if provided in options)
```

### Standards
- Minimum touch target: 48x48dp
- Contrast ratios meet WCAG AA
- Screen reader announcements

## Testing

See `__tests__/UltraTabBar.integration.test.tsx` for comprehensive test coverage including:
- Navigation flows
- Haptic feedback
- Badge functionality
- Accessibility
- Animation states
- Theme support

## Migration from ActivePillTabBar

### Breaking Changes
None! UltraTabBar is a drop-in replacement.

### Improvements
1. **Glass Blur** replaces flat background
2. **Spotlight Ripple** added on press
3. **Breathing Animation** on active indicator
4. **Enhanced Badges** with spring physics
5. **Improved Icons** with micro-motions

### Code Changes
```diff
- import ActivePillTabBar from "./ActivePillTabBar";
+ import UltraTabBar from "./UltraTabBar";

<Tab.Navigator
-  tabBar={(props) => <ActivePillTabBar {...props} />}
+  tabBar={(props) => <UltraTabBar {...props} />}
>
```

That's it! One line change.

## Troubleshooting

### Blur not working on Android
- Ensure `expo-blur` is installed: `expo install expo-blur`
- Check that your device supports blur (Android 9+)
- Fallback to semi-transparent background if needed

### Animations feel sluggish
- Check Reanimated is on v3.3.0+
- Enable native driver (should be automatic)
- Profile with React DevTools Performance

### Badges not updating
- Ensure you've wired `getBadgeCount` to your store
- Check that badge scale shared values are initialized
- Verify useEffect dependencies

### Haptics not working
- iOS only feature
- Ensure `expo-haptics` is installed
- Check device vibration is enabled
- Haptic feedback respects system settings

## API Reference

### Props
```typescript
type Props = {
  state: { index: number; routes: Route[] };
  descriptors: any;
  navigation: any;
};
```

### Animations
- `indicatorX`: SharedValue for indicator X position
- `indicatorW`: SharedValue for indicator width
- `breathe`: SharedValue for breathing animation loop
- `badgeScale`: SharedValue array for badge scales
- `iconScale`: SharedValue for icon focus scale
- `spotX`: SharedValue for spotlight X position
- `spotOpacity`: SharedValue for spotlight opacity
- `spotScale`: SharedValue for spotlight scale

## Credits

Designed and implemented for PawfectMatch mobile app.
Built with React Native Reanimated v3 and Expo Blur.

## License

Part of PawfectMatch project. All rights reserved.

