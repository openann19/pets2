/**
 * 💎 PHASE 3: Premium Feature Hooks
 * React hooks for video calls, analytics, and premium tier management
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@pawfectmatch/core';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { videoCallService, VideoCallConfig } from '../lib/video-communication';
import { premiumTierService, PremiumTier, UserSubscription } from '../lib/premium-tier-service';
import { analyticsService, UserAnalytics, MatchAnalytics } from '../lib/analytics-service';
import type { User, Pet } from '@pawfectmatch/core';
/**
 * Hook for video call management
 */

interface UseVideoCallReturn {
    localStream: MediaStream | null;
    isConnected: boolean;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
    error: string | null;
    startCall: (config: VideoCallConfig) => Promise<void>;
    endCall: () => void;
    toggleVideo: () => void;
    toggleAudio: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => Promise<void>;
}

export function useVideoCall(roomId: string | undefined, userId: string | undefined): UseVideoCallReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const startCall = useCallback(async (config: VideoCallConfig) => {
        try {
            const stream = await videoCallService.initializeCall({
                roomId: roomId || '',
                userId: userId || '',
                ...config,
            });
            setLocalStream(stream);
            setIsConnected(true);
            setError(null);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            logger.error('Failed to start call:', { error: errorMessage });
        }
    }, [roomId, userId]);
    
    const endCall = useCallback(() => {
        videoCallService.endCall();
        setLocalStream(null);
        setIsConnected(false);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        setIsScreenSharing(false);
    }, []);
    
    const toggleVideo = useCallback(() => {
        videoCallService.toggleVideo(!isVideoEnabled);
        setIsVideoEnabled(prev => !prev);
    }, [isVideoEnabled]);
    
    const toggleAudio = useCallback(() => {
        videoCallService.toggleAudio(!isAudioEnabled);
        setIsAudioEnabled(prev => !prev);
    }, [isAudioEnabled]);
    
    const startScreenShare = useCallback(async () => {
        try {
            await videoCallService.startScreenShare();
            setIsScreenSharing(true);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        }
    }, []);
    
    const stopScreenShare = useCallback(async () => {
        await videoCallService.stopScreenSharing();
        setIsScreenSharing(false);
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isConnected) {
                videoCallService.endCall();
            }
        };
    }, [isConnected]);
    
    return {
        localStream,
        isConnected,
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        error,
        startCall,
        endCall,
        toggleVideo,
        toggleAudio,
        startScreenShare,
        stopScreenShare,
    };
}
/**
 * Hook for premium tier management
 */

interface UsePremiumTierReturn {
    subscription: UserSubscription | undefined;
    currentTier: string;
    plan: PremiumTier | undefined;
    allPlans: PremiumTier[];
    isLoading: boolean;
    hasFeature: (feature: string) => boolean;
    getLimit: (limit: string) => number;
    upgrade: (newTier: string) => void;
    cancel: () => void;
    isUpgrading: boolean;
    isCancelling: boolean;
}

