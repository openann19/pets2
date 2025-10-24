import { logger } from '@pawfectmatch/core';

/**
 * Deep Link Service
 * Comprehensive deep linking support for web app matching mobile capabilities
 */
class DeepLinkService {
    config;
    handlers = [];
    currentRoute = null;
    constructor() {
        this.config = this.getDefaultConfig();
    }
    /**
     * Initialize the deep link service
     */
    async initialize() {
        try {
            // Setup default handlers
            this.setupDefaultHandlers();
            // Handle initial URL
            await this.handleCurrentUrl();
            // Setup event listeners
            this.setupEventListeners();
            // Update social meta tags
            this.updateSocialMetaTags();
            logger.info('Deep Link Service initialized');
        }
        catch (error) {
            logger.error('Failed to initialize deep link service:', { error });
        }
    }
    /**
     * Register a deep link handler
     */
    registerHandler(pattern, handler, priority = 0) {
        this.handlers.push({ pattern, handler, priority });
        // Sort by priority (higher priority first)
        this.handlers.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Handle a deep link URL
     */
    async handleUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            // Find matching handler
            for (const handler of this.handlers) {
                const match = urlObj.pathname.match(handler.pattern);
                if (match) {
                    await handler.handler(match, urlObj);
                    return true;
                }
            }
            // No handler found, use fallback
            await this.handleFallback(urlObj);
            return false;
        }
        catch (error) {
            logger.error('Failed to handle URL:', { error });
            return false;
        }
    }
    /**
     * Generate a deep link URL
     */
    generateUrl(route, params, query, fragment) {
        let url = `${this.config.baseUrl}${route}`;
        // Replace route parameters
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url = url.replace(`:${key}`, encodeURIComponent(value));
            }
        }
        // Add query parameters
        if (query && Object.keys(query).length > 0) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                searchParams.append(key, value);
            }
            url += `?${searchParams.toString()}`;
        }
        // Add fragment
        if (fragment) {
            url += `#${fragment}`;
        }
        return url;
    }
    /**
     * Share a deep link
     */
    async shareLink(options) {
        try {
            if (navigator.share) {
                // Use native Web Share API
                await navigator.share({
                    title: options.title,
                    text: options.description,
                    url: options.url,
                });
            }
            else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(options.url);
                // Show success message
                this.showNotification('Link copied to clipboard!');
            }
            // Track analytics
            if (this.config.enableAnalytics) {
                this.trackEvent('deep_link_shared', {
                    url: options.url,
                    title: options.title,
                });
            }
        }
        catch (error) {
            logger.error('Failed to share link:', { error });
        }
    }
    /**
     * Open a deep link in a new tab
     */
    openInNewTab(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    /**
     * Copy a deep link to clipboard
     */
    async copyToClipboard(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showNotification('Link copied to clipboard!');
        }
        catch (error) {
            logger.error('Failed to copy to clipboard:', { error });
        }
    }
    /**
     * Get current route information
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    /**
     * Update social meta tags
     */
    updateSocialMetaTags(meta) {
        if (!this.config.enableSocialMeta)
            return;
        const title = meta?.title || document.title;
        const description = meta?.description || this.getMetaContent('description');
        const image = meta?.image || this.getMetaContent('og:image');
        const url = meta?.url || window.location.href;
        // Update Open Graph tags
        this.setMetaTag('og:title', title);
        this.setMetaTag('og:description', description);
        this.setMetaTag('og:image', image);
        this.setMetaTag('og:url', url);
        // Update Twitter Card tags
        this.setMetaTag('twitter:card', 'summary_large_image');
        this.setMetaTag('twitter:title', title);
        this.setMetaTag('twitter:description', description);
        this.setMetaTag('twitter:image', image);
        // Update standard meta tags
        this.setMetaTag('description', description);
    }
    /**
     * Setup default handlers
     */
    setupDefaultHandlers() {
        // Pet profile handler
        this.registerHandler(/^\/pet\/([^/]+)$/, async (match, url) => {
            const petId = match[1];
            await this.navigateToRoute(`/pet/${petId}`);
            this.updateSocialMetaTags({
                title: `Pet Profile - ${petId}`,
                description: `View this amazing pet's profile`,
                url: url.href,
            });
        }, 100);
        // Match handler
        this.registerHandler(/^\/match\/([^/]+)$/, async (match, url) => {
            const matchId = match[1];
            await this.navigateToRoute(`/match/${matchId}`);
            this.updateSocialMetaTags({
                title: `New Match!`,
                description: `You have a new match waiting for you`,
                url: url.href,
            });
        }, 100);
        // Chat handler
        this.registerHandler(/^\/chat\/([^/]+)$/, async (match, url) => {
            const chatId = match[1];
            await this.navigateToRoute(`/chat/${chatId}`);
            this.updateSocialMetaTags({
                title: `Chat`,
                description: `Continue your conversation`,
                url: url.href,
            });
        }, 100);
        // User profile handler
        this.registerHandler(/^\/profile\/([^/]+)$/, async (match, url) => {
            const userId = match[1];
            await this.navigateToRoute(`/profile/${userId}`);
            this.updateSocialMetaTags({
                title: `User Profile`,
                description: `View this user's profile`,
                url: url.href,
            });
        }, 100);
        // Leaderboard handler
        this.registerHandler(/^\/leaderboard(?:\/([^/]+))?$/, async (match, url) => {
            const category = match[1] || 'all';
            await this.navigateToRoute(`/leaderboard/${category}`);
            this.updateSocialMetaTags({
                title: `Leaderboard - ${category}`,
                description: `See the top pets in ${category}`,
                url: url.href,
            });
        }, 100);
        // Discover handler
        this.registerHandler(/^\/discover(?:\?(.*))?$/, async (match, url) => {
            const query = match[1] || '';
            await this.navigateToRoute(`/discover?${query}`);
            this.updateSocialMetaTags({
                title: `Discover Pets`,
                description: `Find your perfect pet match`,
                url: url.href,
            });
        }, 100);
        // Settings handler
        this.registerHandler(/^\/settings(?:\/([^/]+))?$/, async (match, url) => {
            const section = match[1] || 'general';
            await this.navigateToRoute(`/settings/${section}`);
            this.updateSocialMetaTags({
                title: `Settings - ${section}`,
                description: `Manage your account settings`,
                url: url.href,
            });
        }, 100);
    }
    /**
     * Handle current URL
     */
    async handleCurrentUrl() {
        await this.handleUrl(window.location.href);
    }
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle popstate events (back/forward navigation)
        window.addEventListener('popstate', (_event) => {
            this.handleCurrentUrl();
        });
        // Handle hash changes
        window.addEventListener('hashchange', (_event) => {
            this.handleCurrentUrl();
        });
    }
    /**
     * Handle fallback route
     */
    async handleFallback(_url) {
        await this.navigateToRoute(this.config.fallbackRoute);
    }
    /**
     * Navigate to a route
     */
    async navigateToRoute(route) {
        try {
            // Parse the route
            const [pathname, search, hash] = route.split(/(\?.*)?(#.*)?/);
            // Ensure pathname is not undefined for strict type checking
            const path = pathname ?? '';
            const component = pathname ?? '';
            // Create a deep link route with the required properties 
            // and optional properties only when they exist
            const routeInfo = {
                path,
                component,
            };
            // Only add optional properties when they have values
            if (search) {
                routeInfo.query = this.parseQueryString(search);
            }
            if (hash) {
                routeInfo.fragment = hash.substring(1);
            }
            this.currentRoute = routeInfo;
            // Emit route change event
            this.emit('routeChanged', routeInfo);
            // Update browser history
            if (window.location.pathname !== pathname) {
                window.history.pushState({}, '', route);
            }
        }
        catch (error) {
            logger.error('Failed to navigate to route:', { error });
        }
    }
    /**
     * Parse query string
     */
    parseQueryString(queryString) {
        const params = {};
        const searchParams = new URLSearchParams(queryString);
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }
    /**
     * Get meta content
     */
    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta ? meta.getAttribute('content') || '' : '';
    }
    /**
     * Set meta tag
     */
    setMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }
    /**
     * Show notification
     */
    showNotification(message) {
        // Implementation would show a toast notification
        logger.info('Notification:', { message });
    }
    /**
     * Track analytics event
     */
    trackEvent(event, data) {
        // Implementation would track with analytics service
        logger.info('Analytics:', { event, data });
    }
    /**
     * Emit event
     */
    emit(event, data) {
        const customEvent = new CustomEvent(event, { detail: data });
        window.dispatchEvent(customEvent);
    }
    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            baseUrl: window.location.origin,
            enableAnalytics: true,
            enableSharing: true,
            enableSocialMeta: true,
            fallbackRoute: '/',
        };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
const deepLinkService = new DeepLinkService();
export default deepLinkService;
//# sourceMappingURL=DeepLinkService.js.map