/// <reference lib="dom" />
/**
 * Environment detection helpers to safely access browser-only APIs.
 * 
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */

export type BrowserWindow = Window & typeof globalThis;

type EventListenerTarget = {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) => void;
};

const isWindowAvailable = (): boolean => typeof window !== 'undefined';

export const isBrowserEnvironment = (): boolean => isWindowAvailable() && typeof document !== 'undefined';

export const getWindowObject = (): BrowserWindow | null => (isWindowAvailable() ? window : null);

export const getDocumentObject = (): Document | null => {
  const browserWindow = getWindowObject();
  return browserWindow?.document ?? null;
};

export const getDocumentElement = (): HTMLElement | null => getDocumentObject()?.documentElement ?? null;

export const getNavigatorObject = (): Navigator | null => {
  const browserWindow = getWindowObject();
  return browserWindow?.navigator ?? null;
};

export const getLocalStorage = (): Storage | null => {
  const browserWindow = getWindowObject();
  if (browserWindow == null) {
    return null;
  }

  try {
    return browserWindow.localStorage;
  } catch {
    return null;
  }
};

export const getGeolocation = (): Geolocation | null => getNavigatorObject()?.geolocation ?? null;

export const redirectTo = (href: string): void => {
  const browserWindow = getWindowObject();
  if (browserWindow != null) {
    browserWindow.location.href = href;
  }
};

export const addEventListenerSafely = (
  target: unknown,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void => {
  if (isEventListenerTarget(target)) {
    target.addEventListener(type, listener, options);
  }
};

export const removeEventListenerSafely = (
  target: unknown,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
): void => {
  if (isEventListenerTarget(target)) {
    target.removeEventListener(type, listener, options);
  }
};

export const setLocalStorageValue = (key: string, value: string): void => {
  const storage = getLocalStorage();
  if (storage != null) {
    storage.setItem(key, value);
  }
};

export const removeLocalStorageValue = (key: string): void => {
  const storage = getLocalStorage();
  if (storage != null) {
    storage.removeItem(key);
  }
};

export const getLocalStorageValue = (key: string): string | null => {
  const storage = getLocalStorage();
  return storage?.getItem(key) ?? null;
};

const isEventListenerTarget = (target: unknown): target is EventListenerTarget => {
  return (
    typeof target === 'object' &&
    target !== null &&
    'addEventListener' in target &&
    typeof (target as { addEventListener?: unknown }).addEventListener === 'function' &&
    'removeEventListener' in target &&
    typeof (target as { removeEventListener?: unknown }).removeEventListener === 'function'
  );
};
