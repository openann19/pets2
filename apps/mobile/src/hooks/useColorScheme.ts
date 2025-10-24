import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  const systemScheme = Appearance.getColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: nextScheme }) => {
      setColorScheme(nextScheme === 'dark' ? 'dark' : 'light');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return colorScheme;
}
