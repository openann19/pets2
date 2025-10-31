import type { ReactNode } from 'react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

interface AppChromeProps {
  children: ReactNode;
}

/**
 * AppChrome - Main app wrapper component
 * Provides consistent layout and safe area handling
 */
export default function AppChrome({ children }: AppChromeProps): React.ReactElement {
  const edges: Edge[] = ['top', 'bottom'];
  return (
    <SafeAreaView style={styles.container} edges={edges}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
