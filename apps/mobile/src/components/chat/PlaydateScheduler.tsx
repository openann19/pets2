/**
 * Playdate Scheduler Component
 * Integrated calendar for arranging pet meetups
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { logger } from '@pawfectmatch/core';
import { petChatService } from '../../services/petChatService';
import type { PlaydateProposal, VenueInfo, WeatherForecast } from '@pawfectmatch/core/types/pet-chat';

interface PlaydateSchedulerProps {
  matchId: string;
  pet1Id: string;
  pet2Id: string;
  onProposalCreated?: (proposal: PlaydateProposal) => void;
  onCancel?: () => void;
}

export const PlaydateScheduler: React.FC<PlaydateSchedulerProps> = ({
  matchId,
  pet1Id,
  pet2Id,
  onProposalCreated,
  onCancel,
}) => {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState(60); // minutes
  const [notes, setNotes] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<VenueInfo | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [nearbyVenues, setNearbyVenues] = useState<VenueInfo[]>([]);

  // Load nearby venues
  React.useEffect(() => {
    const loadVenues = async () => {
      try {
        // Get user location (placeholder - implement actual location service)
        const venues = await petChatService.getNearbyVenues(0, 0, 10);
        setNearbyVenues(venues);
      } catch (error) {
        logger.error('Failed to load venues', error);
      }
    };
    loadVenues();
  }, []);

  // Load weather forecast when date changes
  React.useEffect(() => {
    const loadWeather = async () => {
      if (selectedVenue?.coordinates || customLocation) {
        try {
          const coordinates = selectedVenue?.coordinates || { lat: 0, lng: 0 };
          const forecast = await petChatService.getWeatherForecast(
            coordinates.lat,
            coordinates.lng,
            selectedDate.toISOString(),
          );
          setWeatherForecast({
            date: selectedDate.toISOString(),
            ...forecast.forecast,
            suitableForOutdoor: forecast.suitableForOutdoor,
          } as WeatherForecast);
        } catch (error) {
          logger.error('Failed to load weather', error);
        }
      }
    };
    loadWeather();
  }, [selectedDate, selectedVenue, customLocation]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleCreateProposal = async () => {
    if (!selectedVenue && !customLocation) {
      Alert.alert('Location Required', 'Please select a venue or enter a custom location');
      return;
    }

    setIsLoading(true);
    try {
      const proposedTime = new Date(selectedDate);
      proposedTime.setHours(selectedTime.getHours());
      proposedTime.setMinutes(selectedTime.getMinutes());

      const proposal = await petChatService.proposePlaydate(matchId, {
        proposedTime: proposedTime.toISOString(),
        duration,
        venueId: selectedVenue?.venueId,
        location: selectedVenue
          ? {
              name: selectedVenue.name,
              address: selectedVenue.address,
              coordinates: selectedVenue.coordinates,
            }
          : customLocation
          ? {
              name: customLocation,
              address: customLocation,
              coordinates: { lat: 0, lng: 0 },
            }
          : undefined,
        notes: notes.trim() || undefined,
      });

      onProposalCreated?.(proposal.proposal);
      Alert.alert('Success', 'Playdate proposal sent!');
    } catch (error) {
      logger.error('Failed to create playdate proposal', error);
      Alert.alert('Error', 'Failed to create playdate proposal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      contentContainerStyle={styles.content}
    >
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Select Date
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.inputText, { color: theme.colors.onSurface }]}>
            {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Select Time
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.inputText, { color: theme.colors.onSurface }]}>
            {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Duration (minutes)
        </Text>
        <View style={styles.durationContainer}>
          {[30, 60, 90, 120].map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.durationButton,
                {
                  backgroundColor:
                    duration === dur ? theme.colors.primary : theme.colors.surface,
                  borderColor:
                    duration === dur ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setDuration(dur)}
            >
              <Text
                style={[
                  styles.durationText,
                  {
                    color:
                      duration === dur
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface,
                  },
                ]}
              >
                {dur}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Venue Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Location
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowVenuePicker(true)}
        >
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text
            style={[
              styles.inputText,
              { color: selectedVenue ? theme.colors.onSurface : theme.colors.onMuted },
            ]}
          >
            {selectedVenue ? selectedVenue.name : 'Select a venue'}
          </Text>
        </TouchableOpacity>

        {/* Custom Location */}
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.onSurface,
            },
          ]}
          placeholder="Or enter custom location"
          placeholderTextColor={theme.colors.onMuted}
          value={customLocation}
          onChangeText={setCustomLocation}
        />

        {/* Nearby Venues List */}
        {showVenuePicker && nearbyVenues.length > 0 && (
          <View
            style={[
              styles.venuesList,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {nearbyVenues.map((venue) => (
              <TouchableOpacity
                key={venue.serviceId}
                style={styles.venueItem}
                onPress={() => {
                  setSelectedVenue(venue);
                  setShowVenuePicker(false);
                }}
              >
                <Text style={[styles.venueName, { color: theme.colors.onSurface }]}>
                  {venue.name}
                </Text>
                <Text style={[styles.venueAddress, { color: theme.colors.onMuted }]}>
                  {venue.address} • {venue.distance.toFixed(1)}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Weather Forecast */}
      {weatherForecast && (
        <View
          style={[
            styles.weatherContainer,
            {
              backgroundColor: weatherForecast.suitableForOutdoor
                ? `${theme.colors.success}20`
                : `${theme.colors.warning}20`,
              borderColor: weatherForecast.suitableForOutdoor
                ? theme.colors.success
                : theme.colors.warning,
            },
          ]}
        >
          <Ionicons
            name={weatherForecast.suitableForOutdoor ? 'sunny' : 'cloudy'}
            size={24}
            color={weatherForecast.suitableForOutdoor ? theme.colors.success : theme.colors.warning}
          />
          <View style={styles.weatherInfo}>
            <Text style={[styles.weatherText, { color: theme.colors.onSurface }]}>
              {weatherForecast.condition} • {weatherForecast.temperature.high}°
              {weatherForecast.temperature.unit === 'celsius' ? 'C' : 'F'}
            </Text>
            <Text style={[styles.weatherSuggestion, { color: theme.colors.onMuted }]}>
              {weatherForecast.suitableForOutdoor
                ? 'Great weather for outdoor play!'
                : 'Consider indoor activities or reschedule'}
            </Text>
          </View>
        </View>
      )}

      {/* Notes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.onSurface,
            },
          ]}
          placeholder="Add any special notes or requirements..."
          placeholderTextColor={theme.colors.onMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onSurface }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleCreateProposal}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
            {isLoading ? 'Creating...' : 'Send Proposal'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  venuesList: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 200,
  },
  venueItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherSuggestion: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {},
  submitButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

