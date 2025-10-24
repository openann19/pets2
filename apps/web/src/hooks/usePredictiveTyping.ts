import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
export const usePredictiveTyping = (config) => {
    const [languageModel, setLanguageModel] = useState({
        vocabulary: new Map(),
        bigrams: new Map(),
        trigrams: new Map(),
        contextModel: new Map(),
        totalTokens: 0,
    });
    const [isLearning, setIsLearning] = useState(false);
    const [predictionCache, setPredictionCache] = useState(new Map());
    // Debounce refs for API protection
    const debounceTimeoutRef = useRef();
    const lastPredictionRef = useRef('');
    const debounceMs = config.debounceMs || 300; // Default 300ms debounce
    // Build language model from training data
    const buildLanguageModel = useCallback((trainingTexts) => {
        setIsLearning(true);
        const vocabulary = new Map();
        const bigrams = new Map();
        const trigrams = new Map();
        const contextModel = new Map();
        let totalTokens = 0;
        // Process each training text
        trainingTexts.forEach(text => {
            const tokens = tokenize(text);
            tokens.forEach((token, index) => {
                totalTokens++;
                // Update vocabulary
                vocabulary.set(token, (vocabulary.get(token) || 0) + 1);
                // Update bigrams
                if (index > 0) {
                    const bigram = `${tokens[index - 1]} ${token}`;
                    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
                }
                // Update trigrams
                if (index > 1) {
                    const trigram = `${tokens[index - 2]} ${tokens[index - 1]} ${token}`;
                    trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
                }
                // Update context model
                if (index > 0) {
                    const context = tokens[index - 1];
                    if (!contextModel.has(context)) {
                        contextModel.set(context, new Map());
                    }
                    const contextMap = contextModel.get(context);
                    contextMap.set(token, (contextMap.get(token) || 0) + 1);
                }
            });
        });
        setLanguageModel({
            vocabulary,
            bigrams,
            trigrams,
            contextModel,
            totalTokens,
        });
        setIsLearning(false);
    }, []);
    // Tokenize text into words and meaningful units
    const tokenize = useCallback((text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(token => token.length > 0)
            .slice(-config.contextWindow); // Keep only recent context
    }, [config.contextWindow]);
    // Calculate probability of a token given context
    const getTokenProbability = useCallback((token, context) => {
        if (context.length === 0) {
            return (languageModel.vocabulary.get(token) || 0) / languageModel.totalTokens;
        }
        const lastToken = context[context.length - 1];
        // Try trigram probability first
        if (context.length >= 2) {
            const trigram = `${context[context.length - 2]} ${lastToken} ${token}`;
            const trigramCount = languageModel.trigrams.get(trigram) || 0;
            const bigram = `${context[context.length - 2]} ${lastToken}`;
            const bigramCount = languageModel.bigrams.get(bigram) || 0;
            if (bigramCount > 0) {
                return trigramCount / bigramCount;
            }
        }
        // Fall back to bigram probability
        const bigram = `${lastToken} ${token}`;
        const bigramCount = languageModel.bigrams.get(bigram) || 0;
        if (bigramCount > 0) {
            const singleCount = languageModel.vocabulary.get(lastToken) || 0;
            return bigramCount / singleCount;
        }
        // Fall back to unigram probability
        return (languageModel.vocabulary.get(token) || 0) / languageModel.totalTokens;
    }, [languageModel]);
    // Internal prediction function (not debounced)
    const predictNextWordsInternal = useCallback((contextText, maxPredictions = 5) => {
        const cacheKey = `${contextText}-${maxPredictions}`;
        const cached = predictionCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const tokens = tokenize(contextText);
        const predictions = [];
        // Get all possible next tokens
        const context = tokens.slice(-2); // Use last 2 tokens as context
        const possibleTokens = new Set();
        // Add tokens from vocabulary
        languageModel.vocabulary.forEach((_, token) => possibleTokens.add(token));
        // Add tokens from context model
        if (context.length > 0) {
            const contextMap = languageModel.contextModel.get(context[context.length - 1]);
            if (contextMap) {
                contextMap.forEach((_, token) => possibleTokens.add(token));
            }
        }
        // Calculate probabilities for each possible token
        const tokenProbabilities = [];
        possibleTokens.forEach(token => {
            const probability = getTokenProbability(token, context);
            if (probability > 0) {
                tokenProbabilities.push({ token, probability });
            }
        });
        // Sort by probability and take top predictions
        tokenProbabilities
            .sort((a, b) => b.probability - a.probability)
            .slice(0, maxPredictions)
            .forEach(({ token, probability }) => {
            const confidence = Math.min(probability * 10, 1); // Scale to 0-1 confidence
            predictions.push({
                text: token,
                confidence,
                probability,
                context: context,
                metadata: {
                    tokens: [token],
                    logProbability: Math.log(probability),
                    entropy: -probability * Math.log(probability),
                },
            });
        });
        // Cache predictions
        setPredictionCache(prev => new Map(prev).set(cacheKey, predictions));
        return predictions;
    }, [tokenize, getTokenProbability, languageModel, predictionCache, config.contextWindow]);
    // Debounced prediction function to prevent API spam
    const predictNextWords = useCallback((contextText, maxPredictions = 5) => {
        return new Promise((resolve) => {
            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            // Check if this is the same prediction as last time
            if (lastPredictionRef.current === contextText) {
                resolve(predictNextWordsInternal(contextText, maxPredictions));
                return;
            }
            // Set new timeout for debounced prediction
            debounceTimeoutRef.current = setTimeout(() => {
                lastPredictionRef.current = contextText;
                const predictions = predictNextWordsInternal(contextText, maxPredictions);
                resolve(predictions);
            }, debounceMs);
        });
    }, [predictNextWordsInternal, debounceMs]);
    // Advanced prediction with beam search
    const predictNextSequence = useCallback((contextText, sequenceLength = 3) => {
        const tokens = tokenize(contextText);
        const context = tokens.slice(-2);
        let beams = [{ sequence: [], probability: 1, logProbability: 0 }];
        // Beam search for sequence prediction
        for (let step = 0; step < sequenceLength; step++) {
            const newBeams = [];
            beams.forEach(beam => {
                const currentContext = [...context, ...beam.sequence];
                const possibleTokens = new Set();
                languageModel.vocabulary.forEach((_, token) => possibleTokens.add(token));
                if (currentContext.length > 0) {
                    const contextMap = languageModel.contextModel.get(currentContext[currentContext.length - 1]);
                    if (contextMap) {
                        contextMap.forEach((_, token) => possibleTokens.add(token));
                    }
                }
                possibleTokens.forEach(token => {
                    const probability = getTokenProbability(token, currentContext);
                    if (probability > 0) {
                        const newSequence = [...beam.sequence, token];
                        const newProbability = beam.probability * probability;
                        const newLogProbability = beam.logProbability + Math.log(probability);
                        newBeams.push({
                            sequence: newSequence,
                            probability: newProbability,
                            logProbability: newLogProbability,
                        });
                    }
                });
            });
            // Keep top 5 beams
            beams = newBeams
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 5);
        }
        // Convert beams to prediction results
        return beams.map(beam => ({
            text: beam.sequence.join(' '),
            confidence: Math.min(beam.probability * 10, 1),
            probability: beam.probability,
            context,
            metadata: {
                tokens: beam.sequence,
                logProbability: beam.logProbability,
                entropy: -beam.sequence.reduce((entropy, token) => {
                    const prob = getTokenProbability(token, [...context, ...beam.sequence.slice(0, -1)]);
                    return entropy - prob * Math.log(prob);
                }, 0),
            },
        }));
    }, [tokenize, getTokenProbability, languageModel]);
    // Learn from user input in real-time
    const learnFromInput = useCallback((input) => {
        const tokens = tokenize(input);
        // Update language model with new tokens
        setLanguageModel(prev => {
            const newVocabulary = new Map(prev.vocabulary);
            const newBigrams = new Map(prev.bigrams);
            const newTrigrams = new Map(prev.trigrams);
            const newContextModel = new Map(prev.contextModel);
            tokens.forEach((token, index) => {
                // Update vocabulary
                newVocabulary.set(token, (newVocabulary.get(token) || 0) + 1);
                // Update bigrams
                if (index > 0) {
                    const bigram = `${tokens[index - 1]} ${token}`;
                    newBigrams.set(bigram, (newBigrams.get(bigram) || 0) + 1);
                }
                // Update trigrams
                if (index > 1) {
                    const trigram = `${tokens[index - 2]} ${tokens[index - 1]} ${token}`;
                    newTrigrams.set(trigram, (newTrigrams.get(trigram) || 0) + 1);
                }
                // Update context model
                if (index > 0) {
                    const context = tokens[index - 1];
                    if (!newContextModel.has(context)) {
                        newContextModel.set(context, new Map());
                    }
                    const contextMap = newContextModel.get(context);
                    contextMap.set(token, (contextMap.get(token) || 0) + 1);
                }
            });
            return {
                vocabulary: newVocabulary,
                bigrams: newBigrams,
                trigrams: newTrigrams,
                contextModel: newContextModel,
                totalTokens: prev.totalTokens + tokens.length,
            };
        });
    }, [tokenize]);
    // Get prediction confidence based on context
    const getPredictionConfidence = useCallback((contextText) => {
        const predictions = predictNextWords(contextText, 1);
        return predictions.length > 0 ? predictions[0].confidence : 0;
    }, [predictNextWords]);
    // Clear prediction cache
    const clearCache = useCallback(() => {
        setPredictionCache(new Map());
    }, []);
    return {
        predictNextWords,
        predictNextSequence,
        learnFromInput,
        getPredictionConfidence,
        clearCache,
        languageModel,
        isLearning,
        predictionCache: Array.from(predictionCache.entries()),
    };
};
//# sourceMappingURL=usePredictiveTyping.js.map