# Auto-Hide Tab Bar Usage

The Ultra Tab Bar now supports automatic hiding on scroll for a more immersive
experience.

## Features

- **Auto-hide on scroll**: Tab bar slides down when scrolling down, reappears
  when scrolling up
- **Magnetic scrub**: Swipe horizontally across the tab bar to quickly switch
  tabs
- **Parallax shimmer**: Beautiful glass effect with animated shimmer
- **Spotlight ripples**: Visual feedback when pressing tabs
- **Breathing underline**: Animated indicator that "breathes" for the active tab
- **Haptic feedback**: iOS-optimized haptic feedback on interactions

## Implementation

### 1. Enable Auto-Hide in Screen Components

Use `createAutoHideOnScroll` in any screen with a ScrollView or FlatList:

```typescript
import React from 'react';
import { ScrollView } from 'react-native';
import { createAutoHideOnScroll } from '../navigation/tabbarController';

export default function MyScreen() {
  // Create the scroll handler with threshold (optional, defaults to 16)
  const onScroll = React.useMemo(() => createAutoHideOnScroll(14), []);

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}  // Important: throttle for smooth performance
    >
      {/* Your content */}
    </ScrollView>
  );
}
```

### 2. For FlatList

```typescript
import React from 'react';
import { FlatList } from 'react-native';
import { createAutoHideOnScroll } from '../navigation/tabbarController';

export default function MyListScreen() {
  const onScroll = React.useMemo(() => createAutoHideOnScroll(14), []);

  return (
    <FlatList
      data={myData}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}
```

### 3. Custom Threshold

Adjust the threshold to control sensitivity:

```typescript
// Hide/show requires 20px scroll
const onScroll = React.useMemo(() => createAutoHideOnScroll(20), []);

// Very sensitive, hides/shows after 8px
const onScroll = React.useMemo(() => createAutoHideOnScroll(8), []);
```

### 4. Magnetic Scrub Gesture

Simply swipe horizontally across the tab bar to smoothly switch tabs with
magnetic snapping. The active indicator follows your finger.

### 5. Disable Auto-Hide for Specific Screens

If a screen should not trigger auto-hide (e.g., a full-screen modal), simply
don't add the `onScroll` prop to your ScrollView/FlatList.

## Technical Details

- The tab bar slides down by 84px when hidden
- Animation duration: 280ms with cubic easing
- Shimmer effect loops every 6 seconds
- Badge animations spring with custom damping for natural motion
- Spotlight ripples expand from tap point and fade out

## Best Practices

1. Always set `scrollEventThrottle={16}` when using auto-hide for smooth
   animations
2. Use `React.useMemo` to prevent re-creating the handler on every render
3. Keep default threshold (16px) unless you have specific UX requirements
4. Test haptic feedback on physical devices for best results

## Example Screens to Update

Consider adding auto-hide to:

- `HomeScreen` - News feed scroll
- `SwipeScreen` - Card stack navigation (if applicable)
- `MatchesScreen` - Chat list scroll
- `MapScreen` - Location list scroll
- `ProfileScreen` - Settings scroll
