/**
 * SecurityAlertCard Component
 * Displays a security alert in the admin security screen
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface SecurityAlert {
  id: string;
  type:
    | 'suspicious_login'
    | 'blocked_ip'
    | 'reported_content'
    | 'spam_detected'
    | 'data_breach'
    | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  location?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface SecurityAlertCardProps {
  alert: SecurityAlert;
  isActionLoading: boolean;
  onResolve: (alertId: string) => void;
  onBlockIP?: (alertId: string, ipAddress: string) => void;
  getSeverityColor: (severity: string) => string;
  getTypeIcon: (type: string) => string;
  formatDate: (dateString: string) => string;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    alertCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation2,
    },
    alertCardResolved: {
      opacity: 0.7,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    alertInfo: {
      flexDirection: 'row',
      flex: 1,
    },
    severityIndicator: {
      width: 4,
      height: '100%',
      borderRadius: theme.radii.sm,
      marginEnd: theme.spacing.sm,
    },
    alertDetails: {
      flex: 1,
    },
    alertTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    alertTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      flex: 1,
      color: theme.colors.onSurface,
    },
    severityBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.md,
    },
    severityText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.625,
      fontWeight: theme.typography.h2.weight,
    },
    alertDescription: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onMuted,
    },
    alertTimestamp: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    alertActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resolvedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    resolvedText: {
      fontSize: theme.typography.body.size * 0.75,
      fontStyle: 'italic',
      color: theme.colors.onMuted,
    },
    alertMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metaText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
  });
};

export const SecurityAlertCard: React.FC<SecurityAlertCardProps> = ({
  alert,
  isActionLoading,
  onResolve,
  onBlockIP,
  getSeverityColor,
  getTypeIcon,
  formatDate,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.alertCard, alert.resolved && styles.alertCardResolved]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View
            style={[
              styles.severityIndicator,
              { backgroundColor: getSeverityColor(alert.severity) },
            ]}
          />
          <View style={styles.alertDetails}>
            <View style={styles.alertTitleRow}>
              <Ionicons
                name={getTypeIcon(alert.type) as any}
                size={20}
                color={getSeverityColor(alert.severity)}
              />
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) },
                ]}
              >
                <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.alertDescription}>{alert.description}</Text>
            <Text style={styles.alertTimestamp}>{formatDate(alert.timestamp)}</Text>
          </View>
        </View>

        {!alert.resolved && (
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => onResolve(alert.id)}
              disabled={isActionLoading}
              accessibilityLabel={`Resolve ${alert.title}`}
              accessibilityRole="button"
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color={theme.colors.onSurface} />
              ) : (
                <Ionicons name="checkmark" size={16} color={theme.colors.onSurface} />
              )}
            </TouchableOpacity>

            {alert.ipAddress && onBlockIP && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
                onPress={() => onBlockIP(alert.id, alert.ipAddress!)}
                disabled={isActionLoading}
                accessibilityLabel={`Block IP ${alert.ipAddress}`}
                accessibilityRole="button"
              >
                <Ionicons name="ban" size={16} color={theme.colors.onSurface} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {alert.resolved && alert.resolvedBy && alert.resolvedAt && (
        <View style={styles.resolvedInfo}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.resolvedText}>
            Resolved by {alert.resolvedBy} on {formatDate(alert.resolvedAt)}
          </Text>
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.alertMeta}>
        {alert.userEmail && (
          <View style={styles.metaItem}>
            <Ionicons name="person" size={14} color={theme.colors.onMuted} />
            <Text style={styles.metaText}>{alert.userEmail}</Text>
          </View>
        )}
        {alert.ipAddress && (
          <View style={styles.metaItem}>
            <Ionicons name="globe" size={14} color={theme.colors.onMuted} />
            <Text style={styles.metaText}>{alert.ipAddress}</Text>
          </View>
        )}
        {alert.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location" size={14} color={theme.colors.onMuted} />
            <Text style={styles.metaText}>{alert.location}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

