/**
 * CompatibilityResults Component
 *
 * Displays AI compatibility analysis results in an organized format.
 * Shows score, breakdown, recommendations, and analysis text.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

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

const createStyles = (theme: AppTheme) => {
  const { spacing, radii, colors, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: radii.lg,
      marginBottom: spacing.lg,
      gap: spacing.lg,
      ...theme.shadows.elevation2,
    },
    title: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.onSurface,
    },
    scoreContainer: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    scoreValue: {
      fontSize: typography.h1.size,
      fontWeight: '700',
    },
    scoreLabel: {
      fontSize: typography.body.size,
      color: colors.onMuted,
    },
    analysisText: {
      fontSize: typography.body.size,
      color: colors.onSurface,
      lineHeight: typography.body.lineHeight,
    },
    breakdownSection: {
      gap: spacing.sm,
    },
    breakdownTitle: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.onSurface,
    },
    breakdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    breakdownLabel: {
      fontSize: typography.body.size,
      textTransform: 'capitalize',
      color: colors.onMuted,
    },
    breakdownValue: {
      fontSize: typography.body.size,
      fontWeight: '600',
      color: colors.onSurface,
    },
    recommendationsSection: {
      gap: spacing.md,
    },
    recommendationsTitle: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.onSurface,
    },
    recommendationGroup: {
      gap: spacing.xs,
    },
    recommendationGroupTitle: {
      fontSize: typography.body.size,
      fontWeight: '600',
      color: colors.onSurface,
    },
    recommendationItem: {
      fontSize: typography.body.size,
      color: colors.onMuted,
      marginLeft: spacing.xs,
    },
    probabilityGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    probabilityLabel: {
      fontSize: typography.body.size,
      fontWeight: '600',
      color: colors.onSurface,
    },
    probabilityValue: {
      fontSize: typography.h2.size,
      fontWeight: '700',
      color: colors.primary,
    },
  });
};

export const CompatibilityResults: React.FC<CompatibilityResultsProps> = ({
  result,
  getCompatibilityLabel,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  const scorePercentage = Math.round(result.compatibility_score * 100);
  const label = getCompatibilityLabel(result.compatibility_score);
  const scoreTone =
    scorePercentage >= 80 ? colors.success : scorePercentage >= 60 ? colors.warning : colors.danger;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Compatibility Results</Text>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: scoreTone }]}>{scorePercentage}/100</Text>
          <Text style={styles.scoreLabel}>{label}</Text>
        </View>

        <Text style={styles.analysisText}>{result.ai_analysis}</Text>

        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>📊 Detailed Breakdown</Text>

          <BreakdownItem
            label="Personality"
            value={result.breakdown.personality_compatibility}
            styles={styles}
          />
          <BreakdownItem
            label="Lifestyle"
            value={result.breakdown.lifestyle_compatibility}
            styles={styles}
          />
          <BreakdownItem
            label="Activity Level"
            value={result.breakdown.activity_compatibility}
            styles={styles}
          />
          <BreakdownItem
            label="Social Behavior"
            value={result.breakdown.social_compatibility}
            styles={styles}
          />
          <BreakdownItem
            label="Environment"
            value={result.breakdown.environment_compatibility}
            styles={styles}
          />
        </View>

        <RecommendationsSection
          recommendations={result.recommendations}
          styles={styles}
        />
      </View>
    </ScrollView>
  );
};

type BreakdownItemProps = {
  label: string;
  value: number;
  styles: ReturnType<typeof createStyles>;
};

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, value, styles }) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={styles.breakdownValue}>{Math.round(value * 100)}%</Text>
  </View>
);

type RecommendationsSectionProps = {
  recommendations: AnalysisResult['recommendations'];
  styles: ReturnType<typeof createStyles>;
};

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  styles,
}) => (
  <View style={styles.recommendationsSection}>
    <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>

    {recommendations.meeting_suggestions?.length > 0 && (
      <RecommendationGroup
        title="🎯 Meeting Suggestions"
        items={recommendations.meeting_suggestions}
        styles={styles}
      />
    )}

    {recommendations.activity_recommendations?.length > 0 && (
      <RecommendationGroup
        title="🎾 Activity Recommendations"
        items={recommendations.activity_recommendations}
        styles={styles}
      />
    )}

    {recommendations.supervision_requirements?.length > 0 && (
      <RecommendationGroup
        title="⚠️ Supervision Requirements"
        items={recommendations.supervision_requirements}
        styles={styles}
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

type RecommendationGroupProps = {
  title: string;
  items: string[];
  styles: ReturnType<typeof createStyles>;
};

const RecommendationGroup: React.FC<RecommendationGroupProps> = ({ title, items, styles }) => (
  <View style={styles.recommendationGroup}>
    <Text style={styles.recommendationGroupTitle}>{title}</Text>
    {items.map((item, index) => (
      <Text
        key={index}
        style={styles.recommendationItem}
      >
        • {item}
      </Text>
    ))}
  </View>
);
