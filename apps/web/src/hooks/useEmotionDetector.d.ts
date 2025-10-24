interface EmotionDetectorConfig {
    model: 'basic-emotion' | 'advanced-emotion-v2' | 'advanced-emotion-v3';
    realTime: boolean;
    contextAware: boolean;
}
interface EmotionResult {
    valence: number;
    arousal: number;
    dominance: number;
    confidence: number;
    primaryEmotion: string;
    secondaryEmotions: string[];
    intensity: number;
    metadata: {
        detectedWords: string[];
        sentimentScore: number;
        emotionalWords: number;
        totalWords: number;
    };
}
interface EmotionalState {
    valence: number;
    arousal: number;
    dominance: number;
    confidence: number;
}
export declare const useEmotionDetector: (config: EmotionDetectorConfig) => {
    analyzeText: (text: string) => EmotionResult | null;
    trackEmotion: (text: string) => void;
    analyzeWithContext: (text: string) => EmotionResult | null;
    getEmotionalState: () => EmotionalState | null;
    detectEmotionPatterns: () => unknown;
    getEmotionSuggestions: (emotion: EmotionResult) => string[];
    emotionHistory: EmotionResult[];
    currentContext: string[];
    isAnalyzing: boolean;
    emotionModel: {
        [k: string]: {
            valence: number;
            arousal: number;
            dominance: number;
        };
    };
};
export {};
//# sourceMappingURL=useEmotionDetector.d.ts.map