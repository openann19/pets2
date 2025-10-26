/**
 * Unsharp Mask
 * Proper unsharp mask: result = original + amount * (original - gaussian(original))
 * Requires @shopify/react-native-skia; otherwise no-op passthrough.
 */

import * as FileSystem from "expo-file-system";

type SkiaTypes = typeof import("@shopify/react-native-skia");

/**
 * Lazy load Skia to avoid bundling if not installed
 */
async function loadSkia(): Promise<SkiaTypes | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@shopify/react-native-skia");
  } catch {
    return null;
  }
}

export interface UnsharpOpts {
  /** Strength (0..2), default 0.5 */
  amount?: number;
  /** Gaussian blur radius in pixels, default 1.5 */
  radius?: number;
  /** Threshold (0..1) to ignore small differences, default 0.02 */
  threshold?: number;
  /** JPEG quality (0..1), default 1 */
  quality?: number;
  /** Output format */
  format?: "jpg" | "png";
}

/**
 * Apply unsharp mask to sharpen an image
 * Uses proper high-pass filtering: result = original + amount * (original - blurred)
 * 
 * @param uri - Source image URI
 * @param opts - Unsharp mask options
 * @returns URI of sharpened image, or original if Skia unavailable
 */
export async function unsharpMask(
  uri: string,
  opts: UnsharpOpts = {}
): Promise<string> {
  const Skia = await loadSkia();
  
  if (!Skia) {
    return uri; // graceful fallback
  }

  const {
    amount = 0.5,
    radius = 1.5,
    threshold = 0.02,
    quality = 1,
    format = "jpg",
  } = opts;

  const { Skia: S } = Skia;

  // Load source image
  const data = await S.Data.fromURI(uri);
  const src = S.Image.MakeImageFromEncoded(data);
  
  if (!src) {
    return uri;
  }

  const w = src.width();
  const h = src.height();

  const surface = S.Surface.MakeSurface(w, h);
  
  if (!surface) {
    return uri;
  }
  
  const canvas = surface.getCanvas();

  // Blur original into temp surface
  const blurSurface = S.Surface.MakeSurface(w, h);
  
  if (!blurSurface) {
    return uri;
  }
  
  const blurCanvas = blurSurface.getCanvas();
  const blurPaint = S.Paint();
  blurPaint.setImageFilter(S.ImageFilter.MakeBlur(radius, radius, "decal"));
  blurCanvas.drawImage(src, 0, 0, blurPaint);
  const blurred = blurSurface.makeImageSnapshot();

  // Runtime shader to do: base + amount * clamp((base - blur), threshold)
  // This implements the high-pass filter with threshold gating
  const sksl = `
    uniform shader base;
    uniform shader blur;
    uniform float amount;
    uniform float threshold;
    
    half4 main(float2 xy) {
      half4 b = base.eval(xy);
      half4 g = blur.eval(xy);
      half3 hp = b.rgb - g.rgb;              // high-pass
      half m = max(max(abs(hp.r), abs(hp.g)), abs(hp.b));
      half t = m > threshold ? 1.0 : 0.0;    // threshold gate
      half3 sharp = b.rgb + (amount * hp * t);
      return half4(clamp(sharp, 0.0, 1.0), b.a);
    }
  `;
  
  const effect = S.RuntimeEffect.Make(sksl);
  
  if (!effect) {
    return uri;
  }

  // Create shader with uniforms and samplers
  const shader = effect.makeShader(
    // uniforms
    { amount, threshold },
    // children (samplers)
    [
      src.makeShaderOptions({}, {}),
      blurred.makeShaderOptions({}, {}),
    ]
  );

  const p = S.Paint();
  p.setShader(shader);
  canvas.drawRect(S.XYWHRect(0, 0, w, h), p);

  // Export sharpened image
  const snap = surface.makeImageSnapshot();
  const base64 =
    format === "png"
      ? snap.encodeToBase64()
      : snap.encodeToBase64(S.ImageFormat.JPEG, Math.round(quality * 100));

  const outPath = `${FileSystem.cacheDirectory}usm_${Date.now()}.${format}`;
  await FileSystem.writeAsStringAsync(outPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return outPath;
}

