"use strict";
/**
 * 📸 Photo Analyzer Service
 * AI-powered pet photo analysis using Gemini Vision
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._photoAnalyzerService = exports.PhotoAnalyzerService = void 0;
const gemini_client_1 = require("./gemini-client");
class PhotoAnalyzerService {
    /**
     * Analyze pet photo using AI
     */
    async analyzePhoto(request) {
        const prompt = this.buildAnalysisPrompt(request.petType);
        try {
            const gemini = (0, gemini_client_1._getGeminiClient)();
            const response = await gemini.analyzeImage(request.photoUrl, prompt);
            return this.parseAnalysisResponse(response);
        }
        catch (error) {
            console.error('Photo analysis error:', error);
            return this.generateFallbackAnalysis();
        }
    }
    /**
     * Analyze multiple photos and rank them
     */
    async analyzeMultiplePhotos(photoUrls, petType) {
        const analyses = await Promise.all(photoUrls.map(async (url) => {
            const result = await this.analyzePhoto({ photoUrl: url, petType: petType });
            return { ...result, url };
        }));
        // Sort by score (best first)
        return analyses.sort((a, b) => b.score - a.score);
    }
    /**
     * Get best photo for profile
     */
    async getBestProfilePhoto(photoUrls, petType) {
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
    buildAnalysisPrompt(petType) {
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
    parseAnalysisResponse(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch !== null) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    quality: (typeof parsed['quality'] === 'string' && parsed['quality'].length > 0) ? parsed['quality'] : 'good',
                    score: (typeof parsed['score'] === 'number' && !isNaN(parsed['score'])) ? parsed['score'] : 70,
                    suggestions: Array.isArray(parsed['suggestions']) ? parsed['suggestions'] : [],
                    detectedFeatures: {
                        lighting: (typeof parsed['lighting'] === 'string' && parsed['lighting'].length > 0) ? parsed['lighting'] : 'good',
                        framing: (typeof parsed['framing'] === 'string' && parsed['framing'].length > 0) ? parsed['framing'] : 'good',
                        clarity: (typeof parsed['clarity'] === 'string' && parsed['clarity'].length > 0) ? parsed['clarity'] : 'good',
                        background: (typeof parsed['background'] === 'string' && parsed['background'].length > 0) ? parsed['background'] : 'clean',
                    },
                    emotions: Array.isArray(parsed['emotions']) ? parsed['emotions'] : [],
                    bestFor: (typeof parsed['bestFor'] === 'string' && parsed['bestFor'].length > 0) ? parsed['bestFor'] : 'gallery',
                };
            }
        }
        catch (error) {
            console.error('Failed to parse analysis response:', error);
        }
        // Fallback parsing
        return this.generateFallbackAnalysis();
    }
    /**
     * Generate fallback analysis
     */
    generateFallbackAnalysis() {
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
exports.PhotoAnalyzerService = PhotoAnalyzerService;
// Export singleton
exports._photoAnalyzerService = new PhotoAnalyzerService();
