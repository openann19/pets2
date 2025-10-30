import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NavigationProp } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { api } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

type PremiumNavigationProp = NavigationProp<RootStackParamList, 'Premium'>;

interface PremiumGateProps {
  navigation?: PremiumNavigationProp;
}

interface PremiumStatus {
  status: 'active' | 'inactive' | 'expired';
  until?: string | null;
}

interface ApiResponse<T> {
  data?: T;
}

/**
 * Higher-order component that gates content behind a premium subscription
 * Shows an upgrade prompt if the user doesn't have an active subscription
 */
export function withPremiumGate<P extends object>(Component: React.ComponentType<P>) {
  return function Gate(props: P & PremiumGateProps) {
    const theme = useTheme();
    const { data, isLoading } = useQuery<PremiumStatus>({
      queryKey: ['premiumStatus'],
      queryFn: async () => {
        const response = await api.get('/premium/status');
        const typedResponse = response as ApiResponse<PremiumStatus>;
        return typedResponse.data ?? (response as PremiumStatus);
      },
    });

    if (isLoading) {
      return (
        <View style={styles.container(theme)}>
          <Text style={styles.loadingText(theme)}>Loading...</Text>
        </View>
      );
    }

    if (data?.status === 'active') {
      return <Component {...(props as P)} />;
    }

    return (
      <View style={styles.container(theme)}>
        <Text style={styles.title(theme)}>Premium Required</Text>
        <Text style={styles.message(theme)}>Upgrade to unlock this feature</Text>
        <TouchableOpacity
          style={styles.button(theme)}
          onPress={() => {
            if (props.navigation) {
              props.navigation.navigate('Premium');
            }
          }}
        >
          <Text style={styles.buttonText(theme)}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = {
  container: (theme: ReturnType<typeof useTheme>) => ({
    flex: 1 as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 32,
    backgroundColor: theme.colors.bg,
  }),
  title: (theme: ReturnType<typeof useTheme>) => ({
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    color: theme.colors.onSurface,
  }),
  message: (theme: ReturnType<typeof useTheme>) => ({
    fontSize: 16,
    color: theme.colors.onMuted,
    marginBottom: 24,
    textAlign: 'center' as const,
  }),
  button: (theme: ReturnType<typeof useTheme>) => ({
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  }),
  buttonText: (theme: ReturnType<typeof useTheme>) => ({
    color: theme.colors.onPrimary,
    fontWeight: '600' as const,
    fontSize: 16,
  }),
  loadingText: (theme: ReturnType<typeof useTheme>) => ({
    fontSize: 16,
    color: theme.colors.onMuted,
  }),
};