export function usePremiumTier(userId: string | undefined): UsePremiumTierReturn {
    const queryClient = useQueryClient();
    const { data: subscription, isLoading } = useQuery<UserSubscription>({
        queryKey: ['subscription', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');
            const response = await fetch(`/api/subscriptions/${userId}`);
            if (!response.ok)
                throw new Error('Failed to fetch subscription');
            return response.json();
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    const upgradeMutation = useMutation<UserSubscription, Error, string>({
        mutationFn: async (newTier: string) => {
            if (!userId) throw new Error('User ID is required');
            const response = await fetch(`/api/subscriptions/${userId}/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: newTier }),
            });
            if (!response.ok)
                throw new Error('Upgrade failed');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
        },
    });
    
    const cancelMutation = useMutation<UserSubscription, Error, void>({
        mutationFn: async () => {
            if (!userId) throw new Error('User ID is required');
            const response = await fetch(`/api/subscriptions/${userId}/cancel`, {
                method: 'POST',
            });
            if (!response.ok)
                throw new Error('Cancellation failed');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
        },
    });
    
    const currentTier = subscription?.tier || 'free';
    const plan = premiumTierService.getPlan(currentTier);
    const allPlans = premiumTierService.getAllPlans();
    
    const hasFeature = useCallback((feature: string) => {
        return premiumTierService.hasFeatureAccess(currentTier, feature);
    }, [currentTier]);
    
    const getLimit = useCallback((limit: string) => {
        return premiumTierService.getFeatureLimit(currentTier, limit);
    }, [currentTier]);
    
    return {
        subscription,
        currentTier,
        plan,
        allPlans,
        isLoading,
        hasFeature,
        getLimit,
        upgrade: upgradeMutation.mutate,
        cancel: cancelMutation.mutate,
        isUpgrading: upgradeMutation.isPending,
        isCancelling: cancelMutation.isPending,
    };
}
/**
 * Hook for user analytics
 */

interface UseUserAnalyticsReturn {
    analytics: UserAnalytics | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useUserAnalytics(userId: string | undefined, period: string = 'week'): UseUserAnalyticsReturn {
    const { data: analytics, isLoading, error, refetch } = useQuery<UserAnalytics, Error>({
        queryKey: ['analytics', userId, period],
        queryFn: () => {
            if (!userId) throw new Error('User ID is required');
            return analyticsService.getUserAnalytics(userId, period);
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
    
    return {
        analytics,
        isLoading,
        error: error || null,
        refetch,
    };
}

/**
 * Hook for match analytics
 */

interface UseMatchAnalyticsReturn {
    matchAnalytics: MatchAnalytics | undefined;
    isLoading: boolean;
    error: Error | null;
}

export function useMatchAnalytics(userId: string | undefined): UseMatchAnalyticsReturn {
    const { data, isLoading, error } = useQuery<MatchAnalytics, Error>({
        queryKey: ['matchAnalytics', userId],
        queryFn: () => {
            if (!userId) throw new Error('User ID is required');
            return analyticsService.getMatchAnalytics(userId);
        },
        enabled: !!userId,
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
    
    return {
        matchAnalytics: data,
        isLoading,
        error: error || null,
    };
}

/**
 * Hook for event tracking
 */

interface EventMetadata {
    [key: string]: string | number | boolean | null | undefined;
}

interface UseEventTrackingReturn {
    trackEvent: (eventType: string, metadata: EventMetadata) => Promise<void>;
}

export function useEventTracking(userId: string | undefined): UseEventTrackingReturn {
    const trackEvent = useCallback(async (eventType: string, metadata: EventMetadata) => {
        if (!userId) return;
        await analyticsService.trackEvent({
            userId,
            eventType,
            metadata,
        });
    }, [userId]);
    
    return { trackEvent };
}
/**
 * Hook for feature gating based on premium tier
 */

interface UseFeatureGateReturn {
    hasAccess: boolean;
    checkAccess: () => boolean;
    showUpgradeModal: boolean;
    closeModal: () => void;
    currentTier: string;
    plan: PremiumTier | undefined;
}

export function useFeatureGate(userId: string | undefined, requiredFeature: string): UseFeatureGateReturn {
    const { hasFeature, currentTier, plan } = usePremiumTier(userId);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    const checkAccess = useCallback(() => {
        const hasAccess = hasFeature(requiredFeature);
        if (!hasAccess) {
            setShowUpgradeModal(true);
        }
        return hasAccess;
    }, [hasFeature, requiredFeature]);
    
    const closeModal = useCallback(() => {
        setShowUpgradeModal(false);
    }, []);
    
    return {
        hasAccess: hasFeature(requiredFeature),
        checkAccess,
        showUpgradeModal,
        closeModal,
        currentTier,
        plan,
    };
}

/**
 * Hook for real-time performance monitoring
 */

interface PerformanceMetrics {
    responseTime: number;
    activeUsers: number;
    serverLoad: number;
    uptime: number;
    errorRate: number;
}

interface UsePerformanceMonitoringReturn {
    metrics: PerformanceMetrics;
}

export function usePerformanceMonitoring(): UsePerformanceMonitoringReturn {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        responseTime: 0,
        activeUsers: 0,
        serverLoad: 0,
        uptime: 100,
        errorRate: 0,
    });
    
    useEffect(() => {
        const fetchMetrics = async () => {
            const data = await analyticsService.getPerformanceMetrics();
            setMetrics(data);
        };
        
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
    }, []);
    
    return { metrics };
}

/**
 * Hook for usage tracking and limits
 */

interface UsageData {
    dailySwipes: number;
    videoCallMinutes: number;
    photoUploads: number;
}

interface LimitCheckResult {
    reached: boolean;
    remaining: number;
    limit: number;
}

interface UseUsageLimitsReturn {
    usage: UsageData;
    checkLimit: (limitType: string, currentValue: number) => LimitCheckResult;
    incrementUsage: (type: keyof UsageData) => void;
    currentTier: string;
}

export function useUsageLimits(userId: string | undefined): UseUsageLimitsReturn {
    const { currentTier, getLimit } = usePremiumTier(userId);
    const [usage, setUsage] = useState<UsageData>({
        dailySwipes: 0,
        videoCallMinutes: 0,
        photoUploads: 0,
    });
    
    const checkLimit = useCallback((limitType: string, currentValue: number): LimitCheckResult => {
        const limit = getLimit(limitType);
        if (limit === -1)
            return { reached: false, remaining: Infinity, limit };
        const remaining = limit - currentValue;
        return {
            reached: remaining <= 0,
            remaining: Math.max(0, remaining),
            limit,
        };
    }, [getLimit]);
    
    const incrementUsage = useCallback((type: keyof UsageData) => {
        setUsage(prev => ({
            ...prev,
            [type]: prev[type] + 1,
        }));
    }, []);
    
    return {
        usage,
        checkLimit,
        incrementUsage,
        currentTier,
    };
}