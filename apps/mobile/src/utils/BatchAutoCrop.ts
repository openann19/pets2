import { AutoCropEngine } from './AutoCropEngine';

type Rect = { x: number; y: number; width: number; height: number };

type BatchItem = { uri: string; id?: string | number };
type BatchResult = { input: BatchItem; outputUri?: string; error?: Error };

export async function batchAutoCrop(
  items: BatchItem[],
  ratio: string = '4:5',
  options: {
    eyeWeight?: number;
    padPct?: number;
    concurrency?: number;
    onProgress?: (done: number, total: number, last?: BatchResult) => void;
  } = {},
): Promise<BatchResult[]> {
  const { eyeWeight = 0.6, padPct = 0.16, concurrency = 2, onProgress } = options;
  const queue = items.slice();
  const results: BatchResult[] = [];
  let done = 0;

  async function worker() {
    while (queue.length) {
      const item = queue.shift()!;
      try {
        const [suggestion] = await AutoCropEngine.suggestCrops(item.uri, [ratio], {
          eyeWeight,
          padPct,
        });
        if (!suggestion) throw new Error('No suggestion');
        const out = await AutoCropEngine.applyCrop(item.uri, suggestion.crop, 1);
        const res: BatchResult = { input: item, outputUri: out };
        results.push(res);
        done++;
        onProgress?.(done, items.length, res);
      } catch (e: any) {
        const res: BatchResult = { input: item, error: e };
        results.push(res);
        done++;
        onProgress?.(done, items.length, res);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);

  return results.sort((a, b) =>
    String(a.input.id ?? a.input.uri).localeCompare(String(b.input.id ?? b.input.uri)),
  );
}
