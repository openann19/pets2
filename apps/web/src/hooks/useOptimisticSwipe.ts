'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { petsAPI } from '@/services/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'react-hot-toast';
import { ApiResponse, Pet, SwipeFilters } from '@/types/common';
export function useOptimisticSwipe(options = {}) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { onSuccess, onError, showToast = true } = options;
    const swipeMutation = useMutation({
        mutationFn: async ({ petId, action }) => {
            switch (action) {
                case 'like':
                    return petsAPI.likePet(petId);
                case 'pass':
                    return petsAPI.passPet(petId);
                case 'superlike':
                    return petsAPI.superLikePet(petId);
                default:
                    throw new Error(`Unknown swipe action: ${action}`);
            }
        },
        onMutate: async ({ petId, action }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['swipe-queue'] });
            // Snapshot the previous value
            const previousPets = queryClient.getQueryData(['swipe-queue']);
            // Optimistically update the cache
            queryClient.setQueryData(['swipe-queue'], (old) => {
                if (!old?.data)
                    return old;
                // Remove the swiped pet from the queue
                const updatedPets = old.data.filter((pet) => pet._id !== petId);
                return {
                    ...old,
                    data: updatedPets
                };
            });
            // Show optimistic feedback
            if (showToast) {
                const messages = {
                    like: '❤️ Liked!',
                    pass: '👋 Passed',
                    superlike: '⭐ Super liked!'
                };
                toast.success(messages[action], { duration: 1000 });
            }
            // Return a context object with the snapshotted value
            return { previousPets };
        },
        onError: (error, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(['swipe-queue'], context?.previousPets);
            if (showToast) {
                toast.error('Swipe failed. Please try again.');
            }
            onError?.(error);
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch swipe queue
            queryClient.invalidateQueries({ queryKey: ['swipe-queue'] });
            // If it's a match, invalidate matches query
            if (data.data?.isMatch) {
                queryClient.invalidateQueries({ queryKey: ['matches'] });
            }
            onSuccess?.(data);
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ['swipe-queue'] });
        },
    });
    const swipe = useCallback((petId, action) => {
        if (!user) {
            toast.error('Please log in to swipe');
            return;
        }
        return swipeMutation.mutate({ petId, action });
    }, [swipeMutation, user]);
    return {
        swipe,
        isLoading: swipeMutation.isPending,
        error: swipeMutation.error,
        isSuccess: swipeMutation.isSuccess,
    };
}
// Hook for swipe queue with React Query
export function useSwipeQueue(filters) {
    const queryClient = useQueryClient();
    return {
        queryKey: ['swipe-queue', filters],
        queryFn: () => petsAPI.getSwipeablePets(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    };
}
// Hook for matches with React Query
export function useMatches() {
    return {
        queryKey: ['matches'],
        queryFn: () => petsAPI.getMatches(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    };
}
//# sourceMappingURL=useOptimisticSwipe.js.map