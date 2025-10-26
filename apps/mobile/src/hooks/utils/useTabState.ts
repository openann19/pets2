import { useCallback, useState } from "react";

export interface UseTabStateReturn<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

/**
 * Hook for managing tab state
 * 
 * @example
 * const { activeTab, setActiveTab } = useTabState('matches');
 */
export function useTabState<T extends string>(
  initialTab: T
): UseTabStateReturn<T> {
  const [activeTab, setActiveTabState] = useState<T>(initialTab);

  const setActiveTab = useCallback((tab: T) => {
    setActiveTabState(tab);
  }, []);

  return {
    activeTab,
    setActiveTab,
  };
}
