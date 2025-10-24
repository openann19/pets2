import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  onJoinEvent
}: EventWidgetProps): React.JSX.Element {
  const getCategoryEmoji = (category: string) => {
    const emojis = {
      playdate: '🐾',
      training: '🎓',
      social: '👥',
      adoption: '🏠',
      health: '🏥'
    };
    return emojis[category as keyof typeof emojis] || '🎉';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      playdate: '#10B981',
      training: '#3B82F6',
      social: '#8B5CF6',
      adoption: '#F59E0B',
      health: '#EF4444'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Event</Text>
        <TouchableOpacity onPress={onEventPress}>
          <Ionicons name="open-outline" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={styles.eventCard}>
        {event.image ? <Image
            source={{ uri: event.image }}
            style={styles.eventImage}
            resizeMode="cover"
          /> : null}
        
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
              <Text style={styles.categoryEmoji}>{getCategoryEmoji(event.category)}</Text>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 100,
  },
  eventInfo: {
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
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
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
