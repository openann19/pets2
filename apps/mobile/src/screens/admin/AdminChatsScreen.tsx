/**
 * Admin Chat Moderation Screen
 * Production-ready implementation for moderating user chats
 * REFACTORED: Extracted hooks and components for better maintainability
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
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
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { ChatMessageCard, SearchAndFilters, EmptyState } from './chats/components';
import { useAdminChats } from './chats/hooks';

interface AdminChatsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AdminChatsScreen({
  navigation,
}: AdminChatsScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    messages,
    loading,
    refreshing,
    searchQuery,
    filter,
    setSearchQuery,
    setFilter,
    loadMessages,
    handleMessageAction,
  } = useAdminChats();

  const renderMessage = useCallback(
    ({ item }: { item: typeof messages[0] }) => (
      <ChatMessageCard
        message={item}
        onAction={handleMessageAction}
      />
    ),
    [handleMessageAction],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminChatsScreen-button-back"
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
          Chat Moderation
        </Text>
      </View>

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        filter={filter}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
      />

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading messages...
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadMessages(true)}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={<EmptyState />}
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
    listContainer: {
      padding: theme.spacing.lg,
    },
  });
