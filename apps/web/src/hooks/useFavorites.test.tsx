/**
 * Unit Tests - useFavorites Hook
 * 
 * Tests React Query hook with optimistic updates, error handling, and cache invalidation.
 */

import { useFavorites } from '@/hooks/useFavorites';
import { http } from '@/lib/http';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/http');
jest.mock('sonner');

const mockHttp = http as jest.Mocked<typeof http>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Test wrapper with QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useFavorites Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockToast.success = jest.fn();
        mockToast.error = jest.fn();
    });

    describe('Fetching Favorites', () => {
        it('should fetch favorites on mount', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
                {
                    _id: 'fav2',
                    petId: {
                        _id: 'pet2',
                        name: 'Whiskers',
                        species: 'cat',
                        breed: 'Siamese',
                        age: 2,
                        photos: ['photo2.jpg'],
                    },
                    createdAt: '2025-01-15T11:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 2,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            // Initially loading
            expect(result.current.isLoading).toBe(true);

            // Wait for data
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.favorites).toEqual(mockFavorites);
            expect(mockHttp.get).toHaveBeenCalledWith('/api/favorites?page=1&limit=50');
        });

        it('should handle fetch errors', async () => {
            mockHttp.get.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.favorites).toEqual([]);
        });

        it('should return empty array when no favorites', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.favorites).toEqual([]);
        });
    });

    describe('Adding Favorites', () => {
        it('should add favorite with optimistic update', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            mockHttp.post.mockResolvedValue({
                success: true,
                message: 'Pet added to favorites',
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            // Wait for initial data
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Add favorite
            act(() => {
                result.current.addFavorite('pet2');
            });

            await waitFor(() => {
                expect(result.current.isAddingFavorite).toBe(false);
            });

            expect(mockHttp.post).toHaveBeenCalledWith('/api/favorites', {
                petId: 'pet2',
            });
            expect(mockToast.success).toHaveBeenCalledWith(
                'Added to favorites',
                expect.any(Object)
            );
        });

        it('should rollback on add error', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            mockHttp.post.mockRejectedValue({
                response: {
                    data: { message: 'Pet already favorited' },
                },
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Add favorite (will error)
            act(() => {
                result.current.addFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isAddingFavorite).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalled();
        });
    });
});
/**
 * Unit Tests - useFavorites Hook
 * 
 * Tests React Query hook with optimistic updates, error handling, and cache invalidation.
 */


// Mock dependencies
jest.mock('@/lib/http');
jest.mock('sonner');

const mockHttp = http as jest.Mocked<typeof http>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Test wrapper with QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient} > {children} </QueryClientProvider>
    );
};

