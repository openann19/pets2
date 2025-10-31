/// <reference types="jest" />

describe('Jest Environment Test', () => {
  it('should work with basic Jest setup', () => {
    expect(2 + 2).toBe(4);
    expect(typeof jest).toBe('object');
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});
