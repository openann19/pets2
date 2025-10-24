// Ultra-Premium Breed Search API Service
import { apiService } from './api';
export const breedsAPI = {
    /**
     * Get breeds with advanced filtering
     */
    async getBreeds(filters) {
        return apiService.request('/breeds', {
            params: filters
        });
    },
    /**
     * Get breed details with compatibility information
     */
    async getBreed(name) {
        return apiService.request(`/breeds/${encodeURIComponent(name)}`);
    },
    /**
     * Search breeds with autocomplete
     */
    async searchBreeds(query, options) {
        return apiService.request('/breeds/search/autocomplete', {
            params: {
                q: query,
                ...options
            }
        });
    },
    /**
     * Get personalized breed suggestions
     */
    async getBreedSuggestions(preferences) {
        return apiService.request('/breeds/suggestions', {
            method: 'POST',
            body: JSON.stringify(preferences)
        });
    },
    /**
     * Get breed statistics for analytics
     */
    async getBreedStats() {
        return apiService.request('/breeds/stats');
    },
    /**
     * Advanced pet discovery with comprehensive filtering
     */
    async discoverPetsAdvanced(filters) {
        return apiService.request('/pets/discover/advanced', {
            params: {
                ...filters,
                // Convert arrays to comma-separated strings
                species: Array.isArray(filters.species) ? filters.species.join(',') : filters.species,
                breeds: Array.isArray(filters.breeds) ? filters.breeds.join(',') : filters.breeds,
                sizes: Array.isArray(filters.sizes) ? filters.sizes.join(',') : filters.sizes,
                genders: Array.isArray(filters.genders) ? filters.genders.join(',') : filters.genders,
                temperaments: Array.isArray(filters.temperaments) ? filters.temperaments.join(',') : filters.temperaments,
                energyLevels: Array.isArray(filters.energyLevels) ? filters.energyLevels.join(',') : filters.energyLevels
            }
        });
    },
    /**
     * Advanced pet matching algorithm
     */
    async matchPetsAdvanced(request) {
        return apiService.request('/pets/match/advanced', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    },
    /**
     * Get breed compatibility matrix
     */
    async getBreedCompatibility(breedNames) {
        return apiService.request('/breeds/compatibility', {
            method: 'POST',
        });
    },
    /**
     * Search breeds by characteristics
     */
    async searchByCharacteristics(criteria) {
        return apiService.request('/breeds/by-characteristics', {
            method: 'POST',
            body: JSON.stringify(criteria)
        });
    }
};
// Utility functions for breed filtering
export const breedUtils = {
    /**
     * Generate filter query parameters from UI state
     */
    generateQueryParams(filterState) {
        const params = {};
        // Convert arrays to comma-separated strings
        Object.entries(filterState).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                params[key] = value.join(',');
            }
            else if (typeof value === 'object' && value !== null) {
                // Handle nested objects like ages: { min: 0, max: 5 }
                if (value.min !== undefined || value.max !== undefined) {
                    params[key] = `${value.min || 0}-${value.max || 20}`;
                }
                else {
                    // Handle object like premiumFeatures
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        if (subValue) {
                            params[`${key}.${subKey}`] = subValue;
                        }
                    });
                }
            }
            else if (value !== null && value !== undefined && value !== '') {
                params[key] = value;
            }
        });
        return params;
    },
    /**
     * Parse response data and extract pet information
     */
    parsePetResponse(response) {
        return {
            pets: response.data?.pets || [],
            recommendations: response.data?.recommendations || [],
            pagination: response.data?.pagination || {},
            analytics: response.data?.analytics || {},
            appliedFilters: response.data?.appliedFilters || 0
        };
    },
    /**
     * Calculate breed compatibility score
     */
    calculateCompatibility(petBreed, userPreferences) {
        if (!userPreferences.includes(petBreed.toLowerCase())) {
            return 0.3; // Default compatibility
        }
        // Simple scoring algorithm
        const preferenceIndex = userPreferences.indexOf(petBreed.toLowerCase());
        return Math.max(0.6, 1.0 - (preferenceIndex * 0.1));
    },
    /**
     * Filter breeds by user criteria
     */
    filterBreedsByCriteria(breeds, criteria) {
        return breeds.filter(breed => {
            // Species filter
            if (criteria.species && breed.species !== criteria.species) {
                return false;
            }
            // Size filter
            if (criteria.size && breed.size !== criteria.size) {
                return false;
            }
            // Energy level filter
            if (criteria.energyLevel && breed.energyLevel !== criteria.energyLevel) {
                return false;
            }
            // Apartment friendly filter
            if (criteria.apartmentFriendly !== undefined && breed.apartmentFriendly !== criteria.apartmentFriendly) {
                return false;
            }
            // Family friendly filter
            if (criteria.familyFriendly && breed.familyFriendly !== criteria.familyFriendly) {
                return false;
            }
            return true;
        });
    },
    /**
     * Sort breeds by relevance
     */
    sortBreedsByRelevance(breeds, userPreferences) {
        return breeds.sort((a, b) => {
            const scoreA = breedUtils.calculateCompatibility(a.name, userPreferences);
            const scoreB = breedUtils.calculateCompatibility(b.name, userPreferences);
            // Secondary sort by popularity
            if (Math.abs(scoreA - scoreB) < 0.1) {
                return b.popularity - a.popularity;
            }
            return scoreB - scoreA;
        });
    }
};
//# sourceMappingURL=breeds.js.map