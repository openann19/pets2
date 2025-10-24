import { useSyncExternalStore } from 'react';
import { getWindow } from '../utils/environment';

const QUERY = '(prefers-reduced-motion: reduce)';

const getSnapshot = () => {
  const currentWindow = getWindow();
  if (currentWindow == null) {
    return false;
  }

  return currentWindow.matchMedia(QUERY).matches;
};

const subscribe = (listener: () => void) => {
  const currentWindow = getWindow();
  if (currentWindow == null) {
    return (): void => undefined;
  }

  const mediaQueryList = currentWindow.matchMedia(QUERY);
  const handleChange = () => {
    listener();
  };

  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', handleChange);
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }

  const previousHandler = mediaQueryList.onchange;
  mediaQueryList.onchange = handleChange;

  return () => {
    if (mediaQueryList.onchange === handleChange) {
      mediaQueryList.onchange = previousHandler ?? null;
    }
  };
};

export const usePrefersReducedMotion = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};
