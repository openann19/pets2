export declare function PWAManager({ children }: {
    children: any;
}): JSX.Element;
export declare function usePWAStatus(): {
    isOnline: boolean;
    isStandalone: boolean;
    isInstallable: boolean;
    isInstalled: boolean;
};
export declare const PWAUtils: {
    isInstallable: () => boolean;
    getDisplayMode: () => "standalone" | "minimal-ui" | "fullscreen" | "browser";
    isMobile: () => boolean;
    getPlatform: () => "unknown" | "ios" | "android" | "windows" | "mac" | "linux";
    requestNotificationPermission: () => Promise<boolean>;
    showNotification: (title: any, options: any) => void;
    vibrate: (pattern: any) => void;
    share: (data: any) => Promise<boolean>;
};
//# sourceMappingURL=PWAManager.d.ts.map