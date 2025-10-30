import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventWidgetProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    maxAttendees: number;
    category: string;
    image?: string;
  };
  onEventPress: () => void;
  onJoinEvent: () => void;
}

export function EventWidget({
  event,
  onEventPress,
  onJoinEvent,
}: EventWidgetProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      playdate: '🐾',
      training: '🎓',
      social: '👥',
      adoption: '🏠',
      health: '🏥',
    };
    return emojis[category as keyof typeof emojis] || '🎉';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'playdate':
        return theme.colors.success;
      case 'training':
        return theme.colors.info;
      case 'social':
        return theme.colors.primary;
      case 'adoption':
        return theme.colors.warning;
      case 'health':
        return theme.colors.danger;
      default:
        return theme.colors.onMuted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Event</Text>
        <TouchableOpacity
          onPress={onEventPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="open-outline"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.eventCard}>
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text
              style={styles.eventTitle}
              numberOfLines={2}
            >
              {event.title}
            </Text>
            <View
              style={StyleSheet.flatten([
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(event.category) },
              ])}
            >
              <Text style={styles.categoryEmoji}>{getCategoryEmoji(event.category)}</Text>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.colors.border}
              />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.border}
              />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.border}
              />
              <Text
                style={styles.detailText}
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="people-outline"
                size={14}
                color={theme.colors.border}
              />
              <Text style={styles.detailText}>
                {event.attendees}/{event.maxAttendees} attending
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={onJoinEvent}
          >
            <Text style={styles.joinButtonText}>Join Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md ?? 16,
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
    eventCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.sm ?? 12,
      overflow: 'hidden',
    },
    eventImage: {
      width: '100%',
      height: 100,
    },
    eventInfo: {
      padding: theme.spacing.sm,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    categoryBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryEmoji: {
      fontSize: 12,
    },
    eventDetails: {
      marginBottom: theme.spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    detailText: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginLeft: theme.spacing.xs,
      flex: 1,
    },
    joinButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xs ?? 8,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },
    joinButtonText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
