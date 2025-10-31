import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MatchWidgetProps {
  matches: Array<{
    id: string;
    name: string;
    petName: string;
    petPhoto: string;
    lastMessage?: string;
    timestamp?: string;
    unreadCount?: number;
  }>;
  onMatchPress: (matchId: string) => void;
  onViewAll: () => void;
}

export function MatchWidget({
  matches,
  onMatchPress,
  onViewAll,
}: MatchWidgetProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Matches</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.matchesContainer}>
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => {
                onMatchPress(match.id);
              }}
            >
              <View style={styles.petImageContainer}>
                <Image
                  source={{ uri: match.petPhoto }}
                  style={styles.petImage}
                  resizeMode="cover"
                />
                {match.unreadCount && match.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{match.unreadCount}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.petName}>{match.petName}</Text>
                {match.lastMessage ? (
                  <Text
                    style={styles.lastMessage}
                    numberOfLines={1}
                  >
                    {match.lastMessage}
                  </Text>
                ) : null}
                {match.timestamp ? <Text style={styles.timestamp}>{match.timestamp}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii?.lg ?? theme.radius?.md ?? 16,
      padding: theme.spacing.md,
      margin: theme.spacing.sm,
      shadowColor: theme.palette?.overlay ?? theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    viewAll: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    matchesContainer: {
      flexDirection: 'row',
      paddingEnd: theme.spacing.md,
    },
    matchCard: {
      width: 120,
      marginEnd: theme.spacing.sm,
    },
    petImageContainer: {
      position: 'relative',
      marginBottom: theme.spacing.xs,
    },
    petImage: {
      width: '100%',
      height: 80,
      borderRadius: theme.radii?.sm ?? theme.radius?.sm ?? 8,
    },
    unreadBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.danger,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: '600',
    },
    matchInfo: {
      alignItems: 'center',
    },
    matchName: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    petName: {
      fontSize: 11,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
    },
    lastMessage: {
      fontSize: 10,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: 2,
    },
    timestamp: {
      fontSize: 9,
      color: theme.colors.onMuted,
    },
  });
}
