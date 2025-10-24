interface Pet {
    _id: string;
    name: string;
    breed: string;
    age: number;
    photos: string[];
    location?: {
        city?: string;
        state?: string;
    };
    species: string;
    gender: string;
    description?: string;
}
interface Favorite {
    _id: string;
    userId: string;
    petId: Pet;
    createdAt: string;
    updatedAt: string;
}
interface FavoritesResponse {
    success: boolean;
    favorites: Favorite[];
    totalCount: number;
    hasMore: boolean;
}
interface AddFavoriteResponse {
    success: boolean;
    favorite: Favorite;
    message: string;
}
interface RemoveFavoriteResponse {
    success: boolean;
    message: string;
}
export declare function useFavorites(): {
    favorites: Favorite[];
    totalCount: number;
    isLoading: boolean;
    error: Error | null;
    refetch: (options?: import("@tanstack/react-query").RefetchOptions) => Promise<import("@tanstack/react-query").QueryObserverResult<FavoritesResponse, Error>>;
    addFavorite: import("@tanstack/react-query").UseMutateFunction<AddFavoriteResponse, Error, string, {
        previousFavorites: FavoritesResponse | undefined;
    }>;
    removeFavorite: import("@tanstack/react-query").UseMutateFunction<RemoveFavoriteResponse, Error, string, {
        previousFavorites: FavoritesResponse | undefined;
    }>;
    toggleFavorite: (petId: string, currentlyFavorited: boolean) => void;
    isAdding: boolean;
    isRemoving: boolean;
};
export declare function useFavoriteStatus(petId: string): {
    isFavorited: boolean;
    isLoading: boolean;
};
export {};
//# sourceMappingURL=useFavorites.d.ts.map