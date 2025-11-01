/**
 * PACK BUILDER SCREEN - Group Playdates
 *
 * Creates multi-pet playdate groups based on:
 * - Host pet selection
 * - Compatible pack members
 * - Safety score calculation
 * - Scheduled meetup creation
 *
 * Uses existing EliteContainer architecture and pet-first hooks
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';
import { useTheme } from '@/theme';
import { getExtendedColors } from '@/theme/adapters';
import { logger } from '@pawfectmatch/core';

// Pet-first hooks
import { usePets, usePlaydateMatching } from '../hooks/domains/pet';

// Types
import type { Pet } from '@pawfectmatch/core';
import type { RootStackScreenProps } from '../navigation/types';

// Extended Pet interface with energy property
interface ExtendedPet extends Pet {
  energy?: number;
}

// Local type definitions
interface PlaydateMatch {
  pet1: ExtendedPet;
  pet2: ExtendedPet;
  compatibilityScore: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

type PackBuilderScreenProps = RootStackScreenProps<'PackBuilder'> & {
  route?: {
    params?: {
      hostPetId?: string;
      initialMatch?: PlaydateMatch;
    };
  };
};

interface PackParticipant {
  pet: ExtendedPet;
  compatibility: number;
  addedBy: 'host' | 'algorithm';
}

interface PackData {
  hostPet: ExtendedPet | null;
  participants: PackParticipant[];
  scheduledAt: Date | null;
  venue: string;
  notes: string;
  maxSize: number;
}

export default function PackBuilderScreen({
  navigation,
  route
}: PackBuilderScreenProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const { hostPetId, initialMatch } = route?.params || {};

  // Pet data
  const { pets } = usePets();

  // State
  const [packData, setPackData] = useState<PackData>({
    hostPet: null,
    participants: [],
    scheduledAt: null,
    venue: '',
    notes: '',
    maxSize: 5,
  });

  const [suggestedPets, setSuggestedPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  // Find host pet
  const hostPet = hostPetId ? pets.find(p => p._id === hostPetId) : null;

  // Initialize pack with host pet
  useEffect(() => {
    if (hostPet && !packData.hostPet) {
      setPackData(prev => ({
        ...prev,
        hostPet,
        participants: [{
          pet: hostPet,
          compatibility: 100,
          addedBy: 'host',
        }],
      }));

      // Find suggested pets for the pack
      findSuggestedPackMembers(hostPet);
    }
  }, [hostPet, packData.hostPet]);

  // Add initial match if provided
  useEffect(() => {
    if (initialMatch && hostPet && packData.participants.length === 1) {
      const matchedPet = initialMatch.pet1._id === hostPet._id ? initialMatch.pet2 : initialMatch.pet1;
      addPetToPack(matchedPet, initialMatch.compatibilityScore, 'algorithm');
    }
  }, [initialMatch, hostPet, packData.participants.length]);

  const findSuggestedPackMembers = useCallback(async (host: Pet) => {
    try {
      setLoading(true);
      // Find pets that would complement the host pet's personality
      const complementaryPets = pets.filter(pet => {
        if (pet._id === host._id) return false;

        // Calculate basic compatibility score
        let score = 0;

        // Energy level compatibility (similar or complementary)
        if (Math.abs(((pet as ExtendedPet).energy || 3) - ((host as ExtendedPet).energy || 3)) <= 1) score += 25;

        // Size compatibility (avoid large size differences)
        const sizeOrder: Record<string, number> = { tiny: 0, small: 1, medium: 2, large: 3, 'extra-large': 4, xlarge: 4 };
        const hostSize = sizeOrder[host.size || 'medium'] ?? 2;
        const petSize = sizeOrder[pet.size || 'medium'] ?? 2;
        if (Math.abs(hostSize - petSize) <= 1) score += 25;

        // Sociability compatibility
        if (pet.sociability === host.sociability) score += 25;

        // Play style overlap
        const hostStyles = host.playStyle || [];
        const petStyles = pet.playStyle || [];
        const commonStyles = hostStyles.filter(style => petStyles.includes(style));
        score += (commonStyles.length / Math.max(hostStyles.length, 1)) * 25;

        return score >= 50; // Only suggest reasonably compatible pets
      });

      setSuggestedPets(complementaryPets.slice(0, 10)); // Limit suggestions
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to find pack suggestions', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [pets]);

  const calculateSafetyScore = useCallback((participants: PackParticipant[]): number => {
    if (participants.length < 2) return 100;

    let totalScore = 0;
    let comparisons = 0;

    // Compare each pair of pets
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const pet1 = participants[i].pet;
        const pet2 = participants[j].pet;

        let pairScore = 0;

        // Size compatibility (most important for safety)
        const sizeOrder: Record<string, number> = { tiny: 0, small: 1, medium: 2, large: 3, 'extra-large': 4, xlarge: 4 };
        const size1 = sizeOrder[pet1.size || 'medium'] ?? 2;
        const size2 = sizeOrder[pet2.size || 'medium'] ?? 2;
        const sizeDiff = Math.abs(size1 - size2);

        if (sizeDiff === 0) pairScore += 30; // Same size
        else if (sizeDiff === 1) pairScore += 20; // Adjacent sizes
        else pairScore += 10; // Large size difference (caution)

        // Energy level compatibility
        const energyDiff = Math.abs(((pet1 as ExtendedPet).energy || 3) - ((pet2 as ExtendedPet).energy || 3));
        if (energyDiff <= 1) pairScore += 25;

        // Good with dogs/cats compatibility
        if (pet1.goodWith?.dogs && pet2.goodWith?.dogs) pairScore += 20;
        if (pet1.goodWith?.cats && pet2.goodWith?.cats) pairScore += 15;

        // Prey drive consideration
        if (pet1.goodWith?.preyDrive === 'high' && pet2.species === 'other') pairScore -= 10;

        totalScore += pairScore;
        comparisons++;
      }
    }

    return comparisons > 0 ? Math.round(totalScore / comparisons) : 100;
  }, []);

  const addPetToPack = useCallback((pet: Pet, compatibility: number = 75, addedBy: 'host' | 'algorithm' = 'algorithm') => {
    setPackData(prev => {
      const isAlreadyAdded = prev.participants.some(p => p.pet._id === pet._id);
      if (isAlreadyAdded) return prev;

      if (prev.participants.length >= prev.maxSize) {
        Alert.alert('Pack Full', `Maximum pack size is ${prev.maxSize} pets.`);
        return prev;
      }

      const newParticipants = [...prev.participants, { pet, compatibility, addedBy }];
      const safetyScore = calculateSafetyScore(newParticipants);

      return {
        ...prev,
        participants: newParticipants,
        safetyScore,
      };
    });
  }, [calculateSafetyScore]);

  const removePetFromPack = useCallback((petId: string) => {
    setPackData(prev => {
      const newParticipants = prev.participants.filter(p => p.pet._id !== petId);
      const safetyScore = calculateSafetyScore(newParticipants);

      return {
        ...prev,
        participants: newParticipants,
        safetyScore,
      };
    });
  }, [calculateSafetyScore]);

  const createPackPlaydate = useCallback(async () => {
    if (!packData.hostPet || packData.participants.length < 2) {
      Alert.alert('Incomplete Pack', 'Need at least 2 pets to create a pack playdate.');
      return;
    }

    try {
      // Here you would call an API to create the pack playdate
      // For now, just show success and navigate back

      Alert.alert(
        'Pack Playdate Created! 🎉',
        `Your pack of ${packData.participants.length} pets is ready for fun!`,
        [
          {
            text: 'View Details',
            onPress: () => {
              // Navigate to playdate details
              navigation.goBack();
            },
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset pack data
              setPackData({
                hostPet: packData.hostPet,
                participants: [{
                  pet: packData.hostPet,
                  compatibility: 100,
                  addedBy: 'host',
                }],
                scheduledAt: null,
                venue: '',
                notes: '',
                maxSize: 5,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create pack playdate. Please try again.');
    }
  }, [packData, navigation]);

  const renderPetCard = (pet: Pet, compatibility?: number, inPack: boolean = false, addedBy?: 'host' | 'algorithm') => (
    <View key={pet._id} style={[styles.petCard, { backgroundColor: colors.bgElevated }]}>
      <View style={styles.petHeader}>
        <View style={styles.petInfo}>
          <Text style={[styles.petName, { color: colors.text }]}>
            {pet.name}
          </Text>
          <Text style={[styles.petDetails, { color: colors.textMuted }]}>
            {pet.breed} • {pet.age} months
          </Text>
        </View>

        {compatibility && (
          <View style={styles.compatibilityBadge}>
            <Text style={[styles.compatibilityText, { color: colors.primary }]}>
              {compatibility}%
            </Text>
          </View>
        )}

        {addedBy === 'host' && (
          <View style={[styles.hostBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.hostBadgeText, { color: colors.primaryText }]}>
              Host
            </Text>
          </View>
        )}
      </View>

      <View style={styles.petStats}>
        <Text style={[styles.petStat, { color: colors.textMuted }]}>
          🎾 {pet.playStyle?.slice(0, 2).join(', ') || 'No styles'}
        </Text>
        <Text style={[styles.petStat, { color: colors.textMuted }]}>
          ⚡ Energy: {(pet as ExtendedPet).energy || 3}/5
        </Text>
      </View>

      {!inPack ? (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => addPetToPack(pet, compatibility)}
        >
          <Text style={[styles.addButtonText, { color: colors.primaryText }]}>
            ➕ Add to Pack
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.removeButton, { borderColor: colors.danger, borderWidth: 1 }]}
          onPress={() => removePetFromPack(pet._id)}
        >
          <Text style={[styles.removeButtonText, { color: colors.danger }]}>
            ➖ Remove
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPackSummary = () => {
    const safetyScore = calculateSafetyScore(packData.participants);

    return (
      <View style={[styles.packSummary, { backgroundColor: colors.bgElevated }]}>
        <View style={styles.packHeader}>
          <Text style={[styles.packTitle, { color: colors.text }]}>
            🐾 Pack of {packData.participants.length}
          </Text>

          <View style={styles.safetyScore}>
            <Text style={[styles.safetyLabel, { color: colors.textMuted }]}>
              Safety Score
            </Text>
            <Text style={[
              styles.safetyValue,
              {
                color: safetyScore >= 80 ? colors.success :
                       safetyScore >= 60 ? colors.warning : colors.danger
              }
            ]}>
              {safetyScore}%
            </Text>
          </View>
        </View>

        <View style={styles.packPets}>
          {packData.participants.map(participant => (
            <View key={participant.pet._id} style={styles.packPet}>
              <Text style={[styles.packPetName, { color: colors.text }]}>
                {participant.pet.name}
              </Text>
              <Text style={[styles.packPetCompatibility, { color: colors.primary }]}>
                {participant.compatibility}%
              </Text>
            </View>
          ))}
        </View>

        {safetyScore < 70 && (
          <View style={[styles.safetyWarning, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.safetyWarningText, { color: colors.warning }]}>
              ⚠️ Consider pack size or pet compatibility for safer playtime
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (!hostPet) {
    return (
      <EliteContainer>
        <EliteHeader title="Build a Pack" />
        <View style={styles.loading}>
          <Text style={{ color: colors.text }}>Loading pets...</Text>
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader
        title={`Build Pack with ${hostPet.name}`}
        subtitle={`${packData.participants.length}/${packData.maxSize} pets • Safety: ${calculateSafetyScore(packData.participants)}%`}
      />

      <ScrollView style={styles.container}>
        {/* Pack Summary */}
        {packData.participants.length > 0 && renderPackSummary()}

        {/* Scheduling */}
        <View style={[styles.section, { backgroundColor: colors.bgElevated }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>When & Where</Text>

          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={[styles.scheduleButtonText, { color: colors.primary }]}>
              📅 Schedule Playdate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.venueButton}>
            <Text style={[styles.venueButtonText, { color: colors.primary }]}>
              📍 Choose Venue
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.notesInput, {
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }]}
            placeholder="Add notes about the playdate..."
            placeholderTextColor={colors.textMuted}
            value={packData.notes}
            onChangeText={(notes) => setPackData(prev => ({ ...prev, notes }))}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Suggested Pets */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Suggested Pack Members
          </Text>

          {loading ? (
            <View style={styles.loading}>
              <Text style={{ color: colors.text }}>Finding compatible pets...</Text>
            </View>
          ) : suggestedPets.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No suggested pets found. Try adjusting your pack preferences.
              </Text>
            </View>
          ) : (
            suggestedPets
              .filter(pet => !packData.participants.some(p => p.pet._id === pet._id))
              .map(pet => renderPetCard(pet, 75)) // Placeholder compatibility score
          )}
        </View>

        {/* Create Pack Button */}
        {packData.participants.length >= 2 && (
          <View style={styles.createSection}>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={createPackPlaydate}
            >
              <Text style={[styles.createButtonText, { color: colors.primaryText }]}>
                🎉 Create Pack Playdate ({packData.participants.length} pets)
              </Text>
            </TouchableOpacity>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  packSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  safetyScore: {
    alignItems: 'center',
  },
  safetyLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  safetyValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  packPets: {
    marginBottom: 12,
  },
  packPet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  packPetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  packPetCompatibility: {
    fontSize: 14,
    fontWeight: '600',
  },
  safetyWarning: {
    padding: 12,
    borderRadius: 8,
  },
  safetyWarningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  venueButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginBottom: 16,
  },
  venueButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  petCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
  },
  compatibilityBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  petStats: {
    marginBottom: 12,
  },
  petStat: {
    fontSize: 14,
    marginBottom: 4,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createSection: {
    padding: 16,
  },
  createButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
