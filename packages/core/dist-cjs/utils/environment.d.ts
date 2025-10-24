/**
 * Environment detection helpers to safely access browser-only APIs.
 *
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */
export type BrowserWindow = Window & typeof globalThis;
export declare const isBrowserEnvironment: () => boolean;
export declare const getWindowObject: () => BrowserWindow | null;
export declare const getDocumentObject: () => Document | null;
export declare const getDocumentElement: () => HTMLElement | null;
export declare const getNavigatorObject: () => Navigator | null;
export declare const getLocalStorage: () => Storage | null;
export declare const getGeolocation: () => Geolocation | null;
export declare const redirectTo: (href: string) => void;
export declare const addEventListenerSafely: (target: unknown, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
export declare const removeEventListenerSafely: (target: unknown, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void;
export declare const setLocalStorageValue: (key: string, value: string) => void;
export declare const removeLocalStorageValue: (key: string) => void;
export declare const getLocalStorageValue: (key: string) => string | null;
//# sourceMappingURL=environment.d.ts.map