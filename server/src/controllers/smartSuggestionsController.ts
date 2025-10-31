/**
 * Smart Suggestions Controller
 * Backend controller for AI-powered chat suggestions
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import Pet from '../models/Pet';
import logger from '../utils/logger';
import type { SmartChatSuggestion } from '../../core/src/types/pet-chat';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface GetSmartSuggestionsRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    lastMessages?: number;
    petTopics?: string[];
    conversationStage?: 'initial' | 'active' | 'planning' | 'established';
  };
}

interface GetPetCareAdviceRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    breed: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    context?: {
      lastMessages?: number;
      topics?: string[];
    };
  };
}

interface GetCompatibilityQuestionsRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  query: {
    pet1Id: string;
    pet2Id: string;
  };
}

interface GetConversationStartersRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    compatibilityScore: number;
    sharedInterests?: string[];
  };
}

/**
 * @desc    Get smart suggestions based on conversation context
 * @route   POST /api/chat/:matchId/suggestions
 * @access  Private
 */
export const getSmartSuggestions = async (
  req: GetSmartSuggestionsRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { lastMessages, petTopics, conversationStage } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    }).populate('pet1 pet2');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const suggestions: SmartChatSuggestion[] = [];

    // Generate suggestions based on conversation stage
    if (conversationStage === 'initial') {
      suggestions.push({
        suggestionId: `suggestion_${Date.now()}_1`,
        type: 'conversation_starter',
        title: 'Ask about their pet',
        message: 'What kind of pet do you have?',
        context: 'Initial conversation starter',
        confidence: 0.9,
      });

      suggestions.push({
        suggestionId: `suggestion_${Date.now()}_2`,
        type: 'compatibility_question',
        title: 'Learn about compatibility',
        message: 'Do your pets get along with other pets?',
        context: 'Compatibility check',
        confidence: 0.85,
      });
    }

    // Add pet care advice suggestions
    if (petTopics && petTopics.length > 0) {
      suggestions.push({
        suggestionId: `suggestion_${Date.now()}_3`,
        type: 'pet_care_advice',
        title: 'Pet care tips',
        message: 'Would you like tips on caring for your pet?',
        context: 'Care advice based on conversation',
        confidence: 0.75,
      });
    }

    // Add local services suggestion
    suggestions.push({
      suggestionId: `suggestion_${Date.now()}_4`,
      type: 'local_service',
      title: 'Find nearby services',
      message: 'Looking for pet-friendly places nearby?',
      context: 'Location-based suggestion',
      confidence: 0.7,
    });

    res.json({
      success: true,
      data: suggestions.slice(0, 5), // Return top 5
    });
  } catch (error) {
    logger.error('Get smart suggestions error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get smart suggestions',
    });
  }
};

/**
 * @desc    Get pet care advice based on breed
 * @route   POST /api/chat/:matchId/suggestions/care-advice
 * @access  Private
 */
export const getPetCareAdvice = async (
  req: GetPetCareAdviceRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { breed, species, context } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    // Generate breed-specific care advice
    const suggestions: SmartChatSuggestion[] = [];

    // Example suggestions based on breed
    if (species === 'dog') {
      suggestions.push({
        suggestionId: `care_advice_${Date.now()}_1`,
        type: 'pet_care_advice',
        title: `${breed} Exercise Needs`,
        message: `${breed}s typically need daily exercise. Would you like tips on keeping them active?`,
        context: `Breed-specific advice for ${breed}`,
        confidence: 0.9,
        metadata: {
          questionId: 'exercise_needs',
        },
      });

      suggestions.push({
        suggestionId: `care_advice_${Date.now()}_2`,
        type: 'pet_care_advice',
        title: `${breed} Grooming Tips`,
        message: `Grooming requirements for ${breed}s can vary. Want to know more?`,
        context: `Breed-specific grooming advice`,
        confidence: 0.85,
        metadata: {
          questionId: 'grooming_tips',
        },
      });
    } else if (species === 'cat') {
      suggestions.push({
        suggestionId: `care_advice_${Date.now()}_3`,
        type: 'pet_care_advice',
        title: `${breed} Care Guide`,
        message: `${breed}s have specific care needs. Would you like breed-specific tips?`,
        context: `Breed-specific care for ${breed}`,
        confidence: 0.9,
        metadata: {
          questionId: 'breed_care',
        },
      });
    }

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Get pet care advice error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet care advice',
    });
  }
};

