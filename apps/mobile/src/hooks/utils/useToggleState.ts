import { useCallback, useState } from "react";

export interface UseToggleStateReturn {
  isOn: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
}

/**
 * Hook for managing boolean toggle state
 *
 * @example
 * const { isOn, toggle, setOn, setOff } = useToggleState();
 */
export function useToggleState(
  initialValue: boolean = false,
): UseToggleStateReturn {
  const [isOn, setIsOn] = useState(initialValue);

  const toggle = useCallback(() => {
    setIsOn((prev) => !prev);
  }, []);

  const setOn = useCallback(() => {
    setIsOn(true);
  }, []);

  const setOff = useCallback(() => {
    setIsOn(false);
  }, []);

  return {
    isOn,
    toggle,
    setOn,
    setOff,
  };
}
