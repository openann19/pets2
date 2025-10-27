/**
 * Image Ultra - Usage Examples
 * 
 * This file demonstrates how to use the image processing pipeline
 * in real scenarios (web and React Native)
 */

import { 
  processImagePipeline, 
  loadImageToCanvas,
  AbortableQueue,
  LRU
} from './index';
import { processImageUltraPro } from './pipeline_pro';

// ===== Example 1: Basic upscale + sharpen =====
export async function basicUpscaleExample(fileBlob: Blob) {
  const { blob, report } = await processImagePipeline(fileBlob, {
    upscale: { scale: 2, tileSize: 512 },
    sharpen: { radiusPx: 1.5, amount: 0.7, threshold: 2 },
    export: { target: "jpeg", quality: 0.9 }
  });

  console.log("Processed:", blob.size, "bytes");
  console.log("Report:", report);
  return blob;
}

// ===== Example 2: Adaptive quality by SSIM =====
export async function adaptiveQualityExample(fileBlob: Blob) {
  const baselineCanvas = await loadImageToCanvas(fileBlob);
  
  const { blob, report } = await processImagePipeline(fileBlob, {
    upscale: { scale: 2, tileSize: 512 },
    export: {
      target: "jpeg",
      adaptive: {
        baselineCanvas,
        targetSSIM: 0.985,
        minQ: 0.6,
        maxQ: 0.95
      }
    }
  });

  console.log("Quality found:", report.export.quality);
  console.log("SSIM achieved:", report.export.ssim);
  return blob;
}

// ===== Example 3: WebP thumbnail generation =====
export async function webpThumbnailExample(originalBlob: Blob) {
  const canvas = await loadImageToCanvas(originalBlob);
  
  // Resize to 512px wide
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 512;
  thumbCanvas.height = Math.round((canvas.height / canvas.width) * 512);
  thumbCanvas.getContext("2d")!.drawImage(
    canvas, 
    0, 0, 
    thumbCanvas.width, 
    thumbCanvas.height
  );

  const webpThumb = await new Promise<Blob>(resolve => 
    { thumbCanvas.toBlob(blob => { resolve(blob!); }, "image/webp", 0.8); }
  );

  return webpThumb;
}

// ===== Example 4: Using the queue for concurrency =====
export function queueExample() {
  const queue = new AbortableQueue(2); // max 2 concurrent tasks

  const task1 = queue.enqueue("task-1", async (signal) => {
    if (signal.aborted) throw new Error("cancelled");
    // Process image...
    return "result-1";
  });

  const task2 = queue.enqueue("task-2", async (signal) => {
    if (signal.aborted) throw new Error("cancelled");
    // Process image...
    return "result-2";
  });

  // Cancel task if user leaves
  // task1.cancel();

  return Promise.all([task1.promise, task2.promise]);
}

// ===== Example 5: Using LRU cache =====
export function lruCacheExample(blob: Blob) {
  const cache = new LRU<string, Blob>(8);

  async function getCachedProcessed(originalUri: string, opts: any): Promise<Blob> {
    if (cache.has(originalUri)) {
      return cache.get(originalUri)!;
    }

    // Process image...
    const { blob: processed } = await processImagePipeline(blob, opts);
    
    cache.set(originalUri, processed);
    return processed;
  }

  return getCachedProcessed;
}

