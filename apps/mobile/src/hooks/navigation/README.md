# Tab Reselect & Refresh Hooks

Smart tab bar interactions with intelligent scroll-to-top and refresh behavior.

## Features

✨ **Smart Reselect Behavior**

- Single tap when far from top → scroll to top
- Single tap when near top → refresh content
- Double tap → always scroll to top + refresh

✨ **Visual Feedback**

- Icon pulse animation on reselect
- Ripple effect on double tap
- Haptic feedback for all interactions

✨ **Zero Configuration**

- Works with any ScrollView, FlatList, or SectionList
- Automatic cooldown to prevent spam
- Configurable thresholds per screen

## Quick Start

```tsx
import {
  useScrollOffsetTracker,
  useTabReselectRefresh,
} from '../hooks/navigation';

function MyScreen() {
  const listRef = useRef<FlatList>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  useTabReselectRefresh({
    listRef,
    onRefresh,
    getOffset,
    topThreshold: 120, // pixels before scrolling instead of refreshing
    cooldownMs: 700, // prevent spam
  });

  return (
    <FlatList
      ref={listRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      // ... other props
    />
  );
}
```

## API Reference

### `useScrollOffsetTracker()`

Tracks the current scroll offset.

**Returns:**

- `onScroll` - Handler to pass to scroll components
- `getOffset` - Function that returns current Y offset

### `useTabReselectRefresh(options)`

Main hook that handles tab reselect/refresh logic.

**Options:**

- `listRef` _(required)_ - Ref to your scrollable component (ScrollView,
  FlatList, etc.)
- `onRefresh` _(required)_ - Callback when refresh should occur
- `getOffset` _(optional)_ - Function to get current offset (from tracker)
- `topThreshold` _(optional)_ - Default: 120px. Distance from top that
  determines behavior
- `cooldownMs` _(optional)_ - Default: 700ms. Cooldown between triggers
- `haptics` _(optional)_ - Default: true. Enable haptic feedback
- `nearTopAction` _(optional)_ - Default: "refresh". What to do when near top:
  "refresh" or "none"

## Usage by Screen Type

### FlatList

```tsx
const { onScroll, getOffset } = useScrollOffsetTracker();

useTabReselectRefresh({
  listRef,
  onRefresh: () => refetch(),
  getOffset,
});

<FlatList
  ref={listRef}
  onScroll={onScroll}
  scrollEventThrottle={16}
  data={items}
  renderItem={...}
/>
```

### ScrollView

```tsx
const { onScroll, getOffset } = useScrollOffsetTracker();

useTabReselectRefresh({
  listRef: scrollRef,
  onRefresh: refreshFunction,
  getOffset,
});

<ScrollView
  ref={scrollRef}
  onScroll={onScroll}
  scrollEventThrottle={16}
  children={...}
/>
```

### Custom Behavior (Map Screen)

MapScreen has special behavior (center on location), so it uses the old
`useTabDoublePress`:

```tsx
useTabDoublePress(() => {
  getCurrentLocation();
});
```

## Implemented Screens

✅ **Matches** - FlatList, threshold: 120px  
✅ **Community** - FlatList, threshold: 100px  
✅ **Leaderboard** - ScrollView, threshold: 80px  
✅ **Home** - ScrollView, threshold: 100px  
✅ **Profile** - ScrollView, threshold: 100px (scroll only, no refresh)

## How It Works

1. **EnhancedTabBar** detects taps on the active tab
2. If single tap and near top → emits `tabReselect` event
3. If single tap and far from top → emits `tabPress` event
4. If double tap → emits `tabDoublePress` event
5. **useTabReselectRefresh** listens to these events
6. Based on scroll position and event type, it:
   - Scrolls to top
   - Calls refresh callback
   - Triggers haptic feedback
   - Emits visual pulse events

## Tips

- Use lower `topThreshold` (80-100px) for screens with lots of content
- Use higher `topThreshold` (120-150px) for screens with headers
- Set `nearTopAction: "none"` if you don't want refresh behavior
- Use `cooldownMs: 1000` for slower refreshes or expensive operations
