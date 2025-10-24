import { Breed, BreedSuggestionRequest } from '../services/breeds';
interface UltraFilterState {
    species: string[];
    breeds: string[];
    ages: {
        min: number;
        max: number;
    };
    sizes: string[];
    genders: string[];
    colors: string[];
    temperaments: string[];
    energyLevels: string[];
    trainability: string[];
    familyFriendly: string[];
    petFriendly: string[];
    strangerFriendly: string[];
    apartmentFriendly: boolean | null;
    houseSafe: boolean | null;
    yardRequired: boolean | null;
    groomingNeeds: string[];
    exerciseNeeds: string[];
    barkiness: string[];
    healthStatus: string[];
    vaccinationStatus: string[];
    availability: string[];
    locationRadius: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    resultLimit: number;
    premiumFeatures: {
        trending: boolean;
        verified: boolean;
        featured: boolean;
        aiRecommended: boolean;
    };
    searchQuery: string;
}
interface UltraFilterResult {
    pets: unknown[];
    recommendations?: unknown[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
    analytics?: unknown;
    appliedFilters: number;
    performanceMetrics?: {
        queryTime?: number;
        resultsCount?: number;
        scoredResults?: number;
    };
}
export declare const useUltraBreedFiltering: () => {
    filters: UltraFilterState;
    results: UltraFilterResult | null;
    isLoading: boolean;
    error: string | null;
    breedSuggestions: Breed[];
    isLoadingSuggestions: boolean;
    filterCount: number;
    hasActiveFilters: boolean;
    updateFilter: <K extends keyof UltraFilterState>(key: K, value: UltraFilterState[K]) => void;
    toggleArrayFilter: <K extends keyof UltraFilterState>(key: K, value: unknown) => void;
    resetFilters: () => void;
    discoverPets: (customFilters?: Partial<UltraFilterState>) => Promise<void>;
    matchPetsAdvanced: (userProfile: unknown) => Promise<void>;
    searchBreeds: (query: string, species?: string) => Promise<void>;
    getPersonalizedSuggestions: (preferences: BreedSuggestionRequest) => Promise<void>;
    getPopularBreeds: (species?: string) => Promise<any>;
    getBreedStats: () => Promise<any>;
    totalResults: number;
    currentPage: number;
    hasMore: boolean;
};
export {};
//# sourceMappingURL=useUltraBreedFiltering.d.ts.map