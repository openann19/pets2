/**
 * AbortableQueue Tests
 */

import { AbortableQueue } from '../queue';

describe('AbortableQueue', () => {
  it('should process tasks in order', async () => {
    const queue = new AbortableQueue(1);
    const results: number[] = [];

    queue.enqueue('task-1', async () => {
      results.push(1);
      return 1;
    });

    queue.enqueue('task-2', async () => {
      results.push(2);
      return 2;
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(results).toEqual([1, 2]);
  });

  it('should respect max concurrency', async () => {
    const queue = new AbortableQueue(2);
    const results: number[] = [];

    queue.enqueue('task-1', async () => {
      results.push(1);
      return 1;
    });

    queue.enqueue('task-2', async () => {
      results.push(2);
      return 2;
    });

    queue.enqueue('task-3', async () => {
      results.push(3);
      return 3;
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(results.slice(0, 2).sort()).toEqual([1, 2]);
    expect(queue.active).toBeLessThanOrEqual(2);
  });

  it('should cancel tasks', async () => {
    const queue = new AbortableQueue(1);

    const { cancel, promise } = queue.enqueue('task-1', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'done';
    });

    cancel();

    await expect(promise).rejects.toThrow();
  });

  it('should handle abort signals', async () => {
    const queue = new AbortableQueue(1);

    const { promise } = queue.enqueue('task-1', async (signal) => {
      if (signal.aborted) {
        throw new Error('aborted');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'done';
    });

    queue.cancel('task-1');

    await expect(promise).rejects.toThrow();
  });

  it('should track queue size', () => {
    const queue = new AbortableQueue(1);

    queue.enqueue('task-1', async () => 1);
    queue.enqueue('task-2', async () => 2);

    expect(queue.size).toBeGreaterThan(0);
  });

  it('should clear queue', async () => {
    const queue = new AbortableQueue(1);

    queue.enqueue('task-1', async () => 1);
    queue.enqueue('task-2', async () => 2);

    queue.clear();

    expect(queue.size).toBe(0);
  });
});
