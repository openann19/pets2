interface NeuralNetworkConfig {
    layers: number[];
    activation: 'relu' | 'sigmoid' | 'tanh' | 'gelu' | 'silu';
    dropout: number;
    attentionHeads: number;
}
interface NeuralNetwork {
    layers: number[];
    weights: number[][][];
    biases: number[][];
    attentionHeads: number;
    activation: string;
    dropout: number;
}
export declare const useNeuralNetwork: (config: NeuralNetworkConfig) => {
    network: NeuralNetwork | null;
    isTraining: boolean;
    trainingProgress: number;
    forward: (input: number[]) => number[];
    analyzeComplexity: (text: string) => number;
    train: (trainingData: {
        input: string;
        target: number;
    }[]) => Promise<void>;
    extractTextFeatures: (text: string) => number[];
};
export {};
//# sourceMappingURL=useNeuralNetwork.d.ts.map