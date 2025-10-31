/**
 * 🎯 FOUNDATION: OVERLAY STATE MANAGEMENT
 * 
 * Centralized state for tracking active overlays (modals, sheets, toasts, notifications)
 * Used to toggle backdrop blur globally
 */

import { create } from 'zustand';

type OverlayReason = 'modal' | 'sheet' | 'toast' | 'notification' | 'tooltip' | 'overlay' | string;

interface OverlayState {
  activeCount: number;
  show: (reason?: OverlayReason) => void;
  hide: (reason?: OverlayReason) => void;
  isActive: () => boolean;
  getActiveCount: () => number;
}

/**
 * Global overlay state store
 * Tracks count of active overlays to determine if backdrop should be shown
 */
export const useOverlayState = create<OverlayState>((set, get) => ({
  activeCount: 0,

  show: (reason?: OverlayReason) => {
    set((state) => {
      const newCount = state.activeCount + 1;
      return { activeCount: newCount };
    });
  },

  hide: (reason?: OverlayReason) => {
    set((state) => {
      const newCount = Math.max(0, state.activeCount - 1);
      return { activeCount: newCount };
    });
  },

  isActive: () => {
    return get().activeCount > 0;
  },

  getActiveCount: () => {
    return get().activeCount;
  },
}));

/**
 * Helper to auto-toggle overlay state while an async flow runs
 * 
 * @example
 * ```tsx
 * await withOverlay(async () => {
 *   await openSheet();
 * });
 * ```
 */
export async function withOverlay<T>(fn: () => Promise<T>): Promise<T> {
  useOverlayState.getState().show();
  try {
    return await fn();
  } finally {
    useOverlayState.getState().hide();
  }
}

/**
 * Hook version for React components
 */
export function useOverlayStateSelector<T>(selector: (state: OverlayState) => T): T {
  return useOverlayState(selector);
}

