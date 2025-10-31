/**
 * Bulk Actions Component
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface BulkActionsProps {
  selectedCount: number;
  onSuspend: () => void;
  onActivate: () => void;
  onBan: () => void;
}

export function BulkActions({
  selectedCount,
  onSuspend,
  onActivate,
  onBan,
}: BulkActionsProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (selectedCount === 0) return <></>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.summary, { color: theme.colors.onSurface }]}>
        {selectedCount} selected
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.colors.warning }]}
          testID="bulk-suspend-button"
          accessibilityLabel="Suspend selected users"
          accessibilityRole="button"
          onPress={onSuspend}
        >
          <Text style={[styles.buttonText, { color: theme.colors.warning }]}>Suspend</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.colors.success }]}
          testID="bulk-activate-button"
          accessibilityLabel="Activate selected users"
          accessibilityRole="button"
          onPress={onActivate}
        >
          <Text style={[styles.buttonText, { color: theme.colors.success }]}>Activate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.colors.danger }]}
          testID="bulk-ban-button"
          accessibilityLabel="Ban selected users"
          accessibilityRole="button"
          onPress={onBan}
        >
          <Text style={[styles.buttonText, { color: theme.colors.danger }]}>Ban</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      elevation: 1,
    },
    summary: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.sm,
    },
    buttons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
    },
  });

