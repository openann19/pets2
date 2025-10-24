/// <reference lib="dom" />
/**
 * Isomorphic environment guards for universal code
 * Safe to use in both Node and browser contexts
 * 
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */

/** Runtime check for browser environment */
export const isBrowser = (): boolean => 
  typeof window !== "undefined" && typeof window.document !== "undefined";

/** Runtime check for Node environment */
export const isNode = (): boolean => 
  typeof process !== "undefined" && 
  process.versions != null && 
  process.versions.node != null;

/** Safe window access (undefined in Node) */
export const getSafeWindow = (): (Window & typeof globalThis) | undefined =>
  isBrowser() ? window : undefined;

/** Safe document access (undefined in Node) */
export const getSafeDocument = (): Document | undefined =>
  isBrowser() ? window.document : undefined;

/** Safe navigator access (undefined in Node) */
export const getSafeNavigator = (): Navigator | undefined =>
  isBrowser() ? window.navigator : undefined;

/** Safe localStorage access with error handling */
export const getSafeLocalStorage = (): Storage | undefined => {
  if (!isBrowser()) return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

/** Safe sessionStorage access with error handling */
export const getSafeSessionStorage = (): Storage | undefined => {
  if (!isBrowser()) return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/** Get localStorage item (returns undefined in Node or on error) */
export function getLocalStorageItem(key: string): string | undefined {
  const storage = getSafeLocalStorage();
  if (!storage) return undefined;
  try {
    return storage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Set localStorage item (no-op in Node or on error) */
export function setLocalStorageItem(key: string, value: string): boolean {
  const storage = getSafeLocalStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Remove localStorage item (no-op in Node or on error) */
export function removeLocalStorageItem(key: string): boolean {
  const storage = getSafeLocalStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** Get sessionStorage item (returns undefined in Node or on error) */
export function getSessionStorageItem(key: string): string | undefined {
  const storage = getSafeSessionStorage();
  if (!storage) return undefined;
  try {
    return storage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Set sessionStorage item (no-op in Node or on error) */
export function setSessionStorageItem(key: string, value: string): boolean {
  const storage = getSafeSessionStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Safe requestAnimationFrame (no-op in Node) */
export function safeRequestAnimationFrame(callback: FrameRequestCallback): number | undefined {
  if (!isBrowser()) return undefined;
  return window.requestAnimationFrame(callback);
}

/** Safe cancelAnimationFrame (no-op in Node) */
export function safeCancelAnimationFrame(handle: number): void {
  if (!isBrowser()) return;
  window.cancelAnimationFrame(handle);
}

/** Safe matchMedia (returns null in Node) */
export function safeMatchMedia(query: string): MediaQueryList | undefined {
  if (!isBrowser()) return undefined;
  return window.matchMedia(query);
}

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  const mediaQuery = safeMatchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery?.matches ?? false;
}

/** Check if device has pointer:fine (mouse/trackpad) */
export function hasPointerFine(): boolean {
  const mediaQuery = safeMatchMedia("(pointer: fine)");
  return mediaQuery?.matches ?? false;
}

/** Check if device has touch support */
export function hasTouchSupport(): boolean {
  if (!isBrowser()) return false;
  const nav = getSafeNavigator();
  return (
    nav != null &&
    ("ontouchstart" in window ||
      (nav.maxTouchPoints != null && nav.maxTouchPoints > 0))
  );
}
