/**
 * Pet Domain Hooks - Comprehensive pet-first feature hooks
 * Ported from mobile app with React Query for web optimization
 */

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';
import { isBrowser } from '@pawfectmatch/core/utils/env';
import type { Pet } from '@/types';
import apiClient from '@/lib/api-client';

// Toast hook - simplified implementation if not available
const useToast = () => ({
  success: (message: string, description?: string) => {
    if (isBrowser()) {
      logger.info('Toast:', { message, description });
      // In production, integrate with actual toast library
    }
  },
  error: (message: string, description?: string) => {
    if (isBrowser()) {
      logger.error('Toast Error:', { message, description });
    }
  },
});

// Local type definitions for pet health records and playdates
interface VaccineRecord {
  type: string;
  administeredAt: string;
  expiresAt?: string;
  vetName: string;
  certificateUrl?: string;
  id?: string;
  name?: string;
  administeredBy?: string;
  lotNumber?: string;
  notes?: string;
  nextDue?: string;
}

interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  prescribedAt: string;
  expiresAt?: string;
  vetName: string;
  notes?: string;
  id?: string;
}

interface PlaydateMatch {
  id: string;
  pet1: Pet;
  pet2: Pet;
  compatibilityScore: number;
  compatibilityFactors: {
    playStyle: number;
    energy: number;
    size: number;
    sociability: number;
    location: number;
  };
  recommendedActivities: string[];
  safetyNotes?: string[];
  distanceKm: number;
}

// ============= Pet Profile Management Hook =============
interface UsePetProfileReturn {
  pet: Pet | null;
  loading: boolean;
  error: string | null;
  updatePet: (updates: Partial<Pet>) => Promise<Pet>;
  addHealthRecord: (type: 'vaccine' | 'medication', record: VaccineRecord | MedicationRecord) => Promise<void>;
  updateAvailability: (availability: { isAvailable: boolean; schedule?: unknown }) => Promise<void>;
  verifyPet: (verificationData: { microchipId?: string; vetDocument?: File }) => Promise<void>;
  refetch: () => void;
}

export const usePetProfile = (petId?: string): UsePetProfileReturn => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch pet profile
  const {
    data: pet,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<Pet>({
    queryKey: ['pet', petId],
    queryFn: async () => {
      if (!petId) throw new Error('Pet ID is required');
      const response = await apiClient.getPet(petId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load pet');
      }
      return response.data;
    },
    enabled: !!petId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async (updates: Partial<Pet>) => {
      if (!petId) throw new Error('Pet ID is required');
      const response = await apiClient.updatePet(petId, updates);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update pet');
      }
      return response.data;
    },
    onSuccess: (updatedPet) => {
      queryClient.setQueryData(['pet', petId], updatedPet);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
      toast.success('Pet profile updated successfully');
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error('Failed to update pet profile', err.message);
    },
  });

  // Add health record mutation
  const addHealthRecordMutation = useMutation({
    mutationFn: async ({
      type,
      record,
    }: {
      type: 'vaccine' | 'medication';
      record: VaccineRecord | MedicationRecord;
    }) => {
      if (!petId) throw new Error('Pet ID is required');
      
      const response = await apiClient.addPetHealthRecord(petId, type, record);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add health record');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet', petId] });
      queryClient.invalidateQueries({ queryKey: ['pet', petId, 'health'] });
      toast.success(`${variables.type === 'vaccine' ? 'Vaccine' : 'Medication'} record added successfully`);
    },
    onError: (err: Error) => {
      toast.error('Failed to add health record', err.message);
    },
  });

  // Verify pet mutation
  const verifyPetMutation = useMutation({
    mutationFn: async (verificationData: { microchipId?: string; vetDocument?: File }) => {
      if (!petId) throw new Error('Pet ID is required');
      
      const response = await apiClient.verifyPet(petId, verificationData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to verify pet');
      }
      return response.data;
    },
    onSuccess: (verifiedPet) => {
      queryClient.setQueryData(['pet', petId], verifiedPet);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Pet verification submitted successfully');
    },
    onError: (err: Error) => {
      toast.error('Failed to verify pet', err.message);
    },
  });

  const updatePet = useCallback(
    async (updates: Partial<Pet>): Promise<Pet> => {
      return updatePetMutation.mutateAsync(updates);
    },
    [updatePetMutation]
  );

  const addHealthRecord = useCallback(
    async (type: 'vaccine' | 'medication', record: VaccineRecord | MedicationRecord): Promise<void> => {
      await addHealthRecordMutation.mutateAsync({ type, record });
      await refetch();
    },
    [addHealthRecordMutation, refetch]
  );

  const updateAvailability = useCallback(
    async (availability: { isAvailable: boolean; schedule?: unknown }): Promise<void> => {
      await updatePet({ availability } as Partial<Pet>);
    },
    [updatePet]
  );

  const verifyPet = useCallback(
    async (verificationData: { microchipId?: string; vetDocument?: File }): Promise<void> => {
      await verifyPetMutation.mutateAsync(verificationData);
      await refetch();
    },
    [verifyPetMutation, refetch]
  );

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load pet');
    }
  }, [queryError]);

  return {
    pet: pet || null,
    loading,
    error: error || (queryError instanceof Error ? queryError.message : null),
    updatePet,
    addHealthRecord,
    updateAvailability,
    verifyPet,
    refetch: () => {
      refetch();
    },
  };
};

