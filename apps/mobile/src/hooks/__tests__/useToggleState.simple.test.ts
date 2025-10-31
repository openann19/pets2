/**
 * Test for useToggleState hook
 * Simple boolean state management hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useToggleState } from '../utils/useToggleState';

describe('useToggleState', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useToggleState());
    
    expect(result.current.isOn).toBe(false);
  });

  it('should initialize with custom initial value', () => {
    const { result } = renderHook(() => useToggleState(true));
    
    expect(result.current.isOn).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggleState(false));
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isOn).toBe(true);
  });

  it('should toggle multiple times', () => {
    const { result } = renderHook(() => useToggleState(false));
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOn).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOn).toBe(false);
  });

  it('should provide setOn function', () => {
    const { result } = renderHook(() => useToggleState(false));
    
    act(() => {
      result.current.setOn();
    });
    
    expect(result.current.isOn).toBe(true);
  });

  it('should provide setOff function', () => {
    const { result } = renderHook(() => useToggleState(true));
    
    act(() => {
      result.current.setOff();
    });
    
    expect(result.current.isOn).toBe(false);
  });
});
