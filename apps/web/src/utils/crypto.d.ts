/**
 * Simple encryption utilities for securing localStorage data
 * Note: This is not a replacement for proper server-side security
 * but adds an additional layer of protection against casual inspection
 */
export declare function encryptData(data: string, key: string): string;
export declare function decryptData(encryptedData: string, key: string): string;
export declare function generateStorageKey(): string;
//# sourceMappingURL=crypto.d.ts.map