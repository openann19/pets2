"use strict";
/// <reference lib="dom" />
/**
 * Isomorphic environment guards for universal code
 * Safe to use in both Node and browser contexts
 *
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafeSessionStorage = exports.getSafeLocalStorage = exports.getSafeNavigator = exports.getSafeDocument = exports.getSafeWindow = exports.isNode = exports.isBrowser = void 0;
exports.getLocalStorageItem = getLocalStorageItem;
exports.setLocalStorageItem = setLocalStorageItem;
exports.removeLocalStorageItem = removeLocalStorageItem;
exports.getSessionStorageItem = getSessionStorageItem;
exports.setSessionStorageItem = setSessionStorageItem;
exports.safeRequestAnimationFrame = safeRequestAnimationFrame;
exports.safeCancelAnimationFrame = safeCancelAnimationFrame;
exports.safeMatchMedia = safeMatchMedia;
exports.prefersReducedMotion = prefersReducedMotion;
exports.hasPointerFine = hasPointerFine;
exports.hasTouchSupport = hasTouchSupport;
/** Runtime check for browser environment */
const isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";
exports.isBrowser = isBrowser;
/** Runtime check for Node environment */
const isNode = () => typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;
exports.isNode = isNode;
/** Safe window access (undefined in Node) */
const getSafeWindow = () => (0, exports.isBrowser)() ? window : undefined;
exports.getSafeWindow = getSafeWindow;
/** Safe document access (undefined in Node) */
const getSafeDocument = () => (0, exports.isBrowser)() ? window.document : undefined;
exports.getSafeDocument = getSafeDocument;
/** Safe navigator access (undefined in Node) */
const getSafeNavigator = () => (0, exports.isBrowser)() ? window.navigator : undefined;
exports.getSafeNavigator = getSafeNavigator;
/** Safe localStorage access with error handling */
const getSafeLocalStorage = () => {
    if (!(0, exports.isBrowser)())
        return undefined;
    try {
        return window.localStorage;
    }
    catch {
        return undefined;
    }
};
exports.getSafeLocalStorage = getSafeLocalStorage;
/** Safe sessionStorage access with error handling */
const getSafeSessionStorage = () => {
    if (!(0, exports.isBrowser)())
        return undefined;
    try {
        return window.sessionStorage;
    }
    catch {
        return undefined;
    }
};
exports.getSafeSessionStorage = getSafeSessionStorage;
/** Get localStorage item (returns undefined in Node or on error) */
function getLocalStorageItem(key) {
    const storage = (0, exports.getSafeLocalStorage)();
    if (!storage)
        return undefined;
    try {
        return storage.getItem(key) ?? undefined;
    }
    catch {
        return undefined;
    }
}
/** Set localStorage item (no-op in Node or on error) */
function setLocalStorageItem(key, value) {
    const storage = (0, exports.getSafeLocalStorage)();
    if (!storage)
        return false;
    try {
        storage.setItem(key, value);
        return true;
    }
    catch {
        return false;
    }
}
/** Remove localStorage item (no-op in Node or on error) */
function removeLocalStorageItem(key) {
    const storage = (0, exports.getSafeLocalStorage)();
    if (!storage)
        return false;
    try {
        storage.removeItem(key);
        return true;
    }
    catch {
        return false;
    }
}
/** Get sessionStorage item (returns undefined in Node or on error) */
function getSessionStorageItem(key) {
    const storage = (0, exports.getSafeSessionStorage)();
    if (!storage)
        return undefined;
    try {
        return storage.getItem(key) ?? undefined;
    }
    catch {
        return undefined;
    }
}
/** Set sessionStorage item (no-op in Node or on error) */
function setSessionStorageItem(key, value) {
    const storage = (0, exports.getSafeSessionStorage)();
    if (!storage)
        return false;
    try {
        storage.setItem(key, value);
        return true;
    }
    catch {
        return false;
    }
}
/** Safe requestAnimationFrame (no-op in Node) */
function safeRequestAnimationFrame(callback) {
    if (!(0, exports.isBrowser)())
        return undefined;
    return window.requestAnimationFrame(callback);
}
/** Safe cancelAnimationFrame (no-op in Node) */
function safeCancelAnimationFrame(handle) {
    if (!(0, exports.isBrowser)())
        return;
    window.cancelAnimationFrame(handle);
}
/** Safe matchMedia (returns null in Node) */
function safeMatchMedia(query) {
    if (!(0, exports.isBrowser)())
        return undefined;
    return window.matchMedia(query);
}
/** Check if user prefers reduced motion */
function prefersReducedMotion() {
    const mediaQuery = safeMatchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery?.matches ?? false;
}
/** Check if device has pointer:fine (mouse/trackpad) */
function hasPointerFine() {
    const mediaQuery = safeMatchMedia("(pointer: fine)");
    return mediaQuery?.matches ?? false;
}
/** Check if device has touch support */
function hasTouchSupport() {
    if (!(0, exports.isBrowser)())
        return false;
    const nav = (0, exports.getSafeNavigator)();
    return (nav != null &&
        ("ontouchstart" in window ||
            (nav.maxTouchPoints != null && nav.maxTouchPoints > 0)));
}
//# sourceMappingURL=env.js.map