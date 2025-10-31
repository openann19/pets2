import axios from 'axios';
import type { AxiosResponse } from 'axios';
import User from '../models/User';
import Pet from '../models/Pet';
import logger from '../utils/logger';
import type { IUserPreferences, IUserLocation } from '../types/mongoose.d';
import type { IPetLocation, IPetDocument } from '../types/mongoose.d';
import type { IUserDocument } from '../models/User';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

// Interface for AI recommendation result
export interface AIRecommendation {
  petId: string;
  score: number;
  reasons: string[];
}

// Interface for pet profile data
export interface PetProfile {
  id: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  personality_tags: string[];
  intent: string;
  location?: IPetLocation;
  owner_id?: string;
}

// Interface for user profile data
export interface UserProfile {
  id: string;
  preferences: IUserPreferences;
  location: IUserLocation;
  pets: PetProfile[];
}

// Interface for AI recommendation request
export interface AIRecommendationRequest {
  user_profile: UserProfile;
  candidate_pets: PetProfile[];
}

// Interface for AI recommendation response
export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
}

// Interface for AI data update response
export interface AIDataUpdateResponse {
  success: boolean;
  personality_score?: number;
  compatibility_tags?: string[];
}

// Interface for breed characteristics
export interface BreedCharacteristics {
  temperament: string[];
  energyLevel: string;
  groomingNeeds: string;
  healthConcerns: string[];
}

// Interface for compatibility analysis
export interface CompatibilityAnalysis {
  compatibility_score: number;
  factors: string[];
  recommendation: string;
}

/**
 * Get AI-powered pet recommendations
 * @param userId - User ID
 * @param petIds - Array of pet IDs to score
 * @returns Promise resolving to sorted recommendations with scores
 */
export const getAIRecommendations = async (
  userId: string,
  petIds: string[]
): Promise<AIRecommendation[]> => {
  try {
    // Get user and their pets for context
    const user = await User.findById(userId).populate('pets');
    const candidatePets = await Pet.find({ _id: { $in: petIds } });

    if (!user || !user.pets || user.pets.length === 0) {
      // No pets to base recommendations on, return random order
      return candidatePets.map((pet: IPetDocument) => ({
        petId: pet._id.toString(),
        score: Math.random() * 100,
        reasons: ['New user - exploring options']
      }));
    }

    // Prepare data for AI service
    const userDoc = user as IUserDocument;
    const requestData: AIRecommendationRequest = {
      user_profile: {
        id: (userDoc._id as unknown as { toString(): string }).toString(),
        preferences: userDoc.preferences as IUserPreferences,
        location: userDoc.location as IUserLocation,
        pets: (userDoc.pets as IPetDocument[]).map((pet: IPetDocument) => ({
          id: pet._id.toString(),
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          personality_tags: pet.personalityTags,
          intent: pet.intent
        }))
      },
      candidate_pets: candidatePets.map((pet: IPetDocument) => ({
        id: pet._id.toString(),
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        size: pet.size,
        personality_tags: pet.personalityTags,
        intent: pet.intent,
        location: pet.location,
        owner_id: pet.owner
      }))
    };

    // Call AI service
    const response: AxiosResponse<AIRecommendationResponse> = await axios.post(
      `${AI_SERVICE_URL}/api/recommend`,
      requestData,
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.recommendations || [];

  } catch (error) {
    logger.error('AI Service Error:', { error: (error as Error).message });
    
    // Fallback to rule-based matching
    return await getRuleBasedRecommendations(userId, petIds);
  }
};

/**
 * Fallback rule-based matching system
 * @param userId - User ID
 * @param petIds - Array of pet IDs to score
 * @returns Promise resolving to rule-based recommendations
 */
export const getRuleBasedRecommendations = async (
  userId: string,
  petIds: string[]
): Promise<AIRecommendation[]> => {
  try {
    const user = await User.findById(userId).populate('pets');
    const candidatePets = await Pet.find({ _id: { $in: petIds } }).populate('owner');

    if (!user || !user.pets) {
      return [];
    }

    const userDoc = user as IUserDocument;
    const userPets = userDoc.pets as IPetDocument[];
    const recommendations: AIRecommendation[] = candidatePets.map((pet: IPetDocument) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Species preference
      if (userDoc.preferences?.species?.includes(pet.species)) {
        score += 20;
        reasons.push(`Matches your ${pet.species} preference`);
      }

      // Intent matching
      if (userPets.some((userPet: IPetDocument) => 
        userPet.intent === pet.intent || 
        userPet.intent === 'all' || 
        pet.intent === 'all'
      )) {
        score += 15;
        reasons.push('Compatible intentions');
      }

      // Age preference
      if (userDoc.preferences?.ageRange && 
          pet.age >= userDoc.preferences.ageRange.min && 
          pet.age <= userDoc.preferences.ageRange.max) {
        score += 10;
        reasons.push('Age matches preferences');
      }

      // Size compatibility (for playdates)
      if (pet.intent === 'playdate') {
        const userPetSizes = userPets.map((p: IPetDocument) => p.size);
        if (userPetSizes.includes(pet.size)) {
          score += 10;
          reasons.push('Similar size for safe play');
        }
      }

      // Personality compatibility
      if (userPets.some((userPet: IPetDocument) => {
        const commonTags = userPet.personalityTags.filter((tag: string) => 
          pet.personalityTags.includes(tag)
        );
        return commonTags.length > 0;
      })) {
        score += 15;
        reasons.push('Compatible personalities');
      }

      // Premium user bonus
      const petOwner = pet.owner as unknown as IUserDocument;
      if (petOwner?.premium?.isActive) {
        score += 5;
        reasons.push('Verified premium user');
      }

      // Featured pet bonus
      if (pet.featured?.isFeatured) {
        score += 8;
        reasons.push('Featured pet');
      }

      // Recently active bonus
      const daysSinceActive = petOwner?.analytics?.lastActive
        ? (new Date().getTime() - new Date(petOwner.analytics.lastActive).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;
      if (daysSinceActive < 7) {
        score += 5;
        reasons.push('Active user');
      }

      return {
        petId: pet._id.toString(),
        score: Math.min(100, Math.max(0, score)),
        reasons: reasons.slice(0, 3) // Top 3 reasons
      };
    });

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);

  } catch (error) {
    logger.error('Rule-based matching error:', { error });
    return [];
  }
};

