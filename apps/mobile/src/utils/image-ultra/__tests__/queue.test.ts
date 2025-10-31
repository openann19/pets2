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

    const { cancel, promise } = queue.enqueue('task-1', async (signal) => {
      // Check signal periodically
      for (let i = 0; i < 20; i++) {
        if (signal.aborted) {
          throw new Error('Task cancelled');
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      return 'done';
    });

    // Cancel the task
    cancel();

    // Wait for rejection with timeout
    await expect(
      Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout waiting for cancellation')), 500)
        ),
      ])
    ).rejects.toThrow();
  });

  it('should handle abort signals', async () => {
    const queue = new AbortableQueue(1);

    const { promise } = queue.enqueue('task-1', async (signal) => {
      // Check signal periodically
      for (let i = 0; i < 20; i++) {
        if (signal.aborted) {
          throw new Error('aborted');
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      return 'done';
    });

    // Cancel immediately
    queue.cancel('task-1');

    // Wait for promise to reject with timeout
    await expect(
      Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout waiting for abort')), 500)
        ),
      ])
    ).rejects.toThrow();
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
