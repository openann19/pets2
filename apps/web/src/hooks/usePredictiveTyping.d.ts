interface PredictiveTypingConfig {
    contextWindow: number;
    predictionDepth: number;
    confidenceThreshold: number;
    debounceMs?: number;
}
interface PredictionResult {
    text: string;
    confidence: number;
    probability: number;
    context: string[];
    metadata: {
        tokens: string[];
        logProbability: number;
        entropy: number;
    };
}
interface LanguageModel {
    vocabulary: Map<string, number>;
    bigrams: Map<string, number>;
    trigrams: Map<string, number>;
    contextModel: Map<string, Map<string, number>>;
    totalTokens: number;
}
export declare const usePredictiveTyping: (config: PredictiveTypingConfig) => {
    predictNextWords: (contextText: string, maxPredictions?: number) => Promise<PredictionResult[]>;
    predictNextSequence: (contextText: string, sequenceLength?: number) => PredictionResult[];
    learnFromInput: (input: string) => void;
    getPredictionConfidence: (contextText: string) => number;
    clearCache: () => void;
    languageModel: LanguageModel;
    isLearning: boolean;
    predictionCache: [string, PredictionResult[]][];
};
export {};
//# sourceMappingURL=usePredictiveTyping.d.ts.map