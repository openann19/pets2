import { logger } from '@pawfectmatch/core';

/**
 * Simple encryption utilities for securing localStorage data
 * Note: This is not a replacement for proper server-side security
 * but adds an additional layer of protection against casual inspection
 */

/**
 * Simple encryption function (not production-grade, but better than plain text)
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @returns Encrypted data as base64 string
 */
export function encryptData(data: string, key: string): string {
    try {
        // Simple XOR encryption with key
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(charCode);
        }
        return btoa(encrypted);
    }
    catch (error: unknown) {
        logger.error('Encryption error:', { error });
        return data; // Fallback to plain text if encryption fails
    }
}

/**
 * Simple decryption function
 * @param encryptedData - Encrypted data as base64 string
 * @param key - Decryption key
 * @returns Decrypted data
 */
export function decryptData(encryptedData: string, key: string): string {
    try {
        const decoded = atob(encryptedData);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
    }
    catch (error: unknown) {
        logger.error('Decryption error:', { error });
        return ''; // Return empty string if decryption fails
    }
}

/**
 * Generate a simple key based on user agent and timestamp
 * @returns A 16-character encryption key
 */
export function generateStorageKey(): string {
    const baseKey = typeof window !== 'undefined'
        ? window.navigator.userAgent + new Date().getTime()
        : 'fallback_key';
    return btoa(baseKey).slice(0, 16); // Simple 16-character key
}
//# sourceMappingURL=crypto.js.map