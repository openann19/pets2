import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface AppInfoCardProps {
  version?: string;
  build?: string;
  platform?: string;
}

export function AppInfoCard({
  version = '2.5.1',
  build = '2024.10.13',
  platform = 'iOS & Android',
}: AppInfoCardProps): React.JSX.Element {
  return (
    <BlurView
      intensity={15}
      style={styles.infoCard}
    >
      <Text style={styles.infoTitle}>Version</Text>
      <Text style={styles.infoValue}>{version}</Text>

      <Text style={styles.infoTitle}>Build</Text>
      <Text style={styles.infoValue}>{build}</Text>

      <Text style={styles.infoTitle}>Platform</Text>
      <Text style={styles.infoValue}>{platform}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
});
