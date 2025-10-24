/**
 * 📸 Photo Analyzer Service
 * AI-powered pet photo analysis using Gemini Vision
 */
export interface PhotoAnalysisRequest {
    photoUrl: string;
    petType?: string | undefined;
}
export interface PhotoAnalysisResult {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
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
export declare class PhotoAnalyzerService {
    /**
     * Analyze pet photo using AI
     */
    analyzePhoto(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResult>;
    /**
     * Analyze multiple photos and rank them
     */
    analyzeMultiplePhotos(photoUrls: string[], petType?: string): Promise<Array<PhotoAnalysisResult & {
        url: string;
    }>>;
    /**
     * Get best photo for profile
     */
    getBestProfilePhoto(photoUrls: string[], petType?: string): Promise<string>;
    /**
     * Build analysis prompt
     */
    private buildAnalysisPrompt;
    /**
     * Parse AI response into structured result
     */
    private parseAnalysisResponse;
    /**
     * Generate fallback analysis
     */
    private generateFallbackAnalysis;
}
export declare const _photoAnalyzerService: PhotoAnalyzerService;
//# sourceMappingURL=photo-analyzer.d.ts.map