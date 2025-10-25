/**
 * Search Service for PawfectMatch
 * Advanced search functionality with filters and ranking
 */

import User from '../models/User';
import Pet from '../models/Pet';
import logger from '../utils/logger';

class SearchService {
  /**
   * Search pets with advanced filters
   */
  async searchPets(filters: any, userId: string): Promise<any[]> {
    try {
      const query: any = { isActive: true };
      
      // Apply filters
      if (filters.species) {
        query.species = { $in: filters.species };
      }
      
      if (filters.ageRange) {
        query.age = { $gte: filters.ageRange.min, $lte: filters.ageRange.max };
      }
      
      if (filters.size) {
        query.size = { $in: filters.size };
      }
      
      if (filters.activityLevel) {
        query.activityLevel = { $in: filters.activityLevel };
      }
      
      if (filters.location && filters.maxDistance) {
        // Location-based filtering would be implemented here
        // For now, just exclude the user's own pets
        query.owner = { $ne: userId };
      }
      
      const pets = await Pet.find(query)
        .populate('owner', 'firstName lastName location')
        .limit(filters.limit || 50)
        .skip(filters.offset || 0);
      
      // Apply ranking algorithm
      const rankedPets = this.rankPets(pets, filters, userId);
      
      logger.info('Pet search completed', { 
        filters, 
        resultCount: rankedPets.length 
      });
      
      return rankedPets;
    } catch (error) {
      logger.error('Error searching pets', { error, filters });
      return [];
    }
  }

  /**
   * Search users with filters
   */
  async searchUsers(filters: any, userId: string): Promise<any[]> {
    try {
      const query: any = { isActive: true, _id: { $ne: userId } };
      
      // Apply filters
      if (filters.ageRange) {
        // Calculate age from dateOfBirth
        const now = new Date();
        const maxAge = now.getFullYear() - filters.ageRange.min;
        const minAge = now.getFullYear() - filters.ageRange.max;
        
        query.dateOfBirth = { 
          $gte: new Date(minAge, 0, 1), 
          $lte: new Date(maxAge, 11, 31) 
        };
      }
      
      if (filters.location && filters.maxDistance) {
        // Location-based filtering would be implemented here
      }
      
      const users = await User.find(query)
        .select('firstName lastName bio photos location preferences')
        .limit(filters.limit || 50)
        .skip(filters.offset || 0);
      
      logger.info('User search completed', { 
        filters, 
        resultCount: users.length 
      });
      
      return users;
    } catch (error) {
      logger.error('Error searching users', { error, filters });
      return [];
    }
  }

  /**
   * Rank pets based on relevance
   */
  private rankPets(pets: any[], filters: any, userId: string): any[] {
    return pets.map(pet => {
      let score = 0;
      
      // Base score
      score += 10;
      
      // Species preference
      if (filters.species && filters.species.includes(pet.species)) {
        score += 20;
      }
      
      // Age preference
      if (filters.ageRange) {
        const ageScore = this.calculateAgeScore(pet.age, filters.ageRange);
        score += ageScore;
      }
      
      // Size preference
      if (filters.size && filters.size.includes(pet.size)) {
        score += 15;
      }
      
      // Activity level preference
      if (filters.activityLevel && filters.activityLevel.includes(pet.activityLevel)) {
        score += 15;
      }
      
      // Photo quality bonus
      if (pet.photos && pet.photos.length > 0) {
        score += 5;
      }
      
      // Bio completeness bonus
      if (pet.bio && pet.bio.length > 50) {
        score += 5;
      }
      
      return { ...pet.toObject(), relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate age score based on preference
   */
  private calculateAgeScore(age: number, ageRange: { min: number; max: number }): number {
    if (age >= ageRange.min && age <= ageRange.max) {
      return 20;
    }
    
    const distance = Math.min(
      Math.abs(age - ageRange.min),
      Math.abs(age - ageRange.max)
    );
    
    return Math.max(0, 20 - distance * 2);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, type: string): Promise<string[]> {
    try {
      const suggestions: string[] = [];
      
      if (type === 'species') {
        const species = ['dog', 'cat', 'bird', 'rabbit', 'other'];
        suggestions.push(...species.filter(s => s.includes(query.toLowerCase())));
      }
      
      if (type === 'breed') {
        // Mock breed suggestions
        const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Persian', 'Maine Coon'];
        suggestions.push(...breeds.filter(b => b.toLowerCase().includes(query.toLowerCase())));
      }
      
      return suggestions.slice(0, 10);
    } catch (error) {
      logger.error('Error getting search suggestions', { error, query, type });
      return [];
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<string[]> {
    try {
      // Mock trending searches
      const trending = [
        'Golden Retriever',
        'Persian Cat',
        'Small Dogs',
        'Active Pets',
        'Senior Pets'
      ];
      
      return trending;
    } catch (error) {
      logger.error('Error getting trending searches', { error });
      return [];
    }
  }

  /**
   * Save search query for analytics
   */
  async saveSearchQuery(userId: string, query: string, filters: any, resultCount: number): Promise<void> {
    try {
      // In a real implementation, this would save to analytics database
      logger.info('Search query saved', { 
        userId, 
        query, 
        filters, 
        resultCount 
      });
    } catch (error) {
      logger.error('Error saving search query', { error, userId, query });
    }
  }
}

export default new SearchService();
