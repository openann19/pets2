import { UserAnalytics, MatchAnalytics } from '../lib/analytics-service';
/**
 * Hook for video call management
 */
export declare function useVideoCall(roomId: any, userId: any): {
    localStream: null;
    isConnected: boolean;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
    error: null;
    startCall: (config: any) => Promise<void>;
    endCall: () => void;
    toggleVideo: () => void;
    toggleAudio: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => Promise<void>;
};
/**
 * Hook for premium tier management
 */
export declare function usePremiumTier(userId: any): {
    subscription: any;
    currentTier: any;
    plan: any;
    allPlans: any;
    isLoading: boolean;
    hasFeature: (feature: any) => any;
    getLimit: (limit: any) => any;
    upgrade: import("@tanstack/react-query").UseMutateFunction<any, Error, void, unknown>;
    cancel: import("@tanstack/react-query").UseMutateFunction<any, Error, void, unknown>;
    isUpgrading: boolean;
    isCancelling: boolean;
};
/**
 * Hook for user analytics
 */
export declare function useUserAnalytics(userId: any, period?: string): {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: (options?: import("@tanstack/react-query").RefetchOptions) => Promise<import("@tanstack/react-query").QueryObserverResult<UserAnalytics, Error>>;
};
/**
 * Hook for match analytics
 */
export declare function useMatchAnalytics(userId: any): {
    matchAnalytics: MatchAnalytics | undefined;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for event tracking
 */
export declare function useEventTracking(userId: any): {
    trackEvent: (eventType: any, metadata: any) => Promise<void>;
};
/**
 * Hook for feature gating based on premium tier
 */
export declare function useFeatureGate(userId: any, requiredFeature: any): {
    hasAccess: any;
    checkAccess: () => any;
    showUpgradeModal: boolean;
    closeModal: () => void;
    currentTier: any;
    plan: any;
};
/**
 * Hook for real-time performance monitoring
 */
export declare function usePerformanceMonitoring(): {
    metrics: {
        responseTime: number;
        activeUsers: number;
        serverLoad: number;
        uptime: number;
        errorRate: number;
    };
};
/**
 * Hook for usage tracking and limits
 */
export declare function useUsageLimits(userId: any): {
    usage: {
        dailySwipes: number;
        videoCallMinutes: number;
        photoUploads: number;
    };
    checkLimit: (limitType: any, currentValue: any) => {
        reached: boolean;
        remaining: number;
        limit?: never;
    } | {
        reached: boolean;
        remaining: number;
        limit: any;
    };
    incrementUsage: (type: any) => void;
    currentTier: any;
};
//# sourceMappingURL=premium-hooks.d.ts.map