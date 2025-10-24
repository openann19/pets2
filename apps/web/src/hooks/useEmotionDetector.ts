import { useState, useEffect, useCallback, useMemo } from 'react'
import { logger } from '@pawfectmatch/core';
;
// Emotion lexicons
const emotionLexicons = {
    joy: ['happy', 'excited', 'delighted', 'cheerful', 'wonderful', 'fantastic', 'amazing', 'love', 'great', 'awesome'],
    sadness: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'disappointed', 'upset', 'sorrow', 'grief'],
    anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'rage', 'outraged', 'hostile'],
    fear: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'dread', 'horror'],
    surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'wow', 'omg', 'unexpected'],
    disgust: ['disgusted', 'revolted', 'nauseated', 'grossed', 'repulsed', 'sickened', 'appalled'],
    anticipation: ['excited', 'eager', 'hopeful', 'looking forward', 'anticipating', 'expectant'],
    trust: ['trust', 'confident', 'secure', 'safe', 'reliable', 'dependable', 'faithful'],
};
const intensityModifiers = {
    very: 1.5,
    extremely: 2.0,
    super: 1.8,
    really: 1.4,
    quite: 1.2,
    somewhat: 0.8,
    little: 0.6,
    slightly: 0.5,
};
export const useEmotionDetector = (config) => {
    const [emotionHistory, setEmotionHistory] = useState([]);
    const [currentContext, setCurrentContext] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Pre-trained emotion detection model
    const emotionModel = useMemo(() => {
        const model = new Map();
        // Load emotion lexicon scores
        Object.entries(emotionLexicons).forEach(([emotion, words]) => {
            words.forEach(word => {
                switch (emotion) {
                    case 'joy':
                        model.set(word, { valence: 0.8, arousal: 0.6, dominance: 0.5 });
                        break;
                    case 'sadness':
                        model.set(word, { valence: -0.7, arousal: 0.2, dominance: 0.2 });
                        break;
                    case 'anger':
                        model.set(word, { valence: -0.6, arousal: 0.8, dominance: 0.7 });
                        break;
                    case 'fear':
                        model.set(word, { valence: -0.5, arousal: 0.7, dominance: 0.1 });
                        break;
                    case 'surprise':
                        model.set(word, { valence: 0.2, arousal: 0.9, dominance: 0.3 });
                        break;
                    case 'disgust':
                        model.set(word, { valence: -0.8, arousal: 0.4, dominance: 0.3 });
                        break;
                    case 'anticipation':
                        model.set(word, { valence: 0.3, arousal: 0.5, dominance: 0.4 });
                        break;
                    case 'trust':
                        model.set(word, { valence: 0.6, arousal: 0.3, dominance: 0.6 });
                        break;
                }
            });
        });
        return model;
    }, []);
    // Analyze text for emotions
    const analyzeText = useCallback((text) => {
        if (!text.trim())
            return null;
        setIsAnalyzing(true);
        try {
            const words = text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 0);
            const detectedWords = [];
            const emotionalWords = [];
            let totalValence = 0;
            let totalArousal = 0;
            let totalDominance = 0;
            let emotionCount = 0;
            let maxIntensity = 0;
            const emotionScores = new Map();
            // Analyze each word
            words.forEach(word => {
                // Check for intensity modifiers
                let intensity = 1;
                let cleanWord = word;
                Object.entries(intensityModifiers).forEach(([modifier, multiplier]) => {
                    if (word.includes(modifier)) {
                        intensity = multiplier;
                        cleanWord = word.replace(modifier, '').trim();
                    }
                });
                // Check for negation
                if (words.includes('not') || words.includes('never') || words.includes('no')) {
                    intensity *= -1;
                }
                // Look up word in emotion model
                const emotionData = emotionModel.get(cleanWord) || emotionModel.get(word);
                if (emotionData) {
                    detectedWords.push(word);
                    emotionalWords.push(cleanWord);
                    const adjustedValence = emotionData.valence * intensity;
                    const adjustedArousal = emotionData.arousal * Math.abs(intensity);
                    const adjustedDominance = emotionData.dominance * intensity;
                    totalValence += adjustedValence;
                    totalArousal += adjustedArousal;
                    totalDominance += adjustedDominance;
                    emotionCount++;
                    maxIntensity = Math.max(maxIntensity, Math.abs(intensity));
                    // Track emotion scores for primary/secondary classification
                    Object.entries(emotionLexicons).forEach(([emotion, emotionWords]) => {
                        if (emotionWords.includes(cleanWord)) {
                            emotionScores.set(emotion, (emotionScores.get(emotion) || 0) + Math.abs(intensity));
                        }
                    });
                }
            });
            if (emotionCount === 0) {
                setIsAnalyzing(false);
                return null;
            }
            // Calculate averages
            const avgValence = totalValence / emotionCount;
            const avgArousal = totalArousal / emotionCount;
            const avgDominance = totalDominance / emotionCount;
            // Determine primary and secondary emotions
            const sortedEmotions = Array.from(emotionScores.entries())
                .sort(([, a], [, b]) => b - a);
            const primaryEmotion = sortedEmotions[0]?.[0] || 'neutral';
            const secondaryEmotions = sortedEmotions.slice(1, 3).map(([emotion]) => emotion);
            // Calculate confidence based on emotion count and intensity
            const confidence = Math.min(1, (emotionCount / words.length) * (maxIntensity * 0.5 + 0.5));
            // Calculate sentiment score (-1 to 1)
            const sentimentScore = avgValence;
            const result = {
                valence: Math.max(-1, Math.min(1, avgValence)),
                arousal: Math.max(0, Math.min(1, avgArousal)),
                dominance: Math.max(0, Math.min(1, avgDominance)),
                confidence,
                primaryEmotion,
                secondaryEmotions,
                intensity: Math.min(1, maxIntensity),
                metadata: {
                    detectedWords,
                    sentimentScore,
                    emotionalWords: emotionalWords.length,
                    totalWords: words.length,
                },
            };
            // Add to history
            setEmotionHistory(prev => [...prev.slice(-49), result]); // Keep last 50
            setIsAnalyzing(false);
            return result;
        }
        catch (error) {
            logger.error('Emotion analysis error:', { error });
            setIsAnalyzing(false);
            return null;
        }
    }, [emotionModel]);
    // Real-time emotion tracking
    const trackEmotion = useCallback((text) => {
        if (!config.realTime)
            return;
        const result = analyzeText(text);
        if (result) {
            setCurrentContext(prev => [...prev.slice(-4), text]); // Keep last 5 context items
        }
    }, [config.realTime, analyzeText]);
    // Context-aware emotion analysis
    const analyzeWithContext = useCallback((text) => {
        if (!config.contextAware) {
            return analyzeText(text);
        }
        const contextText = [...currentContext, text].join(' ');
        return analyzeText(contextText);
    }, [config.contextAware, currentContext, analyzeText]);
    // Get emotional state summary
    const getEmotionalState = useCallback(() => {
        if (emotionHistory.length === 0)
            return null;
        const recent = emotionHistory.slice(-5); // Last 5 analyses
        const avgValence = recent.reduce((sum, e) => sum + e.valence, 0) / recent.length;
        const avgArousal = recent.reduce((sum, e) => sum + e.arousal, 0) / recent.length;
        const avgDominance = recent.reduce((sum, e) => sum + e.dominance, 0) / recent.length;
        const avgConfidence = recent.reduce((sum, e) => sum + e.confidence, 0) / recent.length;
        return {
            valence: avgValence,
            arousal: avgArousal,
            dominance: avgDominance,
            confidence: avgConfidence,
        };
    }, [emotionHistory]);
    // Detect emotion patterns over time
    const detectEmotionPatterns = useCallback(() => {
        if (emotionHistory.length < 3)
            return null;
        const recent = emotionHistory.slice(-10);
        const patterns = {
            moodStability: 0,
            emotionalRange: 0,
            dominantEmotions: new Set(),
            intensityTrend: 0,
        };
        // Calculate mood stability (lower variance = more stable)
        const valences = recent.map(e => e.valence);
        const avgValence = valences.reduce((a, b) => a + b, 0) / valences.length;
        const valenceVariance = valences.reduce((acc, v) => acc + Math.pow(v - avgValence, 2), 0) / valences.length;
        patterns.moodStability = Math.max(0, 1 - valenceVariance);
        // Calculate emotional range
        const minValence = Math.min(...valences);
        const maxValence = Math.max(...valences);
        patterns.emotionalRange = maxValence - minValence;
        // Track dominant emotions
        recent.forEach(emotion => {
            patterns.dominantEmotions.add(emotion.primaryEmotion);
        });
        // Calculate intensity trend
        const intensities = recent.map(e => e.intensity);
        const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
        const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
        const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        patterns.intensityTrend = secondHalfAvg - firstHalfAvg;
        return patterns;
    }, [emotionHistory]);
    // Get emotion-based suggestions
    const getEmotionSuggestions = useCallback((emotion) => {
        const suggestions = [];
        if (emotion.valence < -0.3) {
            suggestions.push("Consider taking a break if you're feeling down");
            suggestions.push("Try doing something you enjoy to lift your mood");
        }
        if (emotion.arousal > 0.7) {
            suggestions.push("You seem quite excited! Channel that energy productively");
            suggestions.push("Take deep breaths to maintain focus");
        }
        if (emotion.confidence < 0.5) {
            suggestions.push("Your message seems hesitant - feel free to express yourself freely");
            suggestions.push("Take your time to articulate your thoughts clearly");
        }
        return suggestions;
    }, []);
    return {
        analyzeText,
        trackEmotion,
        analyzeWithContext,
        getEmotionalState,
        detectEmotionPatterns,
        getEmotionSuggestions,
        emotionHistory,
        currentContext,
        isAnalyzing,
        emotionModel: Object.fromEntries(emotionModel),
    };
};
//# sourceMappingURL=useEmotionDetector.js.map