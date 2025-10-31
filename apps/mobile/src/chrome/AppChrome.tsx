/**
 * AppChrome Component
 * Provides app-level chrome/wrapper around navigation
 * Handles global UI elements like status bar, safe areas, etc.
 */

import React, { type ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface AppChromeProps {
  children: ReactNode;
}

/**
 * AppChrome - Wraps the app navigation with chrome elements
 * - Safe area handling
 * - Status bar configuration
 * - Global overlays
 */
export default function AppChrome({ children }: AppChromeProps): React.ReactElement {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom'] as const}>
      <StatusBar style="auto" />
      {children}
    </SafeAreaView>
  );
}
