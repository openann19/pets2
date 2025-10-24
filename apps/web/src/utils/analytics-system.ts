/**
 * 📊 ADVANCED ANALYTICS SYSTEM
 * Comprehensive user behavior tracking and performance monitoring
 */
'use client';
import React from 'react';
import { logger } from '../services/logger';
class AdvancedAnalytics {
    sessionId;
    userId = null;
    pageStartTime = Date.now();
    userBehavior = {
        swipes: [],
        messages: [],
        pageViews: [],
        interactions: [],
    };
    performanceMetrics = {
        pageLoad: [],
        apiCalls: [],
        errors: [],
        memoryUsage: [],
    };
    queue = [];
    isOnline = true;
    constructor() {
        this.sessionId = this.generateSessionId();
        this.initializeTracking();
        this.startPerformanceMonitoring();
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    initializeTracking() {
        if (typeof window === 'undefined')
            return;
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackPageView(window.location.pathname, Date.now() - this.pageStartTime);
            }
            else {
                this.pageStartTime = Date.now();
            }
        });
        // Track network status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        // Track unhandled errors
        window.addEventListener('error', (event) => {
            this.trackError(event.error || new Error(event.message));
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(new Error(event.reason));
        });
    }
    startPerformanceMonitoring() {
        if (typeof window === 'undefined')
            return;
        // Monitor memory usage
        setInterval(() => {
            // Check if performance.memory is available (Chrome-specific API)
            if ('memory' in performance && performance.memory) {
                const memory = performance.memory;
                this.performanceMetrics.memoryUsage.push(memory.usedJSHeapSize);
                // Keep only last 20 measurements
                if (this.performanceMetrics.memoryUsage.length > 20) {
                    this.performanceMetrics.memoryUsage.shift();
                }
            }
        }, 10000); // Every 10 seconds
    }
    // ====== PUBLIC METHODS ======
    setUserId(userId) {
        this.userId = userId;
    }
    // Track user interactions
    trackSwipe(direction, petId) {
        this.userBehavior.swipes.push({
            direction,
            petId,
            timestamp: Date.now(),
        });
        this.track('pet_swipe', {
            direction,
            petId,
            sessionSwipes: this.userBehavior.swipes.length,
        });
    }
    trackMessage(matchId, messageLength) {
        this.userBehavior.messages.push({
            matchId,
            timestamp: Date.now(),
        });
        this.track('message_sent', {
            matchId,
            messageLength,
            sessionMessages: this.userBehavior.messages.length,
        });
    }
    trackPageView(page, duration) {
        const finalDuration = duration || (Date.now() - this.pageStartTime);
        this.userBehavior.pageViews.push({
            page,
            duration: finalDuration,
            timestamp: Date.now(),
        });
        this.track('page_view', {
            page,
            duration: finalDuration,
            sessionPageViews: this.userBehavior.pageViews.length,
        });
    }
    trackInteraction(element, action, metadata) {
        this.userBehavior.interactions.push({
            element,
            action,
            timestamp: Date.now(),
        });
        this.track('user_interaction', {
            element,
            action,
            ...metadata,
            sessionInteractions: this.userBehavior.interactions.length,
        });
    }
    trackAIUsage(feature, success, duration, metadata) {
        this.track('ai_feature_used', {
            feature,
            success,
            duration,
            ...metadata,
        });
    }
    trackPremiumFeatureAttempt(feature, hasAccess) {
        this.track('premium_feature_attempt', {
            feature,
            hasAccess,
            conversionOpportunity: !hasAccess,
        });
    }
    trackMatchSuccess(matchId, compatibilityScore) {
        this.track('match_created', {
            matchId,
            compatibilityScore,
            sessionMatches: this.userBehavior.swipes.filter(s => s.direction === 'like').length,
        });
    }
    // Track performance metrics
    trackApiCall(endpoint, duration, status) {
        this.performanceMetrics.apiCalls.push({
            endpoint,
            duration,
            status,
            timestamp: Date.now(),
        });
        // Keep only last 50 API calls
        if (this.performanceMetrics.apiCalls.length > 50) {
            this.performanceMetrics.apiCalls.shift();
        }
        // Track slow API calls
        if (duration > 2000) {
            this.track('slow_api_call', {
                endpoint,
                duration,
                status,
            });
        }
    }
    trackError(error, context) {
        this.performanceMetrics.errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
        });
        this.track('error_occurred', {
            message: error.message,
            stack: error.stack?.substring(0, 500), // Limit stack trace length
            context,
            sessionErrors: this.performanceMetrics.errors.length,
        });
    }
    // ====== CORE TRACKING METHOD ======
    track(eventName, properties) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                page: typeof window !== 'undefined' ? window.location.pathname : undefined,
                referrer: typeof document !== 'undefined' ? document.referrer : undefined,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                screenResolution: typeof window !== 'undefined'
                    ? `${window.screen.width}x${window.screen.height}`
                    : undefined,
                connectionType: this.getConnectionType(),
            },
            timestamp: Date.now(),
            userId: this.userId ?? undefined,
            sessionId: this.sessionId,
        };
        if (this.isOnline) {
            this.sendEvent(event);
        }
        else {
            this.queue.push(event);
        }
    }
    async sendEvent(event) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });
        }
        catch (error) {
            logger.warn('Failed to send analytics event', error);
            this.queue.push(event);
        }
    }
    flushQueue() {
        while (this.queue.length > 0) {
            const event = this.queue.shift();
            if (event) {
                this.sendEvent(event);
            }
        }
    }
    getConnectionType() {
        // Check if navigator.connection is available (experimental API)
        if ('connection' in navigator && navigator.connection) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    // ====== REPORTING METHODS ======
    generateUserBehaviorReport() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const recentSwipes = this.userBehavior.swipes.filter(s => s.timestamp > last24h);
        const recentMessages = this.userBehavior.messages.filter(m => m.timestamp > last24h);
        const recentPageViews = this.userBehavior.pageViews.filter(p => p.timestamp > last24h);
        return {
            session: {
                id: this.sessionId,
                duration: now - this.pageStartTime,
                userId: this.userId,
            },
            last24Hours: {
                swipes: {
                    total: recentSwipes.length,
                    likes: recentSwipes.filter(s => s.direction === 'like').length,
                    passes: recentSwipes.filter(s => s.direction === 'pass').length,
                    superLikes: recentSwipes.filter(s => s.direction === 'superlike').length,
                },
                messages: recentMessages.length,
                pageViews: recentPageViews.length,
                averageSessionTime: recentPageViews.reduce((sum, pv) => sum + pv.duration, 0) / recentPageViews.length || 0,
            },
            engagement: {
                swipeRate: recentSwipes.length / Math.max(recentPageViews.length, 1),
                messageRate: recentMessages.length / Math.max(recentPageViews.length, 1),
                retentionScore: this.calculateRetentionScore(),
            },
        };
    }
    generatePerformanceReport() {
        return {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            metrics: {
                averageApiResponseTime: this.calculateAverageApiTime(),
                errorRate: this.calculateErrorRate(),
                memoryTrend: this.calculateMemoryTrend(),
                slowRequests: this.performanceMetrics.apiCalls.filter(call => call.duration > 2000).length,
            },
            recommendations: this.generatePerformanceRecommendations(),
        };
    }
    calculateRetentionScore() {
        const totalInteractions = this.userBehavior.interactions.length;
        const sessionDuration = Date.now() - this.pageStartTime;
        const engagementRate = totalInteractions / (sessionDuration / 60000); // Interactions per minute
        return Math.min(100, engagementRate * 10);
    }
    calculateAverageApiTime() {
        const calls = this.performanceMetrics.apiCalls;
        if (calls.length === 0)
            return 0;
        return calls.reduce((sum, call) => sum + call.duration, 0) / calls.length;
    }
    calculateErrorRate() {
        const totalApiCalls = this.performanceMetrics.apiCalls.length;
        const errorCalls = this.performanceMetrics.apiCalls.filter(call => call.status >= 400).length;
        if (totalApiCalls === 0)
            return 0;
        return (errorCalls / totalApiCalls) * 100;
    }
    calculateMemoryTrend() {
        const recent = this.performanceMetrics.memoryUsage.slice(-5);
        if (recent.length < 3)
            return 'stable';
        const trend = recent[recent.length - 1] - recent[0];
        if (trend > recent[0] * 0.1)
            return 'increasing';
        if (trend < -recent[0] * 0.1)
            return 'decreasing';
        return 'stable';
    }
    generatePerformanceRecommendations() {
        const recommendations = [];
        if (this.calculateAverageApiTime() > 1000) {
            recommendations.push('API response times are slow - consider caching optimization');
        }
        if (this.calculateErrorRate() > 5) {
            recommendations.push('High error rate detected - review error handling');
        }
        if (this.calculateMemoryTrend() === 'increasing') {
            recommendations.push('Memory usage is increasing - check for memory leaks');
        }
        return recommendations;
    }
}
// ====== SINGLETON INSTANCE ======
let analyticsInstance = null;
export const getAnalytics = () => {
    if (!analyticsInstance) {
        analyticsInstance = new AdvancedAnalytics();
    }
    return analyticsInstance;
};
// ====== REACT HOOK ======
export const useAnalytics = () => {
    const analytics = getAnalytics();
    const trackSwipe = (direction, petId) => {
        analytics.trackSwipe(direction, petId);
    };
    const trackMessage = (matchId, messageLength) => {
        analytics.trackMessage(matchId, messageLength);
    };
    const trackInteraction = (element, action, metadata) => {
        analytics.trackInteraction(element, action, metadata);
    };
    const trackAIUsage = (feature, success, duration, metadata) => {
        analytics.trackAIUsage(feature, success, duration, metadata);
    };
    const trackPremiumFeatureAttempt = (feature, hasAccess) => {
        analytics.trackPremiumFeatureAttempt(feature, hasAccess);
    };
    const trackMatchSuccess = (matchId, compatibilityScore) => {
        analytics.trackMatchSuccess(matchId, compatibilityScore);
    };
    const trackApiCall = (endpoint, duration, status) => {
        analytics.trackApiCall(endpoint, duration, status);
    };
    const generateReport = () => {
        return {
            behavior: analytics.generateUserBehaviorReport(),
            performance: analytics.generatePerformanceReport(),
        };
    };
    return {
        trackSwipe,
        trackMessage,
        trackInteraction,
        trackAIUsage,
        trackPremiumFeatureAttempt,
        trackMatchSuccess,
        trackApiCall,
        generateReport,
        setUserId: (userId) => analytics.setUserId(userId),
    };
};
// ====== HOC FOR AUTOMATIC TRACKING ======
// ✅ REFACTORED: Moved to separate .tsx file to fix Next.js compilation issues
// Import from: @/components/Analytics/withAnalytics
// 
// Usage:
//   import { withAnalytics } from '@/components/Analytics/withAnalytics';
//   const TrackedComponent = withAnalytics(MyComponent, 'MyComponent');
//
// See: apps/web/src/components/Analytics/withAnalytics.tsx
// ====== PERFORMANCE TRACKING UTILITIES ======
export const trackAPIPerformance = (originalFetch) => {
    return async (input, init) => {
        const start = Date.now();
        const endpoint = typeof input === 'string' ? input : input.toString();
        const analytics = getAnalytics();
        try {
            const response = await originalFetch(input, init);
            const duration = Date.now() - start;
            analytics.trackApiCall(endpoint, duration, response.status);
            return response;
        }
        catch (error) {
            const duration = Date.now() - start;
            analytics.trackApiCall(endpoint, duration, 0); // 0 indicates network error
            analytics.trackError(error, { endpoint, duration });
            throw error;
        }
    };
};
// ====== EXPORTS ======
export { AdvancedAnalytics };
export default getAnalytics;
//# sourceMappingURL=analytics-system.js.map