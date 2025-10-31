import { useState, useEffect, useCallback } from 'react';
import { Pet, VaccineRecord, MedicationRecord, TimeSlot, PlaydateMatch } from '@pawfectmatch/core';
import { useApi } from '@/hooks/utils/useApi';
import { useToast } from '@/hooks/utils/useToast';

// Pet Profile Management Hook (extends existing usePetForm)
export const usePetProfile = (petId?: string) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();
  const { showToast } = useToast();

  const fetchPet = useCallback(async () => {
    if (!petId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/pets/${petId}`);
      setPet(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pet');
    } finally {
      setLoading(false);
    }
  }, [petId, apiCall]);

  const updatePet = useCallback(async (updates: Partial<Pet>) => {
    if (!petId) return;

    try {
      setLoading(true);
      const response = await apiCall(`/pets/${petId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setPet(response);
      showToast('Pet profile updated successfully', 'success');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update pet';
      setError(message);
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [petId, apiCall, showToast]);

  const addHealthRecord = useCallback(async (
    type: 'vaccine' | 'medication',
    record: VaccineRecord | MedicationRecord
  ) => {
    if (!petId) return;

    try {
      const response = await apiCall(`/pets/${petId}/health`, {
        method: 'POST',
        body: JSON.stringify({ type, record }),
      });

      // Refresh pet data to get updated health records
      await fetchPet();
      showToast(`${type} record added successfully`, 'success');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add health record';
      showToast(message, 'error');
      throw err;
    }
  }, [petId, apiCall, fetchPet, showToast]);

  const updateAvailability = useCallback(async (availability: Pet['availability']) => {
    return updatePet({ availability });
  }, [updatePet]);

  const verifyPet = useCallback(async (verificationData: {
    microchipId?: string;
    vetDocument?: File;
  }) => {
    try {
      const formData = new FormData();
      if (verificationData.microchipId) {
        formData.append('microchipId', verificationData.microchipId);
      }
      if (verificationData.vetDocument) {
        formData.append('vetDocument', verificationData.vetDocument);
      }

      const response = await apiCall(`/pets/${petId}/verify`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set content-type for FormData
      });

      await fetchPet();
      showToast('Pet verification submitted successfully', 'success');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify pet';
      showToast(message, 'error');
      throw err;
    }
  }, [petId, apiCall, fetchPet, showToast]);

  useEffect(() => {
    if (petId) {
      fetchPet();
    }
  }, [petId, fetchPet]);

  return {
    pet,
    loading,
    error,
    updatePet,
    addHealthRecord,
    updateAvailability,
    verifyPet,
    refetch: fetchPet,
  };
};

// Multi-Pet Management Hook
export const usePets = (ownerId?: string) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = ownerId ? `/users/${ownerId}/pets` : '/pets/my-pets';
      const response = await apiCall(endpoint);
      setPets(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  }, [ownerId, apiCall]);

  const createPet = useCallback(async (petData: Omit<Pet, '_id' | 'owner'>) => {
    try {
      const response = await apiCall('/pets', {
        method: 'POST',
        body: JSON.stringify(petData),
      });
      setPets(prev => [...prev, response]);
      return response;
    } catch (err) {
      throw err;
    }
  }, [apiCall]);

  const setPrimaryPet = useCallback(async (petId: string) => {
    try {
      await apiCall('/users/primary-pet', {
        method: 'PUT',
        body: JSON.stringify({ petId }),
      });
      // Refresh pets to update primary status
      await fetchPets();
    } catch (err) {
      throw err;
    }
  }, [apiCall, fetchPets]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return {
    pets,
    loading,
    error,
    createPet,
    setPrimaryPet,
    refetch: fetchPets,
  };
};

