/**
 * ENHANCED PET PROFILE SCREEN - Pet-First Features
 *
 * Builds on existing architecture with comprehensive pet profiles:
 * - Multi-pet support with primary pet designation
 * - Play styles and personality matching
 * - Care badges and verification
 * - Health passport with vaccine/medication tracking
 * - Availability scheduling
 * - Lost pet alerts
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Existing architecture components
import {
  FXContainerPresets,
  ModernPhotoUpload,
  useStaggeredAnimation,
} from '../components';
import { EliteContainer, EliteHeader } from '../components/elite';
import { useTheme } from '@mobile/theme';

// Pet-first hooks
import {
  usePetProfile,
  usePets,
  useHealthPassport,
  useLostPetAlert
} from '../hooks/domains/pet';

// Types
import type { Pet } from '@pawfectmatch/core';
import type { RootStackScreenProps } from '../navigation/types';

type EnhancedPetProfileScreenProps = RootStackScreenProps<'EnhancedPetProfile'> & {
  petId?: string;
  isNew?: boolean;
};

export default function EnhancedPetProfileScreen({
  navigation,
  route
}: EnhancedPetProfileScreenProps) {
  const theme = useTheme();
  const { petId, isNew } = route?.params || {};

  // Pet management hooks
  const {
    pet,
    loading: petLoading,
    error: petError,
    updatePet,
    addHealthRecord,
    updateAvailability,
    verifyPet,
  } = usePetProfile(petId);

  const { pets } = usePets();
  const {
    healthData,
    reminders,
    addVaccineRecord,
    addMedicationRecord,
  } = useHealthPassport(petId || '');

  const { createAlert, activeAlert } = useLostPetAlert();

  // Form state
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'availability' | 'safety'>('profile');
  const [isEditing, setIsEditing] = useState(isNew || false);

  // Play style selection
  const playStyles = ['chase', 'tug', 'fetch', 'wrestle', 'water'];
  const energyLevels = [1, 2, 3, 4, 5];

  const handlePlayStyleToggle = useCallback(async (style: string) => {
    if (!pet) return;

    const currentStyles = pet.playStyle || [];
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];

    await updatePet({ playStyle: newStyles });
  }, [pet, updatePet]);

  const handleEnergySelect = useCallback(async (energy: number) => {
    await updatePet({ energy });
  }, [updatePet]);

  const handleSociabilitySelect = useCallback(async (sociability: 'shy' | 'neutral' | 'social') => {
    await updatePet({ sociability });
  }, [updatePet]);

  const handleCreateLostPetAlert = useCallback(async () => {
    if (!pet) return;

    try {
      await createAlert({
        petId: pet._id,
        lastSeenLocation: {
          lat: 0, // Would come from GPS
          lng: 0,
          address: 'Current location'
        },
        description: `${pet.name} - ${pet.breed} ${pet.species}`,
        broadcastRadius: 5,
      });
      Alert.alert('Alert Created', 'Lost pet alert has been created and broadcasted to nearby users.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create lost pet alert. Please try again.');
    }
  }, [pet, createAlert]);

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Name</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{pet?.name}</Text>
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Species & Breed</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {pet?.species} {pet?.breed && `- ${pet.breed}`}
          </Text>
        </View>
      </View>

      {/* Play Style & Personality */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Play Style & Personality</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Play Styles</Text>
          <View style={styles.playStylesContainer}>
            {playStyles.map(style => {
              const isSelected = pet?.playStyle?.includes(style) || false;
              return (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.playStyleChip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.bgElevated,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => handlePlayStyleToggle(style)}
                >
                  <Text style={[
                    styles.playStyleText,
                    { color: isSelected ? theme.colors.primaryText : theme.colors.text }
                  ]}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Energy Level</Text>
          <View style={styles.energyContainer}>
            {energyLevels.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyDot,
                  {
                    backgroundColor: pet?.energy === level ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => handleEnergySelect(level)}
              />
            ))}
          </View>
          <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>
            {pet?.energy === 1 && 'Lap cat energy'}
            {pet?.energy === 2 && 'Low energy'}
            {pet?.energy === 3 && 'Moderate energy'}
            {pet?.energy === 4 && 'High energy'}
            {pet?.energy === 5 && 'Hyper active'}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Sociability</Text>
          <View style={styles.sociabilityContainer}>
            {(['shy', 'neutral', 'social'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.sociabilityOption,
                  {
                    backgroundColor: pet?.sociability === level ? theme.colors.primary : theme.colors.bgElevated,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleSociabilitySelect(level)}
              >
                <Text style={[
                  styles.sociabilityText,
                  { color: pet?.sociability === level ? theme.colors.primaryText : theme.colors.text }
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Care Badges */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Care Badges</Text>
        <View style={styles.badgesContainer}>
          {(pet?.badges || []).map(badge => (
            <View key={badge} style={[styles.badge, { backgroundColor: theme.colors.success }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primaryText }]}>
                {badge.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Health Passport</Text>

      {/* Vaccines */}
      <View style={styles.section}>
        <Text style={[styles.subTitle, { color: theme.colors.text }]}>Vaccinations</Text>
        {(healthData?.vaccines || []).map((vaccine, index) => (
          <View key={index} style={[styles.healthItem, { backgroundColor: theme.colors.bgElevated }]}>
            <Text style={[styles.healthTitle, { color: theme.colors.text }]}>{vaccine.type}</Text>
            <Text style={[styles.healthDate, { color: theme.colors.textMuted }]}>
              Administered: {new Date(vaccine.administeredAt).toLocaleDateString()}
            </Text>
            {vaccine.expiresAt && (
              <Text style={[styles.healthExpiry, { color: theme.colors.warning }]}>
                Expires: {new Date(vaccine.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <Text style={[styles.subTitle, { color: theme.colors.text }]}>Medications</Text>
        {(healthData?.medications || []).map((med, index) => (
          <View key={index} style={[styles.healthItem, { backgroundColor: theme.colors.bgElevated }]}>
            <Text style={[styles.healthTitle, { color: theme.colors.text }]}>{med.name}</Text>
            <Text style={[styles.healthDetail, { color: theme.colors.textMuted }]}>
              {med.dosage} - {med.frequency}
            </Text>
          </View>
        ))}
      </View>

      {/* Reminders */}
      <View style={styles.section}>
        <Text style={[styles.subTitle, { color: theme.colors.text }]}>Upcoming Reminders</Text>
        {reminders.map((reminder, index) => (
          <View key={index} style={[styles.reminderItem, { backgroundColor: theme.colors.bgElevated }]}>
            <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>{reminder.title}</Text>
            <Text style={[styles.reminderDate, { color: theme.colors.primary }]}>
              Due: {new Date(reminder.dueAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSafetyTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Safety & Emergency</Text>

      {/* Lost Pet Alert */}
      <View style={[styles.section, { backgroundColor: theme.colors.bgElevated, padding: theme.spacing.md, borderRadius: theme.radius.md }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Lost Pet Protection</Text>
        <Text style={[styles.description, { color: theme.colors.textMuted }]}>
          Create an emergency alert to notify nearby users if your pet goes missing.
        </Text>

        {activeAlert ? (
          <View style={[styles.alertStatus, { backgroundColor: theme.colors.warning }]}>
            <Text style={[styles.alertStatusText, { color: theme.colors.primaryText }]}>
              Active Alert - Broadcasting to {activeAlert.broadcastRadius}km radius
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.alertButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateLostPetAlert}
          >
            <Text style={[styles.alertButtonText, { color: theme.colors.primaryText }]}>
              Create Lost Pet Alert
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={[styles.subTitle, { color: theme.colors.text }]}>Emergency Contacts</Text>
        <View style={[styles.emergencyCard, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={[styles.emergencyTitle, { color: theme.colors.text }]}>Primary Vet</Text>
          <Text style={[styles.emergencyDetail, { color: theme.colors.textMuted }]}>
            {pet?.vetContact?.name || 'Not set'}
          </Text>
          <Text style={[styles.emergencyDetail, { color: theme.colors.textMuted }]}>
            {pet?.vetContact?.clinic || ''}
          </Text>
        </View>
      </View>
    </View>
  );

  if (petLoading) {
    return (
      <EliteContainer>
        <EliteHeader title="Loading Pet Profile..." />
        <View style={styles.loading}>
          <Text style={{ color: theme.colors.text }}>Loading...</Text>
        </View>
      </EliteContainer>
    );
  }

  if (petError) {
    return (
      <EliteContainer>
        <EliteHeader title="Pet Profile Error" />
        <View style={styles.error}>
          <Text style={{ color: theme.colors.danger }}>{petError}</Text>
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader
        title={isNew ? 'Create Pet Profile' : `${pet?.name}'s Profile`}
        showBack
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.bgElevated }]}>
          {(['profile', 'health', 'availability', 'safety'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                {
                  color: activeTab === tab ? theme.colors.primary : theme.colors.textMuted
                }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollContent}>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'health' && renderHealthTab()}
          {activeTab === 'availability' && <View><Text>Availability tab coming soon</Text></View>}
          {activeTab === 'safety' && renderSafetyTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </EliteContainer>
  );
}

// Add missing imports
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  scrollContent: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  playStylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playStyleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  playStyleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  energyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  energyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  energyLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sociabilityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  sociabilityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sociabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  healthItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  healthDate: {
    fontSize: 14,
  },
  healthExpiry: {
    fontSize: 14,
    fontWeight: '500',
  },
  healthDetail: {
    fontSize: 14,
  },
  reminderItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertStatus: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emergencyCard: {
    padding: 16,
    borderRadius: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emergencyDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
});
