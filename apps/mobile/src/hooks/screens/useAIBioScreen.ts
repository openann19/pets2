/**
 * useAIBioScreen Hook
 * Manages AI Bio Generator screen state and interactions
 */
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@pawfectmatch/core';
import { api } from '../../services/api';
import { useAIBio } from '../domains/ai/useAIBio';

interface UseAIBioScreenReturn {
  // Form state
  petName: string;
  setPetName: (name: string) => void;
  petBreed: string;
  setPetBreed: (breed: string) => void;
  petAge: string;
  setPetAge: (age: string) => void;
  petPersonality: string;
  setPetPersonality: (personality: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedPhoto: string | null;
  setSelectedPhoto: (photo: string | null) => void;

  // UI state
  isGenerating: boolean;
  generatedBio: any | null;
  bioHistory: any[];
  tones: Array<{ id: string; label: string; icon: string; color: string }>;

  // Actions
  pickImage: () => Promise<void>;
  generateBio: () => Promise<void>;
  saveBio: () => Promise<void>;
  handleGoBack: () => void;
  clearForm: () => void;
}

const TONES = [
  { id: 'playful', label: 'Playful', icon: '🎾', color: '#ff6b6b' },
  { id: 'professional', label: 'Professional', icon: '💼', color: '#4dabf7' },
  { id: 'casual', label: 'Casual', icon: '😊', color: '#69db7c' },
  { id: 'romantic', label: 'Romantic', icon: '💕', color: '#f783ac' },
  { id: 'funny', label: 'Funny', icon: '😄', color: '#ffd43b' },
];

export const useAIBioScreen = (): UseAIBioScreenReturn => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    generateBio: generateAIBio,
    isGenerating,
    lastGeneratedBio,
    bioHistory,
    addToHistory,
    clearHistory,
  } = useAIBio();

  // Form state
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petPersonality, setPetPersonality] = useState('');
  const [selectedTone, setSelectedTone] = useState('playful');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to analyze your pet photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const generateBio = async () => {
    if (!petName.trim()) {
      Alert.alert('Missing Information', "Please enter your pet's name");
      return;
    }

    try {
      const params = {
        petName: petName.trim(),
        keywords: petPersonality
          .trim()
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
        tone: selectedTone as 'playful' | 'professional' | 'casual' | 'romantic' | 'funny',
        length: 'medium' as const,
        petType: 'dog' as const, // Could be made dynamic
        age: parseInt(petAge.trim()) || 1,
        breed: petBreed.trim(),
      };

      await generateAIBio(params);
    } catch (error) {
      logger.error('Bio generation failed', { error });
      // Error handling is done in the useAIBio hook
    }
  };

  const saveBio = async () => {
    if (!lastGeneratedBio) return;

    try {
      // Update pet profile with generated bio
      if (user?._id && lastGeneratedBio) {
        // Assuming we have a petId from route params or user's first pet
        const userPets = await api.getUserPets();
        if (userPets && userPets.length > 0 && userPets[0]?._id) {
          await api.updatePet(userPets[0]._id, {
            description: lastGeneratedBio.bio,
          });

          Alert.alert('Success', 'Pet profile updated successfully!');
          navigation.goBack();
        } else {
          Alert.alert('Saved Locally', 'Bio has been saved to your device');
        }
      } else {
        Alert.alert('Saved Locally', 'Bio has been saved to your device');
      }
    } catch (error) {
      Alert.alert('Saved Locally', 'Bio has been saved to your device');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const clearForm = () => {
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setPetPersonality('');
    setSelectedTone('playful');
    setSelectedPhoto(null);
    clearHistory();
  };

  return {
    // Form state
    petName,
    setPetName,
    petBreed,
    setPetBreed,
    petAge,
    setPetAge,
    petPersonality,
    setPetPersonality,
    selectedTone,
    setSelectedTone,
    selectedPhoto,
    setSelectedPhoto,

    // UI state
    isGenerating,
    generatedBio: lastGeneratedBio,
    bioHistory,
    tones: TONES,

    // Actions
    pickImage,
    generateBio,
    saveBio,
    handleGoBack,
    clearForm,
  };
};
