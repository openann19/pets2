/**
 * 📊 ANALYSIS RESULTS SECTION
 * Displays photo analysis results from AIPhotoAnalyzerScreen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface PhotoAnalysisResult {
  breed_analysis?: {
    primary_breed?: string;
    confidence?: number;
    secondary_breeds?: Array<{ breed: string; confidence: number }>;
  };
  health_assessment?: {
    age_estimate?: number;
    health_score?: number;
    recommendations?: string[];
  };
  photo_quality?: {
    overall_score?: number;
    lighting_score?: number;
    composition_score?: number;
    clarity_score?: number;
  };
  matchability_score?: number;
  ai_insights?: string[];
}

interface AnalysisResultsSectionProps {
  result: PhotoAnalysisResult;
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
  };
}

export function AnalysisResultsSection({ result, colors }: AnalysisResultsSectionProps) {
  const renderBreedAnalysis = () => {
    if (!result.breed_analysis) return null;

    const { breed_analysis } = result;

    return (
      <View style={styles.resultCard}>
        <Text style={StyleSheet.flatten([styles.cardTitle, { color: colors.onSurface }])}>
          🧬 Breed Analysis
        </Text>
        {breed_analysis.primary_breed && (
          <View style={styles.resultItem}>
            <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
              Primary Breed:
            </Text>
            <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
              {breed_analysis.primary_breed} ({Math.round((breed_analysis.confidence || 0) * 100)}%
              confidence)
            </Text>
          </View>
        )}
        {breed_analysis.secondary_breeds && breed_analysis.secondary_breeds.length > 0 && (
          <View style={styles.secondaryBreeds}>
            <Text style={StyleSheet.flatten([styles.sectionLabel, { color: colors.onSurface }])}>
              Possible Mixed Breeds:
            </Text>
            {breed_analysis.secondary_breeds.map((breed, index) => (
              <Text
                key={index}
                style={StyleSheet.flatten([styles.resultValue, { color: colors.onMuted }])}
              >
                • {breed.breed} ({Math.round(breed.confidence * 100)}%)
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderHealthAssessment = () => {
    if (!result.health_assessment) return null;

    const { health_assessment } = result;

    return (
      <View style={styles.resultCard}>
        <Text style={StyleSheet.flatten([styles.cardTitle, { color: colors.onSurface }])}>
          🏥 Health Assessment
        </Text>
        {health_assessment.age_estimate && (
          <View style={styles.resultItem}>
            <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
              Estimated Age:
            </Text>
            <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
              {health_assessment.age_estimate} years
            </Text>
          </View>
        )}
        {health_assessment.health_score !== undefined && (
          <View style={styles.resultItem}>
            <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
              Health Score:
            </Text>
            <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
              {Math.round(health_assessment.health_score * 100)}/100
            </Text>
          </View>
        )}
        {health_assessment.recommendations && health_assessment.recommendations.length > 0 && (
          <View style={styles.recommendations}>
            <Text style={StyleSheet.flatten([styles.sectionLabel, { color: colors.onSurface }])}>
              Recommendations:
            </Text>
            {health_assessment.recommendations.map((rec, index) => (
              <Text
                key={index}
                style={StyleSheet.flatten([styles.resultValue, { color: colors.onMuted }])}
              >
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPhotoQuality = () => {
    if (!result.photo_quality) return null;

    const { photo_quality } = result;

    return (
      <View style={styles.resultCard}>
        <Text style={StyleSheet.flatten([styles.cardTitle, { color: colors.onSurface }])}>
          📸 Photo Quality Scores
        </Text>
        <View style={styles.resultItem}>
          <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
            Overall:
          </Text>
          <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
            {Math.round((photo_quality.overall_score || 0) * 100)}/100
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
            Lighting:
          </Text>
          <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
            {Math.round((photo_quality.lighting_score || 0) * 100)}/100
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
            Composition:
          </Text>
          <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
            {Math.round((photo_quality.composition_score || 0) * 100)}/100
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={StyleSheet.flatten([styles.resultLabel, { color: colors.onSurface }])}>
            Clarity:
          </Text>
          <Text style={StyleSheet.flatten([styles.resultValue, { color: colors.primary }])}>
            {Math.round((photo_quality.clarity_score || 0) * 100)}/100
          </Text>
        </View>
      </View>
    );
  };

  const renderMatchabilityScore = () => {
    if (result.matchability_score === undefined) return null;

    const score = Math.round(result.matchability_score * 100);
    const getScoreColor = () => {
      if (score >= 80) return '#4CAF50';
      if (score >= 60) return '#FF9800';
      return '#F44336';
    };

    return (
      <View style={styles.resultCard}>
        <Text style={StyleSheet.flatten([styles.cardTitle, { color: colors.onSurface }])}>
          💕 Matchability Score
        </Text>
        <Text style={StyleSheet.flatten([styles.score, { color: getScoreColor() }])}>
          {score}/100
        </Text>
        <Text
          style={StyleSheet.flatten([styles.scoreDescription, { color: colors.onMuted }])}
        >
          {score >= 80
            ? 'Excellent for matching!'
            : score >= 60
              ? 'Good matching potential'
              : 'Consider improving photos'}
        </Text>
      </View>
    );
  };

  const renderAIInsights = () => {
    if (!result.ai_insights || result.ai_insights.length === 0) return null;

    return (
      <View style={styles.resultCard}>
        <Text style={StyleSheet.flatten([styles.cardTitle, { color: colors.onSurface }])}>
          🤖 AI Insights
        </Text>
        {result.ai_insights.map((insight, index) => (
          <Text
            key={index}
            style={StyleSheet.flatten([styles.insight, { color: colors.onMuted }])}
          >
            • {insight}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {renderMatchabilityScore()}
      {renderBreedAnalysis()}
      {renderHealthAssessment()}
      {renderPhotoQuality()}
      {renderAIInsights()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  secondaryBreeds: {
    marginTop: 10,
  },
  recommendations: {
    marginTop: 15,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  insight: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
