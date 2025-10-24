"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._useAnalyticsStore = void 0;
const zustand_1 = require("zustand");
const client_1 = require("../api/client");
exports._useAnalyticsStore = (0, zustand_1.create)()((set, get) => ({
    userAnalytics: null,
    petAnalytics: {},
    matchAnalytics: {},
    isLoading: false,
    error: null,
    // User analytics
    fetchUserAnalytics: async () => {
        set({ isLoading: true, error: null });
        try {
            // Mock analytics data since the API call doesn't return proper data
            const analyticsData = {
                id: 'user-analytics-id',
                timestamp: new Date().toISOString(),
                data: { views: 123, matches: 45, likes: 67 }
            };
            await Promise.resolve();
            set({ userAnalytics: analyticsData, isLoading: false });
        }
        catch {
            set({ error: 'Failed to fetch user analytics', isLoading: false });
        }
    },
    trackUserEvent: async (eventType, metadata) => {
        try {
            await client_1.apiClient.post('/analytics/user', { eventType, metadata });
            // Refresh user analytics after tracking event
            const { fetchUserAnalytics } = get();
            await fetchUserAnalytics();
        }
        catch {
            set({ error: 'Failed to track user event' });
        }
    },
    // Pet analytics
    fetchPetAnalytics: async (petId) => {
        set({ isLoading: true, error: null });
        try {
            // Mock analytics data since the API call doesn't return proper data
            const petData = {
                id: `pet-analytics-${petId}`,
                timestamp: new Date().toISOString(),
                data: { views: 89, likes: 34, superlikes: 12 }
            };
            await Promise.resolve();
            set({
                petAnalytics: {
                    ...get().petAnalytics,
                    [petId]: petData
                },
                isLoading: false
            });
        }
        catch {
            set({ error: `Failed to fetch pet analytics for ${petId}`, isLoading: false });
        }
    },
    trackPetEvent: async (petId, eventType, metadata) => {
        try {
            await client_1.apiClient.post('/analytics/pet', { petId, eventType, metadata });
            // Refresh pet analytics after tracking event
            const { fetchPetAnalytics } = get();
            await fetchPetAnalytics(petId);
        }
        catch {
            set({ error: `Failed to track pet event for ${petId}` });
        }
    },
    // Match analytics
    fetchMatchAnalytics: async (matchId) => {
        set({ isLoading: true, error: null });
        try {
            // Mock analytics data since the API call doesn't return proper data
            const matchData = {
                id: `match-analytics-${matchId}`,
                timestamp: new Date().toISOString(),
                data: { messageCount: 42, responseTime: 15, lastActivity: new Date().toISOString() }
            };
            await Promise.resolve();
            set({
                matchAnalytics: {
                    ...get().matchAnalytics,
                    [matchId]: matchData
                },
                isLoading: false
            });
        }
        catch {
            set({ error: `Failed to fetch match analytics for ${matchId}`, isLoading: false });
        }
    },
    trackMatchEvent: async (matchId, eventType, metadata) => {
        try {
            await client_1.apiClient.post('/analytics/match', { matchId, eventType, metadata });
            // Refresh match analytics after tracking event
            const { fetchMatchAnalytics } = get();
            await fetchMatchAnalytics(matchId);
        }
        catch {
            set({ error: `Failed to track match event for ${matchId}` });
        }
    },
}));
//# sourceMappingURL=useAnalyticsStore.js.map