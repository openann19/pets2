# Ultra Pipeline Implementation

## Overview

The Ultra Pipeline is a comprehensive photo export system that generates **subject-aware crop trios** (tight/medium/loose) across multiple aspect ratios with **super-resolution upscaling** to publish-grade resolutions for social media.

### Key Features

- **3 crop variants per ratio** (tight/medium/loose) for optimal framing flexibility
- **Multiple aspect ratios** (1:1, 4:5, 9:16 by default) for Instagram, feeds, and stories/reels
- **Pluggable super-resolution** with fallback to bicubic upscaling
- **Subject-aware detection** using eyes/face detection with intelligent fallbacks
- **Progress tracking** and real-time UI feedback
- **Export-ready outputs** at publish-grade resolutions (1080p+)

---

## Architecture

### Core Modules

#### 1. `utils/QualityTargets.ts`

Defines target resolutions for different aspect ratios:

```typescript
QualityTargets = {
  "1:1":   { minW: 1080, minH: 1080 },   // Instagram square
  "4:5":   { minW: 1080, minH: 1350 },   // Portrait feed
  "9:16":  { minW: 1080, minH: 1920 },   // Story/reel
  "3:4":   { minW: 1080, minH: 1440 },   // Alt portrait
  "16:9":  { minW: 1920, minH: 1080 },   // Landscape
}
```

**Helper Functions:**
- `getTargetDimensions(ratio)` - Returns target width/height for a ratio
- `calculateUpscaleFactor(currentW, currentH, targetW, targetH)` - Calculates upscale factor needed

#### 2. `utils/SuperRes.ts`

Pluggable super-resolution system with multiple adapters:

**Adapters (in priority order):**
1. **LocalTFLiteAdapter** - On-device AI upscaling (when available)
2. **ServerAdapter** - Server-side ESRGAN/Real-ESRGAN (when available)
3. **BicubicAdapter** - Always available fallback using ImageManipulator

**Usage:**
```typescript
const upscaledUri = await SuperRes.upscale(uri, targetW, targetH);
```

The system automatically selects the best available adapter and falls back gracefully.

#### 3. `utils/UltraPublish.ts`

Main export pipeline that orchestrates the entire flow:

**Key Functions:**

1. **`generateTrioCrops(uri, ratio, detection)`**
   - Generates tight/medium/loose crop variants for a single ratio
   - Uses different padding percentages (6%, 12%, 20%)

2. **`exportUltraVariants(uri, ratios, options)`**
   - Full export pipeline for multiple ratios
   - Returns array of `UltraVariant` objects with:
     - `ratio`, `kind`, `crop`, `outUri`
     - `method` (eyes/face/fallback)
     - `targetW`, `targetH`, `size`
     - Progress callback support

3. **`previewUltraVariants(uri, ratios)`**
   - Generates thumbnails for quick preview before full export

**Usage:**
```typescript
const variants = await exportUltraVariants(uri, ["1:1","4:5","9:16"], {
  onProgress: (progress, variant) => {
    console.log(`${progress * 100}% complete`);
  }
});
// Returns 9 variants (3 per ratio × 3 ratios)
```

---

## Integration with AdvancedPhotoEditor

### State Management

```typescript
const [ultraExporting, setUltraExporting] = useState(false);
const [ultraProgress, setUltraProgress] = useState(0);
const [ultraVariants, setUltraVariants] = useState<UltraVariant[]>([]);
const [showUltraModal, setShowUltraModal] = useState(false);
```

### Ultra Export Handler

```typescript
const handleUltraExport = useCallback(async () => {
  setUltraExporting(true);
  
  const variants = await exportUltraVariants(editedUri, ["1:1","4:5","9:16"], {
    onProgress: (progress, variant) => {
      setUltraProgress(Math.round(progress * 100));
      if (variant) setUltraVariants((prev) => [...prev, variant]);
    },
  });
  
  setUltraVariants(variants);
  setShowUltraModal(true); // Show results
}, [editedUri]);
```

### UI Components

1. **Ultra Export Button** - Located in the Adjust panel
   - Shows progress percentage during export
   - Becomes disabled during processing
   - Triggers export on press

