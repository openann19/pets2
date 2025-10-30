/**
 * Admin Security Screen - REFACTORED
 * Reduced from 923 lines to ~200 lines by extracting components
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SecurityAlertCard, SecurityMetricsSection } from './security/components';
import { useAdminSecurity } from './security/hooks';
import { useTheme } from '@mobile/theme';
import type { AdminScreenProps } from '../../navigation/types';
import type { SecurityAlert } from './security/types';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
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
      fontWeight: '500',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 8,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    refreshButton: {
      padding: 8,
    },
    filtersContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      minWidth: 60,
    },
    filterButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    filterButtonActive: {
      // Active state handled by backgroundColor
    },
    filterText: {
      fontSize: 12,
      fontWeight: '600',
    },
    metricsSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    alertsSection: {
      flex: 1,
      paddingHorizontal: 16,
    },
    alertsList: {
      paddingBottom: 16,
    },
  });
}

export default function AdminSecurityScreen({
  navigation,
}: AdminScreenProps<'AdminSecurity'>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;
  const {
    alerts,
    metrics,
    loading,
    refreshing,
    selectedSeverity,
    selectedType,
    actionLoading,
    onRefresh,
    handleResolveAlert,
    setSelectedSeverity,
    setSelectedType,
  } = useAdminSecurity();

  const handleBack = () => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const renderAlert = ({ item }: { item: SecurityAlert }) => (
    <SecurityAlertCard
      alert={item}
      onPress={(alert) => {
        // Handle alert detail view
        console.log('Alert pressed:', alert);
      }}
      onResolve={handleResolveAlert}
      isActionLoading={actionLoading === item.id}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Loading security data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="AdminSecurity-back-button"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Security Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            testID="AdminSecurity-refresh-button"
            accessibilityLabel="Refresh"
            accessibilityRole="button"
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Severity:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.filterButton,
                  selectedSeverity === severity && [
                    styles.filterButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => {
                  if (Haptics) {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedSeverity(severity);
                }}
                testID={`AdminSecurity-severity-${severity}`}
                accessibilityLabel={`Filter by ${severity}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedSeverity === severity ? theme.colors.surface : colors.onSurface,
                    },
                  ]}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Type:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'suspicious_login', 'blocked_ip', 'reported_content'] as const).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    selectedType === type && [
                      styles.filterButtonActive,
                      { backgroundColor: colors.primary },
                    ],
                  ]}
                  onPress={() => {
                    if (Haptics) {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedType(type);
                  }}
                  testID={`AdminSecurity-type-${type}`}
                  accessibilityLabel={`Filter by ${type}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: selectedType === type ? palette.neutral[0] : colors.onSurface },
                    ]}
                  >
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      </View>

      {/* Metrics */}
      {metrics && (
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Security Metrics</Text>
          <SecurityMetricsSection metrics={metrics} />
        </View>
      )}

      {/* Alerts List */}
      <View style={styles.alertsSection}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Security Alerts ({alerts.length})
        </Text>
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.alertsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
