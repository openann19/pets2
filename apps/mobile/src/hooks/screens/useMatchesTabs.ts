import { useState, useCallback } from "react";

export type MatchesTab = "matches" | "likedYou";

export interface UseMatchesTabsReturn {
  activeTab: MatchesTab;
  setActiveTab: (tab: MatchesTab) => void;
}

/**
 * Hook for managing MatchesScreen tab state
 */
export function useMatchesTabs(
  initialTab: MatchesTab = "matches",
): UseMatchesTabsReturn {
  const [activeTab, setActiveTab] = useState<MatchesTab>(initialTab);

  return {
    activeTab,
    setActiveTab,
  };
}
