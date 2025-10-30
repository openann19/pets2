/**
 * Abortable Worker Queue
 * Manages image processing tasks with cancellation support
 * Prevents memory buildup and allows background task abortion
 */

export type Task<T> = () => Promise<T>;

export interface AbortableWorkerOptions {
  /** Max concurrent tasks (default: 2) */
  concurrency?: number;
  /** Task timeout in ms (default: 30000) */
  timeout?: number;
}

export class AbortableWorker<T> {
  private queue: Array<{ task: Task<T>; resolve: (v: T) => void; reject: (e: Error) => void }> = [];
  private running = 0;
  private aborted = false;
  private concurrency: number;
  private timeout: number;
  private abortController: AbortController | null = null;

  constructor(options: AbortableWorkerOptions = {}) {
    this.concurrency = options.concurrency ?? 2;
    this.timeout = options.timeout ?? 30000;
    this.aborted = false;
  }

  /**
   * Add a task to the queue
   * @param task - Async task function
   * @returns Promise that resolves when task completes
   */
  add(task: Task<T>): Promise<T> {
    if (this.aborted) {
      return Promise.reject(new Error('Worker has been aborted'));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  /**
   * Abort all pending tasks
   */
  abort(): void {
    this.aborted = true;
    this.queue.forEach(({ reject }) => {
      reject(new Error('Worker aborted'));
    });
    this.queue = [];
    this.abortController?.abort();
  }

  /**
   * Check if worker is aborted
   */
  get isAborted(): boolean {
    return this.aborted;
  }

  /**
   * Get number of tasks in queue
   */
  get queueLength(): number {
    return this.queue.length;
  }

  /**
   * Check if all tasks are complete
   */
  get isIdle(): boolean {
    return this.running === 0 && this.queue.length === 0;
  }

  private async process(): Promise<void> {
    if (this.running >= this.concurrency || this.queue.length === 0 || this.aborted) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift()!;
    this.running++;

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<T>((_, timeoutReject) => {
        setTimeout(() => {
          timeoutReject(new Error('Task timeout'));
        }, this.timeout);
      });

      // Race between task and timeout
      const result = await Promise.race([task(), timeoutPromise]);

      resolve(result);
    } catch (error) {
      // Ensure error is always an Error instance
      const errorObj = error instanceof Error ? error : new Error(String(error));
      reject(errorObj);
    } finally {
      this.running--;
      // Process next task in queue
      this.process();
    }
  }

  /**
   * Wait for all tasks to complete
   */
  async wait(): Promise<void> {
    while (!this.isIdle && !this.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

/**
 * Create a worker pool for image processing
 */
export function createImageWorker<T>(
  tasks: Task<T>[],
  options: AbortableWorkerOptions = {},
): AbortableWorker<T> {
  const worker = new AbortableWorker<T>(options);

  // Add all tasks to queue
  const promises = tasks.map((task) => worker.add(task));

  return worker;
}

/**
 * Process image operation with abort support
 * Automatically cleans up on abort
 */
export async function processWithAbort<T>(
  operation: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    throw new Error('Operation aborted');
  }

  const result = await Promise.race([
    operation(),
    new Promise<never>((_, reject) => {
      signal?.addEventListener('abort', () => {
        reject(new Error('Aborted'));
      });
    }),
  ]);

  return result;
}
