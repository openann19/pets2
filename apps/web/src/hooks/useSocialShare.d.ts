/**
 * Social Share Hook
 * Handles sharing to various social platforms
 */
interface ShareData {
    url: string;
    text: string;
    title: string;
    image?: string;
}
export declare function useSocialShare(): {
    shareToSocial: (platform: string, data: ShareData) => Promise<void>;
    getShareUrl: (platform: string, data: ShareData) => string;
    isNativeShareSupported: () => boolean;
    isSharing: boolean;
};
export {};
//# sourceMappingURL=useSocialShare.d.ts.map