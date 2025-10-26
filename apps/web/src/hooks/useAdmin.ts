/**
 * 🛠️ ADMIN HOOKS
 * React hooks for admin panel functionality
 */
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApiService, { AdminStats, User, Pet, Match, SystemLog, NotificationRequest } from '../services/adminApi';
/**
 * Hook for admin dashboard statistics
 */
export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: () => adminApiService.getStats(),
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 15000, // Consider data stale after 15 seconds
    });
};
/**
 * Hook for managing users
 */
export const useAdminUsers = (params = {}) => {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminApiService.getUsers(params),
        keepPreviousData: true,
    });
};
/**
 * Hook for updating a user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, updates }) => adminApiService.updateUser(userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        },
    });
};
/**
 * Hook for deleting a user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => adminApiService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        },
    });
};
/**
 * Hook for managing pets
 */
export const useAdminPets = (params = {}) => {
    return useQuery({
        queryKey: ['admin', 'pets', params],
        queryFn: () => adminApiService.getPets(params),
        keepPreviousData: true,
    });
};
/**
 * Hook for managing matches
 */
export const useAdminMatches = (params = {}) => {
    return useQuery({
        queryKey: ['admin', 'matches', params],
        queryFn: () => adminApiService.getMatches(params),
        keepPreviousData: true,
    });
};
/**
 * Hook for system metrics
 */
export const useSystemMetrics = () => {
    return useQuery({
        queryKey: ['admin', 'metrics'],
        queryFn: () => adminApiService.getMetrics(),
        refetchInterval: 10000, // Refetch every 10 seconds
    });
};
/**
 * Hook for resetting metrics
 */
export const useResetMetrics = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => adminApiService.resetMetrics(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
        },
    });
};
/**
 * Hook for cache management
 */
export const useCacheManagement = () => {
    const queryClient = useQueryClient();
    const cacheStats = useQuery({
        queryKey: ['admin', 'cache', 'stats'],
        queryFn: () => adminApiService.getCacheStats(),
        refetchInterval: 30000,
    });
    const clearCache = useMutation({
        mutationFn: () => adminApiService.clearCache(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'cache'] });
        },
    });
    const invalidateCache = useMutation({
        mutationFn: (pattern) => adminApiService.invalidateCache(pattern),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'cache'] });
        },
    });
    return {
        cacheStats,
        clearCache,
        invalidateCache,
    };
};
/**
 * Hook for system information
 */
export const useSystemInfo = () => {
    return useQuery({
        queryKey: ['admin', 'system', 'info'],
        queryFn: () => adminApiService.getSystemInfo(),
        refetchInterval: 60000, // Refetch every minute
    });
};
/**
 * Hook for sending notifications
 */
export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request) => adminApiService.sendNotification(request),
        onSuccess: () => {
            // Could invalidate logs or notifications queries here
            queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] });
        },
    });
};
/**
 * Hook for system logs
 */
export const useSystemLogs = (params = {}) => {
    return useQuery({
        queryKey: ['admin', 'logs', params],
        queryFn: () => adminApiService.getLogs(params),
        refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
    });
};
/**
 * Hook for system operations
 */
export const useSystemOperations = () => {
    const queryClient = useQueryClient();
    const restartSystem = useMutation({
        mutationFn: (service) => adminApiService.restartSystem(service),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'system'] });
        },
    });
    const createBackup = useMutation({
        mutationFn: (type) => adminApiService.createBackup(type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'system'] });
        },
    });
    return {
        restartSystem,
        createBackup,
    };
};
/**
 * Hook for API endpoints monitoring
 */
export const useApiEndpoints = () => {
    return useQuery({
        queryKey: ['admin', 'api', 'endpoints'],
        queryFn: () => adminApiService.getApiEndpoints(),
        refetchInterval: 30000,
    });
};
/**
 * Hook for system health monitoring
 */
