/**
 * Matching Service for PawfectMatch Mobile App
 * Handles pet matching logic, compatibility calculations, and recommendations
 */
import { logger } from '@pawfectmatch/core';
import { api } from './api';

// Local interfaces for this service
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  personalityTags: string[];
  intent: string;
  photos: string[];
  ownerId: string;
}

export interface PetFilters {
  species?: string;
  minAge?: number;
  maxAge?: number;
  size?: string;
  intent?: string;
  distance?: number;
  breed?: string;
}

export interface MatchResult {
  pet: Pet;
  compatibilityScore: number;
  reasons: string[];
  distance?: number;
}

export interface SwipeAction {
  petId: string;
  action: 'like' | 'pass' | 'superlike';
  timestamp: number;
}

class MatchingService {

  /**
   * Get pet recommendations for the current user
   */
  async getRecommendations(filters?: PetFilters, limit: number = 20): Promise<MatchResult[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.species !== undefined && filters.species !== '') queryParams.set('species', filters.species);
      if (filters?.minAge !== undefined) queryParams.set('minAge', filters.minAge.toString());
      if (filters?.maxAge !== undefined) queryParams.set('maxAge', filters.maxAge.toString());
      if (filters?.size !== undefined && filters.size !== '') queryParams.set('size', filters.size);
      if (filters?.intent !== undefined && filters.intent !== '') queryParams.set('intent', filters.intent);
      if (filters?.distance !== undefined) queryParams.set('distance', filters.distance.toString());
      if (filters?.breed !== undefined && filters.breed !== '') queryParams.set('breed', filters.breed);
      queryParams.set('limit', limit.toString());

      const endpoint = `/matches/recommendations?${queryParams.toString()}`;

      const response = await api.request<MatchResult[]>(endpoint);

      logger.info('Fetched pet recommendations', {
        count: response.length,
        filters: filters !== undefined ? Object.keys(filters).length : 0
      });

