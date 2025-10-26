# Auto-Crop Implementation

## Overview

Advanced auto-crop system with face detection, edge-guard with rubber-band effects, and story-mode guides for the photo editor.

## Features Implemented

### 1. AI Auto-Crop Engine (`utils/AutoCropEngine.ts`)
- **Face Detection**: Detects faces via `expo-face-detector` (optional, graceful fallback)
- **Smart Fallback**: If no faces detected, uses aesthetically pleasing center 4:5 box with slight upward bias
- **Multiple Face Support**: Merges/selects appropriate rect for groups
- **Custom Detector Registry**: Extensible system for pet-specific or other detectors

### 2. Enhanced Cropper (`components/photo/Cropper.tsx`)
- **forwardRef with focusTo API**: Programmatic zoom-to-subject animation
- **Edge-Guard**: Prevents empty gaps; image always covers crop window
- **Rubber-Band Effect**: Soft overshoot with elegant snap-back feel
- **Story Mode Guides**: Toggle-safe-zone overlays for 9:16 content (top/bottom dashed bands)
- **Haptic Feedback**: On pinch, ratio switch, and crop success

### 3. AdvancedPhotoEditor Integration
- **Auto Button**: One-tap face detection + smart framing
- **Guides Toggle**: Show/hide story safe areas
- **Spring Animation**: Smooth focus-to-subject transitions
- **Imperative API**: Clean integration via refs

## Architecture

### AutoCropEngine Flow
1. Get image dimensions
2. Try registered custom detectors (pet, object, etc.)
3. Try `expo-face-detector` if available
4. Fallback to pleasing center crop
5. Return focus rect with detection method

### Cropper Edge-Guard Logic
- Calculates display bounds given current scale
- Applies rubber-band damping (45%) on overshoot
- Snaps back to valid bounds on gesture end
- Always ensures crop window is fully covered

### focusTo() Implementation
```typescript
focusTo(rect: Rect): void
```
- Calculates required scale to fit subject with 10% padding
- Computes translation to center subject in crop window
- Animates with spring physics (damping: 18, stiffness: 300)
- Applies edge clamp after animation

## Usage

```tsx
import { AutoCropEngine } from '../../utils/AutoCropEngine';
import { Cropper, type CropperHandle } from './Cropper';

const cropperRef = useRef<CropperHandle>(null);

const handleAutoCrop = async () => {
  const res = await AutoCropEngine.detect(imageUri);
  if (res?.focus) {
    cropperRef.current?.focusTo(res.focus);
  }
};

<Cropper
  ref={cropperRef}
  uri={imageUri}
  containerW={width}
  containerH={height}
  showStoryGuides={showGuides}
  onCropped={handleCropped}
/>
```

## Story Guide Positioning
- Top band: 64px from crop top (safe for header/UI)
- Bottom band: 120px from crop bottom (safe for text/CTA)
- 60px height, dashed blue borders
- Only visible when `showStoryGuides={true}`

## Performance Notes
- GPU-friendly transforms via Reanimated worklets
- Face detection runs on-demand (not continuous)
- Rubber-band effects run on UI thread (worklet)
- Single high-res crop at the end

## Graceful Fallback
If `expo-face-detector` is not installed:
- Auto button still works (uses fallback detection)
- No errors or warnings
- Beautiful center crop with smart aspect handling
- Can add custom detectors via `registerDetector()`

## Extending with Custom Detectors

```typescript
import { registerDetector, type Rect } from '../../utils/AutoCropEngine';

registerDetector(async (uri: string): Promise<Rect[]> => {
  // Your custom detection logic (pet detection, object detection, etc.)
  const results = await myMLModel.detect(uri);
  return results.map(r => ({ x: r.x, y: r.y, width: r.w, height: r.h }));
});
```

## Testing Checklist
- [ ] Toggle Crop tab → Auto on selfie → zooms to face
- [ ] Auto on group photo → frames all faces
- [ ] Drag far outside → springs back, no black bars
- [ ] Switch ratios fast → haptics and smooth sizing
- [ ] Toggle Guides (9:16) → dashed bands show
- [ ] Apply Crop → returns to Adjust tab with new base

## Dependencies
- ✅ `expo-image-manipulator` (already installed)
- ✅ `react-native-reanimated` (already installed)
- ✅ `react-native-gesture-handler` (already installed)
- ✅ `expo-haptics` (already installed)
- ⭕ `expo-face-detector` (optional, graceful fallback)

## Implementation Status
✅ AutoCropEngine.ts created
✅ Cropper.tsx upgraded with forwardRef + features
✅ AdvancedPhotoEditor.tsx wired in
✅ No linter errors
✅ Graceful fallback configured

