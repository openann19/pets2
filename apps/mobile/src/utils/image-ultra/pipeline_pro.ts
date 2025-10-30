import type { ImageUri, PipelineOptions } from './types';

type ProModule = { processImageUltraPro: (uri: ImageUri, opts: PipelineOptions) => Promise<ImageUri> };

export async function runPipelinePro(uri: ImageUri, options: PipelineOptions): Promise<ImageUri> {
  const mod = (await import('./pipeline_pro_impl')) as ProModule; // ESM safe
  return mod.processImageUltraPro(uri, options);
}
