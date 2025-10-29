# Image Ultra - Ultra-Advanced Image Processing Pipeline

Production-grade image processing for mobile apps with tile-based upscaling,
adaptive JPEG quality, and professional cropping tools.

## Features

✅ **Tile-based upscaling** - 4K-safe memory usage with 512px tiles  
✅ **Denoise** - Median filter for low-light images  
✅ **Sharpen** - Unsharp mask with configurable radius/amount/threshold  
✅ **Adaptive JPEG** - SSIM-based quality targeting  
✅ **EXIF handling** - Auto-orientation and privacy-first stripping  
✅ **WebP thumbnails** - Efficient thumbnail generation  
✅ **Pro crop overlay** - Multiple guides, ratios, safe text zones, inertial
drag

## Quick Start

```typescript
import { processImagePipeline } from '@/utils/image-ultra';

const { blob, report } = await processImagePipeline(fileBlob, {
  upscale: { scale: 2, tileSize: 512 },
  denoise: { radius: 1 },
  sharpen: { radiusPx: 1.5, amount: 0.7, threshold: 2 },
  export: {
    target: 'jpeg',
    adaptive: { baselineCanvas, targetSSIM: 0.985, minQ: 0.65, maxQ: 0.95 },
  },
});
```

## Architecture

### Core Pipeline (`pipeline.ts`)

- `loadImageToCanvas()` - Load with EXIF orientation correction
- `tileUpscaleCanvas()` - Memory-safe upscaling
- `processImagePipeline()` - Orchestrates full pipeline

### Filters (`filters.ts`)

- `medianDenoise()` - Edge-preserving denoise
- `unsharpMask()` - Classic sharpening algorithm

### Quality Metrics (`ssim.ts`)

- `ssimApprox()` - Fast downscaled SSIM for quality targeting

### Concurrency (`queue.ts`)

- `AbortableQueue` - Cancellable task queue with configurable concurrency

### Caching (`lru.ts`)

- `LRU` - Memory-efficient cache for processed images

### UI Components (`../components/editor/`)

- `CropOverlayUltra` - Professional crop overlay with guides

## Usage Examples

### Basic Upscale + Sharpen

```typescript
const { blob } = await processImagePipeline(inputBlob, {
  upscale: { scale: 2, tileSize: 512 },
  sharpen: { radiusPx: 1.5, amount: 0.7, threshold: 2 },
  export: { target: 'jpeg', quality: 0.9 },
});
```

### Adaptive Quality by SSIM

```typescript
const baselineCanvas = await loadImageToCanvas(originalBlob);
const { blob, report } = await processImagePipeline(inputBlob, {
  export: {
    target: 'jpeg',
    adaptive: {
      baselineCanvas,
      targetSSIM: 0.985,
      minQ: 0.6,
      maxQ: 0.95,
    },
  },
});
console.log(report); // { export: { mode, quality, ssim } }
```

### WebP Thumbnail

```typescript
const thumbCanvas = document.createElement('canvas');
thumbCanvas.width = 512;
thumbCanvas.height = Math.round((originalHeight / originalWidth) * 512);
thumbCanvas
  .getContext('2d')!
  .drawImage(originalCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
const webpThumb = await new Promise<Blob>((r) =>
  thumbCanvas.toBlob((b) => r(b!), 'image/webp', 0.8),
);
```

### Concurrency Control

```typescript
import { AbortableQueue } from '@/utils/image-ultra';

const queue = new AbortableQueue(2); // max 2 concurrent

const { promise, cancel } = queue.enqueue('process-1', async (signal) => {
  if (signal.aborted) throw new Error('cancelled');
  return processImagePipeline(blob, opts);
});

// Cancel when user leaves screen
cancel();
```

### Crop Overlay

```typescript
import { CropOverlayUltra } from '@/components/editor';

<CropOverlayUltra
  ratio="4:5"
  showGuides={true}
  showSafeText={true}
  onDragEnd={(offset) => console.log(offset)}
/>
```

## Platform Notes

- **Web**: Full canvas API support, all features available
- **React Native**: Use outputs written to disk/Blob; pipeline orchestrates
  processing
- **EXIF**: Auto-oriented via
  `createImageBitmap(..., imageOrientation: 'from-image')`
- **Privacy**: All EXIF stripped by default via re-encoding
- **Color Space**: sRGB via Canvas default

## Performance

- **SSIM**: Computed at 512px downscale for speed (typically <100ms)
- **Upscale**: 512px tiles prevent OOM on 4K+ images
- **Denoise**: Median filter ~10ms on 1920x1080
- **Sharpen**: Unsharp mask ~15ms on 1920x1080

## Supported Formats

- **Input**: JPEG, PNG, WebP, HEIC (via native decoder)
- **Output**: JPEG (adaptive or fixed), PNG, WebP
- **EXIF**: Auto-orientation, stripped on export

## Advanced: Custom Filters

```typescript
import { unsharpMask, medianDenoise } from '@/utils/image-ultra';

// Apply filters manually
medianDenoise(canvas, 1);
unsharpMask(canvas, 2, 0.6, 3);
```

## API Reference

See individual file exports:

- `pipeline.ts` - Main pipeline orchestration
- `filters.ts` - Denoise and sharpen filters
- `ssim.ts` - Quality metric computation
- `queue.ts` - Concurrency management
- `lru.ts` - Caching utilities

## Credits

Based on:

- SSIM: Wang et al. (2004) "Image quality assessment: from error visibility to
  structural similarity"
- Unsharp Mask: Classic high-pass sharpening algorithm
- Median Filter: Edge-preserving noise reduction
