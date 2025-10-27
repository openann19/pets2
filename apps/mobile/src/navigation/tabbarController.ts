// navigation/tabbarController.ts
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type Listener = (hidden: boolean) => void;

const listeners = new Set<Listener>();
let _hidden = false;

export const tabBarController = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  setHidden(next: boolean) {
    if (_hidden === next) return;
    _hidden = next;
    listeners.forEach((l) => { l(next); });
  },
};

/** Plug this into onScroll for any ScrollView/FlatList to auto-hide the tab bar. */
export const createAutoHideOnScroll = (threshold = 16) => {
  let lastY = 0;
  return (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset?.y ?? 0;
    const dy = y - lastY;
    if (dy > threshold) tabBarController.setHidden(true);   // scrolling down => hide
    else if (dy < -threshold) tabBarController.setHidden(false); // up => show
    lastY = y;
  };
};

