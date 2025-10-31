/**
 * Application Loading State Component
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: theme.typography.body.size * 1.125,
    },
  });
}

export const ApplicationLoadingState: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.loadingText, { color: colors.onMuted }]}>Loading application...</Text>
    </View>
  );
};

