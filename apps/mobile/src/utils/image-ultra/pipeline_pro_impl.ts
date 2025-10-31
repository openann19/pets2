import type { ImageUri, PipelineOptions } from './types';

/**
 * Pro Pipeline Implementation
 * Mobile-native implementation that delegates to native image processing
 */
export async function processImageUltraPro(
  uri: ImageUri,
  _opts: PipelineOptions,
): Promise<ImageUri> {
  // On mobile, return the input URI as-is since native processing
  // happens at a different layer (expo-image-manipulator, etc.)
  // This is a placeholder until native implementation is complete
  return uri;
}
