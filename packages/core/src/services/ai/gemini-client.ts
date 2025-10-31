/**
 * 🤖 Gemini AI Client
 * Integration with Google's Gemini API for AI features
 */

import axios, { type AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private model: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey.length > 0 ? config.apiKey : '';
    this.model = config.model != null && config.model.length > 0 ? config.model : 'gemini-pro';

    this.client = axios.create({
      baseURL:
        config.baseURL != null && config.baseURL.length > 0
          ? config.baseURL
          : 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.post<GeminiResponse>(
        `/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
      );

      const candidates = response.data.candidates;
      if (candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const candidate = candidates[0] as NonNullable<(typeof candidates)[0]>;

      const text = candidate.content.parts[0]?.text;
      if (text == null || text.length === 0) {
        throw new Error('No content generated');
      }

      return text;
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }

  /**
   * Analyze image using Gemini Vision
   */
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      const response = await this.client.post<GeminiResponse>(
        `/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: await this.imageToBase64(imageUrl),
                  },
                },
              ],
            },
          ],
        },
      );

      const candidates = response.data.candidates;
      if (candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const candidate = candidates[0] as NonNullable<(typeof candidates)[0]>;

      const text = candidate.content.parts[0]?.text;
      if (text == null || text.length === 0) {
        throw new Error('No analysis generated');
      }

      return text;
    } catch (error) {
      logger.error('Gemini Vision API error:', error);
      throw new Error('Failed to analyze image with Gemini');
    }
  }

  /**
   * Helper to convert image URL to base64
   */
  private async imageToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data as ArrayBuffer).toString('base64');
  }
}

// Export singleton instance
let geminiClient: GeminiClient | null = null;

export const initializeGemini = (config: GeminiConfig): void => {
  geminiClient = new GeminiClient(config);
};

export const _getGeminiClient = (): GeminiClient => {
  if (geminiClient === null) {
    throw new Error('Gemini client not initialized. Call initializeGemini first.');
  }
  return geminiClient;
};
