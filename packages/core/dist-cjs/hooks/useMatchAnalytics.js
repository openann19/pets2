"use strict";
/**
 * Match Analytics Hook
 * Tracks match-related analytics and insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMatchAnalytics = useMatchAnalytics;
const react_1 = require("react");
const logger_1 = require("../utils/logger");
const env_1 = require("../utils/env");
/**
 * Hook to fetch match analytics and insights
 */
function useMatchAnalytics(options = {}) {
    const { userId, timeframe = 'weekly' } = options;
    const [insights, setInsights] = (0, react_1.useState)(null);
    const [trends, setTrends] = (0, react_1.useState)(null);
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
            const response = await fetch(`/api/analytics/matches/${userId}?timeframe=${timeframe}`, {
                headers: {
                    'Authorization': `Bearer ${(0, env_1.getLocalStorageItem)('accessToken') ?? ''}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch match analytics: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setInsights(data.data.insights);
                setTrends(data.data.trends);
            }
            else {
                throw new Error(data.message || 'Failed to fetch match analytics');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            logger_1.logger.error('Failed to fetch match analytics', { error: errorMessage, userId });
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, timeframe]);
    (0, react_1.useEffect)(() => {
        void fetchAnalytics();
    }, [fetchAnalytics]);
    return {
        insights,
        trends,
        isLoading,
        error,
        refresh: fetchAnalytics,
    };
}
//# sourceMappingURL=useMatchAnalytics.js.map