/**
 * PROJECT HYPERION: MIGRATION EXAMPLE SCREEN (SIMPLIFIED)
 *
 * Simplified migration example screen to demonstrate basic patterns
 * without complex component dependencies.
 */

import { useTheme } from '@mobile/theme';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MigrationExampleScreen() {
  const theme = useTheme();
  const [useNewArchitecture, setUseNewArchitecture] = useState(true);
  const [selectedExample, setSelectedExample] = useState<'buttons' | 'containers' | 'typography'>(
    'buttons',
  );

  const renderButtonExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>
        {useNewArchitecture ? 'New Architecture' : 'Legacy Architecture'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        testID="MigrationExampleScreen-button-2"
        accessibilityLabel=""
        accessibilityRole="button"
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Primary Button</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={StyleSheet.flatten([styles.button, styles.secondaryButton])}
        testID="MigrationExampleScreen-button-2"
        accessibilityLabel="Interactive element"
        accessibilityRole="button"
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Secondary Button</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContainerExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>Container Examples</Text>

      <View style={styles.container}>
        <Text>Basic Container</Text>
      </View>

      <View style={StyleSheet.flatten([styles.container, styles.elevatedContainer])}>
        <Text>Elevated Container</Text>
      </View>
    </View>
  );

  const renderTypographyExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>Typography Examples</Text>

      <Text style={styles.heading1}>Heading 1</Text>
      <Text style={styles.heading2}>Heading 2</Text>
      <Text style={styles.body}>Body text example</Text>
      <Text style={styles.caption}>Caption text</Text>
    </View>
  );

  const renderCurrentExample = () => {
    switch (selectedExample) {
      case 'buttons':
        return renderButtonExamples();
      case 'containers':
        return renderContainerExamples();
      case 'typography':
        return renderTypographyExamples();
      default:
        return renderButtonExamples();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Migration Example</Text>
        <Text style={styles.subtitle}>Compare old vs new architecture</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.toggleButton,
            useNewArchitecture && styles.activeToggle,
          ])}
          testID="MigrationExampleScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={() => {
            setUseNewArchitecture(true);
          }}
        >
          <Text style={styles.toggleText}>New Architecture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.toggleButton,
            !useNewArchitecture && styles.activeToggle,
          ])}
          testID="MigrationExampleScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={() => {
            setUseNewArchitecture(false);
          }}
        >
          <Text style={styles.toggleText}>Legacy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['buttons', 'containers', 'typography'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={StyleSheet.flatten([styles.tab, selectedExample === tab && styles.activeTab])}
            testID="MigrationExampleScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              setSelectedExample(tab);
            }}
          >
            <Text style={styles.tabText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderCurrentExample()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onMuted,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radii.sm,
  },
  activeToggle: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  exampleSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.onMuted,
  },
  buttonText: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  elevatedContainer: {
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: theme.colors.onMuted,
    fontStyle: 'italic',
  },
});
