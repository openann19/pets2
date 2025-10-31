import React from 'react';
import { Linking } from 'react-native';
import { logger } from '@pawfectmatch/core';

/**
 * Deep Linking Service for PawfectMatch Mobile
 * Professional implementation with comprehensive URL handling
 */

export interface DeepLinkData {
  type: 'pet' | 'match' | 'chat' | 'profile' | 'premium' | 'settings' | 'subscription_success' | null;
  id: string;
  action?: string | undefined;
  params: Record<string, string>;
}

/**
 * Parse a deep link URL into structured data
 * @param url The URL to parse
 */
export function parseDeepLink(url: string): DeepLinkData {
  try {
    // Handle unsupported schemes
    if (!url.startsWith('pawfectmatch://')) {
      return {
        type: null,
        id: '',
        params: {},
      };
    }

    // Remove the scheme prefix
    const path = url.replace('pawfectmatch://', '');
    
    // Split by ? to separate path and query
    const [pathPart = '', queryPart] = path.split('?');
    
    // Extract path segments and remove empty ones
    const pathSegments = pathPart.split('/').filter(Boolean);

    if (pathSegments.length === 0) {
      return {
        type: null,
        id: '',
        params: {},
      };
    }

    const firstSegment = pathSegments[0] ?? '';
    const secondSegment = pathSegments[1];

    // Extract query parameters
    const params: Record<string, string> = {};
    if (queryPart !== undefined && queryPart !== '') {
      queryPart.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key !== undefined && key !== '' && value !== undefined && value !== '') {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }

    // Special handling for premium-success
    if (firstSegment === 'premium-success') {
      return {
        type: 'subscription_success',
        id: '',
        params,
      };
    }

    // Handle chat and match routes - extract ID into params
    if (firstSegment === 'chat' && secondSegment !== undefined && secondSegment !== '') {
      return {
        type: 'chat',
        id: secondSegment,
        params: {
          ...params,
          matchId: secondSegment,
        },
      };
    }

    if (firstSegment === 'match' && secondSegment !== undefined && secondSegment !== '') {
      return {
        type: 'match',
        id: secondSegment,
        params: {
          ...params,
          matchId: secondSegment,
        },
      };
    }

    // Handle simple routes (premium, settings)
    if (firstSegment === 'premium') {
      return {
        type: 'premium',
        id: '',
        params,
      };
    }

    if (firstSegment === 'settings') {
      return {
        type: 'settings',
        id: '',
        params,
      };
    }

    // Handle other valid routes
    const validTypes: Array<DeepLinkData['type']> = ['pet', 'profile'];
    if (validTypes.includes(firstSegment as DeepLinkData['type'])) {
      return {
        type: firstSegment as DeepLinkData['type'],
        id: secondSegment ?? '',
        params,
      };
    }

    // Invalid route
    return {
      type: null,
      id: '',
      params: {},
    };
  } catch (error) {
    logger.error('Error parsing deep link', { url, error });

    // Return null type if parsing fails
    return {
      type: null,
      id: '',
      params: {},
    };
  }
}

export class DeepLinkingService {
  private static instance: DeepLinkingService | null = null;
  private listeners = new Set<(data: DeepLinkData) => void>();
  private navigator: {
    navigate: (routeName: string, params?: Record<string, unknown>) => void;
  } | null = null;

  private constructor() {
    void this.initialize();
  }

  static getInstance(): DeepLinkingService {
    if (DeepLinkingService.instance === null) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Handle initial URL if app was opened from a link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl !== null) {
        this.handleUrl(initialUrl);
      }

