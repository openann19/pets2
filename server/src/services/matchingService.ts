/**
 * Matching Service for PawfectMatch
 * Advanced matching algorithm for pets and users
 */

import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import logger from '../utils/logger';

class MatchingService {
  /**
   * Find potential matches for a pet
   */
  async findMatches(petId: string, userId: string): Promise<any[]> {
    try {
      const pet = await Pet.findById(petId).populate('owner');
      if (!pet) {
        throw new Error('Pet not found');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get potential matches
      const potentialMatches = await this.getPotentialMatches(pet, user);
      
      // Calculate compatibility scores
      const matchesWithScores = potentialMatches.map(match => ({
        ...match,
        compatibilityScore: this.calculateCompatibility(pet, match, user)
      }));

      // Sort by compatibility score
      const sortedMatches = matchesWithScores.sort((a, b) => 
        b.compatibilityScore - a.compatibilityScore
      );

      logger.info('Matches found', { 
        petId, 
        userId, 
        matchCount: sortedMatches.length 
      });

      return sortedMatches;
    } catch (error) {
      logger.error('Error finding matches', { error, petId, userId });
      return [];
    }
  }

  /**
   * Get potential matches
   */
  private async getPotentialMatches(pet: any, user: any): Promise<any[]> {
    try {
      const query: any = { 
        isActive: true, 
        owner: { $ne: user._id } 
      };

      // Apply basic filters
      if (user.preferences.species.length > 0) {
        query.species = { $in: user.preferences.species };
      }

      const pets = await Pet.find(query)
        .populate('owner', 'firstName lastName location preferences')
        .limit(100);

      return pets;
    } catch (error) {
      logger.error('Error getting potential matches', { error });
      return [];
    }
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibility(pet: any, match: any, user: any): number {
    let score = 0;

    // Species compatibility
    if (user.preferences.species.includes(match.species)) {
      score += 30;
    }

    // Age compatibility
    const ageScore = this.calculateAgeCompatibility(pet.age, match.age);
    score += ageScore;

    // Size compatibility
    const sizeScore = this.calculateSizeCompatibility(pet.size, match.size);
    score += sizeScore;

    // Activity level compatibility
    const activityScore = this.calculateActivityCompatibility(pet.activityLevel, match.activityLevel);
    score += activityScore;

    // Personality compatibility
    const personalityScore = this.calculatePersonalityCompatibility(pet.personality, match.personality);
    score += personalityScore;

    // Location compatibility
    const locationScore = this.calculateLocationCompatibility(pet.location, match.location, user.preferences.maxDistance);
    score += locationScore;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate age compatibility
   */
  private calculateAgeCompatibility(age1: number, age2: number): number {
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 1) return 20;
    if (ageDiff <= 3) return 15;
    if (ageDiff <= 5) return 10;
    if (ageDiff <= 10) return 5;
    return 0;
  }

  /**
   * Calculate size compatibility
   */
  private calculateSizeCompatibility(size1: string, size2: string): number {
    if (size1 === size2) return 15;
    
    // Similar sizes get partial points
    const sizeGroups = {
      small: ['small'],
      medium: ['medium'],
      large: ['large']
    };
    
    return 5; // Default partial score
  }

  /**
   * Calculate activity level compatibility
   */
  private calculateActivityCompatibility(level1: string, level2: string): number {
    if (level1 === level2) return 15;
    
    // Similar levels get partial points
    const activityMap = { low: 1, medium: 2, high: 3 };
    const diff = Math.abs(activityMap[level1 as keyof typeof activityMap] - activityMap[level2 as keyof typeof activityMap]);
    
    if (diff === 1) return 10;
    return 0;
  }

  /**
   * Calculate personality compatibility
   */
  private calculatePersonalityCompatibility(personality1: string[], personality2: string[]): number {
    if (!personality1 || !personality2) return 0;
    
    const commonTraits = personality1.filter(trait => personality2.includes(trait));
    return Math.min(commonTraits.length * 5, 20);
  }

  /**
   * Calculate location compatibility
   */
  private calculateLocationCompatibility(location1: any, location2: any, maxDistance: number): number {
    if (!location1 || !location2 || !location1.coordinates || !location2.coordinates) {
      return 0;
    }

    // Mock distance calculation
    const distance = 10; // Mock distance in km
    
    if (distance <= maxDistance) {
      return Math.max(0, 20 - (distance / maxDistance) * 20);
    }
    
    return 0;
  }

  /**
   * Create a match
   */
  async createMatch(pet1Id: string, pet2Id: string, userId: string): Promise<any> {
    try {
      const match = new Match({
        pets: [pet1Id, pet2Id],
        users: [userId],
        status: 'active',
        createdAt: new Date()
      });

      await match.save();
      
      logger.info('Match created', { 
        matchId: match._id, 
        pet1Id, 
        pet2Id, 
        userId 
      });

      return match;
    } catch (error) {
      logger.error('Error creating match', { error, pet1Id, pet2Id, userId });
      throw error;
    }
  }

  /**
   * Get user's matches
   */
  async getUserMatches(userId: string): Promise<any[]> {
    try {
      const matches = await Match.find({ users: userId })
        .populate('pets')
        .populate('users', 'firstName lastName')
        .sort({ createdAt: -1 });

      return matches;
    } catch (error) {
      logger.error('Error getting user matches', { error, userId });
      return [];
    }
  }

  /**
   * Update match status
   */
  async updateMatchStatus(matchId: string, status: string): Promise<void> {
    try {
      await Match.findByIdAndUpdate(matchId, { status });
      
      logger.info('Match status updated', { matchId, status });
    } catch (error) {
      logger.error('Error updating match status', { error, matchId, status });
    }
  }
}

export default new MatchingService();
