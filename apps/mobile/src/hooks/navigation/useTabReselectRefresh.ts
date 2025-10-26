import { useEffect, useMemo } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

type AnyScrollRef =
  | React.RefObject<{ scrollToOffset?: (p: { offset: number; animated: boolean }) => void }>
  | React.RefObject<{ scrollTo?: (p: { y: number; animated: boolean }) => void }>
  | React.RefObject<{ scrollToIndex?: (p: { index: number; animated: boolean }) => void }>;

export interface UseTabReselectRefreshOptions {
  /** Required: ref to FlatList/ScrollView/SectionList */
  listRef: AnyScrollRef;
  /** Required: refresh callback */
  onRefresh: () => void | Promise<void>;
  /** Optional: return current Y offset */
  getOffset?: () => number;
  /** Pixels above which single-tap reselect will scroll-to-top instead of refreshing */
  topThreshold?: number;            // default 120
  /** Double-tap window (ms) – handled by TabBar, exposed for docs */
  doubleTapMs?: number;             // default 300
  /** Prevent spam triggering (ms) */
  cooldownMs?: number;              // default 700
  /** Haptics toggle */
  haptics?: boolean;                // default true
  /** What to do on single reselect when near top */
  nearTopAction?: "refresh" | "none"; // default "refresh"
}

function scrollToTop(listRef: AnyScrollRef) {
  const node = listRef.current as any;
  if (!node) return;
  if (typeof node.scrollToOffset === "function") {
    node.scrollToOffset({ offset: 0, animated: true });
  } else if (typeof node.scrollTo === "function") {
    node.scrollTo({ y: 0, animated: true });
  } else if (typeof node.scrollToIndex === "function") {
    node.scrollToIndex({ index: 0, animated: true });
  }
}

export function useTabReselectRefresh(opts: UseTabReselectRefreshOptions) {
  const {
    listRef,
    onRefresh,
    getOffset,
    topThreshold = 120,
    cooldownMs = 700,
    haptics = true,
    nearTopAction = "refresh",
  } = opts;

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Simple cooldown
  const canTrigger = useMemo(() => {
    let last = 0;
    return () => {
      const now = Date.now();
      if (now - last < cooldownMs) return false;
      last = now;
      return true;
    };
  }, [cooldownMs]);

  useEffect(() => {
    // SINGLE TAP on active tab → reselect
    const handleTabPress = () => {
      if (!isFocused) return;           // only the active screen handles "reselect"
      if (!canTrigger()) return;

      const offset = getOffset?.() ?? 0;
      const farFromTop = offset > topThreshold;

      if (farFromTop) {
        if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scrollToTop(listRef);
      } else if (nearTopAction === "refresh") {
        if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onRefresh();
      }
    };

    // DOUBLE TAP on active tab → snap top + refresh
    const handleTabDoublePress = () => {
      if (!isFocused) return;
      if (!canTrigger()) return;
      if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      scrollToTop(listRef);
      onRefresh();
    };

    // Try to subscribe to events, but handle if types don't exist
    const sub1 = (navigation as unknown as { addListener?: (name: string, handler: () => void) => () => void }).addListener?.("tabPress", handleTabPress);
    const sub2 = (navigation as unknown as { addListener?: (name: string, handler: () => void) => () => void }).addListener?.("tabDoublePress", handleTabDoublePress);

    return () => {
      if (sub1) sub1();
      if (sub2) sub2();
    };
  }, [navigation, isFocused, listRef, onRefresh, getOffset, topThreshold, canTrigger, haptics, nearTopAction]);
}