describe('useFavorites Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockToast.success = jest.fn();
        mockToast.error = jest.fn();
    });

    describe('Fetching Favorites', () => {
        it('should fetch favorites on mount', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
                {
                    _id: 'fav2',
                    petId: {
                        _id: 'pet2',
                        name: 'Whiskers',
                        species: 'cat',
                        breed: 'Siamese',
                        age: 2,
                        photos: ['photo2.jpg'],
                    },
                    createdAt: '2025-01-15T11:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 2,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            // Initially loading
            expect(result.current.isLoading).toBe(true);

            // Wait for data
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.favorites).toEqual(mockFavorites);
            expect(mockHttp.get).toHaveBeenCalledWith('/api/favorites?page=1&limit=50');
        });

        it('should handle fetch errors', async () => {
            mockHttp.get.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.favorites).toEqual([]);
        });

        it('should return empty array when no favorites', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.favorites).toEqual([]);
        });
    });

    describe('Adding Favorites', () => {
        it('should add favorite with optimistic update', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            mockHttp.post.mockResolvedValue({
                success: true,
                message: 'Pet added to favorites',
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            // Wait for initial data
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Add favorite
            act(() => {
                result.current.addFavorite('pet2');
            });

            await waitFor(() => {
                expect(result.current.isAddingFavorite).toBe(false);
            });

            expect(mockHttp.post).toHaveBeenCalledWith('/api/favorites', {
                petId: 'pet2',
            });
            expect(mockToast.success).toHaveBeenCalledWith(
                'Added to favorites',
                expect.any(Object)
            );
        });

        it('should rollback on add error', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            mockHttp.post.mockRejectedValue({
                response: {
                    data: { message: 'Pet already favorited' },
                },
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Attempt to add favorite
            act(() => {
                result.current.addFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isAddingFavorite).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith(
                'Pet already favorited',
                expect.any(Object)
            );
            expect(result.current.favorites).toEqual([]); // Rollback
        });

        it('should handle generic add errors', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            mockHttp.post.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isAddingFavorite).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith(
                'Failed to add to favorites',
                expect.any(Object)
            );
        });
    });

    describe('Removing Favorites', () => {
        it('should remove favorite with optimistic update', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
                {
                    _id: 'fav2',
                    petId: {
                        _id: 'pet2',
                        name: 'Whiskers',
                        species: 'cat',
                        breed: 'Siamese',
                        age: 2,
                        photos: ['photo2.jpg'],
                    },
                    createdAt: '2025-01-15T11:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 2,
            });

            mockHttp.delete.mockResolvedValue({
                success: true,
                message: 'Pet removed from favorites',
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Remove favorite
            act(() => {
                result.current.removeFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isRemovingFavorite).toBe(false);
            });

            expect(mockHttp.delete).toHaveBeenCalledWith('/api/favorites/pet1');
            expect(mockToast.success).toHaveBeenCalledWith(
                'Removed from favorites',
                expect.any(Object)
            );
        });

        it('should rollback on remove error', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            mockHttp.delete.mockRejectedValue({
                response: {
                    data: { message: 'Favorite not found' },
                },
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.removeFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isRemovingFavorite).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith(
                'Favorite not found',
                expect.any(Object)
            );
            expect(result.current.favorites).toEqual(mockFavorites); // Rollback
        });

        it('should handle generic remove errors', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            mockHttp.delete.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.removeFavorite('pet1');
            });

            await waitFor(() => {
                expect(result.current.isRemovingFavorite).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith(
                'Failed to remove from favorites',
                expect.any(Object)
            );
        });
    });

    describe('isFavorited Helper', () => {
        it('should return true if pet is favorited', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isFavorited('pet1')).toBe(true);
        });

        it('should return false if pet is not favorited', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isFavorited('pet2')).toBe(false);
        });
    });

    describe('Cache Invalidation', () => {
        it('should invalidate cache on successful add', async () => {
            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: [],
                totalFavorites: 0,
            });

            mockHttp.post.mockResolvedValue({
                success: true,
                message: 'Pet added to favorites',
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Mock should be called twice: initial fetch + refetch after add
            mockHttp.get.mockClear();

            act(() => {
                result.current.addFavorite('pet1');
            });

            await waitFor(() => {
                expect(mockHttp.get).toHaveBeenCalled();
            });
        });

        it('should invalidate cache on successful remove', async () => {
            const mockFavorites = [
                {
                    _id: 'fav1',
                    petId: {
                        _id: 'pet1',
                        name: 'Buddy',
                        species: 'dog',
                        breed: 'Golden Retriever',
                        age: 3,
                        photos: ['photo1.jpg'],
                    },
                    createdAt: '2025-01-15T10:00:00Z',
                },
            ];

            mockHttp.get.mockResolvedValue({
                success: true,
                favorites: mockFavorites,
                totalFavorites: 1,
            });

            mockHttp.delete.mockResolvedValue({
                success: true,
                message: 'Pet removed from favorites',
            });

            const { result } = renderHook(() => useFavorites(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            mockHttp.get.mockClear();

            act(() => {
                result.current.removeFavorite('pet1');
            });

            await waitFor(() => {
                expect(mockHttp.get).toHaveBeenCalled();
            });
        });
    });
});
