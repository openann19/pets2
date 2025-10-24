/**
 * Isomorphic environment guards for universal code
 * Safe to use in both Node and browser contexts
 *
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */
/** Runtime check for browser environment */
export declare const isBrowser: () => boolean;
/** Runtime check for Node environment */
export declare const isNode: () => boolean;
/** Safe window access (undefined in Node) */
export declare const getSafeWindow: () => (Window & typeof globalThis) | undefined;
/** Safe document access (undefined in Node) */
export declare const getSafeDocument: () => Document | undefined;
/** Safe navigator access (undefined in Node) */
export declare const getSafeNavigator: () => Navigator | undefined;
/** Safe localStorage access with error handling */
export declare const getSafeLocalStorage: () => Storage | undefined;
/** Safe sessionStorage access with error handling */
export declare const getSafeSessionStorage: () => Storage | undefined;
/** Get localStorage item (returns undefined in Node or on error) */
export declare function getLocalStorageItem(key: string): string | undefined;
/** Set localStorage item (no-op in Node or on error) */
export declare function setLocalStorageItem(key: string, value: string): boolean;
/** Remove localStorage item (no-op in Node or on error) */
export declare function removeLocalStorageItem(key: string): boolean;
/** Get sessionStorage item (returns undefined in Node or on error) */
export declare function getSessionStorageItem(key: string): string | undefined;
/** Set sessionStorage item (no-op in Node or on error) */
export declare function setSessionStorageItem(key: string, value: string): boolean;
/** Safe requestAnimationFrame (no-op in Node) */
export declare function safeRequestAnimationFrame(callback: FrameRequestCallback): number | undefined;
/** Safe cancelAnimationFrame (no-op in Node) */
export declare function safeCancelAnimationFrame(handle: number): void;
/** Safe matchMedia (returns null in Node) */
export declare function safeMatchMedia(query: string): MediaQueryList | undefined;
/** Check if user prefers reduced motion */
export declare function prefersReducedMotion(): boolean;
/** Check if device has pointer:fine (mouse/trackpad) */
export declare function hasPointerFine(): boolean;
/** Check if device has touch support */
export declare function hasTouchSupport(): boolean;
//# sourceMappingURL=env.d.ts.map