/**
 * Update pet's AI data based on interactions
 * @param petId - Pet ID
 * @param interactionData - Interaction data
 */
export const updatePetAIData = async (
  petId: string,
  interactionData: Record<string, unknown>
): Promise<void> => {
  try {
    const response = await axios.post<AIDataUpdateResponse>(
      `${AI_SERVICE_URL}/api/update-pet-data`,
      {
        pet_id: petId,
        interaction_data: interactionData
      },
      {
        timeout: 3000
      }
    );

    if (response.data.success) {
      // Update pet's AI data in database
      await Pet.findByIdAndUpdate(petId, {
        $set: {
          'aiData.personalityScore': response.data.personality_score,
          'aiData.compatibilityTags': response.data.compatibility_tags,
          'aiData.lastUpdated': new Date()
        }
      });
    }

  } catch (error) {
    logger.error('AI data update error:', { error });
    // Fail silently - this is not critical
  }
};

/**
 * Get breed characteristics from AI service
 * @param breed - Breed name
 * @param species - Species (dog, cat, etc.)
 * @returns Promise resolving to breed characteristics
 */
export const getBreedCharacteristics = async (
  breed: string,
  species: string
): Promise<BreedCharacteristics> => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/breed-info`, {
      params: { breed, species },
      timeout: 3000
    });

    return response.data.characteristics || {};

  } catch (error) {
    logger.error('Breed characteristics error:', { error });
    
    // Return basic fallback data
    return {
      temperament: [],
      energyLevel: 'medium',
      groomingNeeds: 'medium',
      healthConcerns: []
    };
  }
};

/**
 * Analyze pet compatibility
 * @param pet1Id - First pet ID
 * @param pet2Id - Second pet ID
 * @returns Promise resolving to compatibility analysis
 */
export const analyzePetCompatibility = async (
  pet1Id: string,
  pet2Id: string
): Promise<CompatibilityAnalysis> => {
  try {
    const [pet1, pet2] = await Promise.all([
      Pet.findById(pet1Id),
      Pet.findById(pet2Id)
    ]);

    if (!pet1 || !pet2) {
      throw new Error('One or both pets not found');
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/compatibility`,
      {
        pet1: {
          id: pet1._id.toString(),
          species: pet1.species,
          breed: pet1.breed,
          age: pet1.age,
          size: pet1.size,
          personality_tags: pet1.personalityTags,
          intent: pet1.intent
        },
        pet2: {
          id: pet2._id.toString(),
          species: pet2.species,
          breed: pet2.breed,
          age: pet2.age,
          size: pet2.size,
          personality_tags: pet2.personalityTags,
          intent: pet2.intent
        }
      },
      {
        timeout: 3000
      }
    );

    return response.data;

  } catch (error) {
    logger.error('Compatibility analysis error:', { error });
    
    // Fallback compatibility check
    const pet1 = await Pet.findById(pet1Id);
    const pet2 = await Pet.findById(pet2Id);
    
    if (!pet1 || !pet2) {
      return {
        compatibility_score: 0,
        factors: ['Pets not found'],
        recommendation: 'Unable to assess compatibility'
      };
    }
    
    let score = 50;
    const factors: string[] = [];
    
    if (pet1.species === pet2.species) {
      score += 20;
      factors.push('Same species');
    }
    
    if (pet1.size === pet2.size) {
      score += 10;
      factors.push('Similar size');
    }
    
    const commonTraits = pet1.personalityTags.filter((tag: string) => 
      pet2.personalityTags.includes(tag)
    );
    score += commonTraits.length * 5;
    
    if (commonTraits.length > 0) {
      factors.push(`${commonTraits.length} shared traits`);
    }

    return {
      compatibility_score: Math.min(100, score),
      factors,
      recommendation: score > 70 ? 'Highly Compatible' : 
                     score > 50 ? 'Moderately Compatible' : 'May Need Supervision'
    };
  }
};

// Export default object for backward compatibility
export default {
  getAIRecommendations,
  getRuleBasedRecommendations,
  updatePetAIData,
  getBreedCharacteristics,
  analyzePetCompatibility
};

