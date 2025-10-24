interface BiometricAnalyzerConfig {
    sensitivity: number;
    adaptiveThreshold: boolean;
    multiModal: boolean;
}
interface BiometricData {
    typingSpeed: number;
    keystrokePattern: number[];
    pressureData: number[];
    rhythmAnalysis: RhythmMetrics;
}
interface RhythmMetrics {
    averageInterval: number;
    variance: number;
    consistencyScore: number;
    neuralSync: number;
}
interface NeuralPattern {
    cognitiveLoad: number;
    emotionalState: EmotionalState;
    typingComplexity: number;
    predictionAccuracy: number;
}
interface EmotionalState {
    valence: number;
    arousal: number;
    dominance: number;
    confidence: number;
}
interface SignatureData {
    typingSpeed: number;
    keystrokePattern: number[];
    pressureData: number[];
    rhythmAnalysis: RhythmMetrics;
    neuralPattern: NeuralPattern;
}
export declare const useBiometricAnalyzer: (config: BiometricAnalyzerConfig) => {
    trackKeystroke: (timestamp: number, pressure?: number) => void;
    getCurrentBiometricData: () => BiometricData | null;
    generateSignature: (data: SignatureData) => string;
    multiModalAnalysis: (biometricData: BiometricData, neuralData: NeuralPattern) => {
        confidence: number;
        risk: number;
    };
    biometricProfile: Map<string, any>;
    currentSession: any;
    analysisHistory: any[];
    keystrokeBuffer: number[];
    timingBuffer: number[];
    pressureBuffer: number[];
};
export {};
//# sourceMappingURL=useBiometricAnalyzer.d.ts.map