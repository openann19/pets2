/**
 * UI Demo Screen
 * Showcases all UI v2 components with variants and states
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Switch } from 'react-native';
import { Stack } from '../components/ui/v2/layout/Stack';
import { Text } from '../components/ui/v2/Text';
import { Button } from '../components/ui/v2/Button';
import { useTheme } from "@mobile/theme";
import { showcaseRegistry } from '../components/ui/v2/registry';

export default function UIDemoScreen(): React.ReactElement {
  const theme: ReturnType<typeof useTheme> = useTheme();
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    theme.scheme === 'dark' ? 'dark' : 'light'
  );

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setThemeMode(newTheme);
    // Store preference in AsyncStorage for persistence
  };

  const handleLanguageChange = async (_lang: 'en' | 'bg') => {
    // i18n functionality removed for now
    // await i18n.changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Controls Bar */}
      <View
        style={[
          styles.controls,
          {
            backgroundColor: theme.colors.surface || theme.colors.bg,
            borderBottomColor: theme.colors.border,
          },
        ]}
        testID="ui-controls"
      >
        <Stack direction="row" gap="sm" align="center" style={styles.controlsInner}>
          <Text variant="caption">Theme:</Text>
          <Button
            testID="ui-theme-light"
            title="Light"
            variant={themeMode === 'light' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => handleThemeChange('light')}
          />
          <Button
            testID="ui-theme-dark"
            title="Dark"
            variant={themeMode === 'dark' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => handleThemeChange('dark')}
          />

          <Text variant="caption">Lang:</Text>
          <Button
            testID="ui-lang-en"
            title="EN"
            variant="ghost"
            size="sm"
            onPress={() => handleLanguageChange('en')}
          />
          <Button
            testID="ui-lang-bg"
            title="BG"
            variant="ghost"
            size="sm"
            onPress={() => handleLanguageChange('bg')}
          />

          <Text variant="caption">Density:</Text>
          <Button
            testID="ui-density-comfortable"
            title="+"
            variant={density === 'comfortable' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setDensity('comfortable')}
          />
          <Button
            testID="ui-density-compact"
            title="-"
            variant={density === 'compact' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setDensity('compact')}
          />

          <Text variant="caption">Motion:</Text>
          <Switch
            testID="ui-reduce-motion"
            value={reduceMotion}
            onValueChange={setReduceMotion}
          />
        </Stack>
      </View>

      {/* Showcase Grid */}
      <ScrollView
        testID="ui-demo"
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { padding: density === 'compact' ? 12 : 16 },
        ]}
      >
        {showcaseRegistry.map((section) => (
          <View
            key={section.id}
            style={styles.section}
            testID={`ui-${section.id}`}
          >
            <Text variant="h4" style={{ marginBottom: 8 }}>
              {section.title}
            </Text>
            {section.description && (
              <Text variant="bodyMuted" style={{ marginBottom: 12 }}>
                {section.description}
              </Text>
            )}
            <View style={{ marginTop: 12 }}>{section.demo}</View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 50,
  },
  controlsInner: {
    flexWrap: 'wrap',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
});

