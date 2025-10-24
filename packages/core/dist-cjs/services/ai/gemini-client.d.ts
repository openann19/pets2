/**
 * 🤖 Gemini AI Client
 * Integration with Google's Gemini API for AI features
 */
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
export declare class GeminiClient {
    private client;
    private apiKey;
    private model;
    constructor(config: GeminiConfig);
    /**
     * Generate content using Gemini API
     */
    generateContent(prompt: string): Promise<string>;
    /**
     * Analyze image using Gemini Vision
     */
    analyzeImage(imageUrl: string, prompt: string): Promise<string>;
    /**
     * Helper to convert image URL to base64
     */
    private imageToBase64;
}
export declare const initializeGemini: (config: GeminiConfig) => void;
export declare const _getGeminiClient: () => GeminiClient;
//# sourceMappingURL=gemini-client.d.ts.map