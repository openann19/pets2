/**
 * SecurityFilters Component
 * Filter controls for security alerts
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface SecurityFiltersProps {
  selectedSeverity: 'all' | 'critical' | 'high' | 'medium' | 'low';
  selectedType:
    | 'all'
    | 'suspicious_login'
    | 'blocked_ip'
    | 'reported_content'
    | 'spam_detected'
    | 'data_breach'
    | 'unusual_activity';
  onSeverityChange: (severity: 'all' | 'critical' | 'high' | 'medium' | 'low') => void;
  onTypeChange: (
    type:
      | 'all'
      | 'suspicious_login'
      | 'blocked_ip'
      | 'reported_content'
      | 'spam_detected'
      | 'data_breach'
      | 'unusual_activity',
  ) => void;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    filtersContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    filterLabel: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      minWidth: 60,
      color: theme.colors.onSurface,
    },
    filterButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    filterText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
  });
};

export const SecurityFilters: React.FC<SecurityFiltersProps> = ({
  selectedSeverity,
  selectedType,
  onSeverityChange,
  onTypeChange,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const severityOptions: Array<'all' | 'critical' | 'high' | 'medium' | 'low'> = [
    'all',
    'critical',
    'high',
    'medium',
    'low',
  ];

  const typeOptions: Array<
    | 'all'
    | 'suspicious_login'
    | 'blocked_ip'
    | 'reported_content'
    | 'spam_detected'
    | 'data_breach'
    | 'unusual_activity'
  > = ['all', 'suspicious_login', 'blocked_ip', 'reported_content', 'spam_detected', 'data_breach', 'unusual_activity'];

  return (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Severity:</Text>
        <View style={styles.filterButtons}>
          {severityOptions.map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedSeverity === severity ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => onSeverityChange(severity)}
              accessibilityLabel={`Filter by ${severity} severity`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedSeverity === severity ? theme.colors.onSurface : theme.colors.onSurface,
                  },
                ]}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Type:</Text>
        <View style={styles.filterButtons}>
          {typeOptions.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedType === type ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => onTypeChange(type)}
              accessibilityLabel={`Filter by ${type}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedType === type ? theme.colors.onSurface : theme.colors.onSurface,
                  },
                ]}
              >
                {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

