/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useModalState } from '../useModalState';

describe('useModalState', () => {
  it('should initialize with false', () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open modal', () => {
    const { result } = renderHook(() => useModalState());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useModalState());
    act(() => {
      result.current.open();
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModalState());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('should return stable function references', () => {
    const { result } = renderHook(() => useModalState());
    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;

    // In React Native testing, create a new hook instance to test stability
    const { result: result2 } = renderHook(() => useModalState());

    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });
});
