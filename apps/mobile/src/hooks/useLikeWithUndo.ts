import { useRef } from "react";

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
    if (typeof cleanup === "function") cleanupRef.current = cleanup;
  };

  const triggerUndoPill = () => {
    // Imperative trigger attached in UndoPill
    // @ts-ignore
    if (typeof window.__undoPillShow === "function") window.__undoPillShow();
  };

  const undoNow = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    onUndo?.();
    // @ts-ignore
    if (typeof window.__undoPillHide === "function") window.__undoPillHide();
  };

  return { likeNow, triggerUndoPill, undoNow };
}

