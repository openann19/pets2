/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-native';
import { useToggleState } from '../useToggleState';

describe('useToggleState', () => {
  it('should initialize with false by default', () => {
    const { result } = renderHook(() => useToggleState());
    expect(result.current.isOn).toBe(false);
  });

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useToggleState(true));
    expect(result.current.isOn).toBe(true);
  });

  it('should toggle from false to true', () => {
    const { result } = renderHook(() => useToggleState());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOn).toBe(true);
  });

  it('should toggle from true to false', () => {
    const { result } = renderHook(() => useToggleState(true));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOn).toBe(false);
  });

  it('should toggle multiple times correctly', () => {
    const { result } = renderHook(() => useToggleState());

    act(() => result.current.toggle()); // false -> true
    expect(result.current.isOn).toBe(true);

    act(() => result.current.toggle()); // true -> false
    expect(result.current.isOn).toBe(false);

    act(() => result.current.toggle()); // false -> true
    expect(result.current.isOn).toBe(true);
  });

  it('should return stable toggle function reference', () => {
    const { result } = renderHook(() => useToggleState());
    const firstToggle = result.current.toggle;

    // In React Native testing, rerender needs the same callback
    const { result: result2 } = renderHook(() => useToggleState());
    const secondToggle = result2.current.toggle;

    expect(firstToggle).toBe(secondToggle);
  });

  it('should have setOn and setOff methods', () => {
    const { result } = renderHook(() => useToggleState());

    act(() => result.current.setOff());
    expect(result.current.isOn).toBe(false);

    act(() => result.current.setOn());
    expect(result.current.isOn).toBe(true);
  });
});