// ============= Multi-Pet Management Hook =============
interface UsePetsReturn {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  createPet: (petData: Omit<Pet, '_id' | 'owner'>) => Promise<Pet>;
  setPrimaryPet: (petId: string) => Promise<void>;
  refetch: () => void;
}

export const usePets = (ownerId?: string): UsePetsReturn => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch pets
  const {
    data: pets = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<Pet[]>({
    queryKey: ownerId ? ['pets', 'owner', ownerId] : ['pets', 'my'],
    queryFn: async () => {
      const response = ownerId 
        ? await apiClient.getOwnerPets(ownerId)
        : await apiClient.getMyPets();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load pets');
      }
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create pet mutation
  const createPetMutation = useMutation({
    mutationFn: async (petData: Omit<Pet, '_id' | 'owner'>) => {
      const response = await apiClient.createPet(petData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create pet');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
    },
  });

  // Set primary pet mutation
  const setPrimaryPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const response = await apiClient.setPrimaryPet(petId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to set primary pet');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
    },
  });

  const createPet = useCallback(
    async (petData: Omit<Pet, '_id' | 'owner'>): Promise<Pet> => {
      return createPetMutation.mutateAsync(petData);
    },
    [createPetMutation]
  );

  const setPrimaryPet = useCallback(
    async (petId: string): Promise<void> => {
      await setPrimaryPetMutation.mutateAsync(petId);
      await refetch();
    },
    [setPrimaryPetMutation, refetch]
  );

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load pets');
    }
  }, [queryError]);

  return {
    pets,
    loading,
    error: error || (queryError instanceof Error ? queryError.message : null),
    createPet,
    setPrimaryPet,
    refetch: () => {
      refetch();
    },
  };
};

// ============= Playdate Matching Hook =============
interface UsePlaydateMatchingReturn {
  matches: PlaydateMatch[];
  loading: boolean;
  error: string | null;
  findMatches: (filters?: {
    distance?: number;
    playStyles?: string[];
    energy?: number;
    size?: string;
  }) => Promise<void>;
  createPlaydate: (matchId: string, details: {
    scheduledAt: string;
    venueId: string;
    notes?: string;
  }) => Promise<void>;
}

export const usePlaydateMatching = (petId: string): UsePlaydateMatchingReturn => {
  const [matches, setMatches] = useState<PlaydateMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const findMatches = useCallback(
    async (filters?: {
      distance?: number;
      playStyles?: string[];
      energy?: number;
      size?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getPlaydateMatches(petId, filters);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to find matches');
        }
        setMatches(response.data as PlaydateMatch[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to find matches';
        setError(errorMessage);
        logger.error('Error finding playdate matches', { error: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [petId]
  );

  const createPlaydate = useCallback(
    async (matchId: string, details: {
      scheduledAt: string;
      venueId: string;
      notes?: string;
    }) => {
      try {
        const response = await apiClient.createPlaydate(matchId, details);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to create playdate');
        }
        toast.success('Playdate created successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create playdate';
        toast.error('Failed to create playdate', errorMessage);
        throw err;
      }
    },
    [toast]
  );

  return {
    matches,
    loading,
    error,
    findMatches,
    createPlaydate,
  };
};

// ============= Health Passport Hook =============
interface UseHealthPassportReturn {
  healthData: { vaccines?: VaccineRecord[]; medications?: MedicationRecord[] } | null;
  reminders: Array<{
    type: 'vaccine' | 'medication' | 'checkup';
    title: string;
    dueDate: string;
    isOverdue: boolean;
  }>;
  loading: boolean;
  addVaccineRecord: (record: VaccineRecord) => Promise<void>;
  addMedicationRecord: (record: MedicationRecord) => Promise<void>;
  refetch: () => void;
}

export const useHealthPassport = (petId: string): UseHealthPassportReturn => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch health data
  const {
    data: healthResponse,
    isLoading: loading,
    refetch,
  } = useQuery<{
    records: { vaccines?: VaccineRecord[]; medications?: MedicationRecord[] };
    reminders: Array<{
      type: 'vaccine' | 'medication' | 'checkup';
      title: string;
      dueDate: string;
      isOverdue: boolean;
    }>;
  }>({
    queryKey: ['pet', petId, 'health'],
    queryFn: async () => {
      const response = await apiClient.getPetHealth(petId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch health data');
      }
      return {
        records: response.data.records as { vaccines?: VaccineRecord[]; medications?: MedicationRecord[] },
        reminders: response.data.reminders,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add vaccine mutation
  const addVaccineMutation = useMutation({
    mutationFn: async (record: VaccineRecord) => {
      const response = await apiClient.addPetVaccine(petId, record);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add vaccine record');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', petId, 'health'] });
      queryClient.invalidateQueries({ queryKey: ['pet', petId] });
      toast.success('Vaccine record added successfully');
    },
    onError: (err: Error) => {
      toast.error('Failed to add vaccine record', err.message);
    },
  });

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: async (record: MedicationRecord) => {
      const response = await apiClient.addPetMedication(petId, record);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add medication record');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', petId, 'health'] });
      queryClient.invalidateQueries({ queryKey: ['pet', petId] });
      toast.success('Medication record added successfully');
    },
    onError: (err: Error) => {
      toast.error('Failed to add medication record', err.message);
    },
  });

  const addVaccineRecord = useCallback(
    async (record: VaccineRecord): Promise<void> => {
      await addVaccineMutation.mutateAsync(record);
      await refetch();
    },
    [addVaccineMutation, refetch]
  );

  const addMedicationRecord = useCallback(
    async (record: MedicationRecord): Promise<void> => {
      await addMedicationMutation.mutateAsync(record);
      await refetch();
    },
    [addMedicationMutation, refetch]
  );

  return {
    healthData: healthResponse?.records || null,
    reminders: healthResponse?.reminders || [],
    loading,
    addVaccineRecord,
    addMedicationRecord,
    refetch: () => {
      refetch();
    },
  };
};

