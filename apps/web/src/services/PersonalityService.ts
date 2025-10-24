import { errorHandler } from './errorHandler';
class PersonalityService {
    /**
     * Generate personality archetype for a pet
     */
    async generatePersonality(data) {
        try {
            const response = await fetch('/api/personality/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({})));
                const errorMessage = errorData.message ?? `Failed to generate personality (${response.status.toString()})`;
                const error = new Error(errorMessage);
                const userId = localStorage.getItem('userId');
                errorHandler.handleApiError(error, {
                    component: 'PersonalityService',
                    action: 'generatePersonality',
                    ...(userId ? { userId } : {}),
                    metadata: { status: response.status, data, errorData },
                }, {
                    endpoint: '/api/personality/generate',
                    method: 'POST',
                    statusCode: response.status,
                });
                throw error;
            }
            const result = (await response.json());
            return result.data;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            const networkError = new Error('Unable to generate personality. Please try again.');
            errorHandler.handleNetworkError(networkError, {
                component: 'PersonalityService',
                action: 'generatePersonality',
                metadata: { data },
            });
            throw networkError;
        }
    }
    /**
     * Get personality compatibility between two pets
     */
    async getCompatibility(data) {
        try {
            const response = await fetch('/api/personality/compatibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({})));
                const errorMessage = errorData.message ?? `Failed to analyze compatibility (${response.status.toString()})`;
                const error = new Error(errorMessage);
                const userId = localStorage.getItem('userId');
                errorHandler.handleApiError(error, {
                    component: 'PersonalityService',
                    action: 'getCompatibility',
                    ...(userId ? { userId } : {}),
                    metadata: { status: response.status, data, errorData },
                }, {
                    endpoint: '/api/personality/compatibility',
                    method: 'POST',
                    statusCode: response.status,
                });
                throw error;
            }
            const result = (await response.json());
            return result.data;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            const networkError = new Error('Unable to analyze compatibility. Please try again.');
            errorHandler.handleNetworkError(networkError, {
                component: 'PersonalityService',
                action: 'getCompatibility',
                metadata: { data },
            });
            throw networkError;
        }
    }
    /**
     * Get all personality archetypes
     */
    async getArchetypes() {
        try {
            const response = await fetch('/api/personality/archetypes', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
                },
            });
            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({})));
                const errorMessage = errorData.message ?? `Failed to load personality types (${response.status.toString()})`;
                const error = new Error(errorMessage);
                const userId = localStorage.getItem('userId');
                errorHandler.handleApiError(error, {
                    component: 'PersonalityService',
                    action: 'getArchetypes',
                    ...(userId ? { userId } : {}),
                    metadata: { status: response.status, errorData },
                }, {
                    endpoint: '/api/personality/archetypes',
                    method: 'GET',
                    statusCode: response.status,
                });
                throw error;
            }
            const result = (await response.json());
            return result.data.archetypes;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            const networkError = new Error('Unable to load personality types. Please try again.');
            errorHandler.handleNetworkError(networkError, {
                component: 'PersonalityService',
                action: 'getArchetypes',
            });
            throw networkError;
        }
    }
    /**
     * Get archetype by key
     */
    async getArchetype(key) {
        try {
            const archetypes = await this.getArchetypes();
            return archetypes[key] ?? null;
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to get archetype'), {
                component: 'PersonalityService',
                action: 'getArchetype',
                metadata: { key },
            }, { showNotification: false });
            return null;
        }
    }
    /**
     * Calculate personality compatibility score
     */
    calculateCompatibilityScore(pet1, pet2) {
        const energyDiff = Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy);
        const independenceDiff = Math.abs(pet1.personalityScore.independence - pet2.personalityScore.independence);
        const sociabilityDiff = Math.abs(pet1.personalityScore.sociability - pet2.personalityScore.sociability);
        const avgDifference = (energyDiff + independenceDiff + sociabilityDiff) / 3;
        return Math.max(0, 100 - avgDifference * 10);
    }
    /**
     * Get compatibility level description
     */
    getCompatibilityLevel(score) {
        if (score >= 80) {
            return {
                level: 'Excellent',
                color: 'text-green-600',
                description: 'These pets should get along very well',
            };
        }
        else if (score >= 60) {
            return {
                level: 'Good',
                color: 'text-blue-600',
                description: 'Good potential match with some considerations',
            };
        }
        else if (score >= 40) {
            return {
                level: 'Moderate',
                color: 'text-yellow-600',
                description: 'Moderate compatibility - proceed with caution',
            };
        }
        else {
            return {
                level: 'Low',
                color: 'text-red-600',
                description: 'Low compatibility - may not be suitable',
            };
        }
    }
    /**
     * Get energy level description
     */
    getEnergyLevelDescription(score) {
        if (score >= 8)
            return 'Very High Energy';
        if (score >= 6)
            return 'High Energy';
        if (score >= 4)
            return 'Medium Energy';
        return 'Low Energy';
    }
    /**
     * Get independence level description
     */
    getIndependenceLevelDescription(score) {
        if (score >= 7)
            return 'Very Independent';
        if (score >= 5)
            return 'Moderately Independent';
        return 'Low Independence';
    }
    /**
     * Get sociability level description
     */
    getSociabilityLevelDescription(score) {
        if (score >= 7)
            return 'Very Social';
        if (score >= 5)
            return 'Moderately Social';
        return 'Low Sociability';
    }
}
export const personalityService = new PersonalityService();
export default personalityService;
//# sourceMappingURL=PersonalityService.js.map