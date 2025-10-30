import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { FLAGS } from '../config/flags';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { getExtendedColors } from '../theme/adapters';

interface LiveBrowseScreenProps {
  navigation: any;
}

interface LiveStreamItem {
  _id: string;
  title: string;
  coverUrl?: string;
  viewers: number;
  isLive: boolean;
  startedAt: string;
}

export default function LiveBrowseScreen({ navigation }: LiveBrowseScreenProps) {
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const colors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['live-active'],
    queryFn: async () => {
      const data = await api.request('/live/active', { method: 'GET' });
      return (data as { items: LiveStreamItem[] }).items;
    },
    enabled: FLAGS.GO_LIVE,
    refetchInterval: 5000,
  });

  if (!FLAGS.GO_LIVE) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Ionicons
            name="lock-closed"
            size={64}
            color={colors.onMuted}
          />
          <Text style={styles.unavailableText}>Live streaming is not available</Text>
          <Text style={styles.unavailableSubtext}>This feature is currently disabled</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Streams</Text>
        <TouchableOpacity
          testID="LiveBrowseScreen-button-2"
          accessibilityLabel="refetch()"
          accessibilityRole="button"
          onPress={() => refetch()}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.grid}
        data={data ?? []}
        numColumns={2}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#fff"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            testID="LiveBrowseScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => navigation.navigate('LiveViewer', { streamId: item._id })}
          >
            <Image
              source={{ uri: item.coverUrl || 'https://picsum.photos/400' }}
              style={styles.cover}
            />
            <View style={styles.badge}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text
                style={styles.title}
                numberOfLines={1}
              >
                {item.title || 'Live Stream'}
              </Text>
              <View style={styles.viewerInfo}>
                <Ionicons
                  name="people"
                  size={14}
                  color={colors.onSurface}
                />
                <Text style={styles.viewerCount}>{item.viewers}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="videocam"
              size={64}
              color={colors.onMuted}
            />
            <Text style={styles.emptyText}>No active streams</Text>
            <Text style={styles.emptySubtext}>Be the first to go live!</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (
  theme: ReturnType<typeof useTheme>,
  colors: ReturnType<typeof getExtendedColors>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing?.lg ?? 16,
    },
    headerTitle: {
      color: colors.onSurface,
      fontSize: theme.typography?.fontSize?.xl ?? 24,
      fontWeight: theme.typography?.fontWeight?.bold ?? '700',
    },
    grid: {
      padding: theme.spacing?.md ?? 12,
      gap: theme.spacing?.md ?? 12,
    },
    card: {
      flex: 1,
      margin: (theme.spacing?.sm ?? 12) / 2,
      backgroundColor: colors.surface,
      borderRadius: theme.radius?.lg ?? 12,
      overflow: 'hidden',
    },
    cover: {
      width: '100%',
      height: 140,
      backgroundColor: colors.surfaceElevated,
    },
    badge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: colors.danger,
      paddingHorizontal: theme.spacing?.xs ?? 8,
      paddingVertical: (theme.spacing?.xs ?? 8) / 2,
      borderRadius: theme.radius?.md ?? 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: (theme.spacing?.xs ?? 8) / 2,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.onPrimary,
    },
    badgeText: {
      color: colors.onPrimary,
      fontWeight: theme.typography?.fontWeight?.bold ?? '800',
      fontSize: theme.typography?.fontSize?.xs ?? 10,
    },
    cardFooter: {
      padding: theme.spacing?.sm ?? 10,
    },
    title: {
      color: colors.onSurface,
      fontWeight: theme.typography?.fontWeight?.semibold ?? '600',
      fontSize: theme.typography?.fontSize?.md ?? 14,
      marginBottom: theme.spacing?.xs ?? 6,
    },
    viewerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: (theme.spacing?.xs ?? 8) / 2,
    },
    viewerCount: {
      color: colors.onMuted,
      fontSize: theme.typography?.fontSize?.sm ?? 12,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: theme.spacing?.xl ?? 80,
    },
    emptyText: {
      color: colors.onSurface,
      fontSize: theme.typography?.fontSize?.lg ?? 18,
      fontWeight: theme.typography?.fontWeight?.semibold ?? '600',
      marginTop: theme.spacing?.md ?? 16,
    },
    emptySubtext: {
      color: colors.onMuted,
      fontSize: theme.typography?.fontSize?.sm ?? 14,
      marginTop: theme.spacing?.sm ?? 8,
    },
    unavailableContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing?.xl ?? 32,
    },
    unavailableText: {
      color: colors.onSurface,
      fontSize: theme.typography?.fontSize?.lg ?? 18,
      fontWeight: theme.typography?.fontWeight?.semibold ?? '600',
      marginTop: theme.spacing?.md ?? 16,
    },
    unavailableSubtext: {
      color: colors.onMuted,
      fontSize: theme.typography?.fontSize?.sm ?? 14,
      marginTop: theme.spacing?.sm ?? 8,
    },
  });