      // Listen for incoming URLs
      Linking.addEventListener('url', this.handleUrlEvent);
    } catch (error) {
      logger.error('Error initializing deep linking:', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private handleUrlEvent = (event: { url: string }): void => {
    try {
      this.handleUrl(event.url);
    } catch (error) {
      logger.error('Error handling deep link URL event:', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  handleUrl(url: string): DeepLinkData | null {
    try {
      // Validate and rate-limit to prevent abuse
      if (!this.validateDeepLinkUrl(url)) {
        logger.warn('Invalid deep link URL format', { url });
        return null;
      }
      if (!this.checkDeepLinkRateLimit()) {
        return null;
      }
      logger.info('Handling deep link URL:', { url });

      const parsedData = this.parseUrl(url);
      if (parsedData !== null) {
        this.navigateToScreen(parsedData);
        this.notifyListeners(parsedData);
        return parsedData;
      }

      return null;
    } catch (error) {
      logger.error('Error handling URL:', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
      return null;
    }
  }

  private parseUrl(url: string): DeepLinkData | null {
    try {
      // Handle pawfectmatch:// scheme
      if (url.startsWith('pawfectmatch://')) {
        return this.parseCustomScheme(url);
      }

      // Handle https://pawfectmatch.com scheme
      if (url.includes('pawfectmatch.com')) {
        return this.parseWebUrl(url);
      }

      return null;
    } catch (error) {
      logger.error('Error parsing URL:', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
      return null;
    }
  }

  private parseCustomScheme(url: string): DeepLinkData | null {
    const path = url.replace('pawfectmatch://', '');
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) return null;

    const type = parts[0] as DeepLinkData['type'];
    const id = parts[1] !== undefined && parts[1] !== '' ? parts[1] : '';
    const action = parts[2] !== undefined && parts[2] !== '' ? parts[2] : undefined;
    const params = this.extractParams(url);
    const safeParams = this.sanitizeDeepLinkParams(params);

    return { type, id, action, params: safeParams };
  }

  private parseWebUrl(url: string): DeepLinkData | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const parts = path.split('/').filter(Boolean);

      if (parts.length === 0) return null;

      // Map web paths to app screens
      const pathMap: Record<string, DeepLinkData['type']> = {
        pet: 'pet',
        match: 'match',
        chat: 'chat',
        profile: 'profile',
        premium: 'premium',
        pets: 'pet',
        matches: 'match',
        messages: 'chat',
        users: 'profile',
        subscription: 'premium',
      };

      const pathKey = parts[0] ?? '';

      // Convert URLSearchParams to object manually
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      const safeParams = this.sanitizeDeepLinkParams(params);

      if (Object.prototype.hasOwnProperty.call(pathMap, pathKey)) {
        const type = pathMap[pathKey];
        if (type === undefined) {
          return null;
        }
        const id = parts[1] !== undefined && parts[1] !== '' ? parts[1] : '';
        return { type, id, params: safeParams };
      }

      return null;
    } catch (error) {
      logger.error('Error parsing web URL:', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
      return null;
    }
  }

  private extractParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const queryString = url.split('?')[1];

    if (queryString !== undefined && queryString !== '') {
      queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key !== undefined && key !== '' && value !== undefined && value !== '') {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }

    return params;
  }

  private navigateToScreen(data: DeepLinkData): void {
    // This would integrate with your navigation system
    // For now, we'll log the navigation intent
    logger.info('Deep link navigation:', { data });

    // Handle null type
    if (data.type === null) {
      logger.warn('Cannot navigate: invalid deep link type');
      return;
    }

    // Handle notification-based deep linking
    if (data.type === 'chat') {
      const matchId = data.params['matchId'] ?? data.id;
      if (matchId !== '') {
        this.navigateToChat(matchId);
      }
    } else if (data.type === 'pet' && data.id !== '') {
      // Navigate to pet profile
      this.navigateToPetProfile(data.id);
    } else if (data.type === 'match') {
      const matchId = data.params['matchId'] ?? data.id;
      if (matchId !== '') {
        this.navigateToMatch(matchId);
      }
    } else if (data.type === 'profile' && data.id !== '') {
      // Navigate to user profile
      this.navigateToUserProfile(data.id);
    } else if (data.type === 'premium' || data.type === 'subscription_success') {
      // Navigate to premium screen
      this.navigateToPremium();
    } else if (data.type === 'settings') {
      // Navigate to settings screen
      this.navigateToSettings();
    }
  }

  // Allow app root to inject navigator (e.g., from NavigationContainer)
  setNavigator(navigator: {
    navigate: (routeName: string, params?: Record<string, unknown>) => void;
  }): void {
    this.navigator = navigator;
  }

  private navigateToChat(matchId: string): void {
    if (this.navigator !== null) {
      this.navigator.navigate('Chat', { matchId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to chat:', {
      matchId,
    });
  }

  private navigateToPetProfile(petId: string): void {
    if (this.navigator !== null) {
      this.navigator.navigate('PetProfile', { petId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to pet profile:', {
      petId,
    });
  }

  private navigateToMatch(matchId: string): void {
    if (this.navigator !== null) {
      this.navigator.navigate('MatchDetails', { matchId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to match:', {
      matchId,
    });
  }

  private navigateToUserProfile(userId: string): void {
    if (this.navigator !== null) {
      this.navigator.navigate('UserProfile', { userId });
      return;
    }
    logger.warn('Navigator not available, cannot navigate to user profile:', {
      userId,
    });
  }

  private navigateToPremium(): void {
    if (this.navigator !== null) {
      this.navigator.navigate('Premium');
      return;
    }
    logger.warn('Navigator not available, cannot navigate to premium screen');
  }

  private navigateToSettings(): void {
    if (this.navigator !== null) {
      this.navigator.navigate('Settings');
      return;
    }
    logger.warn('Navigator not available, cannot navigate to settings screen');
  }

  addListener(callback: (data: DeepLinkData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(data: DeepLinkData): void {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in deep link listener:', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  async canOpenUrl(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      logger.error('Error checking if URL can be opened:', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
      return false;
    }
  }

  async openUrl(url: string): Promise<void> {
    try {
      await Linking.openURL(url);
    } catch (error) {
      logger.error('Error opening URL:', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
      throw error;
    }
  }

  cleanup(): void {
    // Note: In React Native, we don't need to manually remove the listener
    // as the addEventListener returns a subscription that should be removed
    // This is handled by the component using the service
    this.listeners.clear();
  }

  // ===== SECURITY CONTROLS =====

  /**
   * Validate deep link URL format and security
   */
  private validateDeepLinkUrl(url: string): boolean {
    try {
      // Basic validation: should not be empty, reasonable length
      if (typeof url !== 'string' || url.length === 0 || url.length > 2000) {
        return false;
      }

      // Only allow http, https, or custom scheme
      const allowedSchemes = ['http:', 'https:', 'pawfectmatch:'];
      const urlObj = new URL(url);
      return allowedSchemes.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize deep link parameters to prevent injection
   */
  private sanitizeDeepLinkParams(params: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      // Remove potentially dangerous characters and limit length
      const cleanKey = key.replace(/[<>"'`]/g, '').substring(0, 100);
      const cleanValue = value.replace(/[<>"'`]/g, '').substring(0, 500);

      if (cleanKey !== '' && cleanValue !== '') {
        sanitized[cleanKey] = cleanValue;
      }
    }

    return sanitized;
  }

  /**
   * Rate limiting for deep link processing
   */
  private lastDeepLinkTime: number = 0;
  private readonly DEEP_LINK_RATE_LIMIT_MS = 1000; // 1 second between deep links

  private checkDeepLinkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastDeepLinkTime < this.DEEP_LINK_RATE_LIMIT_MS) {
      logger.warn('Deep link rate limit exceeded');
      return false;
    }
    this.lastDeepLinkTime = now;
    return true;
  }
}

// Export singleton instance
export const deepLinkingService = DeepLinkingService.getInstance();

// Utility hook for React components
export const useDeepLinking = () => {
  const [currentLink, setCurrentLink] = React.useState<DeepLinkData | null>(null);

  React.useEffect(() => {
    const unsubscribe = deepLinkingService.addListener((data) => {
      setCurrentLink(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    currentLink,
    handleUrl: deepLinkingService.handleUrl.bind(deepLinkingService),
    canOpenUrl: deepLinkingService.canOpenUrl.bind(deepLinkingService),
    openUrl: deepLinkingService.openUrl.bind(deepLinkingService),
    setNavigator: deepLinkingService.setNavigator.bind(deepLinkingService),
  };
};

export default deepLinkingService;
