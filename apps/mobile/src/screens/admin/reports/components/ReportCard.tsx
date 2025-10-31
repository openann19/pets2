/**
 * Report Card Component
 * Displays a single user report
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { UserReport } from '../types';

interface ReportCardProps {
  report: UserReport;
  onPress: () => void;
}

const getPriorityColor = (priority: UserReport['priority'], theme: AppTheme): string => {
  switch (priority) {
    case 'urgent':
      return theme.colors.danger;
    case 'high':
      return theme.colors.warning;
    case 'medium':
      return theme.colors.info;
    case 'low':
      return theme.colors.success;
    default:
      return theme.colors.onMuted;
  }
};

const getStatusColor = (status: UserReport['status'], theme: AppTheme): string => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'reviewing':
      return theme.colors.info;
    case 'resolved':
      return theme.colors.success;
    case 'dismissed':
      return theme.colors.onMuted;
    default:
      return theme.colors.onMuted;
  }
};

const getTypeIcon = (type: UserReport['type']): string => {
  switch (type) {
    case 'user':
      return 'person';
    case 'content':
      return 'document-text';
    case 'chat':
      return 'chatbubble';
    case 'pet':
      return 'paw';
    default:
      return 'alert-circle';
  }
};

export function ReportCard({ report, onPress }: ReportCardProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const priorityColor = getPriorityColor(report.priority, theme);
  const statusColor = getStatusColor(report.status, theme);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Report: ${report.reason}`}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: priorityColor + '20' }]}>
            <Ionicons
              name={getTypeIcon(report.type) as any}
              size={20}
              color={priorityColor}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.reason, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {report.reason}
            </Text>
            <Text style={[styles.type, { color: theme.colors.onMuted }]}>
              {report.type.toUpperCase()} • {report.reporterName}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
      </View>

      {report.description ? (
        <Text style={[styles.description, { color: theme.colors.onMuted }]} numberOfLines={2}>
          {report.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
          <Ionicons
            name="flag"
            size={12}
            color={priorityColor}
          />
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {report.priority}
          </Text>
        </View>
        <Text style={[styles.date, { color: theme.colors.onMuted }]}>
          {new Date(report.submittedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    typeIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: theme.spacing.md,
    },
    titleContainer: {
      flex: 1,
    },
    reason: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    type: {
      fontSize: theme.typography.body.size * 0.75,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    statusText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      textTransform: 'capitalize',
    },
    description: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.sm,
      lineHeight: theme.typography.body.size * 1.2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      gap: theme.spacing.xs,
    },
    priorityText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      textTransform: 'capitalize',
    },
    date: {
      fontSize: theme.typography.body.size * 0.75,
    },
  });
