/**
 * PET-FRIENDLY MAP SCREEN - Local Discovery
 *
 * Shows pet-friendly venues, meetups, and local events:
 * - Parks, trails, cafes with pet policies
 * - Upcoming meetups and playdates
 * - Geofenced alerts for closures/weather
 * - Venue filtering and search
 *
 * Uses existing EliteContainer architecture and MapView
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';
import { useTheme } from '@/theme';
import { getExtendedColors } from '@/theme/adapters';

// Local type definitions
interface Venue {
  _id: string;
  name: string;
  type: 'park' | 'vet' | 'groomer' | 'cafe' | 'store';
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  rating: number;
  petPolicy: string;
  amenities: string[];
  hours: string;
  imageUrl?: string;
}

type PetFriendlyMapScreenProps = {
  navigation: any;
  route?: {
    params?: {
      filter?: 'parks' | 'vets' | 'groomers' | 'all';
    };
  };
};

const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Riverside Park',
    type: 'park',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    address: '123 River St, New York, NY',
    amenities: ['fenced', 'water_station', 'waste_bags', 'small_dog_area'],
    petPolicies: {
      allowed: true,
      restrictions: ['leashed required', 'no large dogs after 6pm'],
      maxSize: 'any',
      leashedRequired: true,
      fees: 0,
    },
    rating: 4.5,
    reviews: 127,
  },
  {
    id: '2',
    name: 'Paws & Coffee',
    type: 'patio',
    coordinates: { lat: 40.7614, lng: -73.9776 },
    address: '456 Coffee Ave, New York, NY',
    amenities: ['outdoor_seating', 'pet_menu', 'water_bowls'],
    petPolicies: {
      allowed: true,
      restrictions: [],
      maxSize: 'small',
      leashedRequired: true,
      fees: 0,
    },
    rating: 4.8,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Downtown Veterinary',
    type: 'vet',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    address: '789 Health Blvd, New York, NY',
    amenities: ['emergency_care', 'grooming', 'boarding'],
    petPolicies: {
      allowed: true,
      restrictions: [],
      maxSize: 'any',
      leashedRequired: false,
      fees: 0,
    },
    rating: 4.2,
    reviews: 203,
  },
];

const MOCK_MEETUPS = [
  {
    id: '1',
    title: 'Yappy Hour Meetup',
    description: 'Weekly social gathering for friendly dogs and their owners',
    type: 'social',
    host: { firstName: 'Sarah', lastName: 'Johnson' },
    venue: MOCK_VENUES[0],
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration: 120,
    maxAttendees: 15,
    attendees: 8,
    petRequirements: {
      vaccinated: true,
      size: 'any',
      leashed: true,
    },
    status: 'published',
  },
  {
    id: '2',
    title: 'Puppy Playdate',
    description: 'Safe socialization for puppies under 6 months',
    type: 'playdate',
    host: { firstName: 'Mike', lastName: 'Chen' },
    venue: MOCK_VENUES[0],
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 90,
    maxAttendees: 10,
    attendees: 6,
    petRequirements: {
      vaccinated: true,
      size: 'small',
      leashed: true,
    },
    status: 'published',
  },
];

export default function PetFriendlyMapScreen({
  navigation,
  route
}: PetFriendlyMapScreenProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const { filter = 'all' } = route?.params || {};

  const [selectedTab, setSelectedTab] = useState<'venues' | 'meetups' | 'alerts'>('venues');
  const [selectedFilters, setSelectedFilters] = useState({
    type: filter,
    amenities: [] as string[],
    rating: 0,
  });

  const [venues] = useState(MOCK_VENUES);
  const [meetups] = useState(MOCK_MEETUPS);
  const [alerts] = useState([
    {
      id: '1',
      type: 'heat_warning',
      title: 'Heat Advisory',
      message: 'Temperatures expected to reach 85°F. Limit outdoor time between 10am-6pm.',
      severity: 'warning',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const filteredVenues = venues.filter(venue => {
    if (selectedFilters.type !== 'all' && venue.type !== selectedFilters.type) return false;
    if (selectedFilters.rating > 0 && venue.rating < selectedFilters.rating) return false;
    if (selectedFilters.amenities.length > 0) {
      const hasAllAmenities = selectedFilters.amenities.every(amenity =>
        venue.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    return true;
  });

  const renderVenueCard = (venue: Venue) => (
    <TouchableOpacity
      key={venue.id}
      style={[styles.venueCard, { backgroundColor: colors.bgElevated }]}
      onPress={() => navigation.navigate('VenueDetails', { venueId: venue.id })}
    >
      <View style={styles.venueHeader}>
        <View style={styles.venueInfo}>
          <Text style={[styles.venueName, { color: colors.text }]}>
            {venue.name}
          </Text>
          <Text style={[styles.venueType, { color: colors.primary }]}>
            {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
          </Text>
        </View>
        <View style={styles.venueRating}>
          <Text style={[styles.ratingText, { color: colors.text }]}>
            ⭐ {venue.rating}
          </Text>
          <Text style={[styles.reviewsText, { color: colors.textMuted }]}>
            ({venue.reviews})
          </Text>
        </View>
      </View>

      <Text style={[styles.venueAddress, { color: colors.textMuted }]}>
        📍 {venue.address}
      </Text>

      <View style={styles.venueAmenities}>
        {venue.amenities.slice(0, 3).map((amenity: string, index: number) => (
          <View key={index} style={[styles.amenityTag, { backgroundColor: colors.bg }]}>
            <Text style={[styles.amenityText, { color: colors.textMuted }]}>
              {amenity.replace('_', ' ')}
            </Text>
          </View>
        ))}
        {venue.amenities.length > 3 && (
          <Text style={[styles.moreAmenities, { color: colors.textMuted }]}>
            +{venue.amenities.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.petPolicy}>
        <Text style={[styles.policyText, {
          color: venue.petPolicies.allowed ? colors.success : colors.danger
        }]}>
          {venue.petPolicies.allowed ? '✅ Pets Welcome' : '❌ No Pets'}
        </Text>
        {venue.petPolicies.fees > 0 && (
          <Text style={[styles.feeText, { color: colors.warning }]}>
            ${venue.petPolicies.fees} fee
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMeetupCard = (meetup: any) => (
    <TouchableOpacity
      key={meetup.id}
      style={[styles.meetupCard, { backgroundColor: colors.bgElevated }]}
      onPress={() => navigation.navigate('MeetupDetails', { meetupId: meetup.id })}
    >
      <View style={styles.meetupHeader}>
        <View style={styles.meetupInfo}>
          <Text style={[styles.meetupTitle, { color: colors.text }]}>
            {meetup.title}
          </Text>
          <Text style={[styles.meetupHost, { color: colors.textMuted }]}>
            Hosted by {meetup.host.firstName}
          </Text>
        </View>
        <View style={styles.attendeeCount}>
          <Text style={[styles.attendeeText, { color: colors.primary }]}>
            👥 {meetup.attendees}/{meetup.maxAttendees}
          </Text>
        </View>
      </View>

      <Text style={[styles.meetupDescription, { color: colors.textMuted }]}>
        {meetup.description}
      </Text>

      <View style={styles.meetupDetails}>
        <Text style={[styles.meetupTime, { color: colors.text }]}>
          📅 {new Date(meetup.scheduledAt).toLocaleDateString()} at{' '}
          {new Date(meetup.scheduledAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={[styles.meetupVenue, { color: colors.textMuted }]}>
          📍 {meetup.venue.name}
        </Text>
        <Text style={[styles.meetupDuration, { color: colors.textMuted }]}>
          ⏱️ {meetup.duration} minutes
        </Text>
      </View>

      <View style={styles.meetupRequirements}>
        <Text style={[styles.requirementsTitle, { color: colors.text }]}>
          Pet Requirements:
        </Text>
        <View style={styles.requirementsList}>
          {meetup.petRequirements.vaccinated && (
            <Text style={[styles.requirement, { color: colors.success }]}>✅ Vaccinated</Text>
          )}
          <Text style={[styles.requirement, { color: colors.textMuted }]}>
            📏 Size: {meetup.petRequirements.size}
          </Text>
          {meetup.petRequirements.leashed && (
            <Text style={[styles.requirement, { color: colors.textMuted }]}>🪢 Leashed</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.rsvpButton, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('RSVP', 'RSVP functionality would be implemented here')}
      >
        <Text style={[styles.rsvpButtonText, { color: colors.primaryText }]}>
          🎯 RSVP
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlertCard = (alert: any) => (
    <View
      key={alert.id}
      style={[
        styles.alertCard,
        {
          backgroundColor: alert.severity === 'warning' ? '#fff3cd' : '#f8d7da',
          borderColor: alert.severity === 'warning' ? '#ffeaa7' : '#f5c6cb',
          borderWidth: 1,
        }
      ]}
    >
      <View style={styles.alertHeader}>
        <Text style={[styles.alertTitle, {
          color: alert.severity === 'warning' ? '#856404' : '#721c24'
        }]}>
          {alert.severity === 'warning' ? '⚠️' : '🚨'} {alert.title}
        </Text>
        <Text style={[styles.alertExpiry, {
          color: alert.severity === 'warning' ? '#856404' : '#721c24'
        }]}>
          Expires: {new Date(alert.expiresAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={[styles.alertMessage, {
        color: alert.severity === 'warning' ? '#856404' : '#721c24'
      }]}>
        {alert.message}
      </Text>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.bgElevated }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor: selectedFilters.type === 'all' ? colors.primary : colors.bg,
            }
          ]}
          onPress={() => setSelectedFilters(prev => ({ ...prev, type: 'all' }))}
        >
          <Text style={[
            styles.filterChipText,
            {
              color: selectedFilters.type === 'all' ? colors.primaryText : colors.text
            }
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {['parks', 'vets', 'groomers', 'patio'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilters.type === type ? colors.primary : colors.bg,
              }
            ]}
            onPress={() => setSelectedFilters(prev => ({ ...prev, type }))}
          >
            <Text style={[
              styles.filterChipText,
              {
                color: selectedFilters.type === type ? colors.primaryText : colors.text
              }
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <EliteContainer>
      <EliteHeader title="Pet Places & Events" />

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgElevated }]}>
        {(['venues', 'meetups', 'alerts'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              {
                color: selectedTab === tab ? colors.primary : colors.textMuted
              }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'meetups' && ` (${meetups.length})`}
              {tab === 'alerts' && alerts.length > 0 && ` (${alerts.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters for Venues */}
      {selectedTab === 'venues' && renderFilters()}

      <ScrollView style={styles.container}>
        {selectedTab === 'venues' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pet-Friendly Places ({filteredVenues.length})
            </Text>

            {filteredVenues.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  🐾 No places found
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Try adjusting your filters to find more pet-friendly locations.
                </Text>
              </View>
            ) : (
              filteredVenues.map(renderVenueCard)
            )}
          </View>
        )}

        {selectedTab === 'meetups' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming Meetups ({meetups.length})
            </Text>

            {meetups.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  📅 No meetups scheduled
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Check back later for upcoming pet events in your area.
                </Text>
              </View>
            ) : (
              meetups.map(renderMeetupCard)
            )}
          </View>
        )}

        {selectedTab === 'alerts' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Local Alerts ({alerts.length})
            </Text>

            {alerts.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  ✅ All clear
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No active alerts in your area.
                </Text>
              </View>
            ) : (
              alerts.map(renderAlertCard)
            )}
          </View>
        )}
      </ScrollView>
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  venueCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueType: {
    fontSize: 14,
    fontWeight: '500',
  },
  venueRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  venueAddress: {
    fontSize: 14,
    marginBottom: 12,
  },
  venueAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
  },
  moreAmenities: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  petPolicy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  meetupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  meetupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetupHost: {
    fontSize: 14,
  },
  attendeeCount: {
    alignItems: 'center',
  },
  attendeeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  meetupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meetupDetails: {
    marginBottom: 12,
  },
  meetupTime: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  meetupVenue: {
    fontSize: 14,
    marginBottom: 4,
  },
  meetupDuration: {
    fontSize: 14,
  },
  meetupRequirements: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirement: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  rsvpButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertExpiry: {
    fontSize: 12,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