2. **Results Modal** - Displays after export completes
   - Groups variants by ratio
   - Shows thumbnails of each variant
   - Displays crop kind (tight/medium/loose) and detection method
   - "Save All" button to export all variants

---

## Output Structure

Each export produces **9 variants** (default):

### 1:1 Ratio (1080×1080)
- Tight crop (6% padding)
- Medium crop (12% padding)
- Loose crop (20% padding)

### 4:5 Ratio (1080×1350)
- Tight crop
- Medium crop
- Loose crop

### 9:16 Ratio (1080×1920)
- Tight crop
- Medium crop
- Loose crop

Each variant:
- Uses subject-aware detection (eyes > face > fallback)
- Upscaled to target resolution using best available method
- Cropped to exact aspect ratio with optimal framing

---

## Extending the Pipeline

### Adding New Aspect Ratios

Update `QualityTargets.ts`:

```typescript
export const QualityTargets = {
  // ... existing ratios
  "21:9": { minW: 2560, minH: 1080 }, // Ultra-wide
} as const;
```

Then call with custom ratios:
```typescript
await exportUltraVariants(uri, ["1:1","21:9"]);
```

### Enabling Server ESRGAN

1. Deploy your backend endpoint
2. Update `ServerAdapter` in `SuperRes.ts`:
   - Set `available()` to return `true`
   - Implement `upscale()` method with actual API calls

Example implementation:
```typescript
async upscale(uri, targetW, targetH) {
  const formData = new FormData();
  formData.append('image', { uri, name: 'image.jpg', type: 'image/jpeg' });
  formData.append('targetW', targetW.toString());
  formData.append('targetH', targetH.toString());
  
  const res = await fetch('https://your-backend.com/api/upscale', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  
  const { upscaledUrl } = await res.json();
  return upscaledUrl;
}
```

### Adding TFLite On-Device Upscaling

1. Install `react-native-tflite` or similar
2. Update `LocalTFLiteAdapter` in `SuperRes.ts`:
   - Set `available()` to check for TFLite module
   - Implement `upscale()` with TFLite model calls

---

## Performance Considerations

### Memory Management

- **Sequential processing** - Ratios processed one at a time to avoid memory spikes
- **Intermediate cleanup** - Cropped URIs can be cleaned up after upscaling
- **Progress callbacks** - Enables showing real-time progress

### Future Optimizations

1. **Tile-based upscaling** - Process large images in 512px tiles
2. **Batch processing** - Process multiple ratios in parallel (with memory limits)
3. **Caching** - Cache intermediate crops to avoid re-computation
4. **Abort support** - Add AbortController for cancellation

---

## Future Enhancements (Backlog)

### A) Image Quality (12 items)
- Tile-based upscale for 4K+ images
- Sharpen-after-upscale (unsharp mask)
- Denoise low-light pre-pass
- HEIC→JPEG/WebP conversion
- Auto color space detection
- EXIF preservation/orientation
- Adaptive JPEG quality by SSIM
- WebP thumbnails
- Glare/highlights recovery
- Edge-protected clarity
- Lens vignette correction
- Mobile noise presets

### B) Cropping & Composition (10 items)
- Headroom-aware mode (bottom 15% reserve for captions)
- Breed heuristics (ear/tail allowance)
- Rule of thirds + golden ratio guides
- Content-aware border (mirror-edge protection)
- HDR framing warnings (clipped highlights)
- Auto straightening (Hough detection)
- Multi-subject focus (consensus box)
- Interactive re-center with inertia
- Safe-text zones for stories/reels
- Batch pass with smart alternates

### C) Subject Detection (6 items)
- On-device pet detector (TFLite)
- Eye landmark confidence gating
- Occlusion handling
- Multi-subject priority selection
- Motion blur scoring
- Low-res rescue (auto-upsample before detection)

### D) Performance & Memory (6 items)
- Precomputed thumbnail worker queue
- Abortable operations
- Reanimated workletized progress HUD (60fps)
- Frame budget logger
- Fast-image for cache/decode priority
- Keep-alive cache (last 8 assets)

