/**
 * Tiny LRU Cache for Images
 * Memory-efficient cache for processed images, blobs, and URIs
 * Evicts least-recently-used entries when capacity is reached
 */

export class LRU<K, V> {
  private max: number;
  private map = new Map<K, V>();

  constructor(max = 64) {
    this.max = max;
  }

  get(k: K): V | undefined {
    const v = this.map.get(k);
    if (v) {
      this.map.delete(k);
      this.map.set(k, v);
    }
    return v;
  }

  set(k: K, v: V) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
      }
    }
  }

  has(k: K): boolean {
    return this.map.has(k);
  }

  delete(k: K): boolean {
    return this.map.delete(k);
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }

  get capacity() {
    return this.max;
  }

  setCapacity(newMax: number) {
    this.max = newMax;
    while (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
      }
    }
  }
}

