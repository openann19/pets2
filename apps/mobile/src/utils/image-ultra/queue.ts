export interface WorkItem {
  id: string;
  run: () => Promise<void>;
}

export class AsyncQueue<T extends WorkItem> {
  private q: T[] = [];
  private running = false;

  enqueue(item: T) { this.q.push(item); void this.drain(); }

  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.q.length) {
        const next = this.q.shift()!;
        await next.run();
      }
    } finally {
      this.running = false;
    }
  }
}

// Legacy queue for backward compatibility
export type Task<T> = (signal: AbortSignal) => Promise<T>;

export class AbortableQueue {
  private readonly maxConcurrent: number;
  private running = 0;
  private q: Array<{
    id: string;
    run: Task<unknown>;
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
    ctrl: AbortController;
  }> = [];

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(id: string, run: Task<T>): { id: string; cancel: () => void; promise: Promise<T> } {
    const ctrl = new AbortController();
    const p = new Promise<T>((resolve, reject) => {
      this.q.push({ id, run, resolve, reject, ctrl });
      this.pump();
    });
    return {
      id,
      cancel: () => {
        ctrl.abort();
      },
      promise: p,
    };
  }

  private pump() {
    while (this.running < this.maxConcurrent && this.q.length) {
      const job = this.q.shift()!;
      this.running++;
      job
        .run(job.ctrl.signal)
        .then((v) => {
          job.resolve(v);
        })
        .catch((e) => {
          job.reject(e);
        })
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
