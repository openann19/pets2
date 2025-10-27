/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { useToggleState } from "../useToggleState";

describe("useToggleState", () => {
  it("should initialize with false by default", () => {
    const { result } = renderHook(() => useToggleState());
    expect(result.current[0]).toBe(false);
  });

  it("should initialize with provided initial value", () => {
    const { result } = renderHook(() => useToggleState(true));
    expect(result.current[0]).toBe(true);
  });

  it("should toggle from false to true", () => {
    const { result } = renderHook(() => useToggleState());
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });

  it("should toggle from true to false", () => {
    const { result } = renderHook(() => useToggleState(true));
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });

  it("should toggle multiple times correctly", () => {
    const { result } = renderHook(() => useToggleState());

    act(() => result.current[1]()); // false -> true
    expect(result.current[0]).toBe(true);

    act(() => result.current[1]()); // true -> false
    expect(result.current[0]).toBe(false);

    act(() => result.current[1]()); // false -> true
    expect(result.current[0]).toBe(true);
  });

  it("should return stable toggle function reference", () => {
    const { result } = renderHook(() => useToggleState());
    const firstToggle = result.current[1];

    // In React Native testing, rerender needs the same callback
    const { result: result2 } = renderHook(() => useToggleState());
    const secondToggle = result2.current[1];

    expect(firstToggle).toBe(secondToggle);
  });
});
