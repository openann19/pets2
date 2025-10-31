/**
 * Status Actions Component
 * Displays action buttons for approve, reject, and schedule interview
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ApplicationStatus } from '../types';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    actionsGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    actionGradient: {
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    actionText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
  });
}

interface StatusActionsProps {
  onStatusChange: (status: ApplicationStatus) => void;
}

export const StatusActions: React.FC<StatusActionsProps> = ({ onStatusChange }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Update Application Status', `Change application status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => onStatusChange(newStatus),
      },
    ]);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStatusChange('approved')}
          testID="status-action-approve"
          accessibilityLabel="Approve application"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.success ?? [colors.success, colors.success]}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.onSurface}
            />
            <Text style={styles.actionText}>Approve</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStatusChange('interview')}
          testID="status-action-interview"
          accessibilityLabel="Schedule interview"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.info ?? [colors.info, colors.info]}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="chatbubble"
              size={24}
              color={colors.onSurface}
            />
            <Text style={styles.actionText}>Schedule Interview</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStatusChange('rejected')}
          testID="status-action-reject"
          accessibilityLabel="Reject application"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.danger ?? [colors.danger, colors.danger]}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="close-circle"
              size={24}
              color={colors.onSurface}
            />
            <Text style={styles.actionText}>Reject</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

