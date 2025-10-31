/**
 * Standalone hook tests with no framework dependencies
 */
import { describe, it, expect } from '@jest/globals';

// This test doesn't actually test a real React hook
// It just creates a fake "hook-like" object with similar behavior
// to prove the testing environment works

// Mock "hook" implementation
function useCounterSimple(initialValue = 0) {
  let count = initialValue;
  
  return {
    getCount: () => count,
    increment: () => { count += 1; },
    decrement: () => { count -= 1; },
    reset: () => { count = initialValue; }
  };
}

describe('Standalone Hook Test', () => {
  it('should handle basic counting operations', () => {
    const counter = useCounterSimple(5);
    
    expect(counter.getCount()).toBe(5);
    
    counter.increment();
    expect(counter.getCount()).toBe(6);
    
    counter.decrement();
    counter.decrement();
    expect(counter.getCount()).toBe(4);
    
    counter.reset();
    expect(counter.getCount()).toBe(5);
  });
});
