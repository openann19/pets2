/**
 * useDemoMode Hook Tests
 * Tests the demo mode hook
 */

import { renderHook } from '@testing-library/react-hooks';
import { useDemoMode } from '../useDemoMode';

// Mock the demo provider
jest.mock('../demo/DemoModeProvider', () => ({
  useDemoMode: jest.fn(() => ({
    isDemoMode: false,
    toggleDemoMode: jest.fn(),
    demoData: null,
  })),
}));

describe('useDemoMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return demo mode state', () => {
    const { result } = renderHook(() => useDemoMode());

    expect(result.current).toEqual({
      isDemoMode: false,
      toggleDemoMode: expect.any(Function),
      demoData: null,
    });
  });

  it('should maintain stable reference', () => {
    const { result, rerender } = renderHook(() => useDemoMode());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});
