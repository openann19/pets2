/**
 * Deep Link Hook
 * React hook for managing deep linking functionality
 */
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
;
import DeepLinkService from '../services/DeepLinkService';
export const useDeepLink = () => {
    const [state, setState] = useState({
        currentRoute: null,
        isInitialized: false,
        isLoading: true,
    });
    // Initialize deep link service
    useEffect(() => {
        const initializeDeepLink = async () => {
            try {
                setState((prev) => ({ ...prev, isLoading: true }));
                await DeepLinkService.initialize();
                // Get initial route
                const currentRoute = DeepLinkService.getCurrentRoute();
                setState((prev) => ({
                    ...prev,
                    currentRoute,
                    isInitialized: true,
                    isLoading: false,
                }));
            }
            catch (error) {
                logger.error('Failed to initialize deep link service:', { error });
                setState((prev) => ({
                    ...prev,
                    isInitialized: false,
                    isLoading: false,
                }));
            }
        };
        initializeDeepLink();
    }, []);
    // Setup event listeners
    useEffect(() => {
        if (!state.isInitialized)
            return;
        const handleRouteChanged = (event) => {
            const route = event.detail;
            setState((prev) => ({ ...prev, currentRoute: route }));
        };
        window.addEventListener('routeChanged', handleRouteChanged);
        return () => {
            window.removeEventListener('routeChanged', handleRouteChanged);
        };
    }, [state.isInitialized]);
    // Handle URL
    const handleUrl = useCallback(async (url) => {
        try {
            return await DeepLinkService.handleUrl(url);
        }
        catch (error) {
            logger.error('Failed to handle URL:', { error });
            return false;
        }
    }, []);
    // Generate URL
    const generateUrl = useCallback((route, params, query, fragment) => DeepLinkService.generateUrl(route, params, query, fragment), []);
    // Share link
    const shareLink = useCallback(async (options) => {
        try {
            await DeepLinkService.shareLink(options);
        }
        catch (error) {
            logger.error('Failed to share link:', { error });
        }
    }, []);
    // Open in new tab
    const openInNewTab = useCallback((url) => {
        DeepLinkService.openInNewTab(url);
    }, []);
    // Copy to clipboard
    const copyToClipboard = useCallback(async (url) => {
        try {
            await DeepLinkService.copyToClipboard(url);
        }
        catch (error) {
            logger.error('Failed to copy to clipboard:', { error });
        }
    }, []);
    // Update social meta
    const updateSocialMeta = useCallback((meta) => {
        DeepLinkService.updateSocialMetaTags(meta);
    }, []);
    // Navigate to route
    const navigateToRoute = useCallback(async (route) => {
        try {
            await handleUrl(route);
        }
        catch (error) {
            logger.error('Failed to navigate to route:', { error });
        }
    }, [handleUrl]);
    return {
        ...state,
        handleUrl,
        generateUrl,
        shareLink,
        openInNewTab,
        copyToClipboard,
        updateSocialMeta,
        navigateToRoute,
    };
};
//# sourceMappingURL=useDeepLink.js.map