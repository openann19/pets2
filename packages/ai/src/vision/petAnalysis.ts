/**
 * Computer Vision Pet Analysis for PawfectMatch
 * Real DeepSeek AI-powered photo analysis for breed identification and health assessment
 */


export interface PetPhotoAnalysisData {
  species: string;
  breed: string;
  confidence: number;
  age: number;
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    conditions: string[];
    recommendations: string[];
  };
  characteristics: {
    size: 'small' | 'medium' | 'large' | 'extra-large';
    color: string[];
    markings: string[];
    features: string[];
  };
  temperament: string[];
  quality: {
    photoScore: number;
    lighting: 'excellent' | 'good' | 'fair' | 'poor';
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface AnalysisResult {
  success: boolean;
  analysis?: PetPhotoAnalysisData;
  error?: string;
  processingTime: number;
}

/**
 * Real DeepSeek AI-Powered Pet Photo Analysis
 */
import type { DeepSeekResponse } from '../services/deepSeekService';
import { DeepSeekService } from '../services/deepSeekService';

export class PetPhotoAnalysis {
  private readonly deepSeekService: DeepSeekService;
  private isInitialized = false;

  constructor(deepSeekConfig: { apiKey: string; baseUrl?: string }) {
    this.deepSeekService = new DeepSeekService(deepSeekConfig);
    void this.initializeService();
  }

  /**
   * Initialize the DeepSeek service
   */
  private async initializeService(): Promise<void> {
    try {
      const isConnected = await this.deepSeekService.testConnection();
      this.isInitialized = isConnected;
      if (!isConnected) {
        // initialization attempt completed but service reported disconnected
        // handled by isInitialized flag
      }
    } catch (_error) {
      // Swallow error: initialization failures are reflected in isInitialized flag
      this.isInitialized = false;
    }
  }

  /**
   * Analyze a pet photo using DeepSeek AI
   */
  public async analyzePhoto(imageData: ImageData | string): Promise<AnalysisResult> {
    const startTime = Date.now();

    if (!this.isInitialized) {
      return {
        success: false,
        error: 'DeepSeek service not initialized',
        processingTime: Date.now() - startTime,
      };
    }

    try {
      // Convert image data to base64 if needed
      const base64Image = typeof imageData === 'string'
        ? imageData
        : this.imageDataToBase64(imageData);

      // Use DeepSeek AI for analysis
    const response = await this.deepSeekService.analyzePetPhoto(base64Image);
    const analysis = this.parseDeepSeekResponse(response);

      return {
        success: true,
        analysis,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Convert ImageData to base64 string
   */
  private imageDataToBase64(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx == null) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const parts = dataUrl.split(',');
    return parts[1] ?? '';
  }

  private parseDeepSeekResponse(response: DeepSeekResponse): PetPhotoAnalysisData {
    try {
      if (response.choices.length === 0 || response.choices[0] == null) {
        throw new Error('No choices in DeepSeek response');
      }
      const choice = response.choices[0];
      if (choice.message === undefined || choice.message.content === '') {
        throw new Error('Invalid DeepSeek response structure');
      }
      const content = choice.message.content;
      if (content === '') {
        throw new Error('Empty content in DeepSeek response');
      }

      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch !== null) {
        return JSON.parse(jsonMatch[0]) as PetPhotoAnalysisData;
      }

      // Fallback parsing
      return this.parseTextResponse(content);
    } catch (_error) {
      return this.getDefaultAnalysis();
    }
  }

  private parseTextResponse(content: string): PetPhotoAnalysisData {
    // Extract information from text response
    const speciesMatch = content.match(/species["\s]*:["\s]*([a-z]+)/i);
    const breedMatch = content.match(/breed["\s]*:["\s]*([^,}]+)/i);
    const confidenceMatch = content.match(/confidence["\s]*:["\s]*([0-9.]+)/i);

    return {
      species: speciesMatch !== null && speciesMatch[1] !== undefined ? speciesMatch[1] : 'unknown',
      breed: breedMatch !== null && breedMatch[1] !== undefined ? breedMatch[1].trim() : 'unknown',
      confidence: confidenceMatch !== null && confidenceMatch[1] !== undefined ? parseFloat(confidenceMatch[1]) : 0.5,
      age: 0,
      health: {
        overall: 'good',
        conditions: [],
        recommendations: [],
      },
      characteristics: {
        size: 'medium',
        color: [],
        markings: [],
        features: [],
      },
      temperament: [],
      quality: {
        photoScore: 0.7,
        lighting: 'good',
        clarity: 'good',
      },
    };
  }

  /**
   * Default analysis fallback
   */
  private getDefaultAnalysis(): PetPhotoAnalysisData {
    return {
      species: 'unknown',
      breed: 'unknown',
      confidence: 0.5,
      age: 0,
      health: {
        overall: 'good',
        conditions: [],
        recommendations: [],
      },
      characteristics: {
        size: 'medium',
        color: [],
        markings: [],
        features: [],
      },
      temperament: [],
      quality: {
        photoScore: 0.5,
        lighting: 'good',
        clarity: 'good',
      },
    };
  }

  /**
   * Test DeepSeek connection
   */
  public async testConnection(): Promise<boolean> {
    return await this.deepSeekService.testConnection();
  }

  /**
   * Get service status
   */
  public getStatus(): { initialized: boolean; deepSeekConnected: boolean } {
    return {
      initialized: this.isInitialized,
      deepSeekConnected: this.isInitialized,
    };
  }

  /**
   * Batch analyze multiple photos
   */
  public async analyzePhotos(photos: (ImageData | string)[]): Promise<AnalysisResult[]> {
    const results = await Promise.all(
      photos.map(photo => this.analyzePhoto(photo))
    );

    return results;
  }

  /**
   * Get analysis confidence threshold
   */
  public getConfidenceThreshold(): number {
    return 0.7; // 70% minimum confidence
  }

  /**
   * Check if analysis is reliable
   */
  public isAnalysisReliable(analysis: PetPhotoAnalysisData): boolean {
    return analysis.confidence >= this.getConfidenceThreshold() &&
      analysis.quality.photoScore >= 0.6;
  }
}

/**
 * Create pet photo analysis instance
 */
export function createPetPhotoAnalysis(deepSeekConfig: { apiKey: string; baseUrl?: string }): PetPhotoAnalysis {
  return new PetPhotoAnalysis(deepSeekConfig);
}
