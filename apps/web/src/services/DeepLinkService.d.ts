/**
 * Deep Link Service
 * Comprehensive deep linking support for web app matching mobile capabilities
 */
export interface DeepLinkRoute {
    path: string;
    component: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
    fragment?: string;
}
export interface DeepLinkHandler {
    pattern: RegExp;
    handler: (match: RegExpMatchArray, url: URL) => Promise<void>;
    priority: number;
}
export interface DeepLinkConfig {
    baseUrl: string;
    enableAnalytics: boolean;
    enableSharing: boolean;
    enableSocialMeta: boolean;
    fallbackRoute: string;
}
export interface ShareOptions {
    title: string;
    description: string;
    image?: string;
    url: string;
    hashtags?: string[];
    via?: string;
}
declare class DeepLinkService {
    private config;
    private handlers;
    private currentRoute;
    constructor();
    /**
     * Initialize the deep link service
     */
    initialize(): Promise<void>;
    /**
     * Register a deep link handler
     */
    registerHandler(pattern: RegExp, handler: (match: RegExpMatchArray, url: URL) => Promise<void>, priority?: number): void;
    /**
     * Handle a deep link URL
     */
    handleUrl(url: string): Promise<boolean>;
    /**
     * Generate a deep link URL
     */
    generateUrl(route: string, params?: Record<string, string>, query?: Record<string, string>, fragment?: string): string;
    /**
     * Share a deep link
     */
    shareLink(options: ShareOptions): Promise<void>;
    /**
     * Open a deep link in a new tab
     */
    openInNewTab(url: string): void;
    /**
     * Copy a deep link to clipboard
     */
    copyToClipboard(url: string): Promise<void>;
    /**
     * Get current route information
     */
    getCurrentRoute(): DeepLinkRoute | null;
    /**
     * Update social meta tags
     */
    updateSocialMetaTags(meta?: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
    }): void;
    /**
     * Setup default handlers
     */
    private setupDefaultHandlers;
    /**
     * Handle current URL
     */
    private handleCurrentUrl;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Handle fallback route
     */
    private handleFallback;
    /**
     * Navigate to a route
     */
    private navigateToRoute;
    /**
     * Parse query string
     */
    private parseQueryString;
    /**
     * Get meta content
     */
    private getMetaContent;
    /**
     * Set meta tag
     */
    private setMetaTag;
    /**
     * Show notification
     */
    private showNotification;
    /**
     * Track analytics event
     */
    private trackEvent;
    /**
     * Emit event
     */
    private emit;
    /**
     * Get default configuration
     */
    private getDefaultConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<DeepLinkConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): DeepLinkConfig;
}
declare const deepLinkService: DeepLinkService;
export default deepLinkService;
//# sourceMappingURL=DeepLinkService.d.ts.map