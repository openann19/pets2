/**
 * CompatibilityResults Component
 * 
 * Displays AI compatibility analysis results in an organized format.
 * Shows score, breakdown, recommendations, and analysis text.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export interface AnalysisResult {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: {
    personality_compatibility: number;
    lifestyle_compatibility: number;
    activity_compatibility: number;
    social_compatibility: number;
    environment_compatibility: number;
  };
  recommendations: {
    meeting_suggestions: string[];
    activity_recommendations: string[];
    supervision_requirements: string[];
    success_probability: number;
  };
}

export interface CompatibilityResultsProps {
  result: AnalysisResult;
  getCompatibilityLabel: (score: number) => string;
}

export const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({
  result,
  getCompatibilityLabel,
}) => {
  const scorePercentage = Math.round(result.compatibility_score * 100);
  const label = getCompatibilityLabel(result.compatibility_score);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Compatibility Results</Text>
        
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{scorePercentage}/100</Text>
          <Text style={styles.scoreLabel}>{label}</Text>
        </View>

        {/* Analysis */}
        <Text style={styles.analysisText}>{result.ai_analysis}</Text>

        {/* Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>📊 Detailed Breakdown</Text>
          
          <BreakdownItem label="Personality" value={result.breakdown.personality_compatibility} />
          <BreakdownItem label="Lifestyle" value={result.breakdown.lifestyle_compatibility} />
          <BreakdownItem label="Activity Level" value={result.breakdown.activity_compatibility} />
          <BreakdownItem label="Social Behavior" value={result.breakdown.social_compatibility} />
          <BreakdownItem label="Environment" value={result.breakdown.environment_compatibility} />
        </View>

        {/* Recommendations */}
        <RecommendationsSection recommendations={result.recommendations} />
      </View>
    </ScrollView>
  );
};

interface BreakdownItemProps {
  label: string;
  value: number;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, value }) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={styles.breakdownValue}>{Math.round(value * 100)}%</Text>
  </View>
);

interface RecommendationsSectionProps {
  recommendations: AnalysisResult["recommendations"];
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
}) => (
  <View style={styles.recommendationsSection}>
    <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>
    
    {recommendations.meeting_suggestions?.length > 0 && (
      <RecommendationGroup
        title="🎯 Meeting Suggestions"
        items={recommendations.meeting_suggestions}
      />
    )}
    
    {recommendations.activity_recommendations?.length > 0 && (
      <RecommendationGroup
        title="🎾 Activity Recommendations"
        items={recommendations.activity_recommendations}
      />
    )}
    
    {recommendations.supervision_requirements?.length > 0 && (
      <RecommendationGroup
        title="⚠️ Supervision Requirements"
        items={recommendations.supervision_requirements}
      />
    )}
    
    <View style={styles.probabilityGroup}>
      <Text style={styles.probabilityLabel}>Success Probability:</Text>
      <Text style={styles.probabilityValue}>
        {Math.round(recommendations.success_probability * 100)}%
      </Text>
    </View>
  </View>
);

interface RecommendationGroupProps {
  title: string;
  items: string[];
}

const RecommendationGroup: React.FC<RecommendationGroupProps> = ({ title, items }) => (
  <View style={styles.recommendationGroup}>
    <Text style={styles.recommendationGroupTitle}>{title}</Text>
    {items.map((item, index) => (
      <Text key={index} style={styles.recommendationItem}>• {item}</Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    color: "#666",
  },
  analysisText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 24,
  },
  breakdownSection: {
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  recommendationGroup: {
    marginBottom: 16,
  },
  recommendationGroupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    marginBottom: 4,
  },
  probabilityGroup: {
    marginTop: 8,
  },
  probabilityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  probabilityValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 4,
  },
});

