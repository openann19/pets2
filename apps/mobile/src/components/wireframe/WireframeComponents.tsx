/**
 * WIREFRAME COMPONENTS - Pet-First Screen Wireframes
 *
 * Rapid prototyping components that can be toggled to show wireframe/mockup versions
 * of our pet-first screens for design iteration and user testing.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useWireframe, useTheme } from '../../hooks';
import type { Pet } from '@pawfectmatch/core';

// Wireframe Card Component
export const WireframeCard: React.FC<{
  title: string;
  content?: React.ReactNode;
  interactive?: boolean;
  height?: number;
}> = ({ title, content, interactive = true, height = 100 }) => {
  const wireframe = useWireframe();
  const theme = useTheme();

  if (wireframe.theme === 'wireframe') {
    return (
      <View style={[styles.wireframeCard, { height }]}>
        <View style={styles.wireframeHeader}>
          <View style={styles.wireframeLine} />
        </View>
        <View style={styles.wireframeContent}>
          <View style={styles.wireframeLineShort} />
          <View style={styles.wireframeLine} />
        </View>
        <Text style={styles.wireframeLabel}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, height }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      {content && <View style={styles.cardContent}>{content}</View>}
      {interactive && (
        <TouchableOpacity style={[styles.cardButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.cardButtonText, { color: theme.colors.onPrimary }]}>
            Action
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Wireframe Pet Profile Card
export const WireframePetCard: React.FC<{
  pet?: Pet;
  showDetails?: boolean;
}> = ({ pet, showDetails = false }) => {
  const wireframe = useWireframe();
  const theme = useTheme();

  if (wireframe.theme === 'wireframe') {
    return (
      <View style={styles.wireframePetCard}>
        <View style={styles.wireframePetImage} />
        <View style={styles.wireframePetInfo}>
          <View style={styles.wireframeLine} />
          <View style={styles.wireframeLineShort} />
          <View style={styles.wireframeLineShorter} />
        </View>
        <View style={styles.wireframePetActions}>
          <View style={styles.wireframeButton} />
          <View style={styles.wireframeButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.petCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.petImage, { backgroundColor: theme.colors.border }]}>
        <Text style={[styles.petImagePlaceholder, { color: theme.colors.textMuted }]}>
          🐕
        </Text>
      </View>
      <View style={styles.petInfo}>
        <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
          {pet?.name || 'Pet Name'}
        </Text>
        <Text style={[styles.petDetails, { color: theme.colors.textMuted }]}>
          {pet?.breed || 'Breed'} • {pet?.age ? `${pet.age} months` : 'Age'}
        </Text>
        {showDetails && pet?.playStyle && (
          <Text style={[styles.petPlayStyle, { color: theme.colors.primary }]}>
            🎾 {pet.playStyle.slice(0, 2).join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.petActions}>
        <TouchableOpacity style={[styles.petActionButton, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.petActionText, { color: theme.colors.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.petActionButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.petActionButtonText, { color: theme.colors.onPrimary }]}>
            Match
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Wireframe Screen Layout
export const WireframeScreen: React.FC<{
  title: string;
  children: React.ReactNode;
  showHeader?: boolean;
  showTabs?: boolean;
  tabLabels?: string[];
}> = ({ title, children, showHeader = true, showTabs = false, tabLabels = [] }) => {
  const wireframe = useWireframe();
  const theme = useTheme();

  if (wireframe.theme === 'wireframe') {
    return (
      <View style={styles.wireframeScreen}>
        {showHeader && (
          <View style={styles.wireframeHeader}>
            <View style={styles.wireframeLine} />
            <View style={styles.wireframeLineShort} />
          </View>
        )}

        {showTabs && tabLabels.length > 0 && (
          <View style={styles.wireframeTabs}>
            {tabLabels.map((label, index) => (
              <View key={index} style={styles.wireframeTab}>
                <View style={styles.wireframeLineShort} />
              </View>
            ))}
          </View>
        )}

        <ScrollView style={styles.wireframeContent}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg }]}>
      {showHeader && (
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        </View>
      )}

      {showTabs && tabLabels.length > 0 && (
        <View style={[styles.tabs, { backgroundColor: theme.colors.surface }]}>
          {tabLabels.map((label, index) => (
            <TouchableOpacity key={index} style={styles.tab}>
              <Text style={[styles.tabLabel, { color: theme.colors.onSurface }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.content}>
        {children}
      </ScrollView>
    </View>
  );
};

// Wireframe Data Generator for Mock Data
export const generateWireframePets = (count: number): Pet[] => {
  const breeds = ['Golden Retriever', 'Labrador', 'Beagle', 'Pug', 'Bulldog', 'Poodle'];
  const playStyles: Pet['playStyle'] = ['chase', 'tug', 'fetch', 'wrestle', 'water'];

  return Array.from({ length: count }, (_, i) => ({
    _id: `pet-${i}`,
    name: ['Max', 'Luna', 'Buddy', 'Charlie', 'Bella', 'Rocky'][i % 6],
    species: i % 2 === 0 ? 'dog' : 'cat',
    breed: breeds[i % breeds.length],
    owner: `user-${i}`,
    age: Math.floor(Math.random() * 120) + 12, // 1-10 years in months
    photos: [`https://via.placeholder.com/200x200?text=Pet${i}`],
    playStyle: playStyles.slice(0, Math.floor(Math.random() * 3) + 2),
    energy: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    sociability: ['shy', 'neutral', 'social'][Math.floor(Math.random() * 3)] as 'shy' | 'neutral' | 'social',
    badges: ['vaccinated', 'microchipped', 'trained'].slice(0, Math.floor(Math.random() * 3) + 1),
    verificationStatus: Math.random() > 0.5 ? 'verified' : 'unverified',
  }));
};

// Wireframe Mock API Responses
export const wireframeApiResponses = {
  getPets: () => generateWireframePets(8),
  getPlaydateMatches: (petId: string) => ({
    pet1: generateWireframePets(1)[0],
    pet2: generateWireframePets(1)[0],
    compatibilityScore: Math.floor(Math.random() * 60) + 40, // 40-100
    compatibilityFactors: {
      playStyle: Math.floor(Math.random() * 25),
      energy: Math.floor(Math.random() * 25),
      size: Math.floor(Math.random() * 20),
      sociability: Math.floor(Math.random() * 15),
      location: Math.floor(Math.random() * 15),
    },
    recommendedActivities: ['fetch', 'walk', 'playground'],
    safetyNotes: Math.random() > 0.7 ? ['Monitor initial interactions'] : [],
    distanceKm: Math.random() * 5,
  }),
  getHealthRecords: () => ({
    vaccines: [
      {
        type: 'Rabies',
        administeredAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        vetName: 'Downtown Vet',
      },
      {
        type: 'DHPP',
        administeredAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        vetName: 'Downtown Vet',
      },
    ],
    medications: [
      {
        name: 'Heartworm Prevention',
        dosage: '1 tablet monthly',
        frequency: 'Monthly',
        prescribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        vetName: 'Downtown Vet',
      },
    ],
  }),
};

const styles = StyleSheet.create({
  // Production Styles
  screen: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  petCard: {
    flexDirection: 'row',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  petImagePlaceholder: {
    fontSize: 24,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  petPlayStyle: {
    fontSize: 14,
  },
  petActions: {
    flexDirection: 'row',
    gap: 8,
  },
  petActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  petActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  petActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },

  // Wireframe Styles
  wireframeScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
  wireframeHeader: {
    height: 60,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  wireframeTabs: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  wireframeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wireframeContent: {
    flex: 1,
    padding: 16,
  },
  wireframeCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    marginBottom: 16,
    position: 'relative',
  },
  wireframeHeader: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  wireframeLine: {
    height: 8,
    backgroundColor: '#d0d0d0',
    margin: 8,
    borderRadius: 4,
  },
  wireframeLineShort: {
    height: 6,
    backgroundColor: '#d0d0d0',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 3,
  },
  wireframeLineShorter: {
    height: 4,
    backgroundColor: '#d0d0d0',
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 2,
  },
  wireframeContent: {
    padding: 12,
  },
  wireframeLabel: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 10,
    color: '#999',
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  wireframePetCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  wireframePetImage: {
    width: 60,
    height: 60,
    backgroundColor: '#e5e5e5',
    borderRadius: 30,
    marginRight: 12,
  },
  wireframePetInfo: {
    flex: 1,
  },
  wireframePetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  wireframeButton: {
    width: 60,
    height: 30,
    backgroundColor: '#d0d0d0',
    borderRadius: 6,
  },
});
