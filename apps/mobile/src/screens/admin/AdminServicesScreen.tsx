/**
 * Admin Services Screen
 * View and manage external services integration status
 * REFACTORED: Extracted hooks and components for better maintainability
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { ServiceStatusCard } from './services/components';
import { useAdminServices } from './services/hooks';

interface AdminServicesScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AdminServicesScreen({
  navigation,
}: AdminServicesScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { services, loading, refreshing, onRefresh, getStatusColor, getStatusIcon } =
    useAdminServices();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminServicesScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>External Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {services.map((service, index) => (
          <ServiceStatusCard
            key={index}
            service={service}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.lg,
      fontSize: theme.typography.body.size,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    scrollView: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  });
