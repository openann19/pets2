import axios from 'axios';
import User from '../models/User';
import Pet from '../models/Pet';
import logger from '../utils/logger';
import { AIService, AIAnalysis } from '../types';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

/**
 * Get AI-powered pet recommendations
 * @param userId - User ID
 * @param petIds - Array of pet IDs to score
 * @returns Sorted recommendations with scores
 */
export const getAIRecommendations = async (userId: string, petIds: string[]): Promise<any[]> => {
  try {
    // Get user and their pets for context
    const user = await User.findById(userId).populate('pets');
    const candidatePets = await Pet.find({ _id: { $in: petIds } });

    if (!user?.pets || user.pets.length === 0) {
      // No pets to base recommendations on, return random order
      return candidatePets.map(pet => ({
        petId: pet._id,
        score: Math.random() * 100,
        reasons: ['New user - exploring options']
      }));
    }

    // Prepare data for AI service
    const requestData = {
      user_profile: {
        id: user._id,
        preferences: user.preferences,
        location: user.location,
        pets: user.pets.map(pet => ({
          id: pet._id,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          personality_tags: pet.personalityTags,
          intent: pet.intent
        }))
      },
      candidate_pets: candidatePets.map(pet => ({
        id: pet._id,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        size: pet.size,
        gender: pet.gender,
        personality_tags: pet.personalityTags,
        intent: pet.intent,
        location: pet.location,
        photos: pet.photos.length
      }))
    };

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/recommendations`, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data && response.data.recommendations) {
      return response.data.recommendations.map((rec: any) => ({
        petId: rec.pet_id,
        score: rec.score,
        reasons: rec.reasons || [],
        compatibility_factors: rec.compatibility_factors || {}
      }));
    }

    // Fallback to random scoring if AI service fails
    return candidatePets.map(pet => ({
      petId: pet._id,
      score: Math.random() * 100,
      reasons: ['AI service unavailable - using fallback scoring']
    }));

  } catch (error) {
    logger.error('Error getting AI recommendations', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      petIds
    });

    // Fallback to random scoring
    const candidatePets = await Pet.find({ _id: { $in: petIds } });
    return candidatePets.map(pet => ({
      petId: pet._id,
      score: Math.random() * 100,
      reasons: ['AI service error - using fallback scoring']
    }));
  }
};

/**
 * Analyze pet photo using AI
 * @param imageUrl - URL of the image to analyze
 * @returns AI analysis results
 */
export const analyzePetPhoto = async (imageUrl: string): Promise<AIAnalysis> => {
  try {
    const requestData = {
      image_url: imageUrl,
      analysis_type: 'comprehensive'
    };

    const response = await axios.post(`${AI_SERVICE_URL}/analyze-photo`, requestData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data) {
      return {
        breed: {
          primary: response.data.breed?.primary || 'Unknown',
          confidence: response.data.breed?.confidence || 0
        },
        health: {
          overall: response.data.health?.overall || 'good',
          score: response.data.health?.score || 75,
          indicators: {
            coat: response.data.health?.indicators?.coat || 'Good condition',
            eyes: response.data.health?.indicators?.eyes || 'Clear and bright',
            posture: response.data.health?.indicators?.posture || 'Normal',
            energy: response.data.health?.indicators?.energy || 'Active'
          }
        },
        quality: {
          score: response.data.quality?.score || 80,
          factors: {
            lighting: response.data.quality?.factors?.lighting || 8,
            clarity: response.data.quality?.factors?.clarity || 8,
            composition: response.data.quality?.factors?.composition || 7,
            expression: response.data.quality?.factors?.expression || 8
          }
        },
        characteristics: {
          age: response.data.characteristics?.age || 'Adult',
          size: response.data.characteristics?.size || 'Medium',
          temperament: response.data.characteristics?.temperament || ['friendly', 'energetic'],
          features: response.data.characteristics?.features || ['well-groomed', 'healthy']
        },
        suggestions: response.data.suggestions || [
          'Consider adding more photos from different angles',
          'Include photos showing the pet in different activities',
          'Ensure good lighting for better photo quality'
        ],
        tags: response.data.tags || ['cute', 'friendly', 'healthy']
      };
    }

    throw new Error('Invalid response from AI service');

  } catch (error) {
    logger.error('Error analyzing pet photo', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      imageUrl
    });

    // Return default analysis on error
    return {
      breed: {
        primary: 'Unknown',
        confidence: 0
      },
      health: {
        overall: 'good',
        score: 75,
        indicators: {
          coat: 'Unable to analyze',
          eyes: 'Unable to analyze',
          posture: 'Unable to analyze',
          energy: 'Unable to analyze'
        }
      },
      quality: {
        score: 50,
        factors: {
          lighting: 5,
          clarity: 5,
          composition: 5,
          expression: 5
        }
      },
      characteristics: {
        age: 'Unknown',
        size: 'Unknown',
        temperament: ['unknown'],
        features: ['unable to analyze']
      },
      suggestions: [
        'AI analysis unavailable - please try again later',
        'Consider uploading a clearer photo',
        'Ensure the pet is clearly visible in the image'
      ],
      tags: ['unable to analyze']
    };
  }
};

/**
 * Generate pet bio using AI
 * @param petData - Pet data for bio generation
 * @returns Generated bio text
 */
export const generatePetBio = async (petData: any): Promise<string> => {
  try {
    const requestData = {
      pet_info: {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        size: petData.size,
        personality_tags: petData.personalityTags || [],
        intent: petData.intent,
        special_needs: petData.specialNeeds,
        health_info: petData.healthInfo
      },
      bio_style: 'engaging_and_friendly'
    };

    const response = await axios.post(`${AI_SERVICE_URL}/generate-bio`, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data && response.data.bio) {
      return response.data.bio;
    }

    throw new Error('Invalid response from AI service');

  } catch (error) {
    logger.error('Error generating pet bio', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      petData
    });

    // Return fallback bio
    return `Meet ${petData.name}! This adorable ${petData.age}-year-old ${petData.breed} is looking for ${petData.intent === 'adoption' ? 'a loving forever home' : petData.intent === 'mating' ? 'a compatible mate' : 'new friends'}. ${petData.gender === 'male' ? 'He' : 'She'} is ${petData.size} sized and has a wonderful personality. ${petData.specialNeeds ? `Special needs: ${petData.specialNeeds}. ` : ''}Contact us to learn more about this amazing pet!`;
  }
};

/**
 * Get compatibility score between two pets
 * @param pet1 - First pet data
 * @param pet2 - Second pet data
 * @returns Compatibility score (0-100)
 */
export const getCompatibilityScore = async (pet1: any, pet2: any): Promise<number> => {
  try {
    const requestData = {
      pet1: {
        species: pet1.species,
        breed: pet1.breed,
        age: pet1.age,
        gender: pet1.gender,
        size: pet1.size,
        personality_tags: pet1.personalityTags || [],
        intent: pet1.intent,
        health_info: pet1.healthInfo
      },
      pet2: {
        species: pet2.species,
        breed: pet2.breed,
        age: pet2.age,
        gender: pet2.gender,
        size: pet2.size,
        personality_tags: pet2.personalityTags || [],
        intent: pet2.intent,
        health_info: pet2.healthInfo
      }
    };

    const response = await axios.post(`${AI_SERVICE_URL}/compatibility`, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data && typeof response.data.score === 'number') {
      return Math.max(0, Math.min(100, response.data.score));
    }

    throw new Error('Invalid response from AI service');

  } catch (error) {
    logger.error('Error getting compatibility score', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      pet1: pet1._id,
      pet2: pet2._id
    });

    // Return fallback compatibility score
    return calculateFallbackCompatibility(pet1, pet2);
  }
};

/**
 * Moderate content using AI
 * @param content - Content to moderate
 * @param type - Type of content (text, image, etc.)
 * @returns Moderation results
 */
export const moderateContent = async (content: string, type: string): Promise<any> => {
  try {
    const requestData = {
      content,
      content_type: type,
      moderation_level: 'standard'
    };

    const response = await axios.post(`${AI_SERVICE_URL}/moderate`, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data) {
      return {
        safe: response.data.safe || true,
        confidence: response.data.confidence || 0.8,
        flags: response.data.flags || [],
        categories: response.data.categories || [],
        suggestions: response.data.suggestions || []
      };
    }

    throw new Error('Invalid response from AI service');

  } catch (error) {
    logger.error('Error moderating content', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      content: content.substring(0, 100),
      type
    });

    // Return safe default on error
    return {
      safe: true,
      confidence: 0.5,
      flags: [],
      categories: [],
      suggestions: ['AI moderation unavailable - manual review recommended']
    };
  }
};

/**
 * Calculate fallback compatibility score
 * @param pet1 - First pet
 * @param pet2 - Second pet
 * @returns Compatibility score
 */
function calculateFallbackCompatibility(pet1: any, pet2: any): number {
  let score = 50; // Base score

  // Species compatibility
  if (pet1.species === pet2.species) {
    score += 20;
  }

  // Age compatibility
  const ageDiff = Math.abs(pet1.age - pet2.age);
  if (ageDiff <= 2) {
    score += 15;
  } else if (ageDiff <= 5) {
    score += 10;
  }

  // Size compatibility
  const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
  const size1Index = sizeOrder.indexOf(pet1.size);
  const size2Index = sizeOrder.indexOf(pet2.size);
  const sizeDiff = Math.abs(size1Index - size2Index);

  if (sizeDiff <= 1) {
    score += 10;
  } else if (sizeDiff <= 2) {
    score += 5;
  }

  // Intent compatibility
  if (pet1.intent === pet2.intent) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// Export the service interface
const aiService: AIService = {
  analyzePetPhoto,
  generatePetBio,
  getCompatibilityScore,
  moderateContent,
};

export default aiService;
