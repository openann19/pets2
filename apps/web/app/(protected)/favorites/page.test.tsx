/**
 * Component Tests - Favorites Page
 * 
 * Tests Favorites page component with loading states, empty state, and interactions.
 */

import type { Favorite } from '@/hooks/useFavorites';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import FavoritesPage from './page';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/useFavorites', () => ({
    useFavorites: jest.fn(),
}));

const mockUseFavorites = require('@/hooks/useFavorites').useFavorites;
const mockUseRouter = useRouter as jest.Mock;

// Test wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
};

describe('FavoritesPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            refresh: jest.fn(),
        });
    });

    describe('Loading State', () => {
        it('should show loading skeletons while fetching', () => {
            mockUseFavorites.mockReturnValue({
                favorites: [],
                totalCount: 0,
                isLoading: true,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Should show loading skeletons
            const skeletons = screen.getAllByTestId('pet-card-skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('should render empty state when no favorites', () => {
            mockUseFavorites.mockReturnValue({
                favorites: [],
                totalCount: 0,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Should show empty state message
            expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
            expect(screen.getByText(/start exploring/i)).toBeInTheDocument();

            // Should show "Browse Pets" button
            const browseButton = screen.getByRole('button', { name: /browse pets/i });
            expect(browseButton).toBeInTheDocument();
        });

        it('should navigate to browse when clicking "Browse Pets"', async () => {
            const user = userEvent.setup();

            mockUseFavorites.mockReturnValue({
                favorites: [],
                totalCount: 0,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            const browseButton = screen.getByRole('button', { name: /browse pets/i });
            await user.click(browseButton);

            expect(mockPush).toHaveBeenCalledWith('/browse');
        });
    });

    describe('Favorites Grid', () => {
        const mockFavorites: Favorite[] = [
            {
                _id: 'fav1',
                petId: {
                    _id: 'pet1',
                    name: 'Buddy',
                    species: 'dog',
                    breed: 'Golden Retriever',
                    age: 3,
                    gender: 'male',
                    description: 'Friendly dog',
                    photos: ['https://example.com/photo1.jpg'],
                    status: 'available',
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
                    gender: 'female',
                    description: 'Playful cat',
                    photos: ['https://example.com/photo2.jpg'],
                    status: 'available',
                },
                createdAt: '2025-01-15T11:00:00Z',
            },
        ];

        it('should render favorites grid with pet cards', () => {
            mockUseFavorites.mockReturnValue({
                favorites: mockFavorites,
                totalCount: 2,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Should show both pet cards
            expect(screen.getByText('Buddy')).toBeInTheDocument();
            expect(screen.getByText('Whiskers')).toBeInTheDocument();

            // Should show breeds
            expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
            expect(screen.getByText(/Siamese/i)).toBeInTheDocument();
        });

        it('should show total count', () => {
            mockUseFavorites.mockReturnValue({
                favorites: mockFavorites,
                totalCount: 2,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            expect(screen.getByText(/2 favorites/i)).toBeInTheDocument();
        });

        it('should remove favorite on button click', async () => {
            const user = userEvent.setup();
            const mockRemoveFavorite = jest.fn();

            mockUseFavorites.mockReturnValue({
                favorites: mockFavorites,
                totalCount: 2,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: mockRemoveFavorite,
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Click remove button on first pet
            const removeButtons = screen.getAllByRole('button', { name: /remove from favorites/i });
            await user.click(removeButtons[0]);

            expect(mockRemoveFavorite).toHaveBeenCalledWith('pet1');
        });

        it('should navigate to pet details on card click', async () => {
            const user = userEvent.setup();

            mockUseFavorites.mockReturnValue({
                favorites: mockFavorites,
                totalCount: 2,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Click on pet card
            const petCard = screen.getByText('Buddy').closest('article');
            expect(petCard).toBeInTheDocument();

            if (petCard) {
                await user.click(petCard);
                expect(mockPush).toHaveBeenCalledWith('/pets/pet1');
            }
        });
    });

    describe('Error State', () => {
        it('should show error message when fetch fails', () => {
            mockUseFavorites.mockReturnValue({
                favorites: [],
                totalCount: 0,
                isLoading: false,
                error: new Error('Network error'),
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            expect(screen.getByText(/failed to load favorites/i)).toBeInTheDocument();
        });

        it('should show retry button on error', async () => {
            const user = userEvent.setup();
            const mockRefetch = jest.fn();

            mockUseFavorites.mockReturnValue({
                favorites: [],
                totalCount: 0,
                isLoading: false,
                error: new Error('Network error'),
                refetch: mockRefetch,
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            const retryButton = screen.getByRole('button', { name: /try again/i });
            await user.click(retryButton);

            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    describe('Animations', () => {
        it('should animate entry of favorites', async () => {
            mockUseFavorites.mockReturnValue({
                favorites: [
                    {
                        _id: 'fav1',
                        petId: {
                            _id: 'pet1',
                            name: 'Buddy',
                            species: 'dog',
                            breed: 'Golden Retriever',
                            age: 3,
                            gender: 'male',
                            description: 'Friendly dog',
                            photos: ['https://example.com/photo1.jpg'],
                            status: 'available',
                        },
                        createdAt: '2025-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            const { container } = render(<FavoritesPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                // Check for Framer Motion animated elements
                const animatedElements = container.querySelectorAll('[data-framer-motion]');
                expect(animatedElements.length).toBeGreaterThan(0);
            });
        });

        it('should animate exit when favorite is removed', async () => {
            const user = userEvent.setup();
            const mockRemoveFavorite = jest.fn();

            mockUseFavorites.mockReturnValue({
                favorites: [
                    {
                        _id: 'fav1',
                        petId: {
                            _id: 'pet1',
                            name: 'Buddy',
                            species: 'dog',
                            breed: 'Golden Retriever',
                            age: 3,
                            gender: 'male',
                            description: 'Friendly dog',
                            photos: ['https://example.com/photo1.jpg'],
                            status: 'available',
                        },
                        createdAt: '2025-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: mockRemoveFavorite,
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            const removeButton = screen.getByRole('button', { name: /remove from favorites/i });
            await user.click(removeButton);

            expect(mockRemoveFavorite).toHaveBeenCalledWith('pet1');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            mockUseFavorites.mockReturnValue({
                favorites: [
                    {
                        _id: 'fav1',
                        petId: {
                            _id: 'pet1',
                            name: 'Buddy',
                            species: 'dog',
                            breed: 'Golden Retriever',
                            age: 3,
                            gender: 'male',
                            description: 'Friendly dog',
                            photos: ['https://example.com/photo1.jpg'],
                            status: 'available',
                        },
                        createdAt: '2025-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: jest.fn(),
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Check for accessible labels
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /my favorites/i })).toBeInTheDocument();
        });

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup();
            const mockRemoveFavorite = jest.fn();

            mockUseFavorites.mockReturnValue({
                favorites: [
                    {
                        _id: 'fav1',
                        petId: {
                            _id: 'pet1',
                            name: 'Buddy',
                            species: 'dog',
                            breed: 'Golden Retriever',
                            age: 3,
                            gender: 'male',
                            description: 'Friendly dog',
                            photos: ['https://example.com/photo1.jpg'],
                            status: 'available',
                        },
                        createdAt: '2025-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                isLoading: false,
                error: null,
                refetch: jest.fn(),
                addFavorite: jest.fn(),
                removeFavorite: mockRemoveFavorite,
                isFavorited: jest.fn(() => true),
                isAdding: false,
                isRemoving: false,
            });

            render(<FavoritesPage />, { wrapper: createWrapper() });

            // Tab to remove button
            await user.tab();
            const removeButton = screen.getByRole('button', { name: /remove from favorites/i });
            expect(removeButton).toHaveFocus();

            // Press Enter to remove
            await user.keyboard('{Enter}');
            expect(mockRemoveFavorite).toHaveBeenCalledWith('pet1');
        });
    });
});
