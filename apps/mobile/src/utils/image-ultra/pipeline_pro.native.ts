export type ProOpts = {
  recoverHighlights?: { strength?: number; pivot?: number };
  clarity?: { radiusPx?: number; amount?: number };
  vignette?: { amount?: number; softness?: number };
  noisePreset?: 'ios-night' | 'android-mid';
  autoStraighten?: boolean;
  crop?: { ratio: '1:1' | '4:5' | '9:16' | '3:2'; bestOf3?: boolean };
  hdrWarnThreshold?: number;
};

/**
 * Mobile fallback for Ultra Pro Pipeline.
 * On native, we bypass canvas-based web processing and return the input blob.
 * Callers that rely on the canvas should guard by platform.
 */
export async function processImageUltraPro(
  input: Blob,
  _baseOpts: unknown,
  _pro: ProOpts,
): Promise<{
  blob: Blob;
  report: {
    hdrWarning: false;
    autoStraightened: false;
    angleDeg?: number;
    cropRect?: undefined;
    export: Record<string, unknown>;
  };
  // canvas is not available on native; callers should not use it on mobile
  canvas: undefined;
}> {
  return {
    blob: input,
    report: { hdrWarning: false, autoStraightened: false, export: {} },
    canvas: undefined,
  };
}
