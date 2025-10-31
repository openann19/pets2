/**
 * 🎯 UI: BACKDROP HOOK
 * 
 * Hook for managing backdrop state in Modal/Sheet components
 * Automatically shows/hides backdrop based on visibility prop
 */

import { useEffect } from 'react';
import { useOverlayState } from '@/foundation/overlay/overlayState';
import type { OverlayReason } from '@/foundation/overlay/overlayState';

/**
 * Hook to automatically manage backdrop state for modals/sheets
 * 
 * @param visible - Whether the overlay is visible
 * @param reason - Reason for the overlay (default: 'overlay')
 * 
 * @example
 * ```tsx
 * function MyModal({ visible, onClose }) {
 *   useBackdrop(visible, 'modal');
 *   // Modal content
 * }
 * ```
 */
export function useBackdrop(
  visible: boolean,
  reason: OverlayReason = 'overlay'
): void {
  const { show, hide } = useOverlayState();

  useEffect(() => {
    if (visible) {
      show(reason);
    } else {
      hide(reason);
    }

    return () => {
      // Cleanup on unmount
      if (visible) {
        hide(reason);
      }
    };
  }, [visible, reason, show, hide]);
}

