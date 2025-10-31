/**
 * Activity Banner Component
 * Displays activity event details and join button
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Interactive } from '../primitives/Interactive';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ActivityDetails } from '../../services/communityAPI';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    activityBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
    },
    activityText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
    },
    activityTextSmall: {
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs / 2,
    },
    joinButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
    },
    joinButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h1.weight,
    },
  });
}

interface ActivityBannerProps {
  activityDetails: ActivityDetails;
  onJoin: () => void;
}

export const ActivityBanner: React.FC<ActivityBannerProps> = ({
  activityDetails,
  onJoin,
}) => {
  const theme = useTheme();
  const styles = __makeStyles_styles(theme);

  return (
    <View
      style={[
        styles.activityBanner,
        { backgroundColor: theme.palette.brand[100] || theme.colors.primary + '20' },
      ]}
    >
      <Ionicons
        name="calendar"
        size={20}
        color={theme.colors.primary}
      />
      <View style={{ flex: 1, marginStart: theme.spacing.sm }}>
        <Text style={[styles.activityText, { color: theme.colors.primary }]}>
          {new Date(activityDetails.date).toLocaleDateString()} at{' '}
          {activityDetails.location}
        </Text>
        <Text style={[styles.activityTextSmall, { color: theme.colors.onMuted }]}>
          {activityDetails.currentAttendees} of {activityDetails.maxAttendees} attending
        </Text>
      </View>
      {!activityDetails.attending && (
        <Interactive
          onPress={onJoin}
          accessibilityLabel="Join activity"
          accessibilityRole="button"
        >
          <View style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.joinButtonText}>Join</Text>
          </View>
        </Interactive>
      )}
    </View>
  );
};

