import { logger } from '@pawfectmatch/core';
/**
 * Analytics Service
 *
 * This service handles all analytics tracking and reporting for the application.
 * It integrates with both internal analytics endpoints and third-party services.
 */
// Temporary fallback until core package is properly built
const errorHandler = {
    handleError: (error, context, options) => {
        logger.error('Error:', { message: error.message, context, options });
    },
    handleApiError: (error, context, apiInfo) => {
        logger.error('API Error:', { message: error.message, context, apiInfo });
    },
};
// Base API URL from environment variable
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';
/**
 * Generic fetch wrapper for analytics endpoints
 */
async function fetchAnalyticsApi(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token !== null && token.length > 0) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({ message: undefined })));
        throw new Error(errorData.message ?? `API error: ${response.status.toString()}`);
    }
    return (await response.json());
}
export class AnalyticsService {
    events = [];
    flushInterval = null;
    isInitialized = false;
    // No constructor needed
    /**
     * Initialize the analytics service
     */
    initialize(userId) {
        if (this.isInitialized)
            return;
        // Start the event flushing interval (every 30 seconds)
        this.flushInterval = setInterval(() => {
            this.flushEvents().catch((error) => {
                errorHandler.handleError(error instanceof Error ? error : new Error('Failed to flush events in interval'), { component: 'AnalyticsService', action: 'flushEvents' }, { showNotification: false });
            });
        }, 30000);
        // Track initialization
        this.trackEvent('analytics_initialized', { user_id: userId });
        // Add page view tracking
        if (typeof window !== 'undefined') {
            this.trackPageView();
            // Track page views when route changes
            window.addEventListener('popstate', () => {
                this.trackPageView();
            });
        }
        this.isInitialized = true;
    }
    /**
     * Clean up the analytics service
     */
    dispose() {
        if (this.flushInterval !== null) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('popstate', () => {
                this.trackPageView();
            });
        }
        // Flush any remaining events
        this.flushEvents().catch((error) => {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to flush events on dispose'), { component: 'AnalyticsService', action: 'dispose' }, { showNotification: false });
        });
    }
    /**
     * Track an event
     */
    trackEvent(eventName, properties = {}) {
        const event = {
            event_name: eventName,
            timestamp: new Date().toISOString(),
            properties: {
                ...properties,
                url: typeof window !== 'undefined' ? window.location.pathname : '',
            },
        };
        this.events.push(event);
        // If we have too many events, flush immediately
        if (this.events.length >= 20) {
            this.flushEvents().catch((error) => {
                errorHandler.handleError(error instanceof Error ? error : new Error('Failed to flush events immediately'), { component: 'AnalyticsService', action: 'trackEvent' }, { showNotification: false });
            });
        }
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.info('Analytics event:', { event });
        }
    }
    /**
     * Track a page view
     */
    trackPageView() {
        if (typeof window === 'undefined')
            return;
        this.trackEvent('page_view', {
            path: window.location.pathname,
            referrer: document.referrer.length > 0 ? document.referrer : '',
            title: document.title,
        });
    }
    /**
     * Send events to the server
     */
    async flushEvents() {
        if (this.events.length === 0)
            return;
        const eventsToSend = [...this.events];
        this.events = [];
        try {
            await fetchAnalyticsApi('/analytics/events', {
                method: 'POST',
                body: JSON.stringify({ events: eventsToSend }),
            });
        }
        catch (error) {
            errorHandler.handleApiError(error instanceof Error ? error : new Error('Failed to send analytics events'), {
                component: 'AnalyticsService',
                action: 'flushEvents',
                metadata: { eventCount: eventsToSend.length },
            }, {
                endpoint: '/analytics/events',
                method: 'POST',
            });
            // Put events back in queue
            this.events = [...eventsToSend, ...this.events];
        }
    }
    /**
     * Get user analytics
     */
    async getUserAnalytics(userId, period = 'week') {
        try {
            const response = await fetchAnalyticsApi(`/analytics/users/${userId}?period=${period}`);
            return response.data;
        }
        catch (error) {
            errorHandler.handleApiError(error instanceof Error ? error : new Error('Failed to fetch user analytics'), {
                component: 'AnalyticsService',
                action: 'getUserAnalytics',
                metadata: { userId, period },
            }, {
                endpoint: `/analytics/users/${userId}`,
                method: 'GET',
            });
            throw error;
        }
    }
    /**
     * Get match analytics
     */
    async getMatchAnalytics(userId, period = 'week') {
        try {
            const response = await fetchAnalyticsApi(`/analytics/matches/${userId}?period=${period}`);
            return response.data;
        }
        catch (error) {
            errorHandler.handleApiError(error instanceof Error ? error : new Error('Failed to fetch match analytics'), {
                component: 'AnalyticsService',
                action: 'getMatchAnalytics',
                metadata: { userId, period },
            }, {
                endpoint: `/analytics/matches/${userId}`,
                method: 'GET',
            });
            throw error;
        }
    }
    /**
     * Get performance metrics
     */
    async getPerformanceMetrics() {
        try {
            const response = await fetchAnalyticsApi('/analytics/performance');
            return response.data;
        }
        catch (error) {
            errorHandler.handleApiError(error instanceof Error ? error : new Error('Failed to fetch performance metrics'), {
                component: 'AnalyticsService',
                action: 'getPerformanceMetrics',
            }, {
                endpoint: '/analytics/performance',
                method: 'GET',
            });
            throw error;
        }
    }
}
// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
//# sourceMappingURL=AnalyticsService.js.map