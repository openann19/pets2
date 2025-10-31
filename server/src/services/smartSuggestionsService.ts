/**
 * Smart Suggestions Service
 * Phase 2 Product Enhancement - AI-powered message suggestions
 */

import Conversation from '../models/Conversation';
import logger from '../utils/logger';
import type {
  SmartSuggestionsRequest,
  SmartSuggestionsResponse,
  SmartSuggestion,
} from '@pawfectmatch/core/types/phase2-contracts';

/**
 * Generate smart suggestions based on conversation context
 * Uses AI service (OpenAI/Claude) to generate contextual suggestions
 */
async function generateSuggestionsFromAI(
  conversationHistory: string[],
  convoId: string
): Promise<Array<{ text: string; relevance: number }>> {
  try {
    // Check if AI service is configured
    const aiServiceEnabled = process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY;
    
    if (!aiServiceEnabled) {
      logger.warn('AI service not configured, returning empty suggestions', { convoId });
      return [];
    }

    // Use OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      const { OpenAIService } = await import('./ai/openai');
      const openai = new OpenAIService();
      
      const context = conversationHistory.slice(-10).join('\n');
      const prompt = `Based on this conversation between pet owners, suggest 3 short, friendly responses (max 50 chars each). Be warm and conversational.\n\nConversation:\n${context}\n\nSuggestions:`;

      const response = await openai.generateText(prompt, {
        maxTokens: 150,
        temperature: 0.7,
      });

      // Parse suggestions (assuming they're numbered or separated)
      const suggestions = response.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3)
        .map((text, index) => ({
          text: text.replace(/^\d+\.\s*/, '').trim(),
          relevance: 0.8 - (index * 0.1), // Slight decreasing relevance
        }));

      return suggestions;
    }

    // Fallback: return basic suggestions
    return [
      { text: "Sounds great! 🐾", relevance: 0.7 },
      { text: "I'd love to meet them!", relevance: 0.6 },
      { text: "Let me know when works for you!", relevance: 0.5 },
    ];
  } catch (error) {
    logger.error('Failed to generate AI suggestions', { error, convoId });
    // Return fallback suggestions
    return [
      { text: "That's awesome! 🐾", relevance: 0.5 },
    ];
  }
}

/**
 * Get smart suggestions for a conversation
 */
export async function getSmartSuggestions(
  userId: string,
  request: SmartSuggestionsRequest
): Promise<SmartSuggestionsResponse> {
  try {
    // Get conversation
    const conversation = await Conversation.findById(request.convoId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is a participant
    if (!conversation.participants.includes(userId)) {
      throw new Error('Unauthorized: user not in conversation');
    }

    // Get recent messages
    const recentCount = request.recentMessages || 10;
    const messages = conversation.messages
      .filter((msg) => msg.sender !== userId && !msg.isDeleted)
      .slice(-recentCount)
      .map((msg) => msg.content);

    if (messages.length === 0) {
      // No context, return friendly opener
      return {
        success: true,
        suggestions: [
          {
            id: `suggestion_${Date.now()}_1`,
            convoId: request.convoId,
            text: "Hey! How are you? 🐾",
            relevance: 0.6,
            createdAt: new Date().toISOString(),
          },
        ],
        relevance: 0.6,
      };
    }

    // Generate suggestions using AI
    const aiSuggestions = await generateSuggestionsFromAI(messages, request.convoId);

    // Map to SmartSuggestion format
    const suggestions: SmartSuggestion[] = aiSuggestions.map((suggestion, index) => ({
      id: `suggestion_${Date.now()}_${index}`,
      convoId: request.convoId,
      text: suggestion.text,
      relevance: suggestion.relevance,
      context: {
        lastMessage: messages[messages.length - 1],
        conversationTopic: extractTopic(messages),
        sentiment: analyzeSentiment(messages),
      },
      createdAt: new Date().toISOString(),
    }));

    const avgRelevance = suggestions.reduce((sum, s) => sum + s.relevance, 0) / suggestions.length;

    logger.info('Smart suggestions generated', {
      convoId: request.convoId,
      userId,
      count: suggestions.length,
      avgRelevance,
    });

    return {
      success: true,
      suggestions,
      relevance: avgRelevance,
    };
  } catch (error) {
    logger.error('Failed to get smart suggestions', { error, userId, request });
    
    return {
      success: false,
      suggestions: [],
    };
  }
}

/**
 * Extract conversation topic (simple heuristic)
 */
function extractTopic(messages: string[]): string {
  // Simple keyword extraction
  const keywords = ['meet', 'park', 'playdate', 'walk', 'coffee', 'adoption'];
  const text = messages.join(' ').toLowerCase();
  
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  
  return 'general';
}

/**
 * Analyze sentiment (simple heuristic)
 */
function analyzeSentiment(messages: string[]): 'positive' | 'neutral' | 'negative' {
  const text = messages.join(' ').toLowerCase();
  const positiveWords = ['great', 'awesome', 'love', 'excited', 'happy', 'wonderful'];
  const negativeWords = ['sorry', 'unfortunately', 'disappointed', 'sad', 'bad'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

