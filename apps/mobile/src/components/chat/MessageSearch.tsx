/**
 * MessageSearch Component
 * Provides full-text search within chat messages with highlighting
 */

import { useCallback, useEffect, useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { matchesAPI } from '../../services/api';
import type { MobileMessage } from '../../types/message';
import { toMobileMessage } from '../../types/message';
import { useAuthStore } from '@pawfectmatch/core';
import { MessageSearchHeader } from './MessageSearchHeader';
import { MessageSearchResults } from './MessageSearchResults';

interface MessageSearchProps {
  matchId: string;
  visible: boolean;
  onClose: () => void;
  onMessageSelect?: (message: MobileMessage) => void;
}

interface SearchResult {
  message: MobileMessage;
  highlightedContent: string;
}

export function MessageSearch({
  matchId,
  visible,
  onClose,
  onMessageSelect,
}: MessageSearchProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, pageNum: number) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await matchesAPI.chat.searchMessages(matchId, searchQuery, {
        page: pageNum,
        limit: 20,
      });

      const highlightedResults: SearchResult[] = response.data.messages.map(
        (msg) => {
          // Convert core Message format to mobile Message format
          const message = toMobileMessage(msg, user?._id);
          // Highlight matching text
          const regex = new RegExp(`(${searchQuery})`, 'gi');
          const parts = message.content.split(regex);
          const highlightedContent = parts
            .map((part) => {
              if (regex.test(part)) {
                return `**${part}**`;
              }
              return part;
            })
            .join('');

          return {
            message,
            highlightedContent,
          };
        },
      );

      if (pageNum === 1) {
        setResults(highlightedResults);
      } else {
        setResults((prev) => [...prev, ...highlightedResults]);
      }

      setHasMore(response.data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [matchId, user?._id]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await performSearch(query, 1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, matchId, performSearch]);

  const loadMore = useCallback(() => {
    if (!isSearching && hasMore && query.trim().length >= 2) {
      performSearch(query, page + 1);
    }
  }, [isSearching, hasMore, query, page, performSearch]);

  const handleMessagePress = useCallback(
    (message: MobileMessage) => {
      onMessageSelect?.(message);
      onClose();
    },
    [onMessageSelect, onClose],
  );

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
    >
      <MessageSearchHeader query={query} onQueryChange={setQuery} onClose={onClose} />
      <MessageSearchResults
        results={results}
        isSearching={isSearching}
        error={error}
        query={query}
        hasMore={hasMore}
        onMessagePress={handleMessagePress}
        onLoadMore={loadMore}
      />
    </Animated.View>
  );
}
