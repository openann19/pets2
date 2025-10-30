import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Universal Error Fallback Component for React Native
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error: _error, resetError }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={48} color={theme.colors.danger} />

      <Text style={styles.title}>
        Something went wrong
      </Text>

      <Text style={styles.message}>
        Please try again or contact support if the issue persists.
      </Text>

      <TouchableOpacity
        style={StyleSheet.flatten([styles.button, styles.retryButton])}
        onPress={resetError}
      >
        <Ionicons name="refresh" size={20} color={theme.colors.onPrimary} />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.colors.bg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
      color: theme.colors.onMuted,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
      justifyContent: 'center',
    },
    retryButton: {
      backgroundColor: theme.colors.danger,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
  });
}

export default ErrorFallback;