### E) UX/Micro-interactions (6 items)
- Tiered haptic feedback
- Parallax in preview while scrubbing
- Before/After press-and-hold peek
- Animated trio chips with ripple
- Export confetti (brand gradient)
- Undo toast with scrub to state

### F) Accessibility (6 items)
- VoiceOver semantic hints
- Dynamic type ramp
- High-contrast theme toggle
- Color-blind safe overlays
- Reduce Motion support
- Spoken progress

### G) Reliability & QA (8 items)
- Golden test images with SSIM snapshots
- Jest tests for ratio math + clamping
- Detox E2E flow
- Fuzz testing on random crops
- Memory leak watchdog (Android)
- Slow-device emulation budget
- Retry/backoff for server ESRGAN
- Crash grouping with breadcrumbs

### H) Offline, Caching, Storage (5 items)
- LRU cache for intermediate URIs
- Offline queue for server upscales
- Disk usage meter + quick-clean
- Store edit recipes (JSON)
- Low storage detection

### I) Privacy & Security (5 items)
- Strip GPS EXIF by default
- Redact faces in crowds
- Signed URL uploads (short TTL)
- On-device only mode
- PII-free metrics

### J) Analytics (5 items)
- Telemetry for ratio/kind choices
- Time-to-export + failure rates
- Funnel drop-off heatmap
- A/B test default ratio
- Suggest best ratio per user

### K) Tooling, DX, CI/CD (6 items)
- Storybook/Expo Router components
- ESLint + TS strictest config
- GitHub Actions lint/test/build
- Bundle analyzer
- Precommit image pipeline tests
- Perf-budget CI (>15% regression)

---

## Usage Example

```typescript
import { exportUltraVariants } from '../../utils/UltraPublish';

// In your component
const handleExport = async () => {
  const variants = await exportUltraVariants(editedUri, ["1:1","4:5","9:16"], {
    onProgress: (progress, variant) => {
      console.log(`${Math.round(progress * 100)}% - ${variant?.ratio} ${variant?.kind}`);
    },
  });
  
  // variants.length === 9 (3 per ratio × 3 ratios)
  // Each variant.outUri is ready for upload/save
};
```

---

## API Reference

### `exportUltraVariants`

```typescript
function exportUltraVariants(
  uri: string,
  ratios?: KnownRatio[],
  options?: {
    onProgress?: (progress: number, variant: UltraVariant | null) => void;
    maxConcurrency?: number;
  }
): Promise<UltraVariant[]>
```

**Returns:** Array of 9 (or custom) variants, each with:
- `ratio`, `kind`, `crop`, `outUri`
- `method`, `targetW`, `targetH`, `size`

### `SuperRes.upscale`

```typescript
function upscale(uri: string, targetW: number, targetH: number): Promise<string>
```

**Returns:** URI of upscaled image using best available backend.

### `getTargetDimensions`

```typescript
function getTargetDimensions(ratio: string): { minW: number; minH: number } | null
```

**Returns:** Target dimensions for a given ratio, or null if unsupported.

---

## Testing

To test the implementation:

1. Open AdvancedPhotoEditor with a photo
2. Go to Adjust tab
3. Scroll to "ULTRA Export" button
4. Tap to generate 9 variants
5. Wait for completion (progress shown)
6. Modal displays all variants organized by ratio
7. Tap "Save All" to export

Expected output:
- 9 variants total (3 per ratio)
- All variants at publish-grade resolution
- Subject properly framed in each crop
- Progress updates in real-time

---

## Troubleshooting

### Export fails
- Check device has sufficient storage
- Verify image is valid (not corrupted)
- Check console for specific error messages

### Slow performance
- Expected: upscaling is intensive
- Use bicubic adapter (fastest) for dev
- Enable server ESRGAN only in production
- Consider limiting to fewer ratios for testing

### Memory issues
- Currently processes sequentially to avoid spikes
- Consider reducing max image size
- Implement tile-based upscaling for 4K+ images

---

## Summary

The Ultra Pipeline provides a complete, production-ready solution for generating subject-aware, publish-grade photo exports for social media. The pluggable architecture allows easy integration of advanced upscaling methods while maintaining a reliable fallback. The system is designed for extensibility and performance, with a roadmap of 75+ enhancement ideas ready for implementation.

