"use strict";
/// <reference lib="dom" />
/**
 * Environment detection helpers to safely access browser-only APIs.
 *
 * Note: This file uses DOM types via triple-slash reference
 * but guards all DOM access with runtime checks for Node safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalStorageValue = exports.removeLocalStorageValue = exports.setLocalStorageValue = exports.removeEventListenerSafely = exports.addEventListenerSafely = exports.redirectTo = exports.getGeolocation = exports.getLocalStorage = exports.getNavigatorObject = exports.getDocumentElement = exports.getDocumentObject = exports.getWindowObject = exports.isBrowserEnvironment = void 0;
const isWindowAvailable = () => typeof window !== 'undefined';
const isBrowserEnvironment = () => isWindowAvailable() && typeof document !== 'undefined';
exports.isBrowserEnvironment = isBrowserEnvironment;
const getWindowObject = () => (isWindowAvailable() ? window : null);
exports.getWindowObject = getWindowObject;
const getDocumentObject = () => {
    const browserWindow = (0, exports.getWindowObject)();
    return browserWindow?.document ?? null;
};
exports.getDocumentObject = getDocumentObject;
const getDocumentElement = () => (0, exports.getDocumentObject)()?.documentElement ?? null;
exports.getDocumentElement = getDocumentElement;
const getNavigatorObject = () => {
    const browserWindow = (0, exports.getWindowObject)();
    return browserWindow?.navigator ?? null;
};
exports.getNavigatorObject = getNavigatorObject;
const getLocalStorage = () => {
    const browserWindow = (0, exports.getWindowObject)();
    if (browserWindow == null) {
        return null;
    }
    try {
        return browserWindow.localStorage;
    }
    catch {
        return null;
    }
};
exports.getLocalStorage = getLocalStorage;
const getGeolocation = () => (0, exports.getNavigatorObject)()?.geolocation ?? null;
exports.getGeolocation = getGeolocation;
const redirectTo = (href) => {
    const browserWindow = (0, exports.getWindowObject)();
    if (browserWindow != null) {
        browserWindow.location.href = href;
    }
};
exports.redirectTo = redirectTo;
const addEventListenerSafely = (target, type, listener, options) => {
    if (isEventListenerTarget(target)) {
        target.addEventListener(type, listener, options);
    }
};
exports.addEventListenerSafely = addEventListenerSafely;
const removeEventListenerSafely = (target, type, listener, options) => {
    if (isEventListenerTarget(target)) {
        target.removeEventListener(type, listener, options);
    }
};
exports.removeEventListenerSafely = removeEventListenerSafely;
const setLocalStorageValue = (key, value) => {
    const storage = (0, exports.getLocalStorage)();
    if (storage != null) {
        storage.setItem(key, value);
    }
};
exports.setLocalStorageValue = setLocalStorageValue;
const removeLocalStorageValue = (key) => {
    const storage = (0, exports.getLocalStorage)();
    if (storage != null) {
        storage.removeItem(key);
    }
};
exports.removeLocalStorageValue = removeLocalStorageValue;
const getLocalStorageValue = (key) => {
    const storage = (0, exports.getLocalStorage)();
    return storage?.getItem(key) ?? null;
};
exports.getLocalStorageValue = getLocalStorageValue;
const isEventListenerTarget = (target) => {
    return (typeof target === 'object' &&
        target !== null &&
        'addEventListener' in target &&
        typeof target.addEventListener === 'function' &&
        'removeEventListener' in target &&
        typeof target.removeEventListener === 'function');
};
