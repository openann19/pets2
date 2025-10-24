/**
 * 🛠️ ADMIN API SERVICE
 * Complete API service for admin panel functionality
 */
import { AdminStats, User, Pet, Match, SystemLog, NotificationRequest } from '@/types';
declare class AdminApiService {
    private http;
    private baseUrl;
    /**
     * Get comprehensive platform statistics
     */
    getStats(): Promise<AdminStats>;
    /**
     * Get all users with pagination and filtering
     */
    getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'all' | 'premium' | 'verified' | 'unverified';
    }): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Update user information
     */
    updateUser(userId: string, updates: Partial<User>): Promise<User>;
    /**
     * Delete user and all associated data
     */
    deleteUser(userId: string): Promise<void>;
    /**
     * Get all pets with filtering
     */
    getPets(params?: {
        page?: number;
        limit?: number;
        species?: string;
        search?: string;
    }): Promise<{
        pets: Pet[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Get all matches with filtering
     */
    getMatches(params?: {
        page?: number;
        limit?: number;
        status?: 'all' | 'active' | 'inactive' | 'blocked';
    }): Promise<{
        matches: Match[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Get system metrics
     */
    getMetrics(): Promise<Record<string, unknown>>;
    /**
     * Reset system metrics
     */
    resetMetrics(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<Record<string, unknown>>;
    /**
     * Clear all cache
     */
    clearCache(): Promise<{
        deletedCount: number;
    }>;
    /**
     * Invalidate cache by pattern
     */
    invalidateCache(pattern: string): Promise<{
        deletedCount: number;
    }>;
    /**
     * Get system information
     */
    getSystemInfo(): Promise<Record<string, unknown>>;
    /**
     * Send notification to users
     */
    sendNotification(request: NotificationRequest): Promise<{
        sent: number;
        failed: number;
        total: number;
    }>;
    /**
     * Get system logs
     */
    getLogs(params?: {
        level?: 'all' | 'info' | 'warn' | 'error';
        limit?: number;
        search?: string;
    }): Promise<SystemLog[]>;
    /**
     * Restart system services
     */
    restartSystem(service?: string): Promise<void>;
    /**
     * Create database backup
     */
    createBackup(type?: string): Promise<{
        backupId: string;
        estimatedTime: string;
    }>;
    /**
     * Get API endpoint statistics
     */
    getApiEndpoints(): Promise<Array<{
        method: string;
        path: string;
        calls: number;
        avgTime: string;
        errors: number;
    }>>;
    /**
     * Get system health status
     */
    getSystemHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        services: Array<{
            name: string;
            status: 'healthy' | 'warning' | 'critical';
            uptime?: string;
            lastCheck: string;
        }>;
    }>;
    /**
     * Export user data
     */
    exportUserData(userId: string): Promise<Blob>;
    /**
     * Bulk user operations
     */
    bulkUserOperation(operation: string, userIds: string[], data?: Record<string, unknown>): Promise<{
        success: number;
        failed: number;
        errors: Array<{
            userId: string;
            error: string;
        }>;
    }>;
    /**
     * Get platform analytics
     */
    getPlatformAnalytics(period?: 'day' | 'week' | 'month' | 'year'): Promise<{
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
    }>;
    /**
     * Manage feature flags
     */
    getFeatureFlags(): Promise<Array<{
        name: string;
        enabled: boolean;
        description: string;
        usersAffected: number;
    }>>;
    updateFeatureFlag(name: string, enabled: boolean): Promise<void>;
    /**
     * Security operations
     */
    getSecurityAlerts(): Promise<Array<{
        id: string;
        type: 'suspicious_login' | 'rate_limit_exceeded' | 'invalid_token' | 'other';
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        timestamp: string;
        userId?: string;
        ip?: string;
        resolved: boolean;
    }>>;
    resolveSecurityAlert(alertId: string): Promise<void>;
    /**
     * Content moderation
     */
    getModerationQueue(): Promise<Array<{
        id: string;
        type: 'pet_profile' | 'user_profile' | 'message' | 'photo';
        content: unknown;
        reportedBy: string;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
        createdAt: string;
    }>>;
    moderateContent(contentId: string, action: 'approve' | 'reject', reason?: string): Promise<void>;
}
declare const adminApiService: AdminApiService;
export default adminApiService;
//# sourceMappingURL=adminApi.d.ts.map