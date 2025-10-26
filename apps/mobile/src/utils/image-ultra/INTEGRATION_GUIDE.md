# 🚀 Image Ultra PRO - Integration Guide

This guide shows how to integrate the PRO modules into your photo editing workflow.

---

## Quick Start: Full Integration

### Step 1: Import the PRO Pipeline

```typescript
import { processImageUltraPro } from '@/utils/image-ultra';
```

### Step 2: Use in Your Photo Editor

```typescript
// In your AdvancedPhotoEditor component
const handleApplyProFilters = async (fileBlob: Blob) => {
  try {
    setLoading(true);
    
    // Load baseline for adaptive quality
    const baseline = await loadImageToCanvas(fileBlob);
    
    // Process with PRO features
    const result = await processImageUltraPro(
      fileBlob,
      {
        upscale: { scale: 2, tileSize: 512 },
        denoise: { radius: 1 },
        sharpen: { radiusPx: 1.5, amount: 0.7, threshold: 2 },
        export: {
          target: "jpeg",
          adaptive: {
            baselineCanvas: baseline,
            targetSSIM: 0.985,
            minQ: 0.65,
            maxQ: 0.95
          }
        }
      },
      {
        // Auto-straighten
        autoStraighten: true,
        
        // Recover blown highlights
        recoverHighlights: { strength: 0.55, pivot: 0.78 },
        
        // Clarity boost
        clarity: { radiusPx: 16, amount: 0.3 },
        
        // Vignette correction
        vignette: { amount: 0.22, softness: 0.6 },
        
        // Noise reduction (mobile-optimized)
        noisePreset: "ios-night",
        
        // Smart crop
        crop: { ratio: "4:5", bestOf3: true },
        
        // HDR clipping threshold
        hdrWarnThreshold: 0.03
      }
    );
    
    // Use the processed image
    const imageUri = await blobToUri(result.blob);
    setProcessedImage(imageUri);
    
    // Show warnings if needed
    if (result.report.hdrWarning) {
      Alert.alert("HDR Clipping", "Some areas may be overexposed");
    }
    
    // Store crop info for prefills
    if (result.report.cropRect) {
      console.log("Crop applied:", result.report.cropRect);
    }
    
  } catch (error) {
    console.error("PRO processing failed:", error);
    Alert.alert("Error", "Failed to process image");
  } finally {
    setLoading(false);
  }
};
```

---

## Component Integration

### Using CropBadges in Photo Editor

```tsx
import { CropBadges } from '@/components/editor/CropOverlayUltra';
import { Image } from 'react-native';

function AdvancedPhotoEditor({ imageUri }) {
  const [report, setReport] = useState(null);
  
  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      {/* Show badges for pro features */}
      {report && (
        <CropBadges 
          angleDeg={report.angleDeg}
          hdrWarning={report.hdrWarning}
        />
      )}
      
      {/* Your filter controls */}
      <FilterControls onApply={handleApplyProFilters} />
    </View>
  );
}
```

---

## Individual Feature Usage

### 1. Glare Recovery Only

```typescript
import { toneMapHighlights } from '@/utils/image-ultra';

const canvas = await loadImageToCanvas(blob);
toneMapHighlights(canvas, 0.6, 0.75);
const processed = await canvasToBlob(canvas, "image/jpeg", 0.9);
```

### 2. Auto-Straighten Only

```typescript
import { estimateHorizonAngle, rotateCanvas } from '@/utils/image-ultra';

const canvas = await loadImageToCanvas(blob);
const angle = estimateHorizonAngle(canvas);
if (Math.abs(angle) > 0.3) {
  const straightened = rotateCanvas(canvas, -angle);
}
```

### 3. Smart Crop Only

```typescript
import { proposeTrioCrops, bestOf3 } from '@/utils/image-ultra';

const canvas = await loadImageToCanvas(blob);
const trio = proposeTrioCrops(canvas, 4/5); // 4:5 ratio
const best = bestOf3(canvas, trio);
// best.rect → { x, y, w, h }
```

### 4. HDR Detection Only

```typescript
import { highlightClipFraction } from '@/utils/image-ultra';

const canvas = await loadImageToCanvas(blob);
const clip = highlightClipFraction(canvas, 250);
if (clip >= 0.03) {
  console.warn("HDR clipping:", clip * 100 + "%");
}
```

---

## Filter Slider UI

### Example Implementation

