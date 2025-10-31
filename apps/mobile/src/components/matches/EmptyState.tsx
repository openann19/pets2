import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export function EmptyState(): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        },
        image: {
          width: 120,
          height: 120,
          marginBottom: 16,
        },
        title: {
          fontSize: 22,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 16,
          color: colors.textMuted,
          textAlign: 'center',
        },
      }),
    [colors],
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel="No matches found"
    >
      <Image
        source={require('../../../assets/empty-matches.png')}
        style={styles.image}
      />
      <Text style={styles.title}>No matches yet</Text>
      <Text style={styles.subtitle}>
        Try adjusting your filters or start swiping to find your perfect match!
      </Text>
    </View>
  );
}
