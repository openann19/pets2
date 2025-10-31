import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';

interface PremiumStatusResponse {
  active: boolean;
}

export function withPremiumGuard<P extends Record<string, unknown>>(Comp: React.ComponentType<P>) {
  return function PremiumGuard(props: P) {
    const [allowed, setAllowed] = React.useState<boolean | null>(null);
    const theme = useTheme() as AppTheme;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    React.useEffect(() => {
      (async () => {
        try {
          const response = await api.request<PremiumStatusResponse>('/premium/status');
          setAllowed(!!response?.active);
        } catch {
          setAllowed(false);
        }
      })();
    }, []);

    if (allowed === null) return null;
    if (allowed) return <Comp {...props} />;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.bg }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, color: theme.colors.onSurface }}>Premium required</Text>
        <Text style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.onMuted }}>
          This feature is available with PawfectMatch Premium.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Premium')}
          style={{ padding: 12, backgroundColor: theme.colors.primary, borderRadius: 10 }}
        >
          <Text style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  };
}
