"use strict";
/**
 * Cross-platform secure storage utility
 * Provides a consistent interface for web and mobile token storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureStorage = void 0;
exports.getAccessToken = getAccessToken;
exports.setAccessToken = setAccessToken;
exports.removeAccessToken = removeAccessToken;
exports.getRefreshToken = getRefreshToken;
exports.setRefreshToken = setRefreshToken;
exports.removeRefreshToken = removeRefreshToken;
// Note: WebStorage and MobileStorage interfaces are defined inline in their implementations
// to avoid unused interface warnings
// Cross-platform storage interface
const environment_1 = require("./environment");
/**
 * Web storage implementation using localStorage with encryption
 */
class WebStorageImpl {
    getStorage;
    getNavigator;
    constructor(getStorage = environment_1.getLocalStorage, getNavigator = environment_1.getNavigatorObject) {
        this.getStorage = getStorage;
        this.getNavigator = getNavigator;
    }
    encryptData(data, key) {
        try {
            let encrypted = '';
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encrypted += String.fromCharCode(charCode);
            }
            return btoa(encrypted);
        }
        catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    }
    decryptData(encryptedData, key) {
        try {
            const decoded = atob(encryptedData);
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(charCode);
            }
            return decrypted;
        }
        catch (error) {
            console.error('Decryption error:', error);
            return '';
        }
    }
    generateStorageKey() {
        const navigator = this.getNavigator();
        const userAgent = navigator?.userAgent ?? 'unknown_agent';
        const timestamp = Date.now().toString(36);
        const baseKey = `${userAgent}-${timestamp}`;
        return btoa(baseKey).slice(0, 16);
    }
    getItem(key) {
        const storage = this.getStorage();
        if (storage == null)
            return Promise.resolve(null);
        try {
            const item = storage.getItem(key);
            if (item == null)
                return Promise.resolve(null);
            const storageKey = this.generateStorageKey();
            const decrypted = this.decryptData(item, storageKey);
            return Promise.resolve(decrypted);
        }
        catch (error) {
            console.error('Web storage get error:', error);
            return Promise.resolve(null);
        }
    }
    setItem(key, value) {
        const storage = this.getStorage();
        if (storage == null)
            return Promise.resolve();
        try {
            const storageKey = this.generateStorageKey();
            const encrypted = this.encryptData(value, storageKey);
            storage.setItem(key, encrypted);
            return Promise.resolve();
        }
        catch (error) {
            console.error('Web storage set error:', error);
            return Promise.resolve();
        }
    }
    removeItem(key) {
        const storage = this.getStorage();
        if (storage == null)
            return Promise.resolve();
        try {
            storage.removeItem(key);
            return Promise.resolve();
        }
        catch (error) {
            console.error('Web storage remove error:', error);
            return Promise.resolve();
        }
    }
}
class MobileStorageImpl {
    secureStore = null;
    constructor() {
        // Try to import expo-secure-store only in mobile environment
        try {
            if (typeof window === 'undefined') {
                // This should work in React Native environment
                // Dynamic import will be used in async methods
            }
        }
        catch {
            console.warn('expo-secure-store not available, falling back to AsyncStorage');
        }
    }
    async getItem(key) {
        try {
            if (this.secureStore !== null) {
                return await this.secureStore.getItemAsync(key);
            }
            else {
                try {
                    // Fallback to AsyncStorage if expo-secure-store is not available
                    // Use dynamic import
                    const AsyncStorageModule = await Promise.resolve().then(() => require('@react-native-async-storage/async-storage'));
                    const AsyncStorage = AsyncStorageModule.default;
                    return await AsyncStorage.getItem(key);
                }
                catch {
                    console.warn('AsyncStorage not available');
                    return null;
                }
            }
        }
        catch {
            console.error('Mobile storage get error');
            return null;
        }
    }
    async setItem(key, value) {
        try {
            if (this.secureStore !== null) {
                await this.secureStore.setItemAsync(key, value);
            }
            else {
                try {
                    // Fallback to AsyncStorage if expo-secure-store is not available
                    const AsyncStorageModule = await Promise.resolve().then(() => require('@react-native-async-storage/async-storage'));
                    const AsyncStorage = AsyncStorageModule.default;
                    await AsyncStorage.setItem(key, value);
                }
                catch {
                    console.warn('AsyncStorage not available');
                }
            }
        }
        catch {
            console.error('Mobile storage set error');
        }
    }
    async removeItem(key) {
        try {
            if (this.secureStore !== null) {
                await this.secureStore.deleteItemAsync(key);
            }
            else {
                try {
                    // Fallback to AsyncStorage if expo-secure-store is not available
                    const AsyncStorageModule = await Promise.resolve().then(() => require('@react-native-async-storage/async-storage'));
                    const AsyncStorage = AsyncStorageModule.default;
                    await AsyncStorage.removeItem(key);
                }
                catch {
                    console.warn('AsyncStorage not available');
                }
            }
        }
        catch {
            console.error('Mobile storage remove error');
        }
    }
}
const createStorageImplementation = () => {
    if ((0, environment_1.isBrowserEnvironment)()) {
        return new WebStorageImpl();
    }
    return new MobileStorageImpl();
};
exports.secureStorage = createStorageImplementation();
// Convenience methods for auth tokens
async function getAccessToken() {
    return await exports.secureStorage.getItem('accessToken');
}
async function setAccessToken(token) {
    await exports.secureStorage.setItem('accessToken', token);
}
async function removeAccessToken() {
    await exports.secureStorage.removeItem('accessToken');
}
async function getRefreshToken() {
    return await exports.secureStorage.getItem('refreshToken');
}
async function setRefreshToken(token) {
    await exports.secureStorage.setItem('refreshToken', token);
}
async function removeRefreshToken() {
    await exports.secureStorage.removeItem('refreshToken');
}
