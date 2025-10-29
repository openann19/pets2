import { useRef } from 'react';

interface WindowWithUndo {
  __undoPillShow?: () => void;
  __undoPillHide?: () => void;
}

/**
 * Orchestrates optimistic like + undo.
 * - Calls onLike() immediately (may return a cleanup function).
 * - Exposes triggerUndoPill() which shows the UndoPill.
 * - If user taps Undo within the window, calls cleanup/onUndo.
 */
export function useLikeWithUndo({
  onLike,
  onUndo,
}: {
  onLike: () => void | (() => void);
  onUndo?: () => void;
}) {
  const cleanupRef = useRef<null | (() => void)>(null);

  const likeNow = () => {
    const cleanup = onLike();
    if (typeof cleanup === 'function') cleanupRef.current = cleanup;
  };

  const triggerUndoPill = () => {
    const win = window as unknown as WindowWithUndo;
    if (typeof win.__undoPillShow === 'function') win.__undoPillShow();
  };

  const undoNow = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    onUndo?.();
    const win = window as unknown as WindowWithUndo;
    if (typeof win.__undoPillHide === 'function') win.__undoPillHide();
  };

  return { likeNow, triggerUndoPill, undoNow };
}
