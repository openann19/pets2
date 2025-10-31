/**
 * Configuration Modal Component
 * Modal for editing service configuration
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ServiceConfig } from '../types';
import { ConfigFieldComponent } from './ConfigFieldComponent';

interface ConfigModalProps {
  visible: boolean;
  service: ServiceConfig | null;
  configValues: Record<string, string | number | boolean>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (key: string, value: string | number | boolean) => void;
}

export function ConfigModal({
  visible,
  service,
  configValues,
  saving,
  onClose,
  onSave,
  onFieldChange,
}: ConfigModalProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!service) return <></>;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Close configuration"
            accessibilityRole="button"
          >
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {service.name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {service.fields.map((field) => (
            <ConfigFieldComponent
              key={field.key}
              field={field}
              value={configValues[field.key]}
              onChange={onFieldChange}
            />
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.colors.onSurface }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            onPress={onSave}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.onPrimary}
              />
            ) : (
              <Text style={styles.buttonText}>Save Configuration</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });

