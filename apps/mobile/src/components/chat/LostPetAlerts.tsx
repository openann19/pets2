/**
 * Lost & Found Alerts Component
 * Community notifications for lost pets
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { LostPetAlert } from '@pawfectmatch/core/types/pet-chat';

interface LostPetAlertsProps {
  userId: string;
  userLocation?: { lat: number; lng: number };
  onReportSighting: (alertId: string, sighting: any) => void;
  onCreateAlert: (alert: Omit<LostPetAlert, 'alertId' | 'createdAt'>) => void;
}

export const LostPetAlerts: React.FC<LostPetAlertsProps> = ({
  userId: _userId,
  userLocation,
  onReportSighting,
  onCreateAlert: _onCreateAlert,
}) => {
  const theme = useTheme();
  // @ts-expect-error - State declared for future implementation
  const [activeAlerts, setActiveAlerts] = useState<LostPetAlert[]>([]);
  // @ts-expect-error - State declared for future implementation
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleReportSighting = (alertId: string) => {
    Alert.prompt(
      'Report Sighting',
      'Where did you see this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: (location) => {
            if (location && userLocation) {
              onReportSighting(alertId, {
                location: {
                  lat: userLocation.lat,
                  lng: userLocation.lng,
                  address: location,
                },
                description: `Sighted at ${location}`,
                reportedAt: new Date().toISOString(),
              });
            }
          },
        },
      ],
      'plain-text',
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Lost & Found
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onMuted }]}>
            Help reunite pets with their families
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreateForm(true)}
        >
          <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={[styles.createButtonText, { color: theme.colors.onPrimary }]}>
            Report Lost
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.alertsList}
        contentContainerStyle={styles.alertsContent}
        showsVerticalScrollIndicator={false}
      >
        {activeAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="paw" size={48} color={theme.colors.onMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
              No active alerts in your area
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onMuted }]}>
              Be the first to help reunite a lost pet
            </Text>
          </View>
        ) : (
          activeAlerts.map((alert) => (
            <View
              key={alert.alertId}
              style={[
                styles.alertCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    alert.status === 'active'
                      ? theme.colors.danger
                      : theme.colors.success,
                },
              ]}
            >
              <View style={styles.alertHeader}>
                {alert.petPhoto && (
                  <Image
                    source={{ uri: alert.petPhoto }}
                    style={styles.petPhoto}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.alertInfo}>
                  <View style={styles.alertStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            alert.status === 'active'
                              ? theme.colors.danger
                              : theme.colors.success,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            alert.status === 'active'
                              ? theme.colors.danger
                              : theme.colors.success,
                        },
                      ]}
                    >
                      {alert.status === 'active' ? 'Lost' : 'Found'}
                    </Text>
                  </View>
                  <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
                    {alert.petName}
                  </Text>
                  <Text style={[styles.lastSeen, { color: theme.colors.onMuted }]}>
                    Last seen: {new Date(alert.lastSeenAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                {alert.description}
              </Text>

              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={theme.colors.onMuted} />
                <Text style={[styles.locationText, { color: theme.colors.onMuted }]}>
                  {alert.lastSeenLocation.address}
                </Text>
              </View>

              {alert.reward && (
                <View style={styles.rewardBadge}>
                  <Ionicons name="gift" size={16} color={theme.colors.warning} />
                  <Text style={[styles.rewardText, { color: theme.colors.warning }]}>
                    Reward: ${alert.reward}
                  </Text>
                </View>
              )}

              {alert.status === 'active' && (
                <TouchableOpacity
                  style={[
                    styles.reportButton,
                    {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => handleReportSighting(alert.alertId)}
                >
                  <Ionicons name="eye" size={18} color={theme.colors.onPrimary} />
                  <Text style={[styles.reportButtonText, { color: theme.colors.onPrimary }]}>
                    I Saw This Pet
                  </Text>
                </TouchableOpacity>
              )}

              {alert.sightings && alert.sightings.length > 0 && (
                <View style={styles.sightingsContainer}>
                  <Text style={[styles.sightingsTitle, { color: theme.colors.onMuted }]}>
                    Recent Sightings ({alert.sightings.length})
                  </Text>
                  {alert.sightings.slice(0, 3).map((sighting, index) => (
                    <View key={index} style={styles.sightingItem}>
                      <Ionicons name="location" size={12} color={theme.colors.onMuted} />
                      <Text style={[styles.sightingText, { color: theme.colors.onMuted }]}>
                        {sighting.location.address} •{' '}
                        {new Date(sighting.reportedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertsList: {
    flex: 1,
  },
  alertsContent: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  alertCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  petPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  alertInfo: {
    flex: 1,
  },
  alertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sightingsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sightingsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sightingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sightingText: {
    fontSize: 12,
  },
});

