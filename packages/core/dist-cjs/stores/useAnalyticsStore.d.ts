interface AnalyticsData {
    id: string;
    timestamp: string;
    data: Record<string, unknown>;
}
interface AnalyticsState {
    userAnalytics: AnalyticsData | null;
    petAnalytics: Record<string, AnalyticsData | null>;
    matchAnalytics: Record<string, AnalyticsData | null>;
    isLoading: boolean;
    error: string | null;
    fetchUserAnalytics: () => Promise<void>;
    trackUserEvent: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
    fetchPetAnalytics: (petId: string) => Promise<void>;
    trackPetEvent: (petId: string, eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
    fetchMatchAnalytics: (matchId: string) => Promise<void>;
    trackMatchEvent: (matchId: string, eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
}
export declare const _useAnalyticsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AnalyticsState>>;
export {};