/**
 * @desc    Get compatibility questions
 * @route   GET /api/chat/:matchId/suggestions/compatibility-questions
 * @access  Private
 */
export const getCompatibilityQuestions = async (
  req: GetCompatibilityQuestionsRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { pet1Id, pet2Id } = req.query;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const pet1 = await Pet.findById(pet1Id);
    const pet2 = await Pet.findById(pet2Id);

    if (!pet1 || !pet2) {
      res.status(404).json({
        success: false,
        message: 'Pets not found',
      });
      return;
    }

    const suggestions: SmartChatSuggestion[] = [
      {
        suggestionId: `compat_q_${Date.now()}_1`,
        type: 'compatibility_question',
        title: 'Play Style',
        message: 'What kind of play does your pet enjoy?',
        context: 'Compatibility assessment',
        confidence: 0.9,
        metadata: {
          questionId: 'play_style',
        },
      },
      {
        suggestionId: `compat_q_${Date.now()}_2`,
        type: 'compatibility_question',
        title: 'Social Behavior',
        message: 'How does your pet interact with other pets?',
        context: 'Social compatibility check',
        confidence: 0.85,
        metadata: {
          questionId: 'social_behavior',
        },
      },
      {
        suggestionId: `compat_q_${Date.now()}_3`,
        type: 'compatibility_question',
        title: 'Energy Level',
        message: 'What is your pet\'s typical energy level?',
        context: 'Energy compatibility',
        confidence: 0.8,
        metadata: {
          questionId: 'energy_level',
        },
      },
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Get compatibility questions error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get compatibility questions',
    });
  }
};

/**
 * @desc    Get conversation starters
 * @route   POST /api/chat/:matchId/suggestions/conversation-starters
 * @access  Private
 */
export const getConversationStarters = async (
  req: GetConversationStartersRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { compatibilityScore, sharedInterests } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    const suggestions: SmartChatSuggestion[] = [];

    if (compatibilityScore >= 80) {
      suggestions.push({
        suggestionId: `starter_${Date.now()}_1`,
        type: 'conversation_starter',
        title: 'Great Match!',
        message: 'Your pets seem like a great match! Would you like to arrange a playdate?',
        context: 'High compatibility starter',
        confidence: 0.95,
      });
    } else if (compatibilityScore >= 60) {
      suggestions.push({
        suggestionId: `starter_${Date.now()}_2`,
        type: 'conversation_starter',
        title: 'Learn More',
        message: 'Your pets have some compatibility! Want to learn more about each other?',
        context: 'Moderate compatibility starter',
        confidence: 0.85,
      });
    }

    if (sharedInterests && sharedInterests.length > 0) {
      suggestions.push({
        suggestionId: `starter_${Date.now()}_3`,
        type: 'conversation_starter',
        title: 'Shared Interests',
        message: `You both like ${sharedInterests[0]}! Want to chat about that?`,
        context: 'Shared interest starter',
        confidence: 0.9,
      });
    }

    // Default starter
    suggestions.push({
      suggestionId: `starter_${Date.now()}_4`,
      type: 'conversation_starter',
      title: 'Introduce Your Pet',
      message: 'Tell me about your pet! What makes them special?',
      context: 'General conversation starter',
      confidence: 0.8,
    });

    res.json({
      success: true,
      data: suggestions.slice(0, 5),
    });
  } catch (error) {
    logger.error('Get conversation starters error', {
      error,
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation starters',
    });
  }
};

// Export existing getSuggestions function for compatibility with existing routes
export const getSuggestions = getSmartSuggestions;
