/**
 * 🛠️ ADMIN HOOKS
 * React hooks for admin panel functionality
 */
import { User } from '../services/adminApi';
/**
 * Hook for admin dashboard statistics
 */
export declare const useAdminStats: () => import("@tanstack/react-query").UseQueryResult<import("../types").AdminStats, Error>;
/**
 * Hook for managing users
 */
export declare const useAdminUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "premium" | "verified" | "unverified";
}) => import("@tanstack/react-query").DefinedUseQueryResult<unknown, Error>;
/**
 * Hook for updating a user
 */
export declare const useUpdateUser: () => import("@tanstack/react-query").UseMutationResult<import("../types").User, Error, {
    userId: string;
    updates: Partial<User>;
}, unknown>;
/**
 * Hook for deleting a user
 */
export declare const useDeleteUser: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
/**
 * Hook for managing pets
 */
export declare const useAdminPets: (params?: {
    page?: number;
    limit?: number;
    species?: string;
    search?: string;
}) => import("@tanstack/react-query").DefinedUseQueryResult<unknown, Error>;
/**
 * Hook for managing matches
 */
export declare const useAdminMatches: (params?: {
    page?: number;
    limit?: number;
    status?: "all" | "active" | "inactive" | "blocked";
}) => import("@tanstack/react-query").DefinedUseQueryResult<unknown, Error>;
/**
 * Hook for system metrics
 */
export declare const useSystemMetrics: () => import("@tanstack/react-query").UseQueryResult<Record<string, unknown>, Error>;
/**
 * Hook for resetting metrics
 */
export declare const useResetMetrics: () => import("@tanstack/react-query").UseMutationResult<void, Error, void, unknown>;
/**
 * Hook for cache management
 */
export declare const useCacheManagement: () => {
    cacheStats: import("@tanstack/react-query").UseQueryResult<Record<string, unknown>, Error>;
    clearCache: import("@tanstack/react-query").UseMutationResult<{
        deletedCount: number;
    }, Error, void, unknown>;
    invalidateCache: import("@tanstack/react-query").UseMutationResult<{
        deletedCount: number;
    }, Error, string, unknown>;
};
/**
 * Hook for system information
 */
export declare const useSystemInfo: () => import("@tanstack/react-query").UseQueryResult<Record<string, unknown>, Error>;
/**
 * Hook for sending notifications
 */
export declare const useSendNotification: () => import("@tanstack/react-query").UseMutationResult<{
    sent: number;
    failed: number;
    total: number;
}, Error, NotificationRequest, unknown>;
/**
 * Hook for system logs
 */
export declare const useSystemLogs: (params?: {
    level?: "all" | "info" | "warn" | "error";
    limit?: number;
    search?: string;
}) => import("@tanstack/react-query").UseQueryResult<import("../types").SystemLog[], Error>;
/**
 * Hook for system operations
 */
export declare const useSystemOperations: () => {
    restartSystem: import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    createBackup: import("@tanstack/react-query").UseMutationResult<{
        backupId: string;
        estimatedTime: string;
    }, Error, string, unknown>;
};
/**
 * Hook for API endpoints monitoring
 */
export declare const useApiEndpoints: () => import("@tanstack/react-query").UseQueryResult<{
    method: string;
    path: string;
    calls: number;
    avgTime: string;
    errors: number;
}[], Error>;
/**
 * Hook for system health monitoring
 */
export declare const useSystemHealth: () => import("@tanstack/react-query").UseQueryResult<{
    status: "healthy" | "warning" | "critical";
    services: Array<{
        name: string;
        status: "healthy" | "warning" | "critical";
        uptime?: string;
        lastCheck: string;
    }>;
}, Error>;
/**
 * Hook for bulk user operations
 */
export declare const useBulkUserOperations: () => import("@tanstack/react-query").UseMutationResult<{
    success: number;
    failed: number;
    errors: Array<{
        userId: string;
        error: string;
    }>;
}, Error, {
    operation: string;
    userIds: string[];
    data?: Record<string, unknown>;
}, unknown>;
/**
 * Hook for platform analytics
 */
export declare const usePlatformAnalytics: (period?: "day" | "week" | "month" | "year") => import("@tanstack/react-query").UseQueryResult<{
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
    matchRate: Array<{
        date: string;
        rate: number;
    }>;
    revenue: Array<{
        date: string;
        amount: number;
    }>;
    engagement: Array<{
        date: string;
        sessions: number;
        duration: number;
    }>;
}, Error>;
/**
 * Hook for feature flags management
 */
export declare const useFeatureFlags: () => {
    featureFlags: import("@tanstack/react-query").UseQueryResult<{
        name: string;
        enabled: boolean;
        description: string;
        usersAffected: number;
    }[], Error>;
    updateFeatureFlag: import("@tanstack/react-query").UseMutationResult<void, Error, {
        name: string;
        enabled: boolean;
    }, unknown>;
};
/**
 * Hook for security alerts
 */
export declare const useSecurityAlerts: () => import("@tanstack/react-query").UseQueryResult<{
    id: string;
    type: "suspicious_login" | "rate_limit_exceeded" | "invalid_token" | "other";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    timestamp: string;
    userId?: string;
    ip?: string;
    resolved: boolean;
}[], Error>;
/**
 * Hook for resolving security alerts
 */
export declare const useResolveSecurityAlert: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
/**
 * Hook for content moderation
 */
export declare const useContentModeration: () => {
    moderationQueue: import("@tanstack/react-query").UseQueryResult<{
        id: string;
        type: "pet_profile" | "user_profile" | "message" | "photo";
        content: unknown;
        reportedBy: string;
        reason: string;
        status: "pending" | "approved" | "rejected";
        createdAt: string;
    }[], Error>;
    moderateContent: import("@tanstack/react-query").UseMutationResult<void, Error, {
        contentId: string;
        action: "approve" | "reject";
        reason?: string;
    }, unknown>;
};
/**
 * Hook for real-time admin updates
 */
export declare const useAdminRealTime: () => void;
/**
 * Hook for admin search functionality
 */
export declare const useAdminSearch: () => {
    searchTerm: string;
    setSearchTerm: import("react").Dispatch<import("react").SetStateAction<string>>;
    searchResults: any[];
    isSearching: boolean;
    performSearch: (term: string) => Promise<void>;
};
//# sourceMappingURL=useAdmin.d.ts.map