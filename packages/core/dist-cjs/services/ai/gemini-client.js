"use strict";
/**
 * 🤖 Gemini AI Client
 * Integration with Google's Gemini API for AI features
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getGeminiClient = exports.initializeGemini = exports.GeminiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class GeminiClient {
    client;
    apiKey;
    model;
    constructor(config) {
        this.apiKey = config.apiKey.length > 0 ? config.apiKey : '';
        this.model = config.model != null && config.model.length > 0 ? config.model : 'gemini-pro';
        this.client = axios_1.default.create({
            baseURL: config.baseURL != null && config.baseURL.length > 0 ? config.baseURL : 'https://generativelanguage.googleapis.com/v1beta',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Generate content using Gemini API
     */
    async generateContent(prompt) {
        try {
            const response = await this.client.post(`/models/${this.model}:generateContent?key=${this.apiKey}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            });
            const candidates = response.data.candidates;
            if (candidates.length === 0) {
                throw new Error('No candidates in response');
            }
            const candidate = candidates[0];
            const text = candidate.content.parts[0]?.text;
            if (text == null || text.length === 0) {
                throw new Error('No content generated');
            }
            return text;
        }
        catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate content with Gemini');
        }
    }
    /**
     * Analyze image using Gemini Vision
     */
    async analyzeImage(imageUrl, prompt) {
        try {
            const response = await this.client.post(`/models/gemini-pro-vision:generateContent?key=${this.apiKey}`, {
                contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: await this.imageToBase64(imageUrl)
                                }
                            }
                        ]
                    }]
            });
            const candidates = response.data.candidates;
            if (candidates.length === 0) {
                throw new Error('No candidates in response');
            }
            const candidate = candidates[0];
            const text = candidate.content.parts[0]?.text;
            if (text == null || text.length === 0) {
                throw new Error('No analysis generated');
            }
            return text;
        }
        catch (error) {
            console.error('Gemini Vision API error:', error);
            throw new Error('Failed to analyze image with Gemini');
        }
    }
    /**
     * Helper to convert image URL to base64
     */
    async imageToBase64(url) {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    }
}
exports.GeminiClient = GeminiClient;
// Export singleton instance
let geminiClient = null;
const initializeGemini = (config) => {
    geminiClient = new GeminiClient(config);
};
exports.initializeGemini = initializeGemini;
const _getGeminiClient = () => {
    if (geminiClient === null) {
        throw new Error('Gemini client not initialized. Call initializeGemini first.');
    }
    return geminiClient;
};
exports._getGeminiClient = _getGeminiClient;
//# sourceMappingURL=gemini-client.js.map