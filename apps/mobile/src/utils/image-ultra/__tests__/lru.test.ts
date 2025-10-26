/**
 * LRU Cache Tests
 */

import { LRU } from '../lru';

describe('LRU', () => {
  it('should get and set values', () => {
    const lru = new LRU<string, number>();
    
    lru.set('a', 1);
    lru.set('b', 2);
    
    expect(lru.get('a')).toBe(1);
    expect(lru.get('b')).toBe(2);
  });

  it('should evict least recently used when full', () => {
    const lru = new LRU<string, number>(2);
    
    lru.set('a', 1);
    lru.set('b', 2);
    lru.set('c', 3); // Should evict 'a'
    
    expect(lru.has('a')).toBe(false);
    expect(lru.has('b')).toBe(true);
    expect(lru.has('c')).toBe(true);
  });

  it('should promote recently used items', () => {
    const lru = new LRU<string, number>(2);
    
    lru.set('a', 1);
    lru.set('b', 2);
    lru.get('a'); // Make 'a' recently used
    lru.set('c', 3); // Should evict 'b'
    
    expect(lru.has('a')).toBe(true);
    expect(lru.has('b')).toBe(false);
    expect(lru.has('c')).toBe(true);
  });

  it('should update existing keys', () => {
    const lru = new LRU<string, number>();
    
    lru.set('a', 1);
    lru.set('a', 2);
    
    expect(lru.get('a')).toBe(2);
  });

  it('should track size', () => {
    const lru = new LRU<string, number>();
    
    expect(lru.size).toBe(0);
    
    lru.set('a', 1);
    lru.set('b', 2);
    
    expect(lru.size).toBe(2);
  });

  it('should clear cache', () => {
    const lru = new LRU<string, number>();
    
    lru.set('a', 1);
    lru.set('b', 2);
    lru.clear();
    
    expect(lru.size).toBe(0);
    expect(lru.has('a')).toBe(false);
  });

  it('should change capacity', () => {
    const lru = new LRU<string, number>(5);
    
    lru.set('a', 1);
    lru.set('b', 2);
    
    lru.setCapacity(1);
    
    expect(lru.capacity).toBe(1);
    expect(lru.size).toBe(1);
  });
});

