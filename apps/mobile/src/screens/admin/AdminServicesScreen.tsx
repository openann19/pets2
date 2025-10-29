/**
 * Admin Services Screen
 * View and manage external services integration status
 */

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@mobile/src/theme'";
import { api } from "../../services/api";

import { logger } from '../../services/logger';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  icon: string; // Ionicons name as string
  color: string;
  endpoint?: string;
  description: string;
}

interface AdminServicesScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AdminServicesScreen({
  navigation,
}: AdminServicesScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Mock services - in production, fetch from API
      const mockServices: ServiceStatus[] = [
        {
          name: 'AWS Rekognition',
          status: 'operational',
          responseTime: 245,
          lastChecked: new Date().toISOString(),
          icon: 'eye-outline',
          color: '#FF9900',
          endpoint: 'https://rekognition.amazonaws.com',
          description: 'Content moderation and safety checks'
        },
        {
          name: 'Cloudinary',
          status: 'operational',
          responseTime: 120,
          lastChecked: new Date().toISOString(),
          icon: 'cloud-outline',
          color: '#3448C5',
          endpoint: 'https://cloudinary.com',
          description: 'Image storage and processing'
        },
        {
          name: 'Stripe',
          status: 'operational',
          responseTime: 98,
          lastChecked: new Date().toISOString(),
          icon: 'card-outline',
          color: '#635BFF',
          endpoint: 'https://api.stripe.com',
          description: 'Payment processing'
        },
        {
          name: 'Sentry',
          status: 'operational',
          responseTime: 145,
          lastChecked: new Date().toISOString(),
          icon: 'bug-outline',
          color: '#362D59',
          endpoint: 'https://sentry.io',
          description: 'Error monitoring and tracking'
        },
        {
          name: 'MongoDB',
          status: 'operational',
          responseTime: 23,
          lastChecked: new Date().toISOString(),
          icon: 'server-outline',
          color: '#4DB33D',
          endpoint: 'mongodb://cluster',
          description: 'Primary database'
        },
        {
          name: 'DeepSeek AI',
          status: 'degraded',
          responseTime: 1200,
          lastChecked: new Date().toISOString(),
          icon: 'brain-outline',
          color: '#10B981',
          endpoint: 'https://api.deepseek.com',
          description: 'AI bio generation and compatibility analysis'
        },
      ];

      setServices(mockServices);
    } catch (error: unknown) {
      Alert.alert('Error', 'Failed to load services');
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to load services', { error: errorObj });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return theme.colors.success;
      case 'degraded':
        return theme.colors.warning;
      case 'down':
        return theme.colors.danger;
      default:
        return theme.colors.border;
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'checkmark-circle';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurface}]>
            Loading services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]>
      <View style={styles.header}>
        <TouchableOpacity  testID="AdminServicesScreen-button-2" accessibilityLabel="navigation.goBack();" accessibilityRole="button" onPress={() => { navigation.goBack(); }}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface}]>
          External Services
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {services.map((service, index) => (
          <View
            key={index}
            style={[styles.serviceCard, { backgroundColor: colors.surface }]
          >
            <View style={styles.serviceHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${service.color}20` }]>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.onSurface}]>
                  {service.name}
                </Text>
                <Text style={[styles.serviceDescription, { color: colors.onSurfaceecondary }]>
                  {service.description}
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Ionicons
                  name={getStatusIcon(service.status)}
                  size={16}
                  color={getStatusColor(service.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(service.status) }]>
                  {service.status.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.responseTime, { color: colors.onSurfaceecondary }]>
                {service.responseTime}ms
              </Text>
            </View>

            {service.endpoint && (
              <Text style={[styles.endpoint, { color: colors.onSurfaceecondary }] numberOfLines={1}>
                {service.endpoint}
              </Text>
            )}

            <Text style={[styles.lastChecked, { color: colors.onSurfaceecondary }]>
              Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  endpoint: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  lastChecked: {
    fontSize: 11,
    marginTop: 8,
  },
});
