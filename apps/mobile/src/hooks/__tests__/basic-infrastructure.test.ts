/**
 * Simple test to verify basic testing infrastructure works
 */

describe('Basic Test Infrastructure', () => {
  it('should run a simple test', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should handle mock functions', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
