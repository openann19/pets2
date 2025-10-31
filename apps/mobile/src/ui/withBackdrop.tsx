/**
 * 🎯 UI: WITH BACKDROP HOC
 * 
 * Higher-order component that automatically manages backdrop state
 * for modals, sheets, and other overlay components
 */

import React, { useEffect } from 'react';
import { useOverlayState } from '@/foundation/overlay/overlayState';
import type { OverlayReason } from '@/foundation/overlay/overlayState';

/**
 * Higher-order component that automatically shows/hides backdrop when component mounts/unmounts
 * 
 * @param Component - React component to wrap
 * @param reason - Optional reason for the overlay (default: 'overlay')
 * 
 * @example
 * ```tsx
 * const MyModal = withBackdrop(({ visible, onClose }) => {
 *   // Modal content
 * });
 * ```
 */
export function withBackdrop<P extends object>(
  Component: React.ComponentType<P>,
  reason: OverlayReason = 'overlay'
): React.ComponentType<P> {
  function WithBackdropWrapper(props: P): React.JSX.Element {
    const { show, hide } = useOverlayState();

    useEffect(() => {
      // Show backdrop when component mounts
      show(reason);

      // Hide backdrop when component unmounts
      return () => {
        hide(reason);
      };
    }, [show, hide]);

    return <Component {...props} />;
  }

  WithBackdropWrapper.displayName = `withBackdrop(${Component.displayName || Component.name || 'Component'})`;

  return WithBackdropWrapper;
}

