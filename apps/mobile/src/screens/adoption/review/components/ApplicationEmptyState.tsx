/**
 * Application Empty State Component
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginTop: theme.spacing.lg,
    },
    emptySubtitle: {
      fontSize: theme.typography.body.size,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    backButton: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
    },
    backButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
  });
}

interface ApplicationEmptyStateProps {
  onBack: () => void;
}

export const ApplicationEmptyState: React.FC<ApplicationEmptyStateProps> = ({ onBack }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle-outline"
        size={80}
        color={colors.danger}
      />
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>Application Not Found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.onMuted }]}>
        Unable to load application details
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        testID="application-empty-back"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

