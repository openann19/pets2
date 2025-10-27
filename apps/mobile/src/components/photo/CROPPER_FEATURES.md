# Pro Cropper Component - Advanced Image Cropping

## Overview

The `Cropper` component is a professional-grade image cropping tool with pinch-to-zoom, pan gestures, multiple aspect ratios, and high-resolution export capabilities.

## Features

### 🎯 Core Functionality
- **Pinch-to-Zoom**: Scale from 1x to 6x with smooth momentum
- **Pan Gesture**: Move the image around to frame your crop
- **High-Resolution Export**: Uses `expo-image-manipulator` for full-quality crops
- **Real-Time Preview**: See your crop area with visual guides

### 📐 Aspect Ratios
- **FREE**: Unconstrained cropping
- **1:1**: Square (Instagram photo)
- **4:5**: Portrait (Instagram portrait post, common photo ratio)
- **9:16**: Vertical/Stories (Instagram/Facebook stories, TikTok)
- **16:9**: Widescreen (YouTube, landscape photos)
- **3:2**: Classic photo ratio (35mm film)

### 🎨 Visual Guides
- **Grid Overlay**: Rule-of-thirds grid for composition
- **Dark Mask**: Semi-transparent overlay outside crop area
- **Highlighted Crop Zone**: Clear border showing the active crop area

### ⚡ Animations
- **Spring Transitions**: Natural motion when adjusting zoom
- **Decay Momentum**: Smooth velocity-based panning
- **Visual Feedback**: Real-time feedback as you adjust

## Usage

```typescript
import { Cropper } from '../components/photo/Cropper';

<Cropper
  uri={imageUri}
  containerW={width}
  containerH={PREVIEW_HEIGHT}
  defaultRatio="4:5"
  onCropped={(newUri) => {
    // Handle the cropped image
    setImageUri(newUri);
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uri` | `string` | *required* | Current working image URI |
| `containerW` | `number` | *required* | Preview container width |
| `containerH` | `number` | *required* | Preview container height |
| `defaultRatio` | `Ratio` | `"4:5"` | Initial aspect ratio |
| `onCropped` | `(uri: string) => void` | *required* | Callback with cropped URI |

## Aspect Ratio Types

```typescript
type Ratio = "FREE" | "1:1" | "4:5" | "9:16" | "16:9" | "3:2";
```

## Integration with Photo Editor

The Cropper is integrated into `AdvancedPhotoEditor` as a new tab:

1. Open the photo editor
2. Tap the "Crop" tab
3. Pinch to zoom and pan to frame
4. Select your desired aspect ratio
5. Tap "Apply Crop"
6. Returns to the Adjust tab with your cropped image

## Technical Details

### High-Resolution Export
Uses `expo-image-manipulator` with:
- No quality loss
- Precise pixel mapping from crop window to original image
- JPEG format with quality compression at 1.0

### Gesture Handling
- Simultaneous pinch and pan for multi-touch gestures
- Velocity-based decay for natural panning
- Minimum zoom: 1x, Maximum zoom: 6x

### Crop Calculation
The component calculates the exact pixel coordinates in the original image:
1. Maps displayed image dimensions to original resolution
2. Accounts for all transforms (zoom, pan)
3. Converts crop window to pixel coordinates
4. Applies bounds checking to prevent invalid crops

## Best Practices

1. **Always crop before applying filters** for best results
2. **Use 4:5 ratio for Instagram posts** (optimal engagement)
3. **Use 1:1 for profile pictures** or square crops
4. **Use 9:16 for stories and vertical content**
5. **Use FREE only when you need maximum flexibility**

## Examples

### Instagram Post (4:5)
```typescript
<Cropper
  uri={imageUri}
  containerW={width}
  containerH={height}
  defaultRatio="4:5"
  onCropped={handleCropped}
/>
```

### Profile Picture (1:1)
```typescript
<Cropper
  uri={imageUri}
  containerW={width}
  containerH={height}
  defaultRatio="1:1"
  onCropped={handleCropped}
/>
```

### Stories/Vertical (9:16)
```typescript
<Cropper
  uri={imageUri}
  containerW={width}
  containerH={height}
  defaultRatio="9:16"
  onCropped={handleCropped}
/>
```

## Advanced: Custom Container Sizes

```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const PREVIEW_HEIGHT = height * 0.5; // 50% of screen

<Cropper
  uri={imageUri}
  containerW={width}
  containerH={PREVIEW_HEIGHT}
  defaultRatio="4:5"
  onCropped={handleCropped}
/>
```

## Notes

- The component automatically calculates the correct dimensions
- Grid overlay helps with composition
- All crops maintain original image quality
- Works seamlessly with the photo editor's filter/adjust workflow

