import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import { VirtualizedFeed } from '../components/feed';
import type { Pet } from '@pawfectmatch/core';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { useTheme } from '@/theme';

type FeedDemoScreenProps = RootStackScreenProps<'FeedDemo'>;

// Mock data for demonstration
const mockPets: Pet[] = [
  {
    _id: '1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    bio: 'Friendly and energetic dog who loves to play fetch and go for long walks. Great with kids and other pets.',
    photos: ['https://example.com/photo1.jpg'],
    age: 3,
  },
  {
    _id: '2',
    name: 'Luna',
    breed: 'Siamese Cat',
    bio: 'Elegant and affectionate Siamese cat. Loves attention and will follow you around the house.',
    photos: ['https://example.com/photo2.jpg'],
    age: 2,
  },
  {
    _id: '3',
    name: 'Max',
    breed: 'German Shepherd',
    bio: 'Intelligent and loyal German Shepherd. Excellent guard dog with proper training. Very protective of family.',
    photos: ['https://example.com/photo3.jpg'],
    age: 4,
  },
  {
    _id: '4',
    name: 'Bella',
    breed: 'French Bulldog',
    bio: 'Adorable French Bulldog with a great personality. Low maintenance and loves to cuddle on the couch.',
    photos: ['https://example.com/photo4.jpg'],
    age: 1,
  },
  {
    _id: '5',
    name: 'Charlie',
    breed: 'Beagle',
    bio: 'Curious and friendly Beagle. Loves to explore and has a great sense of smell. Very vocal and social.',
    photos: ['https://example.com/photo5.jpg'],
    age: 2,
  }
];

export default function FeedDemoScreen({ navigation }: FeedDemoScreenProps) {
  const theme = useTheme();
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwipe = useCallback((pet: Pet, action: 'like' | 'pass' | 'superlike') => {
    Alert.alert(
      'Swipe Action',
      `You ${action}d ${pet.name} (${pet.breed})`,
      [{ text: 'OK' }]
    );

    // Remove the pet from the feed (simulating the swipe)
    setPets(currentPets => currentPets.filter(p => p._id !== pet._id));
  }, []);

  const handleCardPress = useCallback((pet: Pet) => {
    Alert.alert(
      'Pet Details',
      `${pet.name} - ${pet.breed}\n\n${pet.description}`,
      [{ text: 'Close' }]
    );
  }, []);

  const handleEndReached = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);

    // Simulate loading more pets
    setTimeout(() => {
      const newPets: Pet[] = [
        {
          _id: `new-${Date.now()}`,
          name: 'New Pet',
          breed: 'Mixed Breed',
          bio: 'A lovely new pet looking for a home!',
          photos: [],
          age: 1,
        }
      ];

      setPets(currentPets => [...currentPets, ...newPets]);
      setIsLoading(false);
    }, 1000);
  }, [isLoading]);

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: 'Virtualized Feed Demo',
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <Text style={[styles.description, { backgroundColor: theme.colors.surface, color: theme.colors.onMuted }]}>
          This demo shows the VirtualizedFeed component with FlashList for optimal performance.
          Swipe through pets or tap cards for details.
        </Text>

        <VirtualizedFeed
          pets={pets}
          onSwipe={handleSwipe}
          onCardPress={handleCardPress}
          onEndReached={handleEndReached}
          isLoading={isLoading}
          testID="feed-demo"
        />

        {pets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>No more pets to show!</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onMuted }]}>Check back later for new matches.</Text>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    padding: 16,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});