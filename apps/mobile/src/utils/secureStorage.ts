import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Secure storage adapter for Zustand persist middleware
 * Uses expo-secure-store instead of AsyncStorage for sensitive data like JWT tokens
 * Addresses M-SEC-01: JWT stored in AsyncStorage security vulnerability
 */
export const createSecureStorage = (): StateStorage => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const value = await SecureStore.getItemAsync(name);
        return value;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('secure-storage.getItem.failed', { name, message });
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(name, value);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to set secure item');
        logger.error('secure-storage.setItem.failed', { name, message: err.message });
        throw err;
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await SecureStore.deleteItemAsync(name);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to remove secure item');
        logger.error('secure-storage.removeItem.failed', { name, message: err.message });
        throw err;
      }
    },
  };
};

/**
 * Secure storage for non-sensitive data that can use AsyncStorage
 * Used for preferences, theme settings, etc.
 */
export const createAsyncStorage = (): StateStorage => {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const value = await AsyncStorage.getItem(name);
        return value;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('async-storage.getItem.failed', { name, message });
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(name, value);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to set async item');
        logger.error('async-storage.setItem.failed', { name, message: err.message });
        throw err;
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(name);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to remove async item');
        logger.error('async-storage.removeItem.failed', { name, message: err.message });
        throw err;
      }
    },
  };
};
