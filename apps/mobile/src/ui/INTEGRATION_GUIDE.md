# Backdrop Blur Integration Guide

This guide shows how to integrate the backdrop blur system with your existing modals, sheets, and overlay components.

## Quick Integration

### Method 1: Using `useBackdrop` Hook (Recommended)

Add the hook to any modal/sheet component:

```tsx
import { Modal } from 'react-native';
import { useBackdrop } from '@/ui/useBackdrop';

function MyModal({ visible, onClose }) {
  // Automatically manages backdrop state
  useBackdrop(visible, 'modal');

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Modal content */}
    </Modal>
  );
}
```

### Method 2: Using `withBackdrop` HOC

Wrap your component:

```tsx
import { withBackdrop } from '@/ui/withBackdrop';

function MyModal({ visible, onClose }) {
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Modal content */}
    </Modal>
  );
}

export default withBackdrop(MyModal, 'modal');
```

### Method 3: Manual Control

For custom control:

```tsx
import { useOverlayState } from '@/foundation/overlay/overlayState';
import { useEffect } from 'react';

function MyModal({ visible, onClose }) {
  const { show, hide } = useOverlayState();

  useEffect(() => {
    if (visible) {
      show('modal');
    } else {
      hide('modal');
    }
  }, [visible, show, hide]);

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Modal content */}
    </Modal>
  );
}
```

## Integration Examples

### Example 1: React Native Modal

```tsx
import { Modal } from 'react-native';
import { useBackdrop } from '@/ui/useBackdrop';

export function SwipeLimitModal({ visible, onClose }) {
  useBackdrop(visible, 'modal');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Your modal content */}
    </Modal>
  );
}
```

### Example 2: Custom Sheet Component

```tsx
import { Modal } from 'react-native';
import { useBackdrop } from '@/ui/useBackdrop';

export function Sheet({ visible, onClose, children }) {
  useBackdrop(visible, 'sheet');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {children}
      </View>
    </Modal>
  );
}
```

### Example 3: Expo BlurView Modal

```tsx
import { Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { useBackdrop } from '@/ui/useBackdrop';

export function PremiumModal({ visible, onClose }) {
  useBackdrop(visible, 'modal');

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        {/* Your modal content */}
      </BlurView>
    </Modal>
  );
}
```

### Example 4: Toast/In-App Notification

```tsx
import { useBackdrop } from '@/ui/useBackdrop';
import { useEffect } from 'react';

export function InAppNotification({ visible, duration = 3000 }) {
  useBackdrop(visible, 'toast');

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        // Auto-dismiss
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  return visible ? (
    <View style={styles.toast}>
      {/* Toast content */}
    </View>
  ) : null;
}
```

### Example 5: Bottom Sheet with React Native Modal

```tsx
import { Modal } from 'react-native';
import { useBackdrop } from '@/ui/useBackdrop';

export function BottomSheet({ visible, onClose, children }) {
  useBackdrop(visible, 'sheet');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <Animated.View style={styles.sheet}>
        {children}
      </Animated.View>
    </Modal>
  );
}
```

## Migration Guide

### Before (Without Backdrop)

```tsx
export function MyModal({ visible, onClose }) {
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Content */}
    </Modal>
  );
}
```

### After (With Backdrop)

```tsx
import { useBackdrop } from '@/ui/useBackdrop';

export function MyModal({ visible, onClose }) {
  useBackdrop(visible, 'modal'); // Add this line
  
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Content */}
    </Modal>
  );
}
```

## Overlay Reasons

Use appropriate reasons for telemetry:

- `'modal'` - Standard modal dialogs
- `'sheet'` - Bottom sheets, action sheets
- `'toast'` - Toast notifications, snackbars
- `'notification'` - In-app notifications
- `'tooltip'` - Tooltips, popovers
- `'overlay'` - Generic overlays (default)

## Best Practices

1. **Always use `useBackdrop` hook** for automatic cleanup
2. **Use appropriate reason** for better telemetry tracking
3. **Don't manually manage backdrop** if using the hook - it handles everything
4. **Multiple overlays stack correctly** - backdrop shows as long as any overlay is active
5. **Feature flag** controls everything - no performance impact when disabled

## Troubleshooting

### Backdrop doesn't show

1. Check feature flag: `EXPO_PUBLIC_UI_BACKDROP_BLUR` is not set to `'false'`
2. Verify `useBackdrop` is called with `visible={true}`
3. Ensure `<BackdropBlur />` is mounted in `App.tsx` (already done)

### Backdrop stays visible after modal closes

- Ensure cleanup in `useEffect` return function
- Check that `visible` prop correctly changes to `false`

### Performance issues

- Feature flag off = zero performance impact
- Low-end devices automatically get reduced blur intensity
- Reduce Motion setting reduces blur by 30%

