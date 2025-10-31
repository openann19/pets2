/**
 * LOST PET MODE SCREEN
 * Emergency broadcasting system with geofencing for lost pet alerts
 */

import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';

// Pet-first hooks
import { useLostPetAlert, usePets } from '../hooks/domains/pet';

// Extracted components and hooks
import { useLostPetAlertForm } from './lost-pet-alert/hooks/useLostPetAlertForm';
import {
  ActiveAlertCard,
  EmergencyActions,
  SafetyTips,
  CommunityStats,
  CreateAlertModal,
  SightingModal,
} from './lost-pet-alert/components';
import type { LostPetAlertWithSightings } from './lost-pet-alert/types';

import type { RootStackScreenProps } from '../navigation/types';

type LostPetAlertScreenProps = RootStackScreenProps<'LostPetAlert'>;

export default function LostPetAlertScreen({ navigation, route }: LostPetAlertScreenProps) {
  const { petId } = route?.params || {};

  const { createAlert, activeAlert, reportSighting } = useLostPetAlert();
  const activeAlertWithSightings = activeAlert as LostPetAlertWithSightings | null;
  const { pets } = usePets();

  // Form state management
  const formState = useLostPetAlertForm();

  // UI state
  const [selectedPet, setSelectedPet] = useState(
    petId ? pets.find((p) => p._id === petId) : null,
  );
  const [showCreateModal, setShowCreateModal] = useState(!petId);
  const [showSightingModal, setShowSightingModal] = useState(false);

  // Mock current location (would come from GPS)
  const currentLocation = {
    address: '123 Main St, New York, NY',
    coordinates: { lat: 40.7589, lng: -73.9851 },
  };

  const handleCreateAlert = useCallback(async () => {
    if (!selectedPet) {
      Alert.alert('No Pet Selected', 'Please select a pet first.');
      return;
    }

    if (!formState.alertForm.description || !formState.alertForm.lastSeenLocation) {
      Alert.alert('Missing Information', 'Please provide a description and last seen location.');
      return;
    }

    try {
      const alertData: {
        petId: string;
        lastSeenLocation: { lat: number; lng: number; address: string };
        description: string;
        reward?: number;
        broadcastRadius: number;
        contactInfo: {
          method: 'inapp' | 'phone' | 'email';
          value: string;
        };
      } = {
        petId: selectedPet._id,
        lastSeenLocation: {
          lat: currentLocation.coordinates.lat,
          lng: currentLocation.coordinates.lng,
          address: formState.alertForm.lastSeenLocation,
        },
        description: formState.alertForm.description,
        broadcastRadius: formState.alertForm.broadcastRadius,
        contactInfo: {
          method: formState.alertForm.contactMethod,
          value: formState.alertForm.contactValue || 'In-app messaging',
        },
      };
      if (formState.alertForm.reward) {
        alertData.reward = parseFloat(formState.alertForm.reward);
      }

      await createAlert(alertData);

      Alert.alert(
        '🚨 Emergency Alert Activated!',
        `Lost pet alert for ${selectedPet.name} has been broadcast to ${formState.alertForm.broadcastRadius}km radius.`,
        [
          {
            text: 'View Alert',
            onPress: () => setShowCreateModal(false),
          },
        ],
      );

      formState.resetAlertForm();
    } catch {
      Alert.alert('Error', 'Failed to create lost pet alert. Please try again.');
    }
  }, [selectedPet, formState, createAlert, currentLocation]);

  const handleReportSighting = useCallback(async () => {
    if (!activeAlertWithSightings) return;

    if (!formState.sightingForm.description || !formState.sightingForm.location) {
      Alert.alert('Missing Information', 'Please provide sighting details.');
      return;
    }

    try {
      await reportSighting(activeAlertWithSightings.id, {
        location: {
          lat: currentLocation.coordinates.lat,
          lng: currentLocation.coordinates.lng,
          address: formState.sightingForm.location,
        },
        description: formState.sightingForm.description,
      });

      formState.resetSightingForm();
      setShowSightingModal(false);

      Alert.alert(
        'Sighting Reported',
        'Thank you for reporting this sighting. The pet owner has been notified.',
        [{ text: 'OK' }],
      );
    } catch {
      Alert.alert('Error', 'Failed to report sighting. Please try again.');
    }
  }, [activeAlertWithSightings, formState, reportSighting, currentLocation]);

  const pet = activeAlertWithSightings
    ? pets.find((p) => p._id === activeAlertWithSightings.petId)
    : null;

  return (
    <EliteContainer>
      <EliteHeader
        title="Lost Pet Emergency"
        subtitle={
          activeAlertWithSightings ? 'Alert Active - Broadcasting' : 'Emergency Response System'
        }
      />

      <ScrollView style={styles.container}>
        {/* Active Alert Display */}
        {activeAlertWithSightings && (
          <ActiveAlertCard
            alert={activeAlertWithSightings}
            petName={pet?.name}
            petBreed={pet?.breed}
            petSpecies={pet?.species}
            onReportSighting={() => setShowSightingModal(true)}
          />
        )}

        {/* Emergency Actions */}
        {!activeAlertWithSightings && (
          <EmergencyActions
            onCreateAlert={() => setShowCreateModal(true)}
            onReportSafety={() => navigation.navigate('SafetyWelfare', { reportType: 'incident' })}
            onFindVet={() => navigation.navigate('PetFriendlyMap', { filter: 'vets' })}
          />
        )}

        {/* Safety Tips */}
        <SafetyTips />

        {/* Community Stats */}
        <CommunityStats />
      </ScrollView>

      {/* Modals */}
      <CreateAlertModal
        visible={showCreateModal}
        pets={pets}
        selectedPet={selectedPet}
        formData={formState.alertForm}
        onClose={() => setShowCreateModal(false)}
        onSelectPet={setSelectedPet}
        onUpdateForm={formState.updateAlertForm}
        onUseCurrentLocation={() =>
          formState.updateAlertForm('lastSeenLocation', currentLocation.address)
        }
        onSubmit={handleCreateAlert}
      />

      <SightingModal
        visible={showSightingModal}
        formData={formState.sightingForm}
        onClose={() => setShowSightingModal(false)}
        onUpdateForm={formState.updateSightingForm}
        onUseCurrentLocation={() =>
          formState.updateSightingForm('location', currentLocation.address)
        }
        onSubmit={handleReportSighting}
      />
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
