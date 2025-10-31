/**
 * Admin Verification Management Screen
 * Production-ready implementation for managing user verifications
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { SearchAndFilters, VerificationList, VerificationModal } from './verifications/components';
import { useAdminVerifications } from './verifications/hooks';

interface AdminVerificationsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdminVerificationsScreen({
  navigation,
}: AdminVerificationsScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    verifications,
    loading,
    refreshing,
    searchQuery,
    filter,
    selectedVerification,
    handleRefresh,
    handleSearch,
    handleFilterChange,
    handleVerificationSelect,
    handleApprove,
    handleReject,
    handleRequestInfo,
    setSelectedVerification,
  } = useAdminVerifications();

  const handleApproveWithFeedback = useCallback(
    async (id: string) => {
      try {
        await handleApprove(id);
        Alert.alert('Success', 'Verification approved successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to approve verification. Please try again.');
      }
    },
    [handleApprove],
  );

  const handleRejectWithFeedback = useCallback(
    async (id: string, reason: string) => {
      try {
        await handleReject(id, reason);
        Alert.alert('Success', 'Verification rejected successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to reject verification. Please try again.');
      }
    },
    [handleReject],
  );

  const handleRequestInfoWithFeedback = useCallback(
    async (id: string, message: string) => {
      try {
        await handleRequestInfo(id, message);
        Alert.alert('Success', 'Information request sent successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to request information. Please try again.');
      }
    },
    [handleRequestInfo],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
          testID="back-button"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Verification Management
        </Text>
      </View>

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      {/* Verifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading verifications...
          </Text>
        </View>
      ) : (
        <VerificationList
          verifications={verifications}
          selectedVerification={selectedVerification}
          onSelect={handleVerificationSelect}
          onApprove={handleApproveWithFeedback}
          onReject={handleRejectWithFeedback}
          onRequestInfo={handleRequestInfoWithFeedback}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <VerificationModal
          verification={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onApprove={handleApproveWithFeedback}
          onReject={handleRejectWithFeedback}
          onRequestInfo={handleRequestInfoWithFeedback}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginEnd: theme.spacing.lg,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
    },
  });

export default AdminVerificationsScreen;
