// Type extensions for react-native
import { useColorScheme } from 'react-native';

// Export ColorScheme type
export type ColorScheme = ReturnType<typeof useColorScheme>;
export { useColorScheme };

// SafeAreaView edges type
declare module 'react-native' {
  interface SafeAreaViewProps {
    edges?: ('top' | 'right' | 'bottom' | 'left')[];
  }
}
