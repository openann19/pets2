/**
 * Verification List Component
 * Displays list of verification cards
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { Verification } from '../types';
import { VerificationCard } from './VerificationCard';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    listContainer: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 16,
    },
  });
}

interface VerificationListProps {
  verifications: Verification[];
  selectedVerification: Verification | null;
  onSelect: (verification: Verification) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestInfo: (id: string, message: string) => Promise<void>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const VerificationList: React.FC<VerificationListProps> = ({
  verifications,
  selectedVerification,
  onSelect,
  onApprove,
  onReject,
  onRequestInfo,
  refreshing = false,
  onRefresh,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const renderVerificationItem = ({ item }: { item: Verification }) => (
    <VerificationCard
      verification={item}
      onPress={onSelect}
      onApprove={onApprove}
      onReject={onReject}
      onRequestInfo={onRequestInfo}
    />
  );

  return (
    <FlatList
      data={verifications}
      renderItem={renderVerificationItem}
      keyExtractor={(item) => item.id}
      testID="verification-list"
      accessibilityLabel="List of verification requests"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer} testID="verification-list-empty">
          <Ionicons
            name="shield-checkmark-outline"
            size={64}
            color={colors.onMuted}
            accessibilityLabel="No verifications icon"
          />
          <Text style={[styles.emptyText, { color: colors.onMuted }]}>
            No verifications found
          </Text>
        </View>
      }
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};
