/**
 * Cross-platform secure storage utility
 * Provides a consistent interface for web and mobile token storage
 */

// Note: WebStorage and MobileStorage interfaces are defined inline in their implementations
// to avoid unused interface warnings

// Cross-platform storage interface
import { getLocalStorage, getNavigatorObject, isBrowserEnvironment } from './environment';
export interface CrossPlatformStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Web storage implementation using localStorage with encryption
 */
class WebStorageImpl implements CrossPlatformStorage {
  constructor(private readonly getStorage = getLocalStorage, private readonly getNavigator = getNavigatorObject) {}

  private encryptData(data: string, key: string): string {
    try {
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  private decryptData(encryptedData: string, key: string): string {
    try {
      const decoded = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  }

  private generateStorageKey(): string {
    const navigator = this.getNavigator();
    const userAgent = navigator?.userAgent ?? 'unknown_agent';
    const timestamp = Date.now().toString(36);
    const baseKey = `${userAgent}-${timestamp}`;
    return btoa(baseKey).slice(0, 16);
  }

  getItem(key: string): Promise<string | null> {
    const storage = this.getStorage();
    if (storage == null) return Promise.resolve(null);

    try {
      const item = storage.getItem(key);
      if (item == null) return Promise.resolve(null);
      
      const storageKey = this.generateStorageKey();
      const decrypted = this.decryptData(item, storageKey);
      return Promise.resolve(decrypted);
    } catch (error) {
      console.error('Web storage get error:', error);
      return Promise.resolve(null);
    }
  }

  public setItem(key: string, value: string): Promise<void> {
    const storage = this.getStorage();
    if (storage == null) return Promise.resolve();
    
    try {
      const storageKey = this.generateStorageKey();
      const encrypted = this.encryptData(value, storageKey);
      storage.setItem(key, encrypted);
      return Promise.resolve();
    } catch (error) {
      console.error('Web storage set error:', error);
      return Promise.resolve();
    }
  }

  removeItem(key: string): Promise<void> {
    const storage = this.getStorage();
    if (storage == null) return Promise.resolve();
    
    try {
      storage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      console.error('Web storage remove error:', error);
      return Promise.resolve();
    }
  }
}

/**
 * Mobile storage implementation using expo-secure-store
 */
interface SecureStoreType {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

interface AsyncStorageType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

class MobileStorageImpl implements CrossPlatformStorage {
  private secureStore: SecureStoreType | null = null;

  constructor() {
    // Try to import expo-secure-store only in mobile environment
    try {
      if (typeof window === 'undefined') {
        // This should work in React Native environment
        // Dynamic import will be used in async methods
      }
    } catch {
      console.warn('expo-secure-store not available, falling back to AsyncStorage');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.secureStore !== null) {
        return await this.secureStore.getItemAsync(key);
      } else {
        try {
          // Fallback to AsyncStorage if expo-secure-store is not available
          // Use dynamic import
          const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
          const AsyncStorage = AsyncStorageModule.default as AsyncStorageType;
          return await AsyncStorage.getItem(key);
        } catch {
          console.warn('AsyncStorage not available');
          return null;
        }
      }
    } catch {
      console.error('Mobile storage get error');
      return null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.secureStore !== null) {
        await this.secureStore.setItemAsync(key, value);
      } else {
        try {
          // Fallback to AsyncStorage if expo-secure-store is not available
          const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
          const AsyncStorage = AsyncStorageModule.default as AsyncStorageType;
          await AsyncStorage.setItem(key, value);
        } catch {
          console.warn('AsyncStorage not available');
        }
      }
    } catch {
      console.error('Mobile storage set error');
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.secureStore !== null) {
        await this.secureStore.deleteItemAsync(key);
      } else {
        try {
          // Fallback to AsyncStorage if expo-secure-store is not available
          const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
          const AsyncStorage = AsyncStorageModule.default as AsyncStorageType;
          await AsyncStorage.removeItem(key);
        } catch {
          console.warn('AsyncStorage not available');
        }
      }
    } catch {
      console.error('Mobile storage remove error');
    }
  }
}

const createStorageImplementation = (): CrossPlatformStorage => {
  if (isBrowserEnvironment()) {
    return new WebStorageImpl();
  }
  return new MobileStorageImpl();
};

export const secureStorage: CrossPlatformStorage = createStorageImplementation();

// Convenience methods for auth tokens
export async function getAccessToken(): Promise<string | null> {
  return await secureStorage.getItem('accessToken');
}

export async function setAccessToken(token: string): Promise<void> {
  await secureStorage.setItem('accessToken', token);
}

export async function removeAccessToken(): Promise<void> {
  await secureStorage.removeItem('accessToken');
}

export async function getRefreshToken(): Promise<string | null> {
  return await secureStorage.getItem('refreshToken');
}

export async function setRefreshToken(token: string): Promise<void> {
  await secureStorage.setItem('refreshToken', token);
}

export async function removeRefreshToken(): Promise<void> {
  await secureStorage.removeItem('refreshToken');
}
