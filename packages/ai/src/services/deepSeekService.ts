/**
 * DeepSeek AI Service Integration for PawfectMatch
 * Real AI-powered pet analysis and matching using DeepSeek API
 */

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * DeepSeek AI Service for Pet Analysis
 */
export class DeepSeekService {
  private config: DeepSeekConfig;
  private baseUrl: string;

  constructor(config: DeepSeekConfig) {
    this.config = {
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
    this.baseUrl = this.config.baseUrl ?? 'https://api.deepseek.com/v1';
  }

  /**
   * Analyze pet photo using DeepSeek Vision
   */
  public async analyzePetPhoto(imageBase64: string, prompt?: string): Promise<DeepSeekResponse> {
    const defaultPrompt = `
    Analyze this pet photo and provide detailed information in JSON format:
    {
      "species": "dog|cat|bird|fish|reptile|other",
      "breed": "specific breed name",
      "confidence": 0.0-1.0,
      "age": "estimated age range",
      "health": {
        "overall": "excellent|good|fair|poor",
        "conditions": ["list of visible conditions"],
        "recommendations": ["care recommendations"]
      },
      "characteristics": {
        "size": "small|medium|large|extra-large",
        "color": ["primary colors"],
        "markings": ["distinctive markings"],
        "features": ["notable features"]
      },
      "temperament": ["observable temperament traits"],
      "quality": {
        "photoScore": 0.0-1.0,
        "lighting": "excellent|good|fair|poor",
        "clarity": "excellent|good|fair|poor"
      }
    }
    `;

    const response = await this.makeRequest<DeepSeekResponse>('/chat/completions', {
      model: 'deepseek-vision',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt ?? defaultPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response;
  }

  /**
   * Generate pet compatibility analysis
   */
  public async analyzeCompatibility(
    pet1: unknown,
    pet2: unknown,
    userPreferences: unknown,
  ): Promise<DeepSeekResponse> {
    const prompt = `
    Analyze the compatibility between these two pets and provide a detailed assessment:

    Pet 1: ${JSON.stringify(pet1, null, 2)}
    Pet 2: ${JSON.stringify(pet2, null, 2)}
    User Preferences: ${JSON.stringify(userPreferences, null, 2)}

    Provide a comprehensive compatibility analysis in JSON format:
    {
      "compatibilityScore": 0-100,
      "breakdown": {
        "species": 0-100,
        "breed": 0-100,
        "age": 0-100,
        "temperament": 0-100,
        "activity": 0-100,
        "lifestyle": 0-100
      },
      "reasons": ["positive compatibility factors"],
      "concerns": ["potential issues"],
      "recommendations": ["care and management suggestions"]
    }
    `;

    const response = await this.makeRequest<DeepSeekResponse>('/chat/completions', {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response;
  }

  /**
   * Generate pet bio using AI
   */
  public async generatePetBio(petData: unknown): Promise<DeepSeekResponse> {
    const prompt = `
    Create an engaging, personality-driven bio for this pet:

    Pet Data: ${JSON.stringify(petData, null, 2)}

    Write a bio that:
    - Highlights the pet's unique personality
    - Mentions their favorite activities
    - Includes their ideal home environment
    - Shows their charming quirks
    - Is 2-3 sentences long
    - Is warm and inviting

    Return only the bio text, no additional formatting.
    `;

    const response = await this.makeRequest<DeepSeekResponse>('/chat/completions', {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response;
  }

  /**
   * Analyze pet behavior patterns
   */
  public async analyzeBehavior(behaviorData: unknown, context: string): Promise<DeepSeekResponse> {
    const prompt = `
    Analyze this pet's behavior patterns and provide insights:

    Behavior Data: ${JSON.stringify(behaviorData, null, 2)}
    Context: ${context}

    Provide analysis in JSON format:
    {
      "behaviorType": "playful|calm|energetic|shy|aggressive|friendly",
      "energyLevel": 1-10,
      "socialTendency": "high|medium|low",
      "trainingPotential": "high|medium|low",
      "recommendations": ["behavioral recommendations"],
      "redFlags": ["concerning behaviors"],
      "positiveTraits": ["admirable behaviors"]
    }
    `;

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response as DeepSeekResponse;
  }

  /**
   * Make HTTP request to DeepSeek API
   */
  private async makeRequest<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as DeepSeekError;
      throw new Error(`DeepSeek API Error: ${errorData.error.message}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Test API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.',
          },
        ],
        max_tokens: 10,
      });

      const result = response as DeepSeekResponse;
      return Array.isArray(result.choices) && result.choices.length > 0;
    } catch (_error) {
      // Surface as boolean false without logging to console
      return false;
    }
  }

  /**
   * Get API usage statistics
   */
  public async getUsageStats(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/usage`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage stats: ${response.statusText}`);
    }

    return (await response.json()) as unknown;
  }
}

/**
 * Create DeepSeek service instance
 */
export function createDeepSeekService(config: DeepSeekConfig): DeepSeekService {
  return new DeepSeekService(config);
}
