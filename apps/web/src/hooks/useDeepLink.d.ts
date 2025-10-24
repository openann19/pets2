/**
 * Deep Link Hook
 * React hook for managing deep linking functionality
 */
import type { DeepLinkRoute, ShareOptions } from '../services/DeepLinkService';
export interface DeepLinkState {
    currentRoute: DeepLinkRoute | null;
    isInitialized: boolean;
    isLoading: boolean;
}
export interface DeepLinkActions {
    handleUrl: (url: string) => Promise<boolean>;
    generateUrl: (route: string, params?: Record<string, string>, query?: Record<string, string>, fragment?: string) => string;
    shareLink: (options: ShareOptions) => Promise<void>;
    openInNewTab: (url: string) => void;
    copyToClipboard: (url: string) => Promise<void>;
    updateSocialMeta: (meta?: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
    }) => void;
    navigateToRoute: (route: string) => Promise<void>;
}
export declare const useDeepLink: () => DeepLinkState & DeepLinkActions;
//# sourceMappingURL=useDeepLink.d.ts.map