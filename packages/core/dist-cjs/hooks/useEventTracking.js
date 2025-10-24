"use strict";
/**
 * Event Tracking Hook
 * Tracks user events and interactions for analytics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEventTracking = useEventTracking;
const react_1 = require("react");
const logger_1 = require("../utils/logger");
const env_1 = require("../utils/env");
/**
 * Hook for tracking user events and interactions
 */
function useEventTracking() {
    const eventQueue = (0, react_1.useRef)([]);
    const flushTimeout = (0, react_1.useRef)(null);
    // Flush events to server
    const flushEvents = (0, react_1.useCallback)(async () => {
        if (eventQueue.current.length === 0)
            return;
        const events = [...eventQueue.current];
        eventQueue.current = [];
        try {
            const response = await fetch('/api/analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(0, env_1.getLocalStorageItem)('accessToken') ?? ''}`,
                },
                body: JSON.stringify({ events }),
            });
            if (!response.ok) {
                throw new Error('Failed to send analytics events');
            }
            logger_1.logger.info('Analytics events sent', { count: events.length });
        }
        catch (error) {
            logger_1.logger.error('Failed to send analytics events', { error });
            // Re-queue failed events
            eventQueue.current.unshift(...events);
        }
    }, []);
    // Track a generic event
    const trackEvent = (0, react_1.useCallback)(async (options) => {
        const event = {
            ...options,
            timestamp: new Date().toISOString(),
        };
        eventQueue.current.push(event);
        // Debounce flush - send events in batches
        if (flushTimeout.current) {
            clearTimeout(flushTimeout.current);
        }
        flushTimeout.current = setTimeout(() => {
            void flushEvents();
        }, 2000); // Flush every 2 seconds
        logger_1.logger.info('Event tracked', { category: options.category, action: options.action });
    }, [flushEvents]);
    // Track page view
    const trackPageView = (0, react_1.useCallback)(async (pageName, metadata) => {
        await trackEvent({
            category: 'Navigation',
            action: 'PageView',
            label: pageName,
            ...(metadata !== undefined && { metadata }),
        });
    }, [trackEvent]);
    // Track swipe action
    const trackSwipe = (0, react_1.useCallback)(async (action, petId) => {
        await trackEvent({
            category: 'Engagement',
            action: `Swipe_${action}`,
            label: petId,
            value: action === 'superlike' ? 2 : action === 'like' ? 1 : 0,
        });
    }, [trackEvent]);
    // Track match creation
    const trackMatch = (0, react_1.useCallback)(async (matchId, petId) => {
        await trackEvent({
            category: 'Engagement',
            action: 'Match_Created',
            label: matchId,
            metadata: { petId },
        });
    }, [trackEvent]);
    // Track message sent
    const trackMessage = (0, react_1.useCallback)(async (matchId, messageLength) => {
        await trackEvent({
            category: 'Communication',
            action: 'Message_Sent',
            label: matchId,
            value: messageLength,
        });
    }, [trackEvent]);
    // Track profile view
    const trackProfileView = (0, react_1.useCallback)(async (profileId, duration) => {
        await trackEvent({
            category: 'Engagement',
            action: 'Profile_View',
            label: profileId,
            ...(duration !== undefined && { value: duration }),
        });
    }, [trackEvent]);
    return {
        trackEvent,
        trackPageView,
        trackSwipe,
        trackMatch,
        trackMessage,
        trackProfileView,
    };
}
//# sourceMappingURL=useEventTracking.js.map