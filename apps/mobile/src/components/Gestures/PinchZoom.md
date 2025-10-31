# PinchZoom Component

A production-grade, accessible, and feature-rich pinch-to-zoom component for React Native applications.

## Features

- ✅ **Pinch to Zoom**: Smooth zooming with configurable min/max scales
- ✅ **Pan to Navigate**: Drag to pan when zoomed in
- ✅ **Double Tap Reset**: Quick reset to initial scale
- ✅ **Haptic Feedback**: Tactile feedback for better UX
- ✅ **Momentum Scrolling**: Natural deceleration when panning
- ✅ **Accessibility**: Full screen reader support
- ✅ **Performance**: Optimized with Reanimated 3
- ✅ **TypeScript**: Complete type safety
- ✅ **Customizable**: Extensive configuration options

## Installation

```tsx
import { PinchZoom } from '@mobile/components/Gestures/PinchZoom';
```

## Basic Usage

```tsx
import React from 'react';
import { PinchZoom } from '@mobile/components/Gestures/PinchZoom';

const MyComponent = () => {
  return (
    <PinchZoom
      source={{ uri: 'https://example.com/image.jpg' }}
      width={300}
      height={200}
    />
  );
};
```

## Advanced Usage

```tsx
import React, { useState } from 'react';
import { PinchZoom } from '@mobile/components/Gestures/PinchZoom';

const AdvancedImage = () => {
  const [currentScale, setCurrentScale] = useState(1);

  return (
    <PinchZoom
      source={require('./assets/image.jpg')}
      width={SCREEN_WIDTH}
      height={400}
      initialScale={1}
      minScale={0.5}
      maxScale={5}
      enableMomentum={true}
      enableHaptics={true}
      enableDoubleTapReset={true}
      onScaleChange={setCurrentScale}
      onZoomStart={() => console.log('Zoom started')}
      onZoomEnd={() => console.log('Zoom ended')}
      onPanStart={() => console.log('Pan started')}
      onPanEnd={() => console.log('Pan ended')}
      onDoubleTap={() => console.log('Double tapped')}
      resizeMode="cover"
      accessibilityLabel="Product detail image"
      accessibilityHint="Pinch to zoom in, drag to move around, double tap to reset zoom"
    />
  );
};
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `{ uri: string } \| number` | **Required** | Image source (remote URI or local require) |
| `width` | `number` | `SCREEN_WIDTH` | Container width |
| `height` | `number` | `320` | Container height |
| `resizeMode` | `"cover" \| "contain" \| "stretch" \| "repeat" \| "center"` | `"cover"` | Image resize mode |

### Zoom Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialScale` | `number` | `1` | Initial zoom scale |
| `minScale` | `number` | `1` | Minimum allowed zoom scale |
| `maxScale` | `number` | `4` | Maximum allowed zoom scale |

### Feature Flags

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableMomentum` | `boolean` | `true` | Enable momentum scrolling when panning |
| `enableHaptics` | `boolean` | `true` | Enable haptic feedback |
| `enableDoubleTapReset` | `boolean` | `true` | Enable double tap to reset zoom |
| `disabled` | `boolean` | `false` | Disable all gestures |

### Event Callbacks

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onScaleChange` | `(scale: number) => void` | `undefined` | Called when scale changes |
| `onZoomStart` | `() => void` | `undefined` | Called when zoom gesture starts |
| `onZoomEnd` | `() => void` | `undefined` | Called when zoom gesture ends |
| `onPanStart` | `() => void` | `undefined` | Called when pan gesture starts |
| `onPanEnd` | `() => void` | `undefined` | Called when pan gesture ends |
| `onDoubleTap` | `() => void` | `undefined` | Called when double tapped |

### Styling & Accessibility

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `any` | `undefined` | Additional container styles |
| `accessibilityLabel` | `string` | `"Zoomable image"` | Accessibility label for screen readers |
| `accessibilityHint` | `string` | `"Pinch to zoom, drag to pan, double tap to reset"` | Accessibility hint for screen readers |

