/**
 * Application Status Card Component
 * Displays pet info and application status
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { Application } from '../types';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    statusSection: {
      padding: theme.spacing.lg,
    },
    statusCard: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    petInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    petImage: {
      width: 50,
      height: 50,
      borderRadius: theme.radii.full,
      marginRight: theme.spacing.sm,
    },
    petDetails: {
      flex: 1,
    },
    petName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    applicantName: {
      fontSize: 14,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    applicationDate: {
      fontSize: 12,
      marginTop: theme.spacing.xs,
    },
  });
}

interface ApplicationStatusCardProps {
  application: Application;
}

const getStatusColor = (status: Application['status'], colors: AppTheme['colors']) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'approved':
      return colors.success;
    case 'rejected':
      return colors.danger;
    case 'interview':
      return colors.info;
    default:
      return colors.onMuted;
  }
};

const getStatusIcon = (status: Application['status']) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'approved':
      return '✅';
    case 'rejected':
      return '❌';
    case 'interview':
      return '💬';
    default:
      return '❓';
  }
};

export const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;
  const statusColor = getStatusColor(application.status, colors);

  return (
    <View style={styles.statusSection}>
      <BlurView intensity={20} style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.petInfo}>
            <Image
              source={{ uri: application.petPhoto }}
              style={styles.petImage}
            />
            <View style={styles.petDetails}>
              <Text style={[styles.petName, { color: colors.onSurface }]}>
                {application.petName}
              </Text>
              <Text style={[styles.applicantName, { color: colors.onMuted }]}>
                {application.applicantName}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusIcon(application.status)}{' '}
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.applicationDate, { color: colors.onMuted }]}>
          Applied on {new Date(application.applicationDate).toLocaleDateString()}
        </Text>
      </BlurView>
    </View>
  );
};

