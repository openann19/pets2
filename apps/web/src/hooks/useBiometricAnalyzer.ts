import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@pawfectmatch/core';
;
export const useBiometricAnalyzer = (config) => {
    const [biometricProfile, setBiometricProfile] = useState(new Map());
    const [currentSession, setCurrentSession] = useState({});
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const keystrokeBuffer = useRef([]);
    const pressureBuffer = useRef([]);
    const timingBuffer = useRef([]);
    // Track keystroke timing
    const trackKeystroke = useCallback((timestamp, pressure = 1) => {
        const now = Date.now();
        if (keystrokeBuffer.current.length > 0) {
            const interval = now - keystrokeBuffer.current[keystrokeBuffer.current.length - 1];
            timingBuffer.current.push(interval);
        }
        keystrokeBuffer.current.push(now);
        pressureBuffer.current.push(pressure);
        // Keep buffers within reasonable size
        if (keystrokeBuffer.current.length > 100) {
            keystrokeBuffer.current.shift();
            pressureBuffer.current.shift();
            timingBuffer.current.shift();
        }
    }, []);
    // Analyze typing rhythm
    const analyzeRhythm = useCallback((intervals) => {
        if (intervals.length < 2) {
            return {
                averageInterval: 0,
                variance: 0,
                consistencyScore: 0,
                neuralSync: 0,
            };
        }
        const sum = intervals.reduce((a, b) => a + b, 0);
        const average = sum / intervals.length;
        const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - average, 2), 0) / intervals.length;
        const standardDeviation = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 1 - (standardDeviation / average));
        // Neural sync based on rhythm consistency and biometric patterns
        const neuralSync = consistencyScore * config.sensitivity;
        return {
            averageInterval: average,
            variance,
            consistencyScore,
            neuralSync,
        };
    }, [config.sensitivity]);
    // Calculate typing speed (characters per minute)
    const calculateTypingSpeed = useCallback((keystrokes, timeWindow = 60000) => {
        if (keystrokes.length < 2)
            return 0;
        const startTime = keystrokes[0];
        const endTime = keystrokes[keystrokes.length - 1];
        const duration = endTime - startTime;
        if (duration === 0)
            return 0;
        const speed = (keystrokes.length / duration) * (timeWindow / 1000); // CPM
        return Math.min(speed, 1000); // Cap at 1000 CPM for sanity
    }, []);
    // Analyze pressure patterns
    const analyzePressure = useCallback((pressures) => {
        if (pressures.length === 0)
            return [];
        const average = pressures.reduce((a, b) => a + b, 0) / pressures.length;
        const variance = pressures.reduce((acc, p) => acc + Math.pow(p - average, 2), 0) / pressures.length;
        return [average, variance, Math.sqrt(variance)]; // mean, variance, std dev
    }, []);
    // Generate biometric signature
    const generateSignature = useCallback((data) => {
        const { typingSpeed, keystrokePattern, pressureData, rhythmAnalysis, neuralPattern, } = data;
        // Create a unique signature based on biometric data
        const signatureData = [
            typingSpeed.toFixed(2),
            keystrokePattern.slice(-10).join(','),
            pressureData.slice(-5).join(','),
            rhythmAnalysis.consistencyScore.toFixed(3),
            neuralPattern.cognitiveLoad.toFixed(2),
            neuralPattern.emotionalState.valence.toFixed(2),
        ].join('|');
        // Create hash-like signature
        let hash = 0;
        for (let i = 0; i < signatureData.length; i++) {
            const char = signatureData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    }, []);
    // Real-time biometric analysis
    const getCurrentBiometricData = useCallback(() => {
        if (keystrokeBuffer.current.length < 5)
            return null;
        const typingSpeed = calculateTypingSpeed(keystrokeBuffer.current);
        const rhythmAnalysis = analyzeRhythm(timingBuffer.current);
        const pressureStats = analyzePressure(pressureBuffer.current);
        return {
            typingSpeed,
            keystrokePattern: [...keystrokeBuffer.current],
            pressureData: pressureStats,
            rhythmAnalysis,
        };
    }, [calculateTypingSpeed, analyzeRhythm, analyzePressure]);
    // Adaptive threshold adjustment
    const adjustThresholds = useCallback(() => {
        if (!config.adaptiveThreshold)
            return;
        const history = analysisHistory.slice(-20); // Last 20 analyses
        if (history.length < 5)
            return;
        // Calculate average metrics from recent history
        const avgTypingSpeed = history.reduce((sum, h) => sum + h.typingSpeed, 0) / history.length;
        const avgConsistency = history.reduce((sum, h) => sum + h.rhythmAnalysis.consistencyScore, 0) / history.length;
        // Adjust sensitivity based on user patterns
        const newSensitivity = Math.max(0.1, Math.min(0.99, config.sensitivity + (avgConsistency - 0.7) * 0.1));
        // Update configuration would go here
        logger.info('Adaptive threshold adjusted:', { newSensitivity });
    }, [config, analysisHistory]);
    // Multi-modal analysis combining multiple biometric signals
    const multiModalAnalysis = useCallback((biometricData, neuralData) => {
        if (!config.multiModal)
            return { confidence: 0, risk: 0 };
        // Combine typing rhythm, pressure patterns, and neural signals
        const rhythmScore = biometricData.rhythmAnalysis.consistencyScore;
        const pressureStability = 1 - (biometricData.pressureData[1] || 0); // Lower variance = higher stability
        const neuralStability = neuralData.predictionAccuracy;
        const cognitiveLoad = neuralData.cognitiveLoad;
        // Calculate overall confidence
        const confidence = (rhythmScore * 0.4 + pressureStability * 0.3 + neuralStability * 0.3);
        // Calculate risk based on anomalies
        const typingAnomaly = Math.abs(biometricData.typingSpeed - 300) / 300; // Deviation from average typing speed
        const cognitiveAnomaly = Math.abs(cognitiveLoad - 0.5) / 0.5;
        const risk = Math.max(0, typingAnomaly * 0.6 + cognitiveAnomaly * 0.4);
        return { confidence, risk };
    }, [config.multiModal]);
    // Update analysis history
    useEffect(() => {
        const interval = setInterval(() => {
            const biometricData = getCurrentBiometricData();
            if (biometricData) {
                const analysis = {
                    timestamp: Date.now(),
                    ...biometricData,
                    analysisId: Math.random().toString(36).substr(2, 9),
                };
                setAnalysisHistory(prev => [...prev.slice(-99), analysis]); // Keep last 100
                setCurrentSession(analysis);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [getCurrentBiometricData]);
    // Adjust thresholds periodically
    useEffect(() => {
        const thresholdInterval = setInterval(adjustThresholds, 30000); // Every 30 seconds
        return () => clearInterval(thresholdInterval);
    }, [adjustThresholds]);
    return {
        trackKeystroke,
        getCurrentBiometricData,
        generateSignature,
        multiModalAnalysis,
        biometricProfile,
        currentSession,
        analysisHistory,
        keystrokeBuffer: keystrokeBuffer.current,
        timingBuffer: timingBuffer.current,
        pressureBuffer: pressureBuffer.current,
    };
};
//# sourceMappingURL=useBiometricAnalyzer.js.map