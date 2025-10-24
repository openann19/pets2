const axios = require('axios');
const User = require('../models/User');
const Pet = require('../models/Pet');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Get AI-powered pet recommendations
 * @param {string} userId - User ID
 * @param {Array<string>} petIds - Array of pet IDs to score
 * @returns {Promise<Array>} Sorted recommendations with scores
 */
const getAIRecommendations = async (userId, petIds) => {
  try {
    // Get user and their pets for context
    const user = await User.findById(userId).populate('pets');
    const candidatePets = await Pet.find({ _id: { $in: petIds } });

    if (!user.pets || user.pets.length === 0) {
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
        personality_tags: pet.personalityTags,
        intent: pet.intent,
        location: pet.location,
        owner_id: pet.owner
      }))
    };

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/api/recommend`, requestData, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.recommendations || [];

  } catch (error) {
    logger.error('AI Service Error:', { error: error.message });
    
    // Fallback to rule-based matching
    return await getRuleBasedRecommendations(userId, petIds);
  }
};

/**
 * Fallback rule-based matching system
 * @param {string} userId - User ID
 * @param {Array<string>} petIds - Array of pet IDs to score
 * @returns {Promise<Array>} Rule-based recommendations
 */
const getRuleBasedRecommendations = async (userId, petIds) => {
  try {
    const user = await User.findById(userId).populate('pets');
    const candidatePets = await Pet.find({ _id: { $in: petIds } }).populate('owner');

    const recommendations = candidatePets.map(pet => {
      let score = 50; // Base score
      const reasons = [];

      // Species preference
      if (user.preferences.species.includes(pet.species)) {
        score += 20;
        reasons.push(`Matches your ${pet.species} preference`);
      }

      // Intent matching
      if (user.pets.some(userPet => 
        userPet.intent === pet.intent || 
        userPet.intent === 'all' || 
        pet.intent === 'all'
      )) {
        score += 15;
        reasons.push('Compatible intentions');
      }

      // Age preference
      if (pet.age >= user.preferences.ageRange.min && 
          pet.age <= user.preferences.ageRange.max) {
        score += 10;
        reasons.push('Age matches preferences');
      }

      // Size compatibility (for playdates)
      if (pet.intent === 'playdate') {
        const userPetSizes = user.pets.map(p => p.size);
        if (userPetSizes.includes(pet.size)) {
          score += 10;
          reasons.push('Similar size for safe play');
        }
      }

      // Personality compatibility
      if (user.pets.some(userPet => {
        const commonTags = userPet.personalityTags.filter(tag => 
          pet.personalityTags.includes(tag)
        );
        return commonTags.length > 0;
      })) {
        score += 15;
        reasons.push('Compatible personalities');
      }

      // Premium user bonus
      if (pet.owner.premium && pet.owner.premium.isActive) {
        score += 5;
        reasons.push('Verified premium user');
      }

      // Featured pet bonus
      if (pet.featured && pet.featured.isFeatured) {
        score += 8;
        reasons.push('Featured pet');
      }

      // Recently active bonus
      const daysSinceActive = (new Date() - pet.owner.analytics.lastActive) / (1000 * 60 * 60 * 24);
      if (daysSinceActive < 7) {
        score += 5;
        reasons.push('Active user');
      }

      return {
        petId: pet._id,
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
 * @param {string} petId - Pet ID
 * @param {Object} interactionData - Interaction data
 */
const updatePetAIData = async (petId, interactionData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/update-pet-data`, {
      pet_id: petId,
      interaction_data: interactionData
    }, {
      timeout: 3000
    });

    if (response.data.success) {
      // Update pet's AI data in database
      await Pet.findByIdAndUpdate(petId, {
        'aiData.personalityScore': response.data.personality_score,
        'aiData.compatibilityTags': response.data.compatibility_tags,
        'aiData.lastUpdated': new Date()
      });
    }

  } catch (error) {
    logger.error('AI data update error:', { error });
    // Fail silently - this is not critical
  }
};

/**
 * Get breed characteristics from AI service
 * @param {string} breed - Breed name
 * @param {string} species - Species (dog, cat, etc.)
 * @returns {Promise<Object>} Breed characteristics
 */
const getBreedCharacteristics = async (breed, species) => {
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
 * @param {string} pet1Id - First pet ID
 * @param {string} pet2Id - Second pet ID
 * @returns {Promise<Object>} Compatibility analysis
 */
const analyzePetCompatibility = async (pet1Id, pet2Id) => {
  try {
    const [pet1, pet2] = await Promise.all([
      Pet.findById(pet1Id),
      Pet.findById(pet2Id)
    ]);

    if (!pet1 || !pet2) {
      throw new Error('One or both pets not found');
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/compatibility`, {
      pet1: {
        id: pet1._id,
        species: pet1.species,
        breed: pet1.breed,
        age: pet1.age,
        size: pet1.size,
        personality_tags: pet1.personalityTags,
        intent: pet1.intent
      },
      pet2: {
        id: pet2._id,
        species: pet2.species,
        breed: pet2.breed,
        age: pet2.age,
        size: pet2.size,
        personality_tags: pet2.personalityTags,
        intent: pet2.intent
      }
    }, {
      timeout: 3000
    });

    return response.data;

  } catch (error) {
    logger.error('Compatibility analysis error:', { error });
    
    // Fallback compatibility check
    const pet1 = await Pet.findById(pet1Id);
    const pet2 = await Pet.findById(pet2Id);
    
    let score = 50;
    const factors = [];
    
    if (pet1.species === pet2.species) {
      score += 20;
      factors.push('Same species');
    }
    
    if (pet1.size === pet2.size) {
      score += 10;
      factors.push('Similar size');
    }
    
    const commonTraits = pet1.personalityTags.filter(tag => 
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

module.exports = {
  getAIRecommendations,
  getRuleBasedRecommendations,
  updatePetAIData,
  getBreedCharacteristics,
  analyzePetCompatibility
};