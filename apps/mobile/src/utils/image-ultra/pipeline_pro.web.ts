import type { ImageUri, PipelineOptions } from './types';

export async function runPipelineProWeb(_uri: ImageUri, _opts: PipelineOptions): Promise<ImageUri> {
  // Web fallback (no-op or browser pipeline)
  return _uri;
}

