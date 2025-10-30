import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Error loading matches"
    >
      <Image
        source={require('../../../assets/error-pet.png')}
        style={styles.image}
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel="Illustration of a sad pet"
      />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.subtitle}>We couldn't load your matches. Please try again.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        testID="MatchesErrorState-retry"
        accessibilityLabel="Retry loading matches"
      >
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    image: {
      width: 120,
      height: 120,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.danger,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginHorizontal: theme.spacing.md,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minWidth: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
      fontSize: 16,
    },
  });
}