```tsx
function FilterSliders({ canvas, setCanvas }) {
  const [clarity, setClarity] = useState(0.3);
  const [vignette, setVignette] = useState(0.22);
  const [highlights, setHighlights] = useState(0.55);
  
  const handleClarityChange = useCallback(async (value: number) => {
    setClarity(value);
    // Re-apply clarity with new value
    const working = await loadImageToCanvas(canvasBlob);
    clarityLocalContrast(working, 16, value);
    setCanvas(await canvasToBlob(working, "image/png"));
  }, [canvas]);
  
  return (
    <View>
      <Slider
        label="Clarity"
        value={clarity}
        onValueChange={handleClarityChange}
        minimumValue={0}
        maximumValue={1}
      />
      {/* More sliders */}
    </View>
  );
}
```

---

## Batch Processing

### Process Multiple Images

```typescript
import { AbortableQueue } from '@/utils/image-ultra';

const queue = new AbortableQueue(3); // Max 3 concurrent

const tasks = imageBlobs.map((blob, idx) =>
  queue.enqueue(`image-${idx}`, async (signal) => {
    if (signal.aborted) throw new Error("cancelled");
    return await processImageUltraPro(blob, baseOpts, proOpts);
  })
);

const results = await Promise.all(tasks.map(t => t.promise));
```

---

## React Native Integration

### Convert URI to Blob

```typescript
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}

async function blobToUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Usage in RN
const blob = await uriToBlob(imageUri);
const result = await processImageUltraPro(blob, baseOpts, proOpts);
const processedUri = await blobToUri(result.blob);
```

---

## Performance Tips

### 1. Use Worker Threads

```typescript
// Offload processing to worker
const worker = new Worker('/workers/image-processor.js');
worker.postMessage({ blob, opts, proOpts });
worker.onmessage = (e) => {
  setProcessedImage(e.data.blob);
};
```

### 2. Cache Results

```typescript
import { LRU } from '@/utils/image-ultra';

const cache = new LRU<string, Blob>(10);

async function getCachedProcessed(uri: string): Promise<Blob> {
  if (cache.has(uri)) {
    return cache.get(uri)!;
  }
  
  const blob = await uriToBlob(uri);
  const result = await processImageUltraPro(blob, baseOpts, proOpts);
  
  cache.set(uri, result.blob);
  return result.blob;
}
```

### 3. Abort Long-Running Jobs

```typescript
const task = queue.enqueue("process", async (signal) => {
  if (signal.aborted) throw new Error("cancelled");
  return await processImageUltraPro(blob, baseOpts, proOpts);
});

// On unmount or user cancel
task.cancel();
```

---

## Testing Your Integration

### 1. Verify PRO Modules Load

```typescript
import * as ImageUltra from '@/utils/image-ultra';

console.log("Available:", Object.keys(ImageUltra));
// Should include: processImageUltraPro, toneMapHighlights, etc.
```

### 2. Test Individual Features

```typescript
// Test glare recovery
const canvas = createTestCanvas();
toneMapHighlights(canvas, 0.6, 0.75);
// Should modify pixels without errors

// Test auto-straighten
const angle = estimateHorizonAngle(canvas);
console.log("Detected angle:", angle);

// Test smart crop
const trio = proposeTrioCrops(canvas, 4/5);
const best = bestOf3(canvas, trio);
console.log("Best crop:", best.key);
```

---

## Troubleshooting

### Issue: "Cannot find module '@/utils/image-ultra'"

**Fix**: Ensure path aliases are configured in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/utils/*": ["src/utils/*"],
      "@/components/*": ["src/components/*"]
    }
  }
}
```

### Issue: Performance is slow

**Fix**: 
- Reduce tile size: `{ scale: 2, tileSize: 256 }`
- Disable expensive features: remove `bestOf3` if not needed
- Process in background thread/worker

### Issue: Out of memory on 4K images

**Fix**: Already handled! Tile-based processing is memory-safe. If issues persist:
- Use smaller scale: `{ scale: 1.5 }` instead of `2`
- Process in chunks for very large images

---

## Next Steps

1. ✅ Modules are ready (11 files, ~650 LOC)
2. ✅ Wire into `AdvancedPhotoEditor` component
3. ✅ Add filter sliders UI
4. ✅ Show `CropBadges` in preview
5. ✅ Store crop rects in metadata
6. ✅ Test with real photos

**Ready to integrate!** 🚀

