/**
 * Test for useToggleState hook
 * Simple boolean state management hook
 */
/// <reference types="jest" />

import { renderHook } from '@testing-library/react-hooks';
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

    result.current.toggle();

    expect(result.current.isOn).toBe(true);
  });

  it('should toggle multiple times', () => {
    const { result } = renderHook(() => useToggleState(false));

    result.current.toggle();
    expect(result.current.isOn).toBe(true);

    result.current.toggle();
    expect(result.current.isOn).toBe(false);
  });

  it('should provide setOn function', () => {
    const { result } = renderHook(() => useToggleState(false));

    result.current.setOn();

    expect(result.current.isOn).toBe(true);
  });

  it('should provide setOff function', () => {
    const { result } = renderHook(() => useToggleState(true));

    result.current.setOff();

    expect(result.current.isOn).toBe(false);
  });
});
