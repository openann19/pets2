/**
 * Component compatibility showcase used to validate the new theming and button systems
 * without relying on legacy placeholder components.
 */
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { getExtendedColors } from '../theme/adapters';
import AnimatedButton from '../components/AnimatedButton';
import { useReduceMotion } from '../hooks/useReducedMotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_TRAITS = ['Playful', 'House trained', 'Great with kids', 'Needs daily walks'];

export default function NewComponentsTestScreen(): JSX.Element {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const reduceMotion = useReduceMotion();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const handleAction = React.useCallback((message: string) => {
    Alert.alert('Action triggered', message);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={styles.title}>Component Smoke Test</Text>
        <Text style={styles.subtitle}>
          This screen validates that core UI dependencies render correctly with the unified theme
          system in both motion-enabled and reduced-motion contexts.
        </Text>

        <AnimatedButton
          size="md"
          variant="primary"
          accessibilityLabel="Primary action"
          accessibilityHint="Executes a sample primary action"
          onPress={() => handleAction('Primary button pressed')}
        >
          Run Primary Action
        </AnimatedButton>

        <View style={styles.buttonRow}>
          <AnimatedButton
            size="sm"
            variant="secondary"
            accessibilityLabel="Secondary action"
            accessibilityHint="Executes a sample secondary action"
            onPress={() => handleAction('Secondary button pressed')}
          >
            Secondary
          </AnimatedButton>
          <AnimatedButton
            size="sm"
            variant="ghost"
            accessibilityLabel="Ghost action"
            accessibilityHint="Executes a sample ghost action"
            onPress={() => handleAction('Ghost button pressed')}
          >
            Ghost
          </AnimatedButton>
        </View>

        <Text style={styles.sectionHeading}>Sample pet traits</Text>
        <View style={styles.traitGrid}>
          {SAMPLE_TRAITS.map((trait) => (
            <View key={trait} style={[styles.traitPill, { borderColor: colors.border }]}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Motion settings</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Reduce motion enabled</Text>
          <Text style={styles.statusValue}>{reduceMotion ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryLine}>• Theme colors load successfully</Text>
          <Text style={styles.summaryLine}>• Animated button renders with accessibility metadata</Text>
          <Text style={styles.summaryLine}>• Layout adapts to screen width ({Math.round(SCREEN_WIDTH)}px)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    card: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    subtitle: {
      color: theme.colors.onMuted,
      fontSize: 16,
      lineHeight: 22,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    sectionHeading: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginTop: theme.spacing.lg,
    },
    traitGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    traitPill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
    },
    traitText: {
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    statusLabel: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    statusValue: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 16,
    },
    summaryBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    summaryLine: {
      color: theme.colors.onMuted,
      fontSize: 15,
    },
  });
