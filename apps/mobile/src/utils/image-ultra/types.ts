export type ImageUri = { uri: string; width?: number; height?: number };

export interface PipelineOptions {
  upscale?: { factor: number }; // 1,2,3,4
  denoise?: { strength: number }; // 0..1
  sharpen?: { amount: number }; // 0..1
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number; // 1..100
}

export interface ImageOps {
  upscale?(img: ImageUri, factor: number): Promise<ImageUri>;
  denoise?(img: ImageUri, strength: number): Promise<ImageUri>;
  sharpen?(img: ImageUri, amount: number): Promise<ImageUri>;
  export(
    img: ImageUri,
    fmt: NonNullable<PipelineOptions['format']>,
    quality?: number,
  ): Promise<ImageUri>;
}

export interface ProcessorContext {
  ops: ImageOps;
  options: PipelineOptions;
}
