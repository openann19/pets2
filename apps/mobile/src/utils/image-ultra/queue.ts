/**
 * Abortable Worker Queue
 * Manages concurrent image processing tasks with cancellation support
 * Prevents memory leaks and allows mid-operation cancellation
 */

export type Task<T> = (signal: AbortSignal) => Promise<T>;

export class AbortableQueue {
  private readonly maxConcurrent: number;
  private running = 0;
  private q: Array<{
    id: string;
    run: Task<any>;
    resolve: (v: any) => void;
    reject: (e: any) => void;
    ctrl: AbortController;
  }> = [];

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(
    id: string,
    run: Task<T>
  ): { id: string; cancel: () => void; promise: Promise<T> } {
    const ctrl = new AbortController();
    const p = new Promise<T>((resolve, reject) => {
      this.q.push({ id, run, resolve, reject, ctrl });
      this.pump();
    });
    return { id, cancel: () => ctrl.abort(), promise: p };
  }

  private pump() {
    while (this.running < this.maxConcurrent && this.q.length) {
      const job = this.q.shift()!;
      this.running++;
      job.run(job.ctrl.signal)
        .then((v) => job.resolve(v))
        .catch((e) => job.reject(e))
        .finally(() => {
          this.running--;
          this.pump();
        });
    }
  }

  cancel(id: string) {
    const idx = this.q.findIndex((j) => j.id === id);
    if (idx >= 0) {
      const job = this.q[idx];
      if (job) {
        job.ctrl.abort();
        this.q.splice(idx, 1);
      }
    }
  }

  clear() {
    for (const job of this.q) {
      job.ctrl.abort();
    }
    this.q = [];
  }

  get size() {
    return this.q.length;
  }

  get active() {
    return this.running;
  }
}

