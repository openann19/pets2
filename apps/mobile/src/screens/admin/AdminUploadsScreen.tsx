import React from 'react';
/**
 * Admin Upload Management Screen
 * Production-ready implementation for managing user uploads
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { _adminAPI } from '../../services/api';
import { errorHandler } from '../../services/errorHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Upload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: 'profile' | 'pet' | 'verification';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  metadata?: {
    fileSize: number;
    dimensions?: { width: number; height: number };
    contentType: string;
  };
}

interface AdminUploadsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdminUploadsScreen({ navigation }: AdminUploadsScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'pending' | 'flagged' | 'all'>('pending');
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  const loadUploads = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getUploads({
          filter,
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          // Handle different response shapes
          const uploads = (response.data as any)?.uploads || response.data;
          setUploads(Array.isArray(uploads) ? uploads : []);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to load uploads'),
          {
            component: 'AdminUploadsScreen',
            action: 'loadUploads',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, searchQuery],
  );

  useEffect(() => {
    void loadUploads();
  }, [loadUploads]);

  const handleUploadAction = useCallback(
    async (uploadId: string, action: 'approve' | 'reject', reason?: string) => {
      try {
        const response = await _adminAPI.moderateUpload({
          uploadId,
          action,
          ...(reason ? { reason } : {}),
        });

        if (response?.success) {
          setUploads((prev) =>
            prev.map((upload) => {
              if (upload.id !== uploadId) return upload;

              const updated: Upload = {
                ...upload,
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: new Date().toISOString(),
              };

              if (action === 'reject' && reason) {
                updated.rejectionReason = reason;
              }

              return updated;
            }),
          );

          Alert.alert('Success', `Upload ${action}d successfully`);
          setSelectedUpload(null);

          // Reload uploads to get latest data
          void loadUploads();
        } else {
          throw new Error(response?.message || `Failed to ${action} upload`);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error(`Failed to ${action} upload`),
          {
            component: 'AdminUploadsScreen',
            action: 'handleUploadAction',
            metadata: { uploadId, action },
          },
        );
        Alert.alert('Error', `Failed to ${action} upload. Please try again.`);
      }
    },
    [loadUploads],
  );

  const handleRejectWithReason = useCallback(
    (upload: Upload) => {
      Alert.prompt(
        'Reject Upload',
        'Please provide a reason for rejection:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: (reason) => {
              if (reason?.trim()) {
                void handleUploadAction(upload.id, 'reject', reason.trim());
              }
            },
          },
        ],
        'plain-text',
        '',
        'default',
      );
    },
    [handleUploadAction],
  );

  const renderUpload = useCallback(
    ({ item }: { item: Upload }) => (
      <TouchableOpacity
        style={styles.uploadCard}
        testID="AdminUploadsScreen-button-2"
        accessibilityLabel="View upload details"
        accessibilityRole="button"
        onPress={() => {
          setSelectedUpload(item);
        }}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.url }}
          style={styles.uploadImage}
          resizeMode="cover"
        />

        <View style={styles.uploadOverlay}>
          {item.flagged ? (
            <View
              style={StyleSheet.flatten([
                styles.flagBadge,
                { backgroundColor: theme.colors.danger },
              ])}
            >
              <Ionicons
                name="flag"
                size={12}
                color={theme.colors.onPrimary}
              />
            </View>
          ) : null}

          <View
            style={StyleSheet.flatten([
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ])}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.uploadInfo}>
          <Text
            style={StyleSheet.flatten([styles.userName, { color: theme.colors.onSurface }])}
            numberOfLines={1}
          >
            {item.userName}
          </Text>
          <Text style={StyleSheet.flatten([styles.uploadType, { color: theme.colors.onMuted }])}>
            {item.type} • {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [theme],
  );

  const getStatusColor = (status: Upload['status']) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.danger;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.border;
    }
  };

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? theme.colors.primary : theme.colors.surface,
        },
      ])}
      testID="AdminUploadsScreen-button-2"
      accessibilityLabel={`Filter uploads: ${label}`}
      accessibilityRole="button"
      onPress={() => {
        setFilter(filterType);
      }}
    >
      <Text
        style={StyleSheet.flatten([
          styles.filterButtonText,
          { color: filter === filterType ? theme.colors.onPrimary : theme.colors.onSurface },
        ])}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderUploadModal = () => {
    if (!selectedUpload) return null;

    return (
      <View style={styles.modalOverlay}>
        <View
          style={StyleSheet.flatten([
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ])}
        >
          <View style={styles.modalHeader}>
            <Text
              style={StyleSheet.flatten([styles.modalTitle, { color: theme.colors.onSurface }])}
            >
              Upload Details
            </Text>
            <TouchableOpacity
              testID="AdminUploadsScreen-button-2"
              accessibilityLabel="Close upload details"
              accessibilityRole="button"
              onPress={() => {
                setSelectedUpload(null);
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: selectedUpload.url }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <View style={styles.uploadDetails}>
            <Text style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.onMuted }])}>
              User:
            </Text>
            <Text
              style={StyleSheet.flatten([styles.detailValue, { color: theme.colors.onSurface }])}
            >
              {selectedUpload.userName}
            </Text>

            <Text style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.onMuted }])}>
              Type:
            </Text>
            <Text
              style={StyleSheet.flatten([styles.detailValue, { color: theme.colors.onSurface }])}
            >
              {selectedUpload.type}
            </Text>

            <Text style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.onMuted }])}>
              Uploaded:
            </Text>
            <Text
              style={StyleSheet.flatten([styles.detailValue, { color: theme.colors.onSurface }])}
            >
              {new Date(selectedUpload.uploadedAt).toLocaleString()}
            </Text>

            {selectedUpload.petName ? (
              <>
                <Text
                  style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.onMuted }])}
                >
                  Pet:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ])}
                >
                  {selectedUpload.petName}
                </Text>
              </>
            ) : null}

            {selectedUpload.flagReason ? (
              <>
                <Text
                  style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.danger }])}
                >
                  Flag Reason:
                </Text>
                <Text
                  style={StyleSheet.flatten([styles.detailValue, { color: theme.colors.danger }])}
                >
                  {selectedUpload.flagReason}
                </Text>
              </>
            ) : null}

            {selectedUpload.metadata ? (
              <>
                <Text
                  style={StyleSheet.flatten([styles.detailLabel, { color: theme.colors.onMuted }])}
                >
                  File Size:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ])}
                >
                  {(selectedUpload.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </>
            ) : null}
          </View>

          {selectedUpload.status === 'pending' && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.approveButton])}
                testID="AdminUploadsScreen-button-2"
                accessibilityLabel="Approve upload"
                accessibilityRole="button"
                onPress={() => handleUploadAction(selectedUpload.id, 'approve')}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color="white"
                />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.rejectButton])}
                testID="AdminUploadsScreen-button-2"
                accessibilityLabel="Reject upload"
                accessibilityRole="button"
                onPress={() => {
                  handleRejectWithReason(selectedUpload);
                }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="white"
                />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.bg }])}
    >
      {/* Header */}
      <View style={StyleSheet.flatten([styles.header, { backgroundColor: theme.colors.surface }])}>
        <TouchableOpacity
          testID="AdminUploadsScreen-button-2"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={StyleSheet.flatten([styles.headerTitle, { color: theme.colors.onSurface }])}>
          Upload Management
        </Text>
      </View>

      {/* Search and Filters */}
      <View
        style={StyleSheet.flatten([
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ])}
      >
        <View
          style={StyleSheet.flatten([
            styles.searchInputContainer,
            { backgroundColor: theme.colors.bg },
          ])}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.onMuted}
          />
          <TextInput
            style={StyleSheet.flatten([styles.searchInput, { color: theme.colors.onSurface }])}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search uploads..."
            placeholderTextColor={theme.colors.onMuted}
          />
        </View>

        <View style={styles.filterContainer}>
          {renderFilterButton('pending', 'Pending')}
          {renderFilterButton('flagged', 'Flagged')}
          {renderFilterButton('all', 'All')}
        </View>
      </View>

      {/* Uploads Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.colors.onMuted }])}>
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="images-outline"
                size={64}
                color={theme.colors.onMuted}
              />
              <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.colors.onMuted }])}>
                No uploads found
              </Text>
            </View>
          }
        />
      )}

      {/* Upload Detail Modal */}
      {renderUploadModal()}
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) => {
  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return StyleSheet.create({
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
      color: theme.colors.onSurface,
    },
    searchContainer: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.sm,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      marginStart: theme.spacing.sm,
      fontSize: theme.typography.body.size,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
    },
    filterButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    listContainer: {
      padding: theme.spacing.lg,
    },
    row: {
      justifyContent: 'space-between',
    },
    uploadCard: {
      width: IMAGE_SIZE,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    uploadImage: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
    },
    uploadOverlay: {
      position: 'absolute',
      top: theme.spacing.sm,
      start: theme.spacing.sm,
      end: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    flagBadge: {
      width: 24,
      height: 24,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    statusText: {
      fontSize: theme.typography.body.size * 0.625,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
    uploadInfo: {
      padding: theme.spacing.md,
    },
    userName: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    uploadType: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
    },
    emptyText: {
      fontSize: theme.typography.body.size,
      marginTop: theme.spacing.lg,
      color: theme.colors.onMuted,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: alpha(theme.colors.bg, 0.5),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      width: SCREEN_WIDTH - theme.spacing['2xl'],
      maxHeight: '80%',
      borderRadius: theme.radii.lg + theme.radii.xs,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.typography.h2.size * 0.9,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    modalImage: {
      width: '100%',
      height: 300,
    },
    uploadDetails: {
      padding: theme.spacing.lg,
    },
    detailLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onMuted,
    },
    detailValue: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onSurface,
    },
    modalActions: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.sm,
      gap: theme.spacing.sm,
    },
    approveButton: {
      backgroundColor: theme.colors.success,
    },
    rejectButton: {
      backgroundColor: theme.colors.danger,
    },
    actionButtonText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
  });
};

export default AdminUploadsScreen;
