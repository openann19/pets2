import { batchAutoCrop } from '../BatchAutoCrop';
import { AutoCropEngine } from '../AutoCropEngine';

// Mock AutoCropEngine
jest.mock('../AutoCropEngine');

describe('BatchAutoCrop', () => {
  const mockItems = [
    { uri: 'file://photo1.jpg', id: 1 },
    { uri: 'file://photo2.jpg', id: 2 },
    { uri: 'file://photo3.jpg', id: 3 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AutoCropEngine.suggestCrops as jest.Mock).mockResolvedValue([
      {
        ratio: '4:5',
        focus: { x: 100, y: 100, width: 400, height: 300 },
        crop: { x: 50, y: 50, width: 400, height: 500 },
        method: 'eyes',
      },
    ]);
    (AutoCropEngine.applyCrop as jest.Mock).mockImplementation(
      async (uri) => `file://cropped-${uri.split('/').pop()}`,
    );
  });

  describe('basic functionality', () => {
    it('should process all items successfully', async () => {
      const results = await batchAutoCrop(mockItems, '4:5');

      expect(results).toHaveLength(3);
      results.forEach((result, i) => {
        expect(result.input).toEqual(mockItems[i]);
        expect(result.outputUri).toBeTruthy();
        expect(result.error).toBeUndefined();
      });
    });

    it('should return results sorted by ID', async () => {
      const unsortedItems = [
        { uri: 'file://photo3.jpg', id: 3 },
        { uri: 'file://photo1.jpg', id: 1 },
        { uri: 'file://photo2.jpg', id: 2 },
      ];

      const results = await batchAutoCrop(unsortedItems, '4:5');

      expect(results).toHaveLength(3);
      expect(results[0].input.id).toBe(1);
      expect(results[1].input.id).toBe(2);
      expect(results[2].input.id).toBe(3);
    });

    it('should sort by URI when no ID provided', async () => {
      const items = [
        { uri: 'file://photo3.jpg' },
        { uri: 'file://photo1.jpg' },
        { uri: 'file://photo2.jpg' },
      ];

      const results = await batchAutoCrop(items, '4:5');

      expect(results).toHaveLength(3);
      // Should be sorted alphabetically by URI
      expect(results[0].input.uri).toBe('file://photo1.jpg');
      expect(results[1].input.uri).toBe('file://photo2.jpg');
      expect(results[2].input.uri).toBe('file://photo3.jpg');
    });
  });

  describe('concurrency control', () => {
    it('should process items concurrently', async () => {
      const calls: any[] = [];
      (AutoCropEngine.suggestCrops as jest.Mock).mockImplementation(async (uri) => {
        calls.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 50));
        return [
          {
            ratio: '4:5',
            crop: { x: 0, y: 0, width: 100, height: 125 },
            method: 'eyes',
          },
        ];
      });

      const startTime = Date.now();
      await batchAutoCrop(mockItems, '4:5', { concurrency: 2 });
      const endTime = Date.now();

      // With concurrency 2, should take ~100ms (2 batches of 50ms)
      // Without concurrency, would take ~150ms (3 sequential)
      expect(endTime - startTime).toBeLessThan(150);
    });

    it('should not exceed max concurrency', async () => {
      const processedCounts: number[] = [];
      let currentProcessing = 0;

      (AutoCropEngine.suggestCrops as jest.Mock).mockImplementation(async () => {
        currentProcessing++;
        processedCounts.push(currentProcessing);
        await new Promise((resolve) => setTimeout(resolve, 10));
        currentProcessing--;
        return [{ ratio: '4:5', crop: { x: 0, y: 0, width: 100, height: 125 }, method: 'eyes' }];
      });

      await batchAutoCrop(
        new Array(10).fill(0).map((_, i) => ({ uri: `photo${i}.jpg` })),
        '4:5',
        {
          concurrency: 3,
        },
      );

      // Max concurrent processing should be 3
      expect(Math.max(...processedCounts)).toBeLessThanOrEqual(3);
    });

    it('should not exceed number of items for concurrency', async () => {
      await batchAutoCrop(mockItems.slice(0, 2), '4:5', { concurrency: 10 });

      // Should still work with fewer items than concurrency
      expect(AutoCropEngine.suggestCrops).toHaveBeenCalledTimes(2);
    });
  });

  describe('progress callbacks', () => {
    it('should call progress callback for each item', async () => {
      const progressCalls: any[] = [];
      const onProgress = jest.fn((done, total, last) => {
        progressCalls.push({ done, total, last });
      });

      await batchAutoCrop(mockItems, '4:5', { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(3);
      progressCalls.forEach((call, i) => {
        expect(call.done).toBe(i + 1);
        expect(call.total).toBe(3);
        expect(call.last).toBeTruthy();
      });
    });

    it('should include error in progress callback when item fails', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockRejectedValueOnce(
        new Error('Processing failed'),
      );

      const progressCalls: any[] = [];
      const onProgress = jest.fn((done, total, last) => {
        progressCalls.push({ done, total, last });
      });

      await batchAutoCrop(mockItems, '4:5', { onProgress });

      // Should still call progress even for failed items
      expect(progressCalls).toContainEqual(
        expect.objectContaining({
          done: 1,
          total: 3,
          last: expect.objectContaining({ error: expect.any(Error) }),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle individual item failures gracefully', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockImplementation(async (uri) => {
        if (uri === 'file://photo2.jpg') {
          throw new Error('Processing failed');
        }
        return [{ ratio: '4:5', crop: { x: 0, y: 0, width: 100, height: 125 }, method: 'eyes' }];
      });

      const results = await batchAutoCrop(mockItems, '4:5');

      expect(results).toHaveLength(3);
      expect(results.find((r) => r.input.id === 2)?.error).toBeTruthy();
      expect(results.find((r) => r.input.id === 1)?.outputUri).toBeTruthy();
      expect(results.find((r) => r.input.id === 3)?.outputUri).toBeTruthy();
    });

    it('should handle missing suggestions', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockResolvedValueOnce([]);

      const results = await batchAutoCrop(mockItems.slice(0, 1), '4:5');

      expect(results).toHaveLength(1);
      expect(results[0].error).toBeTruthy();
      expect(results[0].error?.message).toBe('No suggestion');
    });

    it('should handle all items failing', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockRejectedValue(new Error('All failed'));

      const results = await batchAutoCrop(mockItems, '4:5');

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.error).toBeTruthy();
        expect(result.outputUri).toBeUndefined();
      });
    });
  });

  describe('custom options', () => {
    it('should pass custom eye weight to engine', async () => {
      await batchAutoCrop(mockItems.slice(0, 1), '4:5', { eyeWeight: 0.7 });

      expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
        'file://photo1.jpg',
        ['4:5'],
        expect.objectContaining({ eyeWeight: 0.7 }),
      );
    });

    it('should pass custom padding to engine', async () => {
      await batchAutoCrop(mockItems.slice(0, 1), '4:5', { padPct: 0.2 });

      expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
        'file://photo1.jpg',
        ['4:5'],
        expect.objectContaining({ padPct: 0.2 }),
      );
    });

    it('should use default options when not provided', async () => {
      await batchAutoCrop(mockItems.slice(0, 1), '4:5');

      expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
        'file://photo1.jpg',
        ['4:5'],
        expect.objectContaining({
          eyeWeight: 0.6, // default
          padPct: 0.16, // default
        }),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', async () => {
      const results = await batchAutoCrop([], '4:5');
      expect(results).toEqual([]);
    });

    it('should handle single item', async () => {
      const results = await batchAutoCrop([mockItems[0]], '4:5');

      expect(results).toHaveLength(1);
      expect(results[0].outputUri).toBeTruthy();
    });

    it('should handle very large batches', async () => {
      const largeBatch = new Array(100).fill(0).map((_, i) => ({ uri: `photo${i}.jpg`, id: i }));

      const results = await batchAutoCrop(largeBatch, '4:5', { concurrency: 5 });

      expect(results).toHaveLength(100);
      expect(AutoCropEngine.suggestCrops).toHaveBeenCalledTimes(100);
    });
  });
});
