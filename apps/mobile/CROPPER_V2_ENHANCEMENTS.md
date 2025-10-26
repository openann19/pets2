# Cropper v2 Enhancements

## Overview

The Cropper component has been significantly enhanced with rubber-band panning effects, haptic feedback, edge clamping, and a programmatic focus API via forwardRef.

## New Features

### 1. **Rubber-Band Panning**
- Natural overshoot effect when dragging beyond boundaries
- Uses RUBBER constant (0.45) for realistic physics
- Smooth decay back to valid bounds

### 2. **Haptic Feedback**
- Light impact on pinch begin (iOS)
- Light impact on pinch end (iOS)
- Silent on Android (platform-aware)
- Success notification on crop completion
- Error notification on crop failure

### 3. **Edge Clamping**
- Prevents panning outside valid bounds
- Worklet-based for smooth performance
- Automatically enforced on gesture end
- Works seamlessly with zoom levels

### 4. **Programmatic Focus API**

The component now supports a ref-based API for programmatic control:

```typescript
import { Cropper, type CropperHandle } from './Cropper';

const cropperRef = useRef<CropperHandle>(null);

// Focus on a specific rectangle (in image pixels)
cropperRef.current?.focusTo({
  x: 100,
  y: 200,
  width: 500,
  height: 800
});

<Cropper
  ref={cropperRef}
  uri={imageUri}
  containerW={width}
  containerH={height}
  defaultRatio="4:5"
  onCropped={handleCropped}
/>
```

### 5. **Story Guides Support**
- Optional safe area indicators for Instagram Stories
- Shows top and bottom safe zones
- Prevents content from being cut off
- Enabled via `showStoryGuides` prop

```typescript
<Cropper
  uri={imageUri}
  containerW={width}
  containerH={height}
  showStoryGuides={true}
  onCropped={handleCropped}
/>
```

## Technical Implementation

### Rubber-Band Algorithm

```typescript
const RUBBER = 0.45; // Resistance factor

const pan = Gesture.Pan()
  .onChange((e) => {
    // Calculate next position
    const nextX = tx.value + e.changeX;
    const nextY = ty.value + e.changeY;

    // Detect overshoot
    const overX = nextX < minTx ? nextX - minTx : nextX > maxTx ? nextX - maxTx : 0;
    const overY = nextY < minTy ? nextY - minTy : nextY > maxTy ? nextY - maxTy : 0;

    // Apply rubber-band resistance
    tx.value = overX ? nextX - overX * (1 - RUBBER) : nextX;
    ty.value = overY ? nextY - overY * (1 - RUBBER) : nextY;
  })
  .onEnd(() => {
    edgeClamp(); // Snap back to valid bounds
  });
```

### Focus API Implementation

Uses spring animations to smoothly zoom and center:

```typescript
useImperativeHandle(ref, () => ({
  focusTo: (rect: Rect) => {
    "worklet";
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    
    // Calculate required zoom
    const targetScale = Math.max(cropW / rect.width, cropH / rect.height) / baseScale;
    
    // Center the rectangle
    const targetTx = (containerW / 2 - centerX * baseScale * targetScale);
    const targetTy = (containerH / 2 - centerY * baseScale * targetScale);
    
    // Animate with spring physics
    scale.value = withSpring(clamp(targetScale, 1, 6), { damping: 18, stiffness: 220 });
    tx.value = withSpring(targetTx, { damping: 18, stiffness: 220 });
    ty.value = withSpring(targetTy, { damping: 18, stiffness: 220 });
  },
}));
```

## Usage in AdvancedPhotoEditor

The Cropper is integrated into the photo editor with:

1. **Ref support**: Can be controlled programmatically
2. **Story guides**: Optional visual guides for safe areas
3. **Haptic feedback**: Provides tactile feedback during interaction
4. **Edge clamping**: Prevents invalid crop positions

```typescript
const cropperRef = useRef<CropperHandle>(null);
const [showGuides, setShowGuides] = useState(false);

{activeTab === 'crop' && (
  <Cropper
    ref={cropperRef}
    uri={editedUri}
    containerW={width}
    containerH={PREVIEW_HEIGHT - 120}
    defaultRatio="4:5"
    showStoryGuides={showGuides}
    onCropped={handleCropped}
  />
)}
```

## Benefits

1. **Better UX**: Rubber-band effect feels natural and responsive
2. **Visual Feedback**: Haptics guide user interaction
3. **Professional Control**: Ref API enables programmatic workflows
4. **Story Safety**: Guides prevent content cutoff
5. **Performance**: Worklet-based computations run on UI thread

## Testing Checklist

- [x] Rubber-band pans smoothly beyond boundaries
- [x] Edge clamping works on gesture end
- [x] Haptic feedback on pinch gestures (iOS)
- [x] Haptic feedback on crop completion
- [x] focusTo method zooms and centers correctly
- [x] Story guides display when enabled
- [x] No TypeScript errors
- [x] No linter errors
- [x] forwardRef properly typed
- [x] useImperativeHandle properly implemented

## Notes

- Rubber factor (0.45) balances resistance and fluidity
- Edge clamping uses worklet for 60fps performance
- Focus API uses spring animations for natural motion
- All haptic calls respect platform differences
- Story guides are positioned for 9:16 content

