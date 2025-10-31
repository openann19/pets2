/**
 * Application Header Component
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size * 0.875,
      fontWeight: theme.typography.h1.weight,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
  });
}

interface ApplicationHeaderProps {
  onBack: () => void;
  onShare?: () => void;
  onMore?: () => void;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({
  onBack,
  onShare,
  onMore,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        testID="application-header-back"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={colors.onSurface}
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Application Review</Text>
      <View style={styles.headerActions}>
        {onShare && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onShare}
            testID="application-header-share"
            accessibilityLabel="Share application"
            accessibilityRole="button"
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        )}
        {onMore && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onMore}
            testID="application-header-more"
            accessibilityLabel="More options"
            accessibilityRole="button"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

