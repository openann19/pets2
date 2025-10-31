/**
 * Create Listing Header Component
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface CreateListingHeaderProps {
  onBack: () => void;
  onHelp?: () => void;
}

export const CreateListingHeader: React.FC<CreateListingHeaderProps> = ({
  onBack,
  onHelp,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        testID="create-listing-back"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={colors.onSurface}
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Create Pet Listing</Text>
      <View style={styles.headerActions}>
        {onHelp && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onHelp}
            testID="create-listing-help"
            accessibilityLabel="Help"
            accessibilityRole="button"
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
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

