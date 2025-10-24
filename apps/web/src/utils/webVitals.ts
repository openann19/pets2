/**
 * Web Vitals v5 monitoring implementation
 * Tracks Core Web Vitals and sends to analytics
 */
import { logger } from '../services/logger';
/**
 * Send metric to analytics service
 */
function sendToAnalytics(metric) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        logger.info('Web Vital', {
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
        });
    }
    // Send to Google Analytics if available
    if (typeof window !== 'undefined') {
        const { gtag } = window;
        if (typeof gtag === 'function') {
            gtag('event', metric.name, {
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                metric_id: metric.id,
                metric_value: metric.value,
                metric_delta: metric.delta,
                metric_rating: metric.rating,
            });
        }
    }
    // Send to custom analytics endpoint
    const analyticsUrl = process.env['NEXT_PUBLIC_ANALYTICS_URL'];
    if (typeof window !== 'undefined' && analyticsUrl) {
        const body = JSON.stringify({
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
        });
        // Use sendBeacon if available for reliable delivery
        if (navigator.sendBeacon) {
            navigator.sendBeacon(analyticsUrl, body);
        }
        else {
            fetch(analyticsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                keepalive: true,
            }).catch((error) => {
                logger.error('Failed to send web vital', { error, metric: metric.name });
            });
        }
    }
}
/**
 * Initialize Web Vitals monitoring
 * Call this from your app entry point or _app.tsx
 */
export async function initWebVitals() {
    try {
        // Dynamically import web-vitals to reduce bundle size
        const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');
        // Cumulative Layout Shift
        onCLS(sendToAnalytics);
        // First Contentful Paint
        onFCP(sendToAnalytics);
        // Largest Contentful Paint
        onLCP(sendToAnalytics);
        // Time to First Byte
        onTTFB(sendToAnalytics);
        // Interaction to Next Paint (replaces FID in v5)
        onINP(sendToAnalytics);
        logger.info('Web Vitals v5 monitoring initialized');
    }
    catch (error) {
        logger.error('Failed to initialize Web Vitals', { error });
    }
}
/**
 * Report custom performance metrics
 */
export function reportCustomMetric(name, value, metadata) {
    logger.info(`Custom metric: ${name}`, { value, ...metadata });
    if (typeof window !== 'undefined') {
        const { gtag } = window;
        if (typeof gtag === 'function') {
            gtag('event', 'custom_metric', {
                metric_name: name,
                metric_value: value,
                ...metadata,
            });
        }
    }
}
/**
 * Get Navigation Timing metrics
 */
export function getNavigationMetrics() {
    if (typeof window === 'undefined' || !window.performance) {
        return null;
    }
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) {
        return null;
    }
    return {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnection: navigation.connectEnd - navigation.connectStart,
        requestTime: navigation.responseStart - navigation.requestStart,
        responseTime: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    };
}
/**
 * Get Resource Timing metrics
 */
export function getResourceMetrics() {
    if (typeof window === 'undefined' || !window.performance) {
        return [];
    }
    return performance.getEntriesByType('resource');
}
//# sourceMappingURL=webVitals.js.map