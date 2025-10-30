/**
 * 🎯 ANALYSIS RESULTS SECTION
 * Extracted from AICompatibilityScreen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Breakdown {
  personality_compatibility: number;
  lifestyle_compatibility: number;
  activity_compatibility: number;
  social_compatibility: number;
  environment_compatibility: number;
}

interface CompatibilityResult {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: Breakdown;
  recommendations: {
    meeting_suggestions: string[];
    activity_recommendations: string[];
    supervision_requirements: string[];
    success_probability: number;
  };
}

interface AnalysisResultsSectionProps {
  compatibilityResult: CompatibilityResult;
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
  };
  onReset: () => void;
}

export function AnalysisResultsSection({
  compatibilityResult,
  colors,
  onReset,
}: AnalysisResultsSectionProps) {
  const renderCompatibilityScore = () => {
    const score = Math.round(compatibilityResult.compatibility_score);
    const getScoreColor = (score: number) => {
      if (score >= 80) return '#4CAF50';
      if (score >= 60) return '#FF9800';
      return '#F44336';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Excellent Match!';
      if (score >= 60) return 'Good Compatibility';
      if (score >= 40) return 'Moderate Compatibility';
      return 'Low Compatibility';
    };

    return (
      <View style={styles.scoreSection}>
        <Text style={StyleSheet.flatten([styles.sectionTitle, { color: colors.onSurface }])}>
          💕 Compatibility Score
        </Text>

        <View style={styles.scoreCard}>
          <Text style={StyleSheet.flatten([styles.scoreValue, { color: getScoreColor(score) }])}>
            {score}/100
          </Text>
          <Text style={StyleSheet.flatten([styles.scoreLabel, { color: getScoreColor(score) }])}>
            {getScoreLabel(score)}
          </Text>
          <Text style={StyleSheet.flatten([styles.scoreDescription, { color: colors.onMuted }])}>
            {compatibilityResult.ai_analysis}
          </Text>
        </View>
      </View>
    );
  };

  const renderBreakdown = () => {
    const breakdown = compatibilityResult.breakdown;
    const categories = [
      { key: 'personality_compatibility', label: 'Personality', icon: '😊' },
      { key: 'lifestyle_compatibility', label: 'Lifestyle', icon: '🏠' },
      { key: 'activity_compatibility', label: 'Activity Level', icon: '⚡' },
      { key: 'social_compatibility', label: 'Social Behavior', icon: '👥' },
      { key: 'environment_compatibility', label: 'Environment', icon: '🌍' },
    ];

    return (
      <View style={styles.breakdownSection}>
        <Text style={StyleSheet.flatten([styles.sectionTitle, { color: colors.onSurface }])}>
          📊 Detailed Breakdown
        </Text>

        <View style={styles.breakdownCard}>
          {categories.map((category) => {
            const score = Math.round((breakdown as any)[category.key] * 100);
            const getBarColor = (score: number) => {
              if (score >= 80) return '#4CAF50';
              if (score >= 60) return '#FF9800';
              return '#F44336';
            };

            return (
              <View
                key={category.key}
                style={styles.breakdownItem}
              >
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownIcon}>{category.icon}</Text>
                  <Text
                    style={StyleSheet.flatten([styles.breakdownLabel, { color: colors.onSurface }])}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.breakdownScore,
                      { color: getBarColor(score) },
                    ])}
                  >
                    {score}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={StyleSheet.flatten([
                      styles.progressFill,
                      {
                        width: `${score}%`,
                        backgroundColor: getBarColor(score),
                      },
                    ])}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    const { recommendations } = compatibilityResult;

    return (
      <View style={styles.recommendationsSection}>
        <Text style={StyleSheet.flatten([styles.sectionTitle, { color: colors.onSurface }])}>
          💡 Recommendations
        </Text>

        <View style={styles.recommendationsCard}>
          {recommendations.meeting_suggestions.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text
                style={StyleSheet.flatten([
                  styles.recommendationTitle,
                  { color: colors.onSurface },
                ])}
              >
                🎯 Meeting Suggestions
              </Text>
              {recommendations.meeting_suggestions.map((suggestion, index) => (
                <Text
                  key={index}
                  style={StyleSheet.flatten([styles.recommendation, { color: colors.onMuted }])}
                >
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}

          {recommendations.activity_recommendations.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text
                style={StyleSheet.flatten([
                  styles.recommendationTitle,
                  { color: colors.onSurface },
                ])}
              >
                🎾 Activity Recommendations
              </Text>
              {recommendations.activity_recommendations.map((activity, index) => (
                <Text
                  key={index}
                  style={StyleSheet.flatten([styles.recommendation, { color: colors.onMuted }])}
                >
                  • {activity}
                </Text>
              ))}
            </View>
          )}

          {recommendations.supervision_requirements.length > 0 && (
            <View style={styles.recommendationGroup}>
              <Text
                style={StyleSheet.flatten([
                  styles.recommendationTitle,
                  { color: colors.onSurface },
                ])}
              >
                ⚠️ Supervision Requirements
              </Text>
              {recommendations.supervision_requirements.map((requirement, index) => (
                <Text
                  key={index}
                  style={StyleSheet.flatten([styles.recommendation, { color: colors.onMuted }])}
                >
                  • {requirement}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.successProbability}>
            <Text style={StyleSheet.flatten([styles.successLabel, { color: colors.onSurface }])}>
              Success Probability:
            </Text>
            <Text style={StyleSheet.flatten([styles.successValue, { color: colors.primary }])}>
              {Math.round(recommendations.success_probability * 100)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <Text style={StyleSheet.flatten([styles.resultsTitle, { color: colors.onSurface }])}>
          🎯 Compatibility Results
        </Text>
        <TouchableOpacity
          style={styles.resetButton}
          testID="AnalysisResultsSection-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={onReset}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={colors.primary}
          />
          <Text style={StyleSheet.flatten([styles.resetButtonText, { color: colors.primary }])}>
            New Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {renderCompatibilityScore()}
      {renderBreakdown()}
      {renderRecommendations()}
    </View>
  );
}

const styles = StyleSheet.create({
  resultsSection: {
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  scoreSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreCard: {
    backgroundColor: '#f8f9fa',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  breakdownSection: {
    marginBottom: 25,
  },
  breakdownCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  breakdownLabel: {
    fontSize: 16,
    flex: 1,
  },
  breakdownScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsSection: {
    marginBottom: 25,
  },
  recommendationsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  recommendationGroup: {
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  successProbability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  successLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