// Playdate Matching Hook
export const usePlaydateMatching = (petId: string) => {
  const [matches, setMatches] = useState<PlaydateMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();

  const findMatches = useCallback(async (filters?: {
    distance?: number;
    playStyles?: string[];
    energy?: number;
    size?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/pets/${petId}/playdate-matches`, {
        method: 'POST',
        body: JSON.stringify(filters || {}),
      });
      setMatches(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  }, [petId, apiCall]);

  const createPlaydate = useCallback(async (matchId: string, details: {
    scheduledAt: string;
    venueId: string;
    notes?: string;
  }) => {
    try {
      const response = await apiCall('/playdates', {
        method: 'POST',
        body: JSON.stringify({
          matchId,
          ...details,
        }),
      });
      return response;
    } catch (err) {
      throw err;
    }
  }, [apiCall]);

  return {
    matches,
    loading,
    error,
    findMatches,
    createPlaydate,
  };
};

// Health Passport Hook
export const useHealthPassport = (petId: string) => {
  const [healthData, setHealthData] = useState<Pet['healthRecords'] | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useApi();
  const { showToast } = useToast();

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/pets/${petId}/health`);
      setHealthData(response.records);
      setReminders(response.reminders || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Failed to fetch health data', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [petId, apiCall]);

  const addVaccineRecord = useCallback(async (record: VaccineRecord) => {
    try {
      await apiCall(`/pets/${petId}/vaccines`, {
        method: 'POST',
        body: JSON.stringify(record),
      });
      await fetchHealthData();
      showToast('Vaccine record added successfully', 'success');
    } catch (err) {
      showToast('Failed to add vaccine record', 'error');
      throw err;
    }
  }, [petId, apiCall, fetchHealthData, showToast]);

  const addMedicationRecord = useCallback(async (record: MedicationRecord) => {
    try {
      await apiCall(`/pets/${petId}/medications`, {
        method: 'POST',
        body: JSON.stringify(record),
      });
      await fetchHealthData();
      showToast('Medication record added successfully', 'success');
    } catch (err) {
      showToast('Failed to add medication record', 'error');
      throw err;
    }
  }, [petId, apiCall, fetchHealthData, showToast]);

  useEffect(() => {
    if (petId) {
      fetchHealthData();
    }
  }, [petId, fetchHealthData]);

  return {
    healthData,
    reminders,
    loading,
    addVaccineRecord,
    addMedicationRecord,
    refetch: fetchHealthData,
  };
};

// Lost Pet Alert Hook
interface LostPetAlert {
  id: string;
  petId: string;
  lastSeenLocation: { lat: number; lng: number; address: string };
  description: string;
  reward?: number;
  broadcastRadius?: number;
  status: 'active' | 'found' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const useLostPetAlert = () => {
  const [alerts, setAlerts] = useState<LostPetAlert[]>([]);
  const [activeAlert, setActiveAlert] = useState<LostPetAlert | null>(null);
  const { apiCall } = useApi();
  const { showToast } = useToast();

  const createAlert = useCallback(async (alertData: {
    petId: string;
    lastSeenLocation: { lat: number; lng: number; address: string };
    description: string;
    reward?: number;
    broadcastRadius?: number;
  }) => {
    try {
      const response = await apiCall('/lost-pet-alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
      setActiveAlert(response);
      showToast('Lost pet alert created successfully', 'success');
      return response;
    } catch (err) {
      showToast('Failed to create lost pet alert', 'error');
      throw err;
    }
  }, [apiCall, showToast]);

  const updateAlert = useCallback(async (
    alertId: string,
    updates: Partial<{
      description: string;
      lastSeenLocation: { lat: number; lng: number; address: string };
      reward: number;
      broadcastRadius: number;
      status: 'active' | 'found' | 'cancelled';
    }>
  ) => {
    try {
      const response = await apiCall(`/lost-pet-alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (activeAlert?.id === alertId) {
        setActiveAlert(response);
      }
      return response;
    } catch (err) {
      throw err;
    }
  }, [apiCall, activeAlert]);

  const reportSighting = useCallback(async (alertId: string, sighting: {
    location: { lat: number; lng: number; address: string };
    description: string;
    photos?: string[];
  }) => {
    try {
      await apiCall(`/lost-pet-alerts/${alertId}/sightings`, {
        method: 'POST',
        body: JSON.stringify(sighting),
      });
      showToast('Sighting reported successfully', 'success');
    } catch (err) {
      showToast('Failed to report sighting', 'error');
      throw err;
    }
  }, [apiCall, showToast]);

  return {
    alerts,
    activeAlert,
    createAlert,
    updateAlert,
    reportSighting,
  };
};
