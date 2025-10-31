/**
 * MessageSearchResults Component
 * Displays search results with highlighting
 */

import { useTheme } from '@/theme';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { MobileMessage } from '../../types/message';

interface SearchResult {
  message: MobileMessage;
  highlightedContent: string;
}

interface MessageSearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  query: string;
  hasMore: boolean;
  onMessagePress: (message: MobileMessage) => void;
  onLoadMore: () => void;
}

export function MessageSearchResults({
  results,
  isSearching,
  error,
  query,
  hasMore,
  onMessagePress,
  onLoadMore,
}: MessageSearchResultsProps): React.JSX.Element {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        resultsContainer: {
          flex: 1,
        },
        centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        loadingText: {
          fontSize: 16,
          marginTop: theme.spacing.md,
        },
        errorText: {
          fontSize: 16,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        },
        emptyText: {
          fontSize: 16,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        },
        resultsList: {
          padding: theme.spacing.md,
        },
        resultItem: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.md,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
        },
        resultContent: {
          gap: theme.spacing.sm,
        },
        resultHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        resultSender: {
          fontSize: 14,
          fontWeight: '600',
        },
        resultTime: {
          fontSize: 12,
        },
        resultText: {
          fontSize: 15,
          lineHeight: 20,
        },
        highlighted: {
          fontWeight: '700',
          color: theme.colors.bg,
          paddingHorizontal: theme.spacing.xs,
          borderRadius: theme.radii.xs,
        },
      }),
    [theme],
  );

  const renderResult = useCallback(
    ({ item }: { item: SearchResult }) => {
      const { message, highlightedContent } = item;
      const parts = highlightedContent.split(/(\*\*.*?\*\*)/g);

      return (
        <TouchableOpacity
          style={[
            styles.resultItem,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          onPress={() => onMessagePress(message)}
          accessibilityRole="button"
          accessibilityLabel={`Message from ${message.senderId}: ${message.content}`}
          accessibilityHint="Tap to navigate to this message in chat"
          hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
        >
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultSender, { color: theme.colors.onSurface }]} allowFontScaling>
                {message.senderId}
              </Text>
              <Text style={[styles.resultTime, { color: theme.colors.onMuted }]} allowFontScaling>
                {new Date(message.timestamp).toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.resultText, { color: theme.colors.onSurface }]} allowFontScaling>
              {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const text = part.slice(2, -2);
                  return (
                    <Text
                      key={index}
                      style={[styles.highlighted, { backgroundColor: theme.colors.primary }]}
                      allowFontScaling
                    >
                      {text}
                    </Text>
                  );
                }
                return <Text key={index} allowFontScaling>{part}</Text>;
              })}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, onMessagePress, styles],
  );

  if (isSearching && results.length === 0) {
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]} allowFontScaling>Searching...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]} allowFontScaling>{error}</Text>
        </View>
      </View>
    );
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.onMuted }]} allowFontScaling>
            No messages found
          </Text>
        </View>
      </View>
    );
  }

  if (query.length < 2) {
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.onMuted }]} allowFontScaling>
            Type at least 2 characters to search
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.resultsContainer}>
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.message._id}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && isSearching ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : null
        }
        contentContainerStyle={styles.resultsList}
        accessibilityRole="list"
        accessibilityLabel={`Search results: ${results.length} messages found`}
      />
    </View>
  );
}

