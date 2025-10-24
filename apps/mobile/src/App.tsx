import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './theme/ThemeProvider';
import HomeScreen from './screens/HomeScreen';

import { queryClient } from './config/queryClient';

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StatusBar style="dark" />
        <HomeScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
