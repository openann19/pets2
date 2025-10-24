"use strict";
/**
 * User Analytics Hook
 * Tracks user behavior and provides analytics data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserAnalytics = useUserAnalytics;
const react_1 = require("react");
const logger_1 = require("../utils/logger");
const env_1 = require("../utils/env");
/**
 * Hook to fetch and track user analytics
 */
function useUserAnalytics(options = {}) {
    const { userId, autoRefresh = false, refreshInterval = 60000 } = options;
    const [analytics, setAnalytics] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchAnalytics = (0, react_1.useCallback)(async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/analytics/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${(0, env_1.getLocalStorageItem)('accessToken') ?? ''}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
            else {
                throw new Error(data.message || 'Failed to fetch analytics');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            logger_1.logger.error('Failed to fetch user analytics', { error: errorMessage, userId });
        }
        finally {
            setIsLoading(false);
        }
    }, [userId]);
    // Initial fetch
    (0, react_1.useEffect)(() => {
        void fetchAnalytics();
    }, [fetchAnalytics]);
    // Auto-refresh
    (0, react_1.useEffect)(() => {
        if (!autoRefresh || !userId)
            return;
        const interval = setInterval(() => {
            void fetchAnalytics();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, userId, fetchAnalytics]);
    return {
        analytics,
        isLoading,
        error,
        refresh: fetchAnalytics,
    };
}
//# sourceMappingURL=useUserAnalytics.js.map