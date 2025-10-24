/**
 * 🎨 Bio Generator Service
 * AI-powered pet bio generation using Gemini
 */
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
export declare class BioGeneratorService {
    /**
     * Generate pet bio using AI
     */
    generateBio(request: BioGenerationRequest): Promise<BioGenerationResponse>;
    /**
     * Build prompt for Gemini
     */
    private buildPrompt;
    /**
     * Extract bio from AI response
     */
    private extractBio;
    /**
     * Extract suggested tags from AI response
     */
    private extractTags;
    /**
     * Fallback bio generation without AI
     */
    private generateFallbackBio;
}
export declare const _bioGeneratorService: BioGeneratorService;
//# sourceMappingURL=bio-generator.d.ts.map