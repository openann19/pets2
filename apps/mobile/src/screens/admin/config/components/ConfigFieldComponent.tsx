/**
 * Configuration Field Component
 * Renders different input types for configuration fields
 */

import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ConfigField } from '../types';

interface ConfigFieldComponentProps {
  field: ConfigField;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function ConfigFieldComponent({
  field,
  value,
  onChange,
}: ConfigFieldComponentProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  switch (field.type) {
    case 'boolean':
      return (
        <View style={styles.container}>
          <View style={styles.switchContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {field.label}
            </Text>
            <Switch
              value={value as boolean}
              onValueChange={(val) => onChange(field.key, val)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={value ? theme.colors.surface : theme.colors.border}
            />
          </View>
          {field.description ? (
            <Text style={[styles.description, { color: theme.colors.onMuted }]}>
              {field.description}
            </Text>
          ) : null}
        </View>
      );

    case 'password':
      return (
        <View style={styles.container}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {field.label}
            {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.border,
              },
            ]}
            value={field.masked && value ? '••••••••' : (value as string)}
            onChangeText={(text) => onChange(field.key, text)}
            placeholder={field.placeholder}
            placeholderTextColor={theme.colors.onMuted}
            secureTextEntry={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {field.description ? (
            <Text style={[styles.description, { color: theme.colors.onMuted }]}>
              {field.description}
            </Text>
          ) : null}
        </View>
      );

    case 'number':
      return (
        <View style={styles.container}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {field.label}
            {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.border,
              },
            ]}
            value={String(value ?? '')}
            onChangeText={(text) => {
              const numValue = parseFloat(text);
              if (!isNaN(numValue)) {
                onChange(field.key, numValue);
              } else if (text === '') {
                onChange(field.key, '');
              }
            }}
            placeholder={field.placeholder}
            placeholderTextColor={theme.colors.onMuted}
            keyboardType="numeric"
          />
          {field.description ? (
            <Text style={[styles.description, { color: theme.colors.onMuted }]}>
              {field.description}
            </Text>
          ) : null}
        </View>
      );

    default:
      return (
        <View style={styles.container}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {field.label}
            {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.border,
              },
            ]}
            value={String(value ?? '')}
            onChangeText={(text) => onChange(field.key, text)}
            placeholder={field.placeholder}
            placeholderTextColor={theme.colors.onMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={field.type === 'url' ? 'url' : 'default'}
          />
          {field.description ? (
            <Text style={[styles.description, { color: theme.colors.onMuted }]}>
              {field.description}
            </Text>
          ) : null}
        </View>
      );
  }
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    description: {
      fontSize: theme.typography.body.size * 0.875,
      marginTop: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

