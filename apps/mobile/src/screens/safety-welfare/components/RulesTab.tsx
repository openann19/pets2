/**
 * Rules Tab Component
 * Displays community rules and guidelines
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { COMMUNITY_RULES } from '../types';

interface RulesTabProps {
  onReportSafety: () => void;
}

export const RulesTab: React.FC<RulesTabProps> = ({ onReportSafety }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabContent: {
          padding: theme.spacing.md,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        sectionDescription: {
          fontSize: 14,
          marginBottom: theme.spacing.md,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
        ruleCard: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        ruleHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.sm,
        },
        ruleTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          flex: 1,
          color: theme.colors.onSurface,
        },
        severityBadge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radii.md,
        },
        severityText: {
          fontSize: 12,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
        ruleDescription: {
          fontSize: 14,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
        reportButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.lg,
          alignItems: 'center' as const,
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.primary,
        },
        reportButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return theme.colors.danger;
      case 'high':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  };

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Community Guidelines 🛡️</Text>

      <Text style={styles.sectionDescription}>
        Our community rules ensure safe and positive experiences for all pets and their owners.
      </Text>

      {COMMUNITY_RULES.map((rule, index) => (
        <View key={index} style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(rule.severity) }]}>
              <Text style={styles.severityText}>{rule.severity}</Text>
            </View>
          </View>

          <Text style={styles.ruleDescription}>{rule.description}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.reportButton} onPress={onReportSafety}>
        <Text style={styles.reportButtonText}>🚨 Report Safety Concern</Text>
      </TouchableOpacity>
    </View>
  );
};

