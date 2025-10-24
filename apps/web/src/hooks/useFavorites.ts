'use client';
/**
 * useFavorites Hook
 *
 * React Query hook for managing user's favorite pets with optimistic updates.
 *
 * Features:
 * - Optimistic UI updates
 * - Automatic cache invalidation
 * - Error rollback
 * - Toast notifications
 */
import http from '@/lib/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
export function useFavorites() {
    const queryClient = useQueryClient();
    // Fetch user's favorites
    const { data: favoritesData, isLoading, error, refetch, } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            const response = await http.get('/api/favorites');
            return response;
        },
        staleTime: 60 * 1000, // 1 minute
    });
    const favorites = favoritesData?.favorites || [];
    const totalCount = favoritesData?.totalCount || 0;
    // Add favorite mutation with optimistic update
    const addFavoriteMutation = useMutation({
        mutationFn: async (petId) => {
            const response = await http.post('/api/favorites', {
                petId,
            });
            return response;
        },
        onMutate: async (petId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            await queryClient.cancelQueries({ queryKey: ['favorite-status', petId] });
            // Snapshot previous value
            const previousFavorites = queryClient.getQueryData([
                'favorites',
            ]);
            // Optimistically update favorites list
            queryClient.setQueryData(['favorites'], (old) => {
                if (!old)
                    return old;
                // Create optimistic favorite entry
                const optimisticFavorite = {
                    _id: `temp-${Date.now()}`,
                    userId: 'current-user',
                    petId: { _id: petId }, // Minimal data for optimistic update
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                return {
                    ...old,
                    favorites: [optimisticFavorite, ...old.favorites],
                    totalCount: old.totalCount + 1,
                };
            });
            // Optimistically update check status
            queryClient.setQueryData(['favorite-status', petId], {
                success: true,
                isFavorited: true,
            });
            return { previousFavorites };
        },
        onError: (error, petId, context) => {
            // Rollback on error
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites'], context.previousFavorites);
            }
            queryClient.setQueryData(['favorite-status', petId], {
                success: true,
                isFavorited: false,
            });
            const message = error instanceof Error ? error.message : 'Failed to add favorite';
            toast.error(message);
        },
        onSuccess: (data, petId) => {
            toast.success(data.message || 'Added to favorites');
            // Invalidate to get real data
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['favorite-status', petId] });
        },
    });
    // Remove favorite mutation with optimistic update
    const removeFavoriteMutation = useMutation({
        mutationFn: async (petId) => {
            const response = await http.delete(`/api/favorites/${petId}`);
            return response;
        },
        onMutate: async (petId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            await queryClient.cancelQueries({ queryKey: ['favorite-status', petId] });
            // Snapshot previous value
            const previousFavorites = queryClient.getQueryData([
                'favorites',
            ]);
            // Optimistically update favorites list
            queryClient.setQueryData(['favorites'], (old) => {
                if (!old)
                    return old;
                return {
                    ...old,
                    favorites: old.favorites.filter((f) => f.petId._id !== petId),
                    totalCount: old.totalCount - 1,
                };
            });
            // Optimistically update check status
            queryClient.setQueryData(['favorite-status', petId], {
                success: true,
                isFavorited: false,
            });
            return { previousFavorites };
        },
        onError: (error, petId, context) => {
            // Rollback on error
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites'], context.previousFavorites);
            }
            queryClient.setQueryData(['favorite-status', petId], {
                success: true,
                isFavorited: true,
            });
            const message = error instanceof Error ? error.message : 'Failed to remove favorite';
            toast.error(message);
        },
        onSuccess: (data, petId) => {
            toast.success(data.message || 'Removed from favorites');
            // Invalidate to sync
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['favorite-status', petId] });
        },
    });
    // Toggle favorite (add or remove)
    const toggleFavorite = (petId, currentlyFavorited) => {
        if (currentlyFavorited) {
            removeFavoriteMutation.mutate(petId);
        }
        else {
            addFavoriteMutation.mutate(petId);
        }
    };
    return {
        favorites,
        totalCount,
        isLoading,
        error,
        refetch,
        addFavorite: addFavoriteMutation.mutate,
        removeFavorite: removeFavoriteMutation.mutate,
        toggleFavorite,
        isAdding: addFavoriteMutation.isPending,
        isRemoving: removeFavoriteMutation.isPending,
    };
}
// Hook to check if a specific pet is favorited
export function useFavoriteStatus(petId) {
    const { data, isLoading } = useQuery({
        queryKey: ['favorite-status', petId],
        queryFn: async () => {
            const response = await http.get(`/api/favorites/check/${petId}`);
            return response;
        },
        enabled: !!petId,
        staleTime: 30 * 1000, // 30 seconds
    });
    return {
        isFavorited: data?.isFavorited ?? false,
        isLoading,
    };
}
//# sourceMappingURL=useFavorites.js.map