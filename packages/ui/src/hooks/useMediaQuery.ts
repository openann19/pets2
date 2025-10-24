import { useSyncExternalStore } from 'react';
import { getWindow } from '../utils/environment';

const getSnapshotFactory = (query: string) => () => {
  const currentWindow = getWindow();
  if (currentWindow == null) {
    return false;
  }

  return currentWindow.matchMedia(query).matches;
};

const subscribeFactory = (query: string) => (listener: () => void) => {
  const currentWindow = getWindow();
  if (currentWindow == null) {
    return (): void => undefined;
  }

  const mediaQueryList = currentWindow.matchMedia(query);
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

export const useMediaQuery = (query: string): boolean => {
  return useSyncExternalStore(
    (listener) => subscribeFactory(query)(listener),
    getSnapshotFactory(query),
    () => false,
  );
};
