/**
 * Basic React Testing Setup
 * This file contains basic tests that should pass with minimal configuration
 */

import { renderHook } from '@testing-library/react-hooks';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

// Mock React Native's useColorScheme
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('Basic React Hook Tests', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });
  
  it('should test useState hook', () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0);
      return { count, setCount };
    });
    
    expect(result.current.count).toBe(0);
  });

  it('should test useEffect hook', () => {
    const mockFn = jest.fn();
    
    const { rerender } = renderHook(
      ({ dependency }) => {
        useEffect(() => {
          mockFn(dependency);
        }, [dependency]);
      },
      { initialProps: { dependency: 'initial' } }
    );
    
    expect(mockFn).toHaveBeenCalledWith('initial');
    
    rerender({ dependency: 'updated' });
    
    expect(mockFn).toHaveBeenCalledWith('updated');
  });

  it('should test mocked useColorScheme', () => {
    mockUseColorScheme.mockReturnValue('dark');
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe('dark');
  });
});
