export const isBrowserEnvironment = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const getWindow = (): Window | null => {
  if (!isBrowserEnvironment()) {
    return null;
  }

  return window;
};

export const getDocument = (): Document | null => {
  if (!isBrowserEnvironment()) {
    return null;
  }

  return document;
};
