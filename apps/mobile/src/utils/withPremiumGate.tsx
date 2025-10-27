import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

interface PremiumGateProps {
  navigation?: {
    navigate?: (screen: string) => void;
  };
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
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (data?.status === 'active') {
      return <Component {...(props as P)} />;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Premium Required</Text>
        <Text style={styles.message}>Upgrade to unlock this feature</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation?.navigate?.('Subscribe')}
        >
          <Text style={styles.buttonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
