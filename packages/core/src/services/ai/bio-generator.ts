/**
 * 🎨 Bio Generator Service
 * AI-powered pet bio generation using Gemini
 */

import { _getGeminiClient } from './gemini-client';
import { logger } from '../../utils/logger';

export interface BioGenerationRequest {
  petName: string;
  species: string;
  breed?: string;
  age?: number;
  personality?: string[];
  keywords?: string[];
  tone?: 'playful' | 'professional' | 'friendly' | 'quirky';
  length?: 'short' | 'medium' | 'long';
}

export interface BioGenerationResponse {
  bio: string;
  suggestedTags: string[];
}

export class BioGeneratorService {
  /**
   * Generate pet bio using AI
   */
  async generateBio(request: BioGenerationRequest): Promise<BioGenerationResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const gemini = _getGeminiClient();
      const response = await gemini.generateContent(prompt);

      // Parse response
      const bio = this.extractBio(response);
      const suggestedTags = this.extractTags(response);

      return {
        bio,
        suggestedTags,
      };
    } catch (error) {
      logger.error('Bio generation error:', error);
      // Fallback to template-based bio
      return this.generateFallbackBio(request);
    }
  }

  /**
   * Build prompt for Gemini
   */
  private buildPrompt(request: BioGenerationRequest): string {
    const {
      petName,
      species,
      breed,
      age,
      personality = [],
      keywords = [],
      tone = 'friendly',
      length = 'medium',
    } = request;

    const lengthMap = {
      short: '50-75 words',
      medium: '100-150 words',
      long: '200-300 words',
    };

    let prompt = `Write a ${tone} and engaging bio for a pet with the following details:\n\n`;
    prompt += `Name: ${petName}\n`;
    prompt += `Species: ${species}\n`;
    if (breed != null && breed.length > 0) prompt += `Breed: ${breed}\n`;
    if (age != null && !isNaN(age) && age > 0) prompt += `Age: ${String(age)} years old\n`;
    if (personality.length > 0) prompt += `Personality: ${personality.join(', ')}\n`;
    if (keywords.length > 0) prompt += `Keywords to include: ${keywords.join(', ')}\n`;

    prompt += `\nRequirements:\n`;
    prompt += `- Length: ${lengthMap[length]}\n`;
    prompt += `- Tone: ${tone}\n`;
    prompt += `- Make it engaging and shareable\n`;
    prompt += `- Highlight unique qualities\n`;
    prompt += `- Include personality traits naturally\n`;
    prompt += `- End with a call to action\n\n`;

    prompt += `Also suggest 3-5 relevant hashtags/tags at the end after "TAGS:"\n`;

    return prompt;
  }

  /**
   * Extract bio from AI response
   */
  private extractBio(response: string): string {
    // Remove tags section
    const bioText = response.split('TAGS:')[0]?.trim();
    return bioText ?? '';
  }

  /**
   * Extract suggested tags from AI response
   */
  private extractTags(response: string): string[] {
    const tagsSection = response.split('TAGS:')[1];
    if (tagsSection == null || tagsSection.length === 0) return [];

    // Extract hashtags
    const matchResult = tagsSection.match(/#\w+/g);
    const tags = matchResult != null ? matchResult.map((tag) => tag.replace('#', '')) : [];

    return tags.slice(0, 5); // Max 5 tags
  }

  /**
   * Fallback bio generation without AI
   */
  private generateFallbackBio(request: BioGenerationRequest): BioGenerationResponse {
    const { petName, species, personality = [], age } = request;

    let bio = `Meet ${petName}, a wonderful ${age != null && !isNaN(age) ? `${String(age)}-year-old ` : ''}${species}! `;

    if (personality.length > 0) {
      bio += `${petName} is known for being ${personality.join(', ')}. `;
    }

    bio += `Looking for a loving home where ${petName} can thrive and bring joy every day!`;

    return {
      bio,
      suggestedTags: [species.toLowerCase(), 'adoption', 'pets', 'rescue'],
    };
  }
}

// Export singleton
export const _bioGeneratorService = new BioGeneratorService();
