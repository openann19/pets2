/**
 * PetProfileScreen
 * 
 * Shows detailed pet profile with shared-element transition from SwipeCard
 * Implements hero transition: Card → Details per polish mandate
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { RootStackScreenProps } from '../navigation/types';
import { SHARED_ELEMENT_IDS, prefetchPetImage } from '@/foundation/shared-element';
import { haptic } from '@/foundation/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { logger } from '@pawfectmatch/core';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PetProfileScreenProps = RootStackScreenProps<'PetProfile'>;

interface Pet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  bio: string;
  photos: string[];
  tags: string[];
  distance: number;
  compatibility: number;
  isVerified: boolean;
}

export default function PetProfileScreen({ navigation }: PetProfileScreenProps) {
  const route = useRoute();
  const theme = useTheme();
  const { petId } = route.params as { petId: string };
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Load pet data
  useEffect(() => {
    const loadPet = async () => {
      try {
        setIsLoading(true);
        // Fetch pet data from API
        const { matchingService } = await import('../services/MatchingService');
        const petData = await matchingService.getPetDetails(petId);
        
        if (petData) {
          setPet(petData);
          
          // Prefetch all photos
          if (petData.photos && petData.photos.length > 0) {
            await Promise.all(petData.photos.map((photo: string) => prefetchPetImage(photo)));
          }
        } else {
          // Handle pet not found
          logger.warn('Pet not found', { petId });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to load pet', { error: errorMessage, petId });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPet();
  }, [petId]);
  
  const handleBack = useCallback(() => {
    haptic.tap();
    navigation.goBack();
  }, [navigation]);
  
  if (isLoading || !pet) {
    return (
      <ScreenShell>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenShell>
    );
  }
  
  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: pet.name,
            showBackButton: true,
            onBackPress: handleBack,
          })}
        />
      }
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Image with Shared Element */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <Animated.Image
              source={{ uri: pet.photos[currentPhotoIndex] }}
              style={styles.heroImage}
              resizeMode="cover"
              sharedTransitionTag={`${SHARED_ELEMENT_IDS.petImage}-${pet._id}`}
            />
            
            {/* Photo Indicators */}
            {pet.photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {pet.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoDot,
                      index === currentPhotoIndex && styles.photoDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
            
            {/* Verification Badge */}
            {pet.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              </View>
            )}
          </View>
          
          {/* Photo Navigation */}
          {pet.photos.length > 1 && (
            <View style={styles.photoNav}>
              <TouchableOpacity
                style={styles.photoNavButton}
                onPress={() => setCurrentPhotoIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPhotoIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={currentPhotoIndex === 0 ? theme.colors.onMuted : theme.colors.onSurface}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoNavButton}
                onPress={() =>
                  setCurrentPhotoIndex((prev) => Math.min(pet.photos.length - 1, prev + 1))
                }
                disabled={currentPhotoIndex === pet.photos.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    currentPhotoIndex === pet.photos.length - 1
                      ? theme.colors.onMuted
                      : theme.colors.onSurface
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Pet Info */}
        <View style={styles.infoSection}>
          {/* Name with Shared Element */}
          <Animated.View
            style={styles.nameRow}
            sharedTransitionTag={`${SHARED_ELEMENT_IDS.petName}-${pet._id}`}
          >
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.age}>{pet.age}</Text>
          </Animated.View>
          
          <Text style={styles.breed}>{pet.breed}</Text>
          
          {/* Compatibility */}
          <View style={styles.compatibilityContainer}>
            <View style={styles.compatibilityBar}>
              <View
                style={[
                  styles.compatibilityFill,
                  {
                    width: `${pet.compatibility}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.compatibilityText}>{pet.compatibility}% match</Text>
          </View>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {pet.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          {/* Bio */}
          <Text style={styles.bio}>{pet.bio}</Text>
          
          {/* Distance */}
          <View style={styles.distanceContainer}>
            <Ionicons name="location" size={16} color={theme.colors.onMuted} />
            <Text style={styles.distanceText}>{pet.distance}km away</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  photoDotActive: {
    backgroundColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
  },
  photoNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  photoNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    color: '#666',
  },
  breed: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  compatibilityContainer: {
    marginBottom: 16,
  },
  compatibilityBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 2,
  },
  compatibilityText: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
});