// ===== Example 6: Full pipeline with all features =====
export async function fullPipelineExample(fileBlob: Blob) {
  // Load original
  const originalCanvas = await loadImageToCanvas(fileBlob);

  // Process with upscale, denoise, sharpen
  const result = await processImagePipeline(fileBlob, {
    upscale: { scale: 2, tileSize: 512 },
    denoise: { radius: 1 },
    sharpen: { radiusPx: 1.5, amount: 0.7, threshold: 2 },
    export: {
      target: "jpeg",
      adaptive: {
        baselineCanvas: originalCanvas,
        targetSSIM: 0.985,
        minQ: 0.65,
        maxQ: 0.95
      }
    }
  });

  // Generate WebP thumbnail
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 512;
  thumbCanvas.height = Math.round((result.canvas.height / result.canvas.width) * 512);
  thumbCanvas.getContext("2d")!.drawImage(result.canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const webpThumb = await new Promise<Blob>(resolve => 
    { thumbCanvas.toBlob(blob => { resolve(blob!); }, "image/webp", 0.8); }
  );

  return {
    fullSize: result.blob,
    thumbnail: webpThumb,
    report: result.report
  };
}

// ===== Example 7: React Native usage (write to FS) =====
export async function reactNativeExample(uri: string) {
  // In React Native, you'd convert URI to Blob first
  // Then process, then save back to FS
  
  // const response = await fetch(uri);
  // const blob = await response.blob();
  
  // const { blob: processed } = await processImagePipeline(blob, { /* ... */ });
  
  // const reader = new FileReader();
  // const dataUri = await new Promise(resolve => {
  //   reader.onloadend = () => resolve(reader.result);
  //   reader.readAsDataURL(processed);
  // });
  
  // return dataUri;
}

// ===== Example 8: Ultra PRO Features =====
export async function ultraProExample(fileBlob: Blob) {
  const baseline = await loadImageToCanvas(fileBlob);
  
  const { blob, report, canvas } = await processImageUltraPro(
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
      
      // Recover blown highlights (glare, overexposed sky/forehead)
      recoverHighlights: { strength: 0.55, pivot: 0.78 },
      
      // Clarity (local contrast enhancement)
      clarity: { radiusPx: 16, amount: 0.3 },
      
      // Vignette correction (brighten edges)
      vignette: { amount: 0.22, softness: 0.6 },
      
      // Noise reduction preset (iOS night mode)
      noisePreset: "ios-night",
      
      // Smart crop: 4:5 ratio, best-of-3 (Tenengrad + entropy + eye-line)
      crop: { ratio: "4:5", bestOf3: true },
      
      // HDR clipping warning threshold (3%)
      hdrWarnThreshold: 0.03
    }
  );

  console.log("PRO Report:", {
    hdrWarning: report.hdrWarning, // true if >3% clipped
    autoStraightened: report.autoStraightened,
    angleDeg: report.angleDeg, // e.g., -2.3°
    cropRect: report.cropRect, // { x, y, w, h }
    ...report.export
  });

  return { blob, canvas, report };
}

// ===== Example 9: Individual PRO features =====
export async function individualProFeaturesExample(fileBlob: Blob) {
  const { toneMapHighlights, clarityLocalContrast, vignetteCorrect, applyNoisePreset } = await import('./filters_extras');
  const { highlightClipFraction } = await import('./histogram');
  const { estimateHorizonAngle, rotateCanvas } = await import('./horizon');
  const { proposeTrioCrops, bestOf3 } = await import('./auto_crop');
  
  let canvas = await loadImageToCanvas(fileBlob);
  
  // 1) Check HDR clipping
  const clipFrac = highlightClipFraction(canvas, 250);
  console.log("Clipped pixels:", (clipFrac * 100).toFixed(1) + "%");
  
  // 2) Auto-straighten
  const angle = estimateHorizonAngle(canvas);
  if (Math.abs(angle) > 0.3) {
    canvas = rotateCanvas(canvas, -angle);
    console.log("Rotated:", angle.toFixed(1) + "°");
  }
  
  // 3) Noise reduction
  applyNoisePreset(canvas, "ios-night");
  
  // 4) Recover highlights
  toneMapHighlights(canvas, 0.6, 0.75);
  
  // 5) Clarity
  clarityLocalContrast(canvas, 12, 0.35);
  
  // 6) Vignette correction
  vignetteCorrect(canvas, 0.25, 0.6);
  
  // 7) Smart crop
  const trio = proposeTrioCrops(canvas, 4/5); // 4:5 ratio
  const best = bestOf3(canvas, trio);
  console.log("Best crop:", best.key, "score:", best.score.toFixed(3));
  
  // Cut to best crop
  const out = document.createElement("canvas");
  out.width = Math.round(best.rect.w);
  out.height = Math.round(best.rect.h);
  out.getContext("2d")!.drawImage(
    canvas,
    best.rect.x, best.rect.y, best.rect.w, best.rect.h,
    0, 0, out.width, out.height
  );
  
  const blob = await new Promise<Blob>(resolve =>
    { out.toBlob(b => { resolve(b!); }, "image/jpeg", 0.9); }
  );
  
  return blob;
}

