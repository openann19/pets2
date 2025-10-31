import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export function useTabDoublePress(callback: () => void) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabDoublePress' as any, () => {
      try {
        callback();
      } catch (error) {
        // Silently handle errors in callbacks to prevent crashes
        if (__DEV__) {
          console.error('Error in tabDoublePress callback:', error);
        }
      }
    });
    return unsubscribe;
  }, [navigation, callback]);
}
