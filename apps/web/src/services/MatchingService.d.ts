declare const errorHandler: {
    handleApiError: (error: Error, context: unknown, apiInfo: unknown) => void;
    handleError: (error: Error, context: unknown, options: unknown) => void;
};
export interface Pet {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    size: string;
    personalityTags: string[];
    intent: string;
}
export interface PetFilters {
    species?: string;
    minAge?: number;
    maxAge?: number;
    size?: string;
    intent?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
declare const API_BASE_URL: string;
/**
 * Generic fetch wrapper for matching endpoints
 */
declare function fetchMatchingApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
declare class MatchingService {
    /**
     * Calculate compatibility score between two pets
     */
    calculateCompatibilityScore(pet1: Pet, pet2: Pet): number;
    /**
     * Calculate size compatibility
     */
    private calculateSizeCompatibility;
    /**
     * Get pet recommendations
     */
    getRecommendations(userId: string, intent?: string): Promise<Pet[]>;
    /**
     * Get compatibility analysis
     */
    getCompatibilityAnalysis(petId1: string, petId2: string): Promise<{
        score: number;
        reasons: string[];
    } | null>;
    /**
     * Apply filters to pet list
     */
    applyFilters(pets: Pet[], filters: PetFilters): Pet[];
    /**
     * Sort recommendations by compatibility score
     */
    sortRecommendations(recommendations: Pet[]): Pet[];
}
export { API_BASE_URL, errorHandler, fetchMatchingApi, MatchingService };
//# sourceMappingURL=MatchingService.d.ts.map