import { useRef, useState, useCallback } from 'react';
import { rewindLast } from '../services/swipeService';
import type { Pet } from '@pawfectmatch/core';

type LastSwipe = {
  petId: string;
  direction: 'left' | 'right' | 'up';
  index: number;
} | null;

export function useSwipeUndo() {
  const lastSwipeRef = useRef<LastSwipe>(null);
  const [busy, setBusy] = useState(false);

  const capture = useCallback((args: NonNullable<LastSwipe>) => {
    lastSwipeRef.current = args;
  }, []);

  const undo = useCallback(async (): Promise<Pet | null> => {
    if (busy) return null;
    setBusy(true);
    try {
      const restored = await rewindLast();
      lastSwipeRef.current = null;
      return restored;
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return { capture, undo, busy };
}
