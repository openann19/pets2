/**
 * Admin Support Screen
 * Production-ready implementation for admin-customer support chat
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { AdminScreenProps } from '../../navigation/types';
import { SupportChatCard, SupportChatView } from './support/components';
import { useAdminSupport } from './support/hooks/useAdminSupport';
import type { SupportChatFilter } from './support/types';

const AdminSupportScreen = ({ navigation }: AdminScreenProps<'AdminSupport'>) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    chats,
    isLoading,
    isRefreshing,
    filter,
    selectedChat,
    messages,
    isLoadingMessages,
    setFilter,
    loadChats,
    selectChat,
    closeChat,
    sendMessage,
    closeSupportChat,
  } = useAdminSupport();

  const filteredChats = useMemo(() => {
    let filtered = chats;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter((chat) => chat.status === filter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.userName.toLowerCase().includes(query) ||
          chat.userEmail.toLowerCase().includes(query) ||
          chat.subject.toLowerCase().includes(query) ||
          chat.lastMessage.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [chats, filter, searchQuery]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedChat) return;
      await sendMessage(selectedChat.id, message);
    },
    [selectedChat, sendMessage],
  );

  const handleCloseChat = useCallback(async () => {
    if (!selectedChat) return;
    await closeSupportChat(selectedChat.id);
  }, [selectedChat, closeSupportChat]);

  const renderChatItem = useCallback(
    ({ item }: { item: typeof chats[0] }) => (
      <SupportChatCard
        chat={item}
        onPress={() => selectChat(item)}
      />
    ),
    [selectChat],
  );

  if (selectedChat) {
    return (
      <ErrorBoundary>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
          <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={closeChat}
              accessibilityRole="button"
              accessibilityLabel="Back to chat list"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                {selectedChat.userName}
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.onMuted }]}>
                {selectedChat.userEmail}
              </Text>
            </View>
          </View>
          <SupportChatView
            messages={messages}
            isLoading={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onCloseChat={handleCloseChat}
            chatUserName={selectedChat.userName}
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              Support Chats
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.onMuted }]}>
              Chat with customers and resolve issues
            </Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.searchInputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.onMuted}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder="Search chats..."
              placeholderTextColor={theme.colors.onMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterContainer}>
            {(['all', 'open', 'pending', 'closed'] as SupportChatFilter[]).map((filterValue) => (
              <TouchableOpacity
                key={filterValue}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      filter === filterValue ? theme.colors.primary : theme.colors.surfaceAlt,
                  },
                ]}
                onPress={() => setFilter(filterValue)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filterValue}`}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        filter === filterValue ? '#FFFFFF' : theme.colors.onSurface,
                    },
                  ]}
                >
                  {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chats List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
              Loading support chats...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadChats(true)}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={theme.colors.onMuted}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  {searchQuery || filter !== 'all'
                    ? 'No chats match your filters'
                    : 'No support chats yet'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

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
      gap: theme.spacing.md,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs / 2,
    },
    headerSubtitle: {
      fontSize: theme.typography.body.size * 0.875,
    },
    searchContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    filterText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.typography.body.size,
    },
    listContent: {
      padding: theme.spacing.lg,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['4xl'],
      gap: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.body.size,
      textAlign: 'center',
    },
  });

export default AdminSupportScreen;