## Gesture Interactions

### Zoom Gestures
- **Pinch**: Use two fingers to zoom in/out
- **Bounds**: Zoom is clamped between `minScale` and `maxScale`
- **Snap**: Zoom snaps to bounds when gesture ends

### Pan Gestures
- **Drag**: Pan when zoomed in beyond `minScale`
- **Bounds**: Pan is bounded to keep image within container
- **Momentum**: Natural deceleration when `enableMomentum` is true

### Reset Gestures
- **Double Tap**: Reset to initial scale and position
- **Configurable**: Can be disabled with `enableDoubleTapReset={false}`

## Haptic Feedback

The component provides contextual haptic feedback:

| Interaction | Haptic Type | Description |
|-------------|-------------|-------------|
| Zoom Start | Light | Subtle feedback when zoom begins |
| Zoom End | Selection | Confirmation when zoom completes |
| Double Tap | Medium | Noticeable feedback for reset action |

Haptics can be disabled with `enableHaptics={false}`.

## Accessibility

### Screen Reader Support
- **Role**: Identified as an image element
- **Label**: Customizable via `accessibilityLabel`
- **Hint**: Instructions provided via `accessibilityHint`
- **Live Region**: Updates announced as `polite`

### Default Accessibility
```tsx
accessibilityLabel="Zoomable image"
accessibilityHint="Pinch to zoom, drag to pan, double tap to reset"
accessibilityRole="image"
accessibilityLiveRegion="polite"
```

## Performance Considerations

### Optimizations
- **Reanimated 3**: 60fps animations on UI thread
- **Gesture Handler**: Native gesture recognition
- **Cancellation**: Proper animation cleanup
- **Memory**: Efficient shared value usage

### Best Practices
1. **Image Size**: Use appropriately sized images
2. **Container Bounds**: Set reasonable `width`/`height`
3. **Scale Limits**: Configure appropriate `minScale`/`maxScale`
4. **Callback Debouncing**: Avoid expensive work in `onScaleChange`

## Use Cases

### Product Gallery
```tsx
<PinchZoom
  source={{ uri: product.imageUrl }}
  width={SCREEN_WIDTH}
  height={400}
  minScale={1}
  maxScale={3}
  enableHaptics={true}
  accessibilityLabel={`Product image: ${product.name}`}
/>
```

### Photo Viewer
```tsx
<PinchZoom
  source={{ uri: photo.highResUrl }}
  width={SCREEN_WIDTH}
  height={SCREEN_HEIGHT}
  minScale={0.5}
  maxScale={8}
  enableMomentum={true}
  onScaleChange={handleZoomChange}
/>
```

### Document Viewer
```tsx
<PinchZoom
  source={{ uri: document.pdfImageUrl }}
  width={SCREEN_WIDTH - 40}
  height={500}
  resizeMode="contain"
  minScale={1}
  maxScale={5}
  enableDoubleTapReset={true}
/>
```

## Troubleshooting

### Common Issues

**Gestures not working**
- Ensure `react-native-gesture-handler` is properly installed
- Check that the component has valid dimensions
- Verify `disabled` is not set to `true`

**Performance issues**
- Reduce image size before passing to component
- Limit `maxScale` to reasonable values
- Avoid expensive operations in callbacks

**Accessibility not working**
- Ensure proper accessibility labels are set
- Test with screen reader enabled
- Check that `accessible` is not overridden

## TypeScript Support

Full TypeScript support with comprehensive interfaces:

```tsx
interface PinchZoomProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enableMomentum?: boolean;
  enableHaptics?: boolean;
  enableDoubleTapReset?: boolean;
  onScaleChange?: (scale: number) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onPanStart?: () => void;
  onPanEnd?: () => void;
  onDoubleTap?: () => void;
  style?: any;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

## Dependencies

- `react-native-reanimated` ^3.0.0
- `react-native-gesture-handler` ^2.0.0
- `expo-haptics` ^12.0.0
- `react-native` ^0.70.0

## License

This component is part of the PawfectMatch mobile application.
