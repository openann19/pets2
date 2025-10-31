/**
 * OfflineIndicator Component
 * Displays a banner when the device is offline
 */

import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';

export function OfflineIndicator(): React.JSX.Element | null {
  const { isOffline } = useNetworkStatus();
  const theme = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.danger,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel="No internet connection"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.onSurface} />
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}
