# Backdrop Blur System

Global backdrop blur overlay that activates when any overlay (modal, sheet, toast, in-app notification) is active.

## Features

- ✅ Feature flag controlled (kill switch via `ui.backdropBlur`)
- ✅ Quality tier scaling (reduces intensity on low-end devices)
- ✅ Respects Reduce Motion and Reduce Transparency accessibility settings
- ✅ Platform-specific blur (iOS native blur, Android blur/fallback)
- ✅ Telemetry tracking for backdrop shown/hidden events
- ✅ Auto-toggles for modals, sheets, and notifications
- ✅ Simple hook-based integration (`useBackdrop`)

## Quick Start

### Method 1: Using `useBackdrop` Hook (Recommended)

Add one line to any modal/sheet component:

```tsx
import { Modal } from 'react-native';
import { useBackdrop } from '@/ui/useBackdrop';

function MyModal({ visible, onClose }) {
  useBackdrop(visible, 'modal'); // Add this line

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Your modal content */}
    </Modal>
  );
}
```

### Method 2: Using `withBackdrop` HOC

Wrap your component:

```tsx
import { withBackdrop } from '@/ui/withBackdrop';

const MyModal = withBackdrop(({ visible, onClose }) => {
  return (
    <Modal visible={visible} onRequestClose={onClose}>
    {/* Your modal content */}
  </Modal>
  );
}, 'modal');
```

### Method 3: Manual Control

For custom control, use the overlay state store:

```tsx
import { useOverlayState } from '@/foundation/overlay/overlayState';

function MyComponent() {
  const { show, hide } = useOverlayState();

  const openSheet = () => {
    show('sheet');
    // Open your sheet
  };

  const closeSheet = () => {
    hide('sheet');
    // Close your sheet
  };
}
```

### Method 4: With Async Operations

```tsx
import { withOverlay } from '@/foundation/overlay/overlayState';

await withOverlay(async () => {
  await openSheet();
  // Backdrop automatically shows/hides
});
```

## Configuration

Feature flags (in `apps/mobile/src/config/flags.ts`):

- `ui.backdropBlur`: Enable/disable backdrop blur (default: `true`)
- `ui.backdropBlur.amount`: Blur intensity 0-100 (default: `24`)
- `ui.backdropBlur.tint`: Blur tint - 'light' | 'dark' | 'regular' | 'prominent' (default: `'dark'`)

Environment variables:
- `EXPO_PUBLIC_UI_BACKDROP_BLUR=false` - Disable backdrop blur
- `EXPO_PUBLIC_UI_BACKDROP_BLUR_AMOUNT=32` - Set blur amount
- `EXPO_PUBLIC_UI_BACKDROP_BLUR_TINT=light` - Set blur tint

## Integration Examples

See [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) for detailed examples including:
- React Native Modal integration
- Custom Sheet components
- Toast/In-App notifications
- Bottom sheets
- Migration guide from existing modals

## Architecture

- **Overlay State**: Zustand store tracking active overlay count (`apps/mobile/src/foundation/overlay/overlayState.ts`)
- **Backdrop Component**: Main blur component (`apps/mobile/src/ui/BackdropBlur.tsx`)
- **Backdrop Hook**: Easy integration hook (`apps/mobile/src/ui/useBackdrop.ts`)
- **Quality Tier**: Device performance detection (`apps/mobile/src/foundation/quality/useQualityTier.ts`)
- **Feature Flags**: Configuration system (`apps/mobile/src/foundation/flags/useFlags.ts`)

## Accessibility

- Respects `Reduce Motion` → reduces blur intensity by 30%
- Respects `Reduce Transparency` → falls back to dimmed scrim
- Background content is marked as inert to screen readers
- No performance impact when feature flag is disabled

## Performance

- Blur intensity scales by device tier:
  - High tier: 100% intensity
  - Mid tier: 80% intensity
  - Low tier: 60% intensity
- No blur code path executes when feature flag is off
- Optimized for ≤16ms toggle time on p50 devices

## Telemetry

Events tracked:
- `ui_backdrop_shown` - When backdrop appears
- `ui_backdrop_hidden` - When backdrop disappears

Both events include `reason` payload (modal, sheet, notification, etc.)

