/**
 * 🎛️ Preview Code Screen
 * Allows testers to enter preview codes to test UI configurations before publishing
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { RootStackScreenProps } from '../navigation/types';
import { loadPreviewConfig, clearPreviewMode, useUIConfig, loadPreviewCode } from '../services/uiConfig';
import { haptic } from '../ui/haptics';
import { logger } from '@pawfectmatch/core';

type PreviewCodeScreenProps = RootStackScreenProps<'PreviewCode'>;

export default function PreviewCodeScreen({ navigation }: PreviewCodeScreenProps) {
  const theme = useTheme();
  const { config, refresh } = useUIConfig();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPreviewCode, setCurrentPreviewCode] = useState<string | null>(null);

  useEffect(() => {
    // Load existing preview code if any
    loadPreviewCode().then((stored) => {
      if (stored) {
        setCurrentPreviewCode(stored);
      }
    });
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing['2xl'],
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      lineHeight: 24,
    },
    inputContainer: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    codeInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 8,
      textAlign: 'center',
      color: theme.colors.onSurface,
      textTransform: 'uppercase',
    },
    codeInputFocused: {
      borderColor: theme.colors.primary,
    },
    hint: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: theme.colors.onSurface,
    },
    currentPreview: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    currentPreviewLabel: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
    },
    currentPreviewCode: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 4,
    },
    status: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.info + '20',
    },
    statusText: {
      fontSize: 14,
      color: theme.colors.info,
    },
  });

  const handleApplyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character preview code');
      return;
    }

    setIsLoading(true);
    haptic.tap();

    try {
      const previewConfig = await loadPreviewConfig(code.trim().toUpperCase());
      if (previewConfig) {
        setCurrentPreviewCode(code.trim().toUpperCase());
        await refresh();
        Alert.alert(
          'Preview Mode Active',
          `Preview configuration loaded successfully!\n\nVersion: ${previewConfig.version}\n\nRestart the app to apply changes fully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert('Error', 'Failed to load preview configuration. Please check the code and try again.');
      }
    } catch (error) {
      logger.error('Failed to load preview config', { error });
      Alert.alert('Error', 'Failed to load preview configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPreview = async () => {
    haptic.confirm();
    Alert.alert(
      'Clear Preview Mode',
      'Are you sure you want to exit preview mode? You will return to the production configuration.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearPreviewMode();
            await refresh();
            setCurrentPreviewCode(null);
            Alert.alert('Preview Mode Cleared', 'You are now using the production configuration.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎛️ Preview Mode</Text>
          <Text style={styles.subtitle}>
            Enter a preview code to test UI configurations before they're published to production.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preview Code</Text>
          <TextInput
            style={[styles.codeInput, code.length === 6 && styles.codeInputFocused]}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={theme.colors.onMuted}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={handleApplyCode}
          />
          <Text style={styles.hint}>Enter the 6-character code provided by your admin</Text>
        </View>

        {currentPreviewCode && (
          <View style={styles.currentPreview}>
            <Text style={styles.currentPreviewLabel}>Active Preview Code</Text>
            <Text style={styles.currentPreviewCode}>{currentPreviewCode}</Text>
          </View>
        )}

        {config.status === 'preview' && (
          <View style={styles.status}>
            <Text style={styles.statusText}>
              ⚠️ Preview configuration active (Version: {config.version})
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleApplyCode}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Apply Preview Code</Text>
            )}
          </TouchableOpacity>

          {currentPreviewCode && (
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleClearPreview}>
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Clear Preview Mode</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

