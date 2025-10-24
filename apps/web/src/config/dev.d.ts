/**
 * Development Configuration
 * Controls development-specific features and overrides
 */
export declare const DEV_CONFIG: {
    DISABLE_AUTH: boolean;
    DEV_MODE: boolean;
    USE_MOCK_DATA: boolean;
    DEBUG_LOGS: boolean;
    API_URL: string;
    WS_URL: string;
};
export declare const isDevelopment: () => boolean;
export declare const isAuthDisabled: () => boolean;
export declare const shouldUseMockData: () => boolean;
export declare const shouldDebugLog: () => boolean;
//# sourceMappingURL=dev.d.ts.map