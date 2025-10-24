export interface Breed {
    _id: string;
    name: string;
    species: string;
    group?: string;
    size: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
    weightRange?: {
        min: number;
        max: number;
    };
    lifeSpan?: {
        min: number;
        max: number;
    };
    temperament: string[];
    energyLevel: 'low' | 'moderate' | 'high' | 'very-high';
    exerciseNeeds: 'minimal' | 'moderate' | 'high' | 'extensive';
    groomingNeeds: 'minimal' | 'moderate' | 'high' | 'extensive';
    familyFriendly: 'excellent' | 'good' | 'fair' | 'poor';
    kidFriendly: 'excellent' | 'good' | 'fair' | 'poor';
    petFriendly: 'excellent' | 'good' | 'fair' | 'poor';
    strangerFriendly: 'excellent' | 'good' | 'fair' | 'poor';
    apartmentFriendly: boolean;
    yardRequired?: boolean;
    trainability?: 'easy' | 'moderate' | 'difficult' | 'stubborn';
    barkingTendency?: 'quiet' | 'moderate' | 'high' | 'very-high';
    healthConcerns?: string[];
    popularity: number;
    availablePets?: number;
    isVerified?: boolean;
    compatibility: {
        kids?: string;
        pets?: string;
        strangers?: string;
        exercise?: string;
    };
}
export interface BreedSuggestionRequest {
    species?: string;
    livingSpace?: 'apartment' | 'house' | 'farm' | 'any';
    familySize?: 'single' | 'couple' | 'with_children' | 'large_family';
    energyPreference?: 'low' | 'moderate' | 'high' | 'very_high';
    groomingTime?: 'minimal' | 'moderate' | 'extensive';
    exerciseLevel?: 'minimal' | 'moderate' | 'high' | 'extensive';
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}
export interface BreedSearchFilters {
    species?: string | string[];
    size?: string | string[];
    energyLevel?: string | string[];
    exerciseNeeds?: string | string[];
    familyFriendly?: string | string[];
    apartmentFriendly?: boolean;
    temperament?: string | string[];
    groomingNeeds?: string | string[];
}
export declare const breedsAPI: {
    /**
     * Get breeds with advanced filtering
     */
    getBreeds(filters?: BreedSearchFilters & {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    /**
     * Get breed details with compatibility information
     */
    getBreed(name: string): Promise<any>;
    /**
     * Search breeds with autocomplete
     */
    searchBreeds(query: string, options?: {
        species?: string;
        limit?: number;
    }): Promise<any>;
    /**
     * Get personalized breed suggestions
     */
    getBreedSuggestions(preferences: BreedSuggestionRequest): Promise<any>;
    /**
     * Get breed statistics for analytics
     */
    getBreedStats(): Promise<any>;
    /**
     * Advanced pet discovery with comprehensive filtering
     */
    discoverPetsAdvanced(filters: {
        species?: string | string[];
        breeds?: string | string[];
        ages?: {
            min: number;
            max: number;
        };
        sizes?: string | string[];
        genders?: string | string[];
        colors?: string | string[];
        temperaments?: string | string[];
        energyLevels?: string | string[];
        trainability?: string | string[];
        barkiness?: string | string[];
        familyFriendly?: string | string[];
        petFriendly?: string | string[];
        strangerFriendly?: string | string[];
        apartmentFriendly?: boolean;
        houseSafe?: boolean;
        yardRequired?: boolean;
        healthStatus?: string | string[];
        vaccinationStatus?: string | string[];
        groomingNeeds?: string | string[];
        exerciseNeeds?: string | string[];
        availability?: string | string[];
        locationRadius?: number;
        nearMeFirst?: boolean;
        sortBy?: "relevance" | "newest" | "popularity" | "distance" | "breed_match" | "age" | "featured";
        sortDirection?: "asc" | "desc";
        resultLimit?: number;
        premiumFeatures?: {
            trending?: boolean;
            verified?: boolean;
            featured?: boolean;
            aiRecommended?: boolean;
        };
        searchQuery?: string;
        boostFeature?: boolean;
        page?: number;
        limit?: number;
    }): Promise<any>;
    /**
     * Advanced pet matching algorithm
     */
    matchPetsAdvanced(request: {
        userPreferences?: {
            breedPreference?: string[];
            temperamentPreference?: string[];
            sizePreference?: string[];
            ageRange?: {
                min: number;
                max: number;
            };
            location?: {
                coordinates: [number, number];
            };
        };
        lifestyleFactors?: {
            livingSpace?: "apartment" | "house" | "farm";
            experienceLevel?: "beginner" | "intermediate" | "advanced";
            timeCommitment?: "limited" | "moderate" | "extensive";
            desiredEnergyLevel?: "low" | "moderate" | "high" | "very_high";
            familySize?: "single" | "couple" | "family_with_kids";
            otherPets?: boolean;
        };
        matchingCriteria?: {
            importanceScore?: "breedMatch" | "temperamentMatch" | "lifestyleMatch" | "balanced";
            maxDistance?: number;
            agePreference?: "young" | "adult" | "senior" | "any";
            trainingLevel?: "none_required" | "some_training" | "advanced_training";
        };
        personalityAssessment?: {
            experienceLevel?: "beginner" | "intermediate" | "advanced";
            patienceLevel?: "low" | "moderate" | "high";
            activityLevel?: "sedentary" | "moderate" | "active" | "very_active";
        };
    }): Promise<any>;
    /**
     * Get breed compatibility matrix
     */
    getBreedCompatibility(breedNames: string[]): Promise<any>;
    /**
     * Search breeds by characteristics
     */
    searchByCharacteristics(criteria: {
        energyLevel?: string;
        apartmentFriendly?: boolean;
        familyFriendly?: string;
        exerciseNeeds?: string;
        groomingNeeds?: string;
        trainability?: string;
        size?: string;
        species?: string;
    }): Promise<any>;
};
export declare const breedUtils: {
    /**
     * Generate filter query parameters from UI state
     */
    generateQueryParams(filterState: unknown): Record<string, any>;
    /**
     * Parse response data and extract pet information
     */
    parsePetResponse(response: unknown): {
        pets: any;
        recommendations: any;
        pagination: any;
        analytics: any;
        appliedFilters: any;
    };
    /**
     * Calculate breed compatibility score
     */
    calculateCompatibility(petBreed: string, userPreferences: string[]): number;
    /**
     * Filter breeds by user criteria
     */
    filterBreedsByCriteria(breeds: Breed[], criteria: BreedSearchFilters): Breed[];
    /**
     * Sort breeds by relevance
     */
    sortBreedsByRelevance(breeds: Breed[], userPreferences: string[]): Breed[];
};
//# sourceMappingURL=breeds.d.ts.map