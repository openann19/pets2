/**
 * Admin Upload Management Screen
 * Production-ready implementation for managing user uploads
 */

import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { AdminScreenProps } from '../../navigation/types';
import { UploadCard, UploadModal, SearchAndFiltersSection, EmptyState } from './components';
import { useAdminUploads } from './hooks/useAdminUploads';

export default function AdminUploadsScreen({
  navigation,
}: AdminScreenProps<'AdminUploads'>): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const {
    uploads,
    loading,
    refreshing,
    searchQuery,
    filter,
    selectedUpload,
    setSearchQuery,
    setFilter,
    setSelectedUpload,
    loadUploads,
    handleUploadAction,
    handleRejectWithReason,
  } = useAdminUploads();

  const renderUpload = ({ item }: { item: typeof uploads[0] }) => (
    <UploadCard
      upload={item}
      onPress={() => setSelectedUpload(item)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminUploadsScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Upload Management
        </Text>
      </View>

      {/* Search and Filters */}
      <SearchAndFiltersSection
        searchQuery={searchQuery}
        filter={filter}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
      />

      {/* Uploads Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading uploads...
          </Text>
        </View>
      ) : (
        <FlatList
          data={uploads}
          keyExtractor={(item) => item.id}
          renderItem={renderUpload}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadUploads(true)}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}

      {/* Upload Detail Modal */}
      <UploadModal
        upload={selectedUpload}
        visible={selectedUpload !== null}
        onClose={() => setSelectedUpload(null)}
        onApprove={handleUploadAction}
        onReject={handleRejectWithReason}
      />
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
    listContainer: {
      padding: theme.spacing.lg,
    },
    row: {
      justifyContent: 'space-between',
    },
  });
