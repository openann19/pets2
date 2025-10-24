/**
 * Cross-platform secure storage utility
 * Provides a consistent interface for web and mobile token storage
 */
export interface CrossPlatformStorage {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}
export declare const secureStorage: CrossPlatformStorage;
export declare function getAccessToken(): Promise<string | null>;
export declare function setAccessToken(token: string): Promise<void>;
export declare function removeAccessToken(): Promise<void>;
export declare function getRefreshToken(): Promise<string | null>;
export declare function setRefreshToken(token: string): Promise<void>;
export declare function removeRefreshToken(): Promise<void>;
//# sourceMappingURL=storage.d.ts.map