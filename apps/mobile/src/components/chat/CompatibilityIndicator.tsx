/**
 * Compatibility Indicator Component
 * Displays pet compatibility scores and factors in chat
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { CompatibilityIndicator as CompatibilityIndicatorType } from '@pawfectmatch/core/types/pet-chat';
import { Ionicons } from '@expo/vector-icons';

interface CompatibilityIndicatorProps {
  indicator: CompatibilityIndicatorType;
  compact?: boolean;
  showDetails?: boolean;
}

export const CompatibilityIndicator: React.FC<CompatibilityIndicatorProps> = ({
  indicator,
  compact = false,
  showDetails = false,
}) => {
  const theme = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.primary;
    if (score >= 40) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'heart';
    if (score >= 60) return 'checkmark-circle';
    if (score >= 40) return 'alert-circle';
    return 'close-circle';
  };

  const scoreColor = getScoreColor(indicator.score);
  const scoreIcon = getScoreIcon(indicator.score);

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.compactHeader}>
          <Ionicons name={scoreIcon as any} size={16} color={scoreColor} />
          <Text style={[styles.compactScore, { color: scoreColor }]}>
            {indicator.score}% Match
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Ionicons name={scoreIcon as any} size={24} color={scoreColor} />
          <Text style={[styles.score, { color: scoreColor }]}>
            {indicator.score}%
          </Text>
          <Text style={[styles.scoreLabel, { color: theme.colors.onMuted }]}>
            Compatibility
          </Text>
        </View>
      </View>

      {/* Compatibility Breakdown */}
      {showDetails && indicator.compatibilityBreakdown && (
        <View style={styles.breakdownContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Compatibility Breakdown
          </Text>
          {Object.entries(indicator.compatibilityBreakdown).map(([key, value]) => (
            <View key={key} style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <Text style={[styles.breakdownLabel, { color: theme.colors.onMuted }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <Text style={[styles.breakdownValue, { color: theme.colors.onSurface }]}>
                  {value}%
                </Text>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${value}%`,
                      backgroundColor: getScoreColor(value),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Factors */}
      {indicator.factors && indicator.factors.length > 0 && (
        <View style={styles.factorsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Key Factors
          </Text>
          {indicator.factors.map((factor, index) => (
            <View key={index} style={styles.factorRow}>
              <Ionicons
                name={factor.positive ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={factor.positive ? theme.colors.success : theme.colors.danger}
              />
              <Text style={[styles.factorText, { color: theme.colors.onSurface }]}>
                {factor.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Activities */}
      {indicator.recommendedActivities && indicator.recommendedActivities.length > 0 && (
        <View style={styles.activitiesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recommended Activities
          </Text>
          <View style={styles.activitiesGrid}>
            {indicator.recommendedActivities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityChip,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.activityText, { color: theme.colors.onSurface }]}>
                  {activity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Safety Notes */}
      {indicator.safetyNotes && indicator.safetyNotes.length > 0 && (
        <View style={styles.safetyContainer}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.warning} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Safety Notes
            </Text>
          </View>
          {indicator.safetyNotes.map((note, index) => (
            <Text
              key={index}
              style={[styles.safetyNote, { color: theme.colors.onMuted }]}
            >
              • {note}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 4,
  },
  compactContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginVertical: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  breakdownContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  breakdownRow: {
    marginBottom: 12,
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  factorText: {
    fontSize: 14,
    flex: 1,
  },
  activitiesContainer: {
    marginBottom: 16,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityText: {
    fontSize: 12,
  },
  safetyContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  safetyNote: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
});

