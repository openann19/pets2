'use client';
import { createContext, useContext, useEffect } from 'react';
import { getAnalytics } from '../utils/analytics-system';
const AnalyticsContext = createContext(undefined);
export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
}
export function AnalyticsProvider({ children }) {
    const analytics = getAnalytics();
    useEffect(() => {
        // Track app initialization
        analytics.track('app_initialized', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
        });
        // Track page visibility changes
        const handleVisibilityChange = () => {
            analytics.track('page_visibility_change', {
                hidden: document.hidden,
                timestamp: Date.now(),
            });
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // Track performance metrics
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                analytics.track('performance_metric', {
                    name: entry.name,
                    duration: entry.duration,
                    type: entry.entryType,
                });
            }
        });
        observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
        };
    }, []);
    const trackEvent = (eventName, properties) => {
        analytics.track(eventName, properties);
    };
    const trackPageView = (page) => {
        analytics.trackPageView(page);
    };
    const trackInteraction = (element, action, metadata) => {
        analytics.trackInteraction(element, action, metadata);
    };
    const trackError = (error, context) => {
        analytics.trackError(error, context);
    };
    const setUserId = (userId) => {
        analytics.setUserId(userId);
    };
    const value = {
        trackEvent,
        trackPageView,
        trackInteraction,
        trackError,
        setUserId,
    };
    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
//# sourceMappingURL=AnalyticsContext.jsx.map