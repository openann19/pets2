/**
 * Matching Service
 * Handles pet matching logic and compatibility calculations
 */
import { logger } from '@pawfectmatch/core';
// Temporary fallback until core package is properly built
const errorHandler = {
    handleApiError: (error, context, apiInfo) => {
        logger.error('API Error:', { error: error.message, context, apiInfo });
    },
    handleError: (error, context, options) => {
        logger.error('Error:', { error: error.message, context, options });
    }
};
// Base API URL from environment variable
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';
/**
 * Generic fetch wrapper for matching endpoints
 */
async function fetchMatchingApi(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token && token.trim().length > 0) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({ message: undefined })));
        throw new Error(errorData.message ?? `API error: ${response.status.toString()}`);
    }
    return (await response.json());
}
class MatchingService {
    /**
     * Calculate compatibility score between two pets
     */
    calculateCompatibilityScore(pet1, pet2) {
        let score = 0;
        // Species match (30 points)
        if (pet1.species === pet2.species) {
            score += 30;
        }
        // Intent match (25 points)
        if (pet1.intent === pet2.intent || pet1.intent === 'all' || pet2.intent === 'all') {
            score += 25;
        }
        // Size compatibility (15 points)
        const sizeCompatibility = this.calculateSizeCompatibility(pet1.size, pet2.size);
        score += sizeCompatibility * 15;
        // Age compatibility (15 points)
        const ageDiff = Math.abs(pet1.age - pet2.age);
        const ageScore = Math.max(0, 1 - ageDiff / 10);
        score += ageScore * 15;
        // Personality tags overlap (15 points)
        const commonTags = pet1.personalityTags.filter((tag) => pet2.personalityTags.includes(tag));
        const personalityScore = commonTags.length / Math.max(pet1.personalityTags.length, pet2.personalityTags.length, 1);
        score += personalityScore * 15;
        return Math.round(Math.min(100, Math.max(0, score)));
    }
    /**
     * Calculate size compatibility
     */
    calculateSizeCompatibility(size1, size2) {
        const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
        const index1 = sizeOrder.indexOf(size1);
        const index2 = sizeOrder.indexOf(size2);
        if (index1 === -1 || index2 === -1)
            return 0.5;
        const diff = Math.abs(index1 - index2);
        return Math.max(0, 1 - diff * 0.25);
    }
    /**
     * Get pet recommendations
     */
    async getRecommendations(userId, intent) {
        try {
            const response = await fetchMatchingApi(`/matching/recommendations?userId=${encodeURIComponent(userId)}`);
            if (!response.success || !response.data) {
                errorHandler.handleError(new Error('Failed to fetch recommendations'), { response, userId }, {});
                return [];
            }
            let recommendations = response.data;
            if (intent && intent.trim().length > 0) {
                recommendations = recommendations.filter((pet) => pet.intent === intent || pet.intent === 'all');
            }
            return recommendations;
        }
        catch (error) {
            // Cast error to Error type for strict typing
            const typedError = error instanceof Error ? error : new Error(String(error));
            errorHandler.handleError(typedError, { error, userId }, {});
            return [];
        }
    }
    /**
     * Get compatibility analysis
     */
    async getCompatibilityAnalysis(petId1, petId2) {
        try {
            const response = await fetchMatchingApi('/matching/compatibility', {
                method: 'POST',
                body: JSON.stringify({ petId1, petId2 }),
            });
            if (!response.success || !response.data) {
                logger.error('Failed to fetch compatibility analysis', { response, petId1, petId2 });
                return null;
            }
            return response.data;
        }
        catch (error) {
            logger.error('Failed to get compatibility analysis', { error, petId1, petId2 });
            return null;
        }
    }
    /**
     * Apply filters to pet list
     */
    applyFilters(pets, filters) {
        return pets.filter((pet) => {
            if (filters.species && filters.species.length > 0 && pet.species !== filters.species)
                return false;
            if (typeof pet.age !== 'number')
                return false;
            if (filters.minAge !== undefined && pet.age < filters.minAge)
                return false;
            if (filters.maxAge !== undefined && pet.age > filters.maxAge)
                return false;
            if (filters.size && filters.size.length > 0 && pet.size !== filters.size)
                return false;
            if (filters.intent &&
                filters.intent.length > 0 &&
                pet.intent !== filters.intent &&
                pet.intent !== 'all')
                return false;
            return true;
        });
    }
    /**
     * Sort recommendations by compatibility score
     */
    sortRecommendations(recommendations) {
        return [...recommendations].sort((a, b) => {
            // Sort by name if no compatibility score available
            return a.name.localeCompare(b.name);
        });
    }
}
export { API_BASE_URL, errorHandler, fetchMatchingApi, MatchingService };
//# sourceMappingURL=MatchingService.js.map