// ============= Lost Pet Alert Hook =============
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

interface UseLostPetAlertReturn {
  alerts: LostPetAlert[];
  activeAlert: LostPetAlert | null;
  createAlert: (alertData: {
    petId: string;
    lastSeenLocation: { lat: number; lng: number; address: string };
    description: string;
    reward?: number;
    broadcastRadius?: number;
  }) => Promise<LostPetAlert>;
  updateAlert: (
    alertId: string,
    updates: Partial<{
      description: string;
      lastSeenLocation: { lat: number; lng: number; address: string };
      reward: number;
      broadcastRadius: number;
      status: 'active' | 'found' | 'cancelled';
    }>
  ) => Promise<LostPetAlert>;
  reportSighting: (
    alertId: string,
    sighting: {
      location: { lat: number; lng: number; address: string };
      description: string;
      photos?: string[];
    }
  ) => Promise<void>;
}

export const useLostPetAlert = (): UseLostPetAlertReturn => {
  const [activeAlert, setActiveAlert] = useState<LostPetAlert | null>(null);
  const toast = useToast();

  const createAlert = useCallback(
    async (alertData: {
      petId: string;
      lastSeenLocation: { lat: number; lng: number; address: string };
      description: string;
      reward?: number;
      broadcastRadius?: number;
    }): Promise<LostPetAlert> => {
      try {
        const response = await apiClient.createLostPetAlert(alertData);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create lost pet alert');
        }
        
        const createdAlert = response.data as LostPetAlert;
        setActiveAlert(createdAlert);
        toast.success('Lost pet alert created successfully');
        return createdAlert;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create lost pet alert';
        toast.error('Failed to create lost pet alert', errorMessage);
        throw err;
      }
    },
    [toast]
  );

  const updateAlert = useCallback(
    async (
      alertId: string,
      updates: Partial<{
        description: string;
        lastSeenLocation: { lat: number; lng: number; address: string };
        reward: number;
        broadcastRadius: number;
        status: 'active' | 'found' | 'cancelled';
      }>
    ): Promise<LostPetAlert> => {
      try {
        const response = await apiClient.updateLostPetAlert(alertId, updates);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update alert');
        }
        
        const updatedAlert = response.data as LostPetAlert;
        if (activeAlert?.id === alertId) {
          setActiveAlert(updatedAlert);
        }
        
        return updatedAlert;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update alert';
        throw new Error(errorMessage);
      }
    },
    [activeAlert]
  );

  const reportSighting = useCallback(
    async (
      alertId: string,
      sighting: {
        location: { lat: number; lng: number; address: string };
        description: string;
        photos?: string[];
      }
    ): Promise<void> => {
      try {
        const response = await apiClient.reportLostPetSighting(alertId, sighting);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to report sighting');
        }
        
        toast.success('Sighting reported successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to report sighting';
        toast.error('Failed to report sighting', errorMessage);
        throw err;
      }
    },
    [toast]
  );

  return {
    alerts: activeAlert ? [activeAlert] : [],
    activeAlert,
    createAlert,
    updateAlert,
    reportSighting,
  };
};

// Hooks are already exported above with their export declarations