      return response;
    } catch (error) {
      logger.error('Failed to get recommendations', { error, filters });
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Calculate compatibility score between two pets
   */
  calculateCompatibilityScore(pet1: Pet, pet2: Pet): number {
    let score = 0;
    let reasons: string[] = [];

    // Species preference (30 points)
    if (pet1.species === pet2.species) {
      score += 30;
      reasons.push('Same species preference');
    }

    // Intent compatibility (25 points)
    if (pet1.intent === pet2.intent || pet1.intent === 'all' || pet2.intent === 'all') {
      score += 25;
      reasons.push('Compatible intentions');
    }

    // Size compatibility (15 points)
    const sizeCompatibility = this.calculateSizeCompatibility(pet1.size, pet2.size);
    score += sizeCompatibility * 15;
    if (sizeCompatibility > 0.7) {
      reasons.push('Size compatible');
    }

    // Age compatibility (15 points)
    const ageDiff = Math.abs(pet1.age - pet2.age);
    const ageScore = Math.max(0, 1 - ageDiff / 10);
    score += ageScore * 15;
    if (ageScore > 0.7) {
      reasons.push('Age compatible');
    }

    // Personality tags overlap (15 points)
    const commonTags = pet1.personalityTags.filter((tag: string) =>
      pet2.personalityTags.includes(tag),
    );
    const personalityScore =
      commonTags.length / Math.max(pet1.personalityTags.length, pet2.personalityTags.length, 1);
    score += personalityScore * 15;

    if (commonTags.length > 0) {
      reasons.push(`Shared personality traits: ${commonTags.slice(0, 3).join(', ')}`);
    }

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate size compatibility
   */
  private calculateSizeCompatibility(size1: string, size2: string): number {
    const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
    const index1 = sizeOrder.indexOf(size1);
    const index2 = sizeOrder.indexOf(size2);

    if (index1 === -1 || index2 === -1) return 0.5;

    const diff = Math.abs(index1 - index2);
    return Math.max(0, 1 - diff * 0.25);
  }

  /**
   * Record a swipe action (like, pass, superlike)
   */
  async recordSwipe(action: SwipeAction): Promise<boolean> {
    try {
      const response = await api.request<{ success: boolean }>('/matching/swipe', {
        method: 'POST',
        body: JSON.stringify(action)
      });

      logger.info('Swipe recorded', {
        petId: action.petId,
        action: action.action,
        timestamp: action.timestamp
      });

      return response.success;
    } catch (error) {
      logger.error('Failed to record swipe', { error, action });
      return false;
    }
  }

  /**
   * Get user's matches
   */
  async getMatches(limit: number = 50): Promise<MatchResult[]> {
    try {
      const response = await api.request<MatchResult[]>(`/matching/matches?limit=${String(limit)}`);

      logger.info('Fetched user matches', { count: response.length });

      return response;
    } catch (error) {
      logger.error('Failed to get matches', { error });
      return [];
    }
  }

  /**
   * Get detailed compatibility analysis between two pets
   */
  async getCompatibilityAnalysis(petId1: string, petId2: string): Promise<{ score: number; reasons: string[]; details: Record<string, unknown> } | null> {
    try {
      const response = await api.request<{ score: number; reasons: string[]; details: Record<string, unknown> }>(
        '/matching/compatibility',
        {
          method: 'POST',
          body: JSON.stringify({ petId1, petId2 })
        }
      );

      logger.info('Fetched compatibility analysis', {
        petId1,
        petId2,
        score: response.score
      });

      return response;
    } catch (error) {
      logger.error('Failed to get compatibility analysis', { error, petId1, petId2 });
      return null;
    }
  }

  /**
   * Apply filters to pet results locally
   */
  applyFilters(pets: MatchResult[], filters: PetFilters): MatchResult[] {
    return pets.filter((match: MatchResult) => {
      const pet = match.pet;

      if (filters.species !== undefined && filters.species !== '' && pet.species !== filters.species) return false;
      if (filters.minAge !== undefined && pet.age < filters.minAge) return false;
      if (filters.maxAge !== undefined && pet.age > filters.maxAge) return false;
      if (filters.size !== undefined && filters.size !== '' && pet.size !== filters.size) return false;
      if (filters.intent !== undefined && filters.intent !== '' && pet.intent !== filters.intent && pet.intent !== 'all') return false;
      if (filters.breed !== undefined && filters.breed !== '' && pet.breed !== filters.breed) return false;
      if (filters.distance !== undefined && match.distance !== undefined && match.distance > filters.distance) return false;

      return true;
    });
  }

  /**
   * Sort recommendations by compatibility score and other factors
   */
  sortRecommendations(recommendations: MatchResult[]): MatchResult[] {
    return [...recommendations].sort((a, b) => {
      // Primary sort: compatibility score (descending)
      if (a.compatibilityScore !== b.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore;
      }

      // Secondary sort: distance (ascending, if available)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }

      // Tertiary sort: pet name (alphabetical)
      return a.pet.name.localeCompare(b.pet.name);
    });
  }

  /**
   * Get swipe statistics for the current user
   */
  async getSwipeStats(): Promise<{
    totalSwipes: number;
    likes: number;
    passes: number;
    superlikes: number;
    matches: number;
    todaySwipes: number;
  }> {
    try {
      const response = await api.request<{
        totalSwipes: number;
        likes: number;
        passes: number;
        superlikes: number;
        matches: number;
        todaySwipes: number;
      }>('/matching/stats');

      logger.info('Fetched swipe statistics', response);

      return response;
    } catch (error) {
      logger.error('Failed to get swipe stats', { error });
      // Return default stats
      return {
        totalSwipes: 0,
        likes: 0,
        passes: 0,
        superlikes: 0,
        matches: 0,
        todaySwipes: 0,
      };
    }
  }

  /**
   * Undo the last swipe action (premium feature)
   */
  async undoLastSwipe(): Promise<boolean> {
    try {
      const response = await api.request<{ success: boolean }>('/matching/undo', {
        method: 'POST'
      });

      logger.info('Last swipe undone', { success: response.success });

      return response.success;
    } catch (error) {
      logger.error('Failed to undo last swipe', { error });
      return false;
    }
  }

  /**
   * Check if user can undo (has premium or remaining undos)
   */
  async canUndoSwipe(): Promise<boolean> {
    try {
      const response = await api.request<{ canUndo: boolean }>('/matching/can-undo');
      return response.canUndo;
    } catch (error) {
      logger.error('Failed to check undo availability', { error });
      return false;
    }
  }

  /**
   * Get pet details by ID
   */
  async getPetDetails(petId: string): Promise<Pet | null> {
    try {
      const response = await api.request<Pet>(`/pets/${petId}`);

      logger.info('Fetched pet details', { petId, petName: response.name });

      return response;
    } catch (error) {
      logger.error('Failed to get pet details', { error, petId });
      return null;
    }
  }
}

// Export singleton instance
export const matchingService = new MatchingService();
export default matchingService;
