/**
 * WIREFRAME DEMO COMPONENT
 * Simple demonstration of wireframe integration for testing purposes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWireframe, WireframeCard, WireframeScreen } from '../components/wireframe';
import { useTheme } from '../hooks';

export default function WireframeDemoScreen() {
  const wireframe = useWireframe();
  const theme = useTheme();

  return (
    <WireframeScreen
      title="Wireframe Demo"
      showHeader={true}
      showTabs={true}
      tabLabels={['Components', 'Layout', 'Interactive']}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Wireframe System Demo
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Current Mode: {wireframe.theme}
        </Text>

        <WireframeCard
          title="Demo Card 1"
          height={100}
          content={
            <Text style={{ color: theme.colors.textMuted }}>
              This card demonstrates wireframe mode switching
            </Text>
          }
        />

        <WireframeCard
          title="Demo Card 2"
          height={80}
          interactive={false}
          content={
            <Text style={{ color: theme.colors.textMuted }}>
              Non-interactive card example
            </Text>
          }
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => alert('Button pressed!')}
        >
          <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
            Test Button
          </Text>
        </TouchableOpacity>

        <View style={[styles.status, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            Wireframe Status: {wireframe.enabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
            Grid: {wireframe.showGrid ? 'On' : 'Off'} | Measurements: {wireframe.showMeasurements ? 'On' : 'Off'}
          </Text>
          <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
            Interactive: {wireframe.interactiveMode ? 'Yes' : 'No'} | Data: {wireframe.dataSource}
          </Text>
        </View>
      </View>
    </WireframeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    padding: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