export const useSystemHealth = () => {
    return useQuery({
        queryKey: ['admin', 'system', 'health'],
        queryFn: () => adminApiService.getSystemHealth(),
        refetchInterval: 15000,
    });
};
/**
 * Hook for bulk user operations
 */
export const useBulkUserOperations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ operation, userIds, data }) => adminApiService.bulkUserOperation(operation, userIds, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        },
    });
};
/**
 * Hook for platform analytics
 */
export const usePlatformAnalytics = (period = 'month') => {
    return useQuery({
        queryKey: ['admin', 'analytics', 'platform', period],
        queryFn: () => adminApiService.getPlatformAnalytics(period),
        refetchInterval: 300000, // Refetch every 5 minutes
    });
};
/**
 * Hook for feature flags management
 */
export const useFeatureFlags = () => {
    const queryClient = useQueryClient();
    const featureFlags = useQuery({
        queryKey: ['admin', 'features', 'flags'],
        queryFn: () => adminApiService.getFeatureFlags(),
    });
    const updateFeatureFlag = useMutation({
        mutationFn: ({ name, enabled }) => adminApiService.updateFeatureFlag(name, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
        },
    });
    return {
        featureFlags,
        updateFeatureFlag,
    };
};
/**
 * Hook for security alerts
 */
export const useSecurityAlerts = () => {
    return useQuery({
        queryKey: ['admin', 'security', 'alerts'],
        queryFn: () => adminApiService.getSecurityAlerts(),
        refetchInterval: 30000,
    });
};
/**
 * Hook for resolving security alerts
 */
export const useResolveSecurityAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alertId) => adminApiService.resolveSecurityAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'security'] });
        },
    });
};
/**
 * Hook for content moderation
 */
export const useContentModeration = () => {
    const queryClient = useQueryClient();
    const moderationQueue = useQuery({
        queryKey: ['admin', 'moderation', 'queue'],
        queryFn: () => adminApiService.getModerationQueue(),
        refetchInterval: 30000,
    });
    const moderateContent = useMutation({
        mutationFn: ({ contentId, action, reason }) => adminApiService.moderateContent(contentId, action, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
        },
    });
    return {
        moderationQueue,
        moderateContent,
    };
};
/**
 * Hook for real-time admin updates
 */
export const useAdminRealTime = () => {
    const queryClient = useQueryClient();
    useEffect(() => {
        // Set up WebSocket connection for real-time updates
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/admin`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'user_registered':
                    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
                    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
                    break;
                case 'match_created':
                    queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] });
                    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
                    break;
                case 'system_alert':
                    queryClient.invalidateQueries({ queryKey: ['admin', 'system', 'health'] });
                    break;
                case 'security_alert':
                    queryClient.invalidateQueries({ queryKey: ['admin', 'security'] });
                    break;
            }
        };
        return () => {
            ws.close();
        };
    }, [queryClient]);
};
/**
 * Hook for admin search functionality
 */
export const useAdminSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const performSearch = useCallback(async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            // Search across users, pets, and matches
            const [usersResult, petsResult, matchesResult] = await Promise.all([
                adminApiService.getUsers({ search: term, limit: 10 }),
                adminApiService.getPets({ search: term, limit: 10 }),
                adminApiService.getMatches({ limit: 10 }),
            ]);
            const results = [
                ...usersResult.users.map(user => ({ type: 'user', data: user })),
                ...petsResult.pets.map(pet => ({ type: 'pet', data: pet })),
                ...matchesResult.matches.map(match => ({ type: 'match', data: match })),
            ];
            setSearchResults(results);
        }
        catch (error) {
            logger.error('Search failed:', { error });
            setSearchResults([]);
        }
        finally {
            setIsSearching(false);
        }
    }, []);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchTerm);
        }, 300); // Debounce search
        return () => { clearTimeout(timeoutId); };
    }, [searchTerm, performSearch]);
    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        performSearch,
    };
};
//# sourceMappingURL=useAdmin.js.map