import { AbortableWorker } from '../AbortableWorker';

describe('AbortableWorker', () => {
  describe('basic functionality', () => {
    it('should execute tasks in order', async () => {
      const worker = new AbortableWorker({ concurrency: 1 });

      const results = await Promise.all([
        worker.add(() => Promise.resolve('task1')),
        worker.add(() => Promise.resolve('task2')),
        worker.add(() => Promise.resolve('task3')),
      ]);

      expect(results).toEqual(['task1', 'task2', 'task3']);
    });

    it('should process multiple tasks concurrently', async () => {
      const worker = new AbortableWorker({ concurrency: 3 });

      const startTimes: number[] = [];
      const tasks = Array.from({ length: 6 }, (_, i) =>
        worker.add(() => {
          startTimes.push(Date.now());
          return Promise.resolve(`task${i}`);
        }),
      );

      await Promise.all(tasks);

      // First 3 should start immediately
      expect(startTimes.length).toBe(6);
      // Allow some tolerance for execution order
      expect(
        Math.max(...startTimes.slice(0, 3)) - Math.min(...startTimes.slice(0, 3)),
      ).toBeLessThan(10);
    });
  });

  describe('abort functionality', () => {
    it('should abort pending tasks', async () => {
      const worker = new AbortableWorker({ concurrency: 1 });

      const task1Promise = worker.add(() => Promise.resolve('task1'));
      const task2Promise = worker.add(() => Promise.resolve('task2'));
      const task3Promise = worker.add(() => Promise.resolve('task3'));

      // Complete first task
      await task1Promise;

      // Abort remaining
      worker.abort();

      // Remaining tasks should be rejected
      await expect(task2Promise).rejects.toThrow('Worker aborted');
      await expect(task3Promise).rejects.toThrow('Worker aborted');
    });

    it('should not execute new tasks after abort', async () => {
      const worker = new AbortableWorker();

      worker.abort();

      await expect(worker.add(() => Promise.resolve('task'))).rejects.toThrow(
        'Worker has been aborted',
      );
    });

    it('should track abort status', () => {
      const worker = new AbortableWorker();

      expect(worker.isAborted).toBe(false);

      worker.abort();

      expect(worker.isAborted).toBe(true);
    });
  });

  describe('timeout functionality', () => {
    it('should timeout slow tasks', async () => {
      const worker = new AbortableWorker({ timeout: 100 });

      await expect(
        worker.add(() => new Promise((resolve) => setTimeout(resolve, 1000))),
      ).rejects.toThrow('Task timeout');
    });

    it('should not timeout fast tasks', async () => {
      const worker = new AbortableWorker({ timeout: 100 });

      const result = await worker.add(() => Promise.resolve('done'));

      expect(result).toBe('done');
    });
  });

  describe('state queries', () => {
    it('should track queue length', async () => {
      const worker = new AbortableWorker({ concurrency: 1 });

      const task1 = worker.add(() => new Promise((resolve) => setTimeout(() => resolve('1'), 10)));
      const task2 = worker.add(() => Promise.resolve('2'));
      const task3 = worker.add(() => Promise.resolve('3'));

      // Initially 1 running, 2 in queue
      expect(worker.queueLength).toBe(2);

      await Promise.all([task1, task2, task3]);

      expect(worker.queueLength).toBe(0);
    });

    it('should report idle state', async () => {
      const worker = new AbortableWorker();

      expect(worker.isIdle).toBe(true);

      const task = worker.add(() => Promise.resolve('done'));
      expect(worker.isIdle).toBe(false);

      await task;
      expect(worker.isIdle).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should propagate task errors', async () => {
      const worker = new AbortableWorker();

      await expect(worker.add(() => Promise.reject(new Error('Task failed')))).rejects.toThrow(
        'Task failed',
      );
    });

    it('should continue processing after error', async () => {
      const worker = new AbortableWorker({ concurrency: 1 });

      const task1 = worker.add(() => Promise.reject(new Error('Failed')));
      const task2 = worker.add(() => Promise.resolve('success'));

      await expect(task1).rejects.toThrow('Failed');
      await expect(task2).resolves.toBe('success');
    });
  });
});
