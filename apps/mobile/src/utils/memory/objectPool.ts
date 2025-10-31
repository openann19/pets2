/**
 * Object Pooling Utilities
 *
 * Reuses objects to reduce garbage collection pressure
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
interface PoolOptions<T> {
  /** Initial pool size */
  initialSize?: number;
  /** Maximum pool size */
  maxSize?: number;
  /** Factory function to create new objects */
  factory: () => T;
  /** Reset function to clear object state */
  reset?: (obj: T) => void;
}

/**
 * Object pool for reusing objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset?: (obj: T) => void;
  private maxSize: number;
  private initialSize: number;
  private created = 0;

  constructor(options: PoolOptions<T>) {
    this.factory = options.factory;
    this.reset = options.reset;
    this.maxSize = options.maxSize ?? 100;
    this.initialSize = options.initialSize ?? 10;

    // Pre-populate pool
    for (let i = 0; i < this.initialSize; i++) {
      this.pool.push(this.factory());
      this.created++;
    }
  }

  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
      this.created++;
    }

    return obj;
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (this.reset) {
      this.reset(obj);
    }

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
    // If pool is full, let object be garbage collected
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      available: this.pool.length,
      created: this.created,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }
}

/**
 * Weak reference cache for temporary data
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

/**
 * Pre-allocated array pool for list operations
 */
export class ArrayPool {
  private static pools = new Map<number, ObjectPool<any[]>>();

  static acquire<T>(size: number): T[] {
    let pool = this.pools.get(size);

    if (!pool) {
      pool = new ObjectPool({
        factory: () => new Array(size),
        reset: (arr) => arr.length = 0,
        initialSize: 5,
        maxSize: 20,
      });
      this.pools.set(size, pool);
    }

    return pool.acquire() as T[];
  }

  static release<T>(arr: T[]): void {
    const pool = this.pools.get(arr.length);
    if (pool) {
      pool.release(arr as any[]);
    }
  }
}
