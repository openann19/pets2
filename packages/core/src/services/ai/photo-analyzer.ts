/**
 * 📸 Photo Analyzer Service
 * AI-powered pet photo analysis using Gemini Vision
 */

import { _getGeminiClient } from './gemini-client';
import { logger } from '../../utils/logger';

export interface PhotoAnalysisRequest {
  photoUrl: string;
  petType?: string | undefined;
}

export interface PhotoAnalysisResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  suggestions: string[];
  detectedFeatures: {
    lighting: 'excellent' | 'good' | 'fair' | 'poor';
    framing: 'excellent' | 'good' | 'fair' | 'poor';
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
    background: 'clean' | 'busy' | 'distracting';
  };
  emotions: string[];
  bestFor: 'profile' | 'gallery' | 'background';
}

type RawPhotoAnalysisResponse = Record<string, unknown>;

export class PhotoAnalyzerService {
  /**
   * Analyze pet photo using AI
   */
  async analyzePhoto(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(request.petType);

    try {
      const gemini = _getGeminiClient();
      const response = await gemini.analyzeImage(request.photoUrl, prompt);

      return this.parseAnalysisResponse(response);
    } catch (error) {
      logger.error('Photo analysis error:', error);
      return this.generateFallbackAnalysis();
    }
  }

  /**
   * Analyze multiple photos and rank them
   */
  async analyzeMultiplePhotos(
    photoUrls: string[],
    petType?: string,
  ): Promise<Array<PhotoAnalysisResult & { url: string }>> {
    const analyses = await Promise.all(
      photoUrls.map(async (url) => {
        const result = await this.analyzePhoto({ photoUrl: url, petType: petType });
        return { ...result, url };
      }),
    );

    // Sort by score (best first)
    return analyses.sort((a, b) => b.score - a.score);
  }

  /**
   * Get best photo for profile
   */
  async getBestProfilePhoto(photoUrls: string[], petType?: string): Promise<string> {
    const petTypeParam = petType?.trim();
    const analyses = await this.analyzeMultiplePhotos(photoUrls, petTypeParam);
    const bestResult = analyses[0];
    if (bestResult?.url != null && bestResult.url !== '') {
      return bestResult.url;
    }

    const fallbackUrl = photoUrls[0];
    if (typeof fallbackUrl === 'string' && fallbackUrl !== '') {
      return fallbackUrl;
    }

    return '';
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(petType?: string): string {
    let prompt = 'Analyze this pet photo and provide:\n\n';
    prompt += '1. Overall quality rating (excellent/good/fair/poor)\n';
    prompt += '2. Technical quality scores for:\n';
    prompt += '   - Lighting quality\n';
    prompt += '   - Framing and composition\n';
    prompt += '   - Image clarity and focus\n';
    prompt += '   - Background (clean/busy/distracting)\n';
    prompt += '3. Detected emotions or expressions\n';
    prompt += '4. Suggestions for improvement\n';
    prompt += '5. Best use case (profile/gallery/background)\n\n';

    if (petType != null && petType.length > 0) {
      prompt += `The pet is a ${petType}.\n\n`;
    }

    prompt += 'Format response as JSON with this structure:\n';
    prompt += '{\n';
    prompt += '  "quality": "excellent|good|fair|poor",\n';
    prompt += '  "score": 0-100,\n';
    prompt += '  "lighting": "excellent|good|fair|poor",\n';
    prompt += '  "framing": "excellent|good|fair|poor",\n';
    prompt += '  "clarity": "excellent|good|fair|poor",\n';
    prompt += '  "background": "clean|busy|distracting",\n';
    prompt += '  "emotions": ["happy", "playful"],\n';
    prompt += '  "suggestions": ["tip1", "tip2"],\n';
    prompt += '  "bestFor": "profile|gallery|background"\n';
    prompt += '}';

    return prompt;
  }

  /**
   * Parse AI response into structured result
   */
  private parseAnalysisResponse(response: string): PhotoAnalysisResult {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch !== null) {
        const parsed = JSON.parse(jsonMatch[0]) as RawPhotoAnalysisResponse;
        return {
          quality:
            typeof parsed['quality'] === 'string' && parsed['quality'].length > 0
              ? (parsed['quality'] as PhotoAnalysisResult['quality'])
              : 'good',
          score:
            typeof parsed['score'] === 'number' && !isNaN(parsed['score']) ? parsed['score'] : 70,
          suggestions: Array.isArray(parsed['suggestions'])
            ? (parsed['suggestions'] as string[])
            : [],
          detectedFeatures: {
            lighting:
              typeof parsed['lighting'] === 'string' && parsed['lighting'].length > 0
                ? (parsed['lighting'] as PhotoAnalysisResult['detectedFeatures']['lighting'])
                : 'good',
            framing:
              typeof parsed['framing'] === 'string' && parsed['framing'].length > 0
                ? (parsed['framing'] as PhotoAnalysisResult['detectedFeatures']['framing'])
                : 'good',
            clarity:
              typeof parsed['clarity'] === 'string' && parsed['clarity'].length > 0
                ? (parsed['clarity'] as PhotoAnalysisResult['detectedFeatures']['clarity'])
                : 'good',
            background:
              typeof parsed['background'] === 'string' && parsed['background'].length > 0
                ? (parsed['background'] as PhotoAnalysisResult['detectedFeatures']['background'])
                : 'clean',
          },
          emotions: Array.isArray(parsed['emotions']) ? (parsed['emotions'] as string[]) : [],
          bestFor:
            typeof parsed['bestFor'] === 'string' && parsed['bestFor'].length > 0
              ? (parsed['bestFor'] as PhotoAnalysisResult['bestFor'])
              : 'gallery',
        };
      }
    } catch (error) {
      logger.error('Failed to parse analysis response:', error);
    }

    // Fallback parsing
    return this.generateFallbackAnalysis();
  }

  /**
   * Generate fallback analysis
   */
  private generateFallbackAnalysis(): PhotoAnalysisResult {
    return {
      quality: 'good',
      score: 75,
      suggestions: ['Try better lighting', 'Center the pet in frame'],
      detectedFeatures: {
        lighting: 'good',
        framing: 'good',
        clarity: 'good',
        background: 'clean',
      },
      emotions: ['happy', 'friendly'],
      bestFor: 'gallery',
    };
  }
}

// Export singleton
export const _photoAnalyzerService = new PhotoAnalyzerService